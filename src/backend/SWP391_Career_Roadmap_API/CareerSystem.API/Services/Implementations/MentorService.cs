using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace CareerSystem.API.Services.Implementations
{
    public class MentorService : IMentorService
    {
        private readonly AppDbContext _context;
        private readonly IAiRecommendationService _aiRecommendationService;
        private readonly IPromptContextService _promptContextService;

        public MentorService(AppDbContext context, IAiRecommendationService aiRecommendationService, IPromptContextService promptContextService)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _promptContextService = promptContextService;
        }

        public async Task<MentorAskResponseDto> AskAsync(MentorAskRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserId))
                throw new Exception("UserID is required.");

            if (string.IsNullOrWhiteSpace(request.Question))
                throw new Exception("Question is required.");

            if (request.Question.Length > 1000)
                throw new Exception("Question is too long.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            if (string.IsNullOrWhiteSpace(user.GeminiApiKey))
            {
                throw new Exception("Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để sử dụng tính năng này.");
            }

            var (contextJson, githubContextJson) = await _promptContextService.BuildMentorContextAsync(user, request);

            var decryptedApiKey = EncryptionUtility.Decrypt(user.GeminiApiKey);
            var result = await _aiRecommendationService.GetMentorAdviceAsync(contextJson, githubContextJson, request.Question, decryptedApiKey);

            string rawJsonResponse = JsonSerializer.Serialize(result);

            await SaveChatSessionAsync(request.UserId, request.Question, rawJsonResponse);

            return result;
        }

        public async Task<SessionInitializationDto> InitializeChatSessionAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new Exception("UserId is required.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new Exception("User not found.");

            var session = await _context.MentorSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            bool isNewSession = false;

            if (session == null)
            {
                session = new MentorSession
                {
                    SessionId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    CreatedAt = DateTime.Now
                };
                _context.MentorSessions.Add(session);
                await _context.SaveChangesAsync();
                isNewSession = true;
            }

            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == session.SessionId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessageDto
                {
                    MessageId = m.MessageId,
                    Sender = m.Sender,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return new SessionInitializationDto
            {
                SessionId = session.SessionId,
                UserId = user.UserId,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role ?? "STUDENT",
                CreatedAt = session.CreatedAt ?? DateTime.Now,
                ChatHistory = messages,
                IsNewSession = isNewSession
            };
        }

        public async Task<CursorPagedResponseDto<ChatMessageDto>> GetSessionHistoryAsync(string userId, string? cursor = null, int limit = 20)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new Exception("UserId is required.");

            if (limit <= 0) limit = 20;
            if (limit > 100) limit = 100;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                throw new Exception("User not found.");

            var session = await _context.MentorSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
            {
                session = new MentorSession
                {
                    SessionId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    CreatedAt = DateTime.Now
                };
                _context.MentorSessions.Add(session);
                await _context.SaveChangesAsync();

                return new CursorPagedResponseDto<ChatMessageDto>
                {
                    Items = new List<ChatMessageDto>(),
                    NextCursor = null,
                    HasNextPage = false,
                    TotalCount = 0
                };
            }

            var query = _context.ChatMessages
                .AsNoTracking()
                .Where(m => m.SessionId == session.SessionId);

            var totalCount = await query.CountAsync();

            if (!string.IsNullOrWhiteSpace(cursor))
            {
                var cursorMessage = await _context.ChatMessages
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.MessageId == cursor && m.SessionId == session.SessionId);

                if (cursorMessage != null && cursorMessage.Timestamp.HasValue)
                {
                    var cursorTimestamp = cursorMessage.Timestamp.Value;
                    var cursorId = cursorMessage.MessageId;

                    query = query.Where(m => m.Timestamp < cursorTimestamp
                        || (m.Timestamp == cursorTimestamp && string.Compare(m.MessageId, cursorId) < 0));
                }
            }

            var fetchedMessages = await query
                .OrderByDescending(m => m.Timestamp)
                .ThenByDescending(m => m.MessageId)
                .Take(limit + 1)
                .Select(m => new ChatMessageDto
                {
                    MessageId = m.MessageId,
                    Sender = m.Sender,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            bool hasNextPage = fetchedMessages.Count > limit;
            var itemsToReturn = hasNextPage ? fetchedMessages.Take(limit).ToList() : fetchedMessages;
            string? nextCursor = hasNextPage ? itemsToReturn.Last().MessageId : null;

            itemsToReturn.Reverse();

            return new CursorPagedResponseDto<ChatMessageDto>
            {
                Items = itemsToReturn,
                NextCursor = nextCursor,
                HasNextPage = hasNextPage,
                TotalCount = totalCount
            };
        }

        public async Task<bool> ClearSessionHistoryAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                throw new Exception("UserId is required.");

            var session = await _context.MentorSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
                return false;

            var messages = await _context.ChatMessages
                .Where(m => m.SessionId == session.SessionId)
                .ToListAsync();

            if (messages.Any())
            {
                _context.ChatMessages.RemoveRange(messages);
                await _context.SaveChangesAsync();
            }

            return true;
        }

        private async Task SaveChatSessionAsync(string userId, string userQuestion, string aiRawResponse)
        {
            // 1. Get or create session
            var session = await _context.MentorSessions
                .FirstOrDefaultAsync(s => s.UserId == userId);

            if (session == null)
            {
                session = new MentorSession
                {
                    SessionId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    CreatedAt = DateTime.Now
                };
                _context.MentorSessions.Add(session);
                await _context.SaveChangesAsync();
            }

            var now = DateTime.UtcNow;
            // 2. Save USER's question
            var userMessage = new ChatMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SessionId = session.SessionId,
                Sender = "USER",
                Content = userQuestion,
                Timestamp = now
            };
            _context.ChatMessages.Add(userMessage);

            // 3. Save AI's answer
            var aiMessage = new ChatMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SessionId = session.SessionId,
                Sender = "AI",
                Content = aiRawResponse, // Save as JSON
                Timestamp = now.AddSeconds(1),
            };
            _context.ChatMessages.Add(aiMessage);

            await _context.SaveChangesAsync();
        }
    }
}
