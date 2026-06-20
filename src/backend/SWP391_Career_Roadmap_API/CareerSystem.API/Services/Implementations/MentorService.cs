using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
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

            var result = await _aiRecommendationService.GetMentorAdviceAsync(contextJson, githubContextJson, request.Question, user.GeminiApiKey);

            string rawJsonResponse = JsonSerializer.Serialize(result);

            await SaveChatSessionAsync(request.UserId, request.Question, rawJsonResponse);

            return result;
        }

        public async Task<List<ChatMessageDto>> GetSessionHistoryAsync(string userId)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.Session.UserId == userId)
                .OrderBy(m => m.Timestamp)
                .Select(m => new ChatMessageDto
                {
                    MessageId = m.MessageId,
                    Sender = m.Sender,
                    Content = m.Content,
                    Timestamp = m.Timestamp
                })
                .ToListAsync();

            return messages;
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

            // 2. Save USER's question
            var userMessage = new ChatMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SessionId = session.SessionId,
                Sender = "USER",
                Content = userQuestion,
                Timestamp = DateTime.Now
            };
            _context.ChatMessages.Add(userMessage);

            // 3. Save AI's answer
            var aiMessage = new ChatMessage
            {
                MessageId = Guid.NewGuid().ToString(),
                SessionId = session.SessionId,
                Sender = "AI",
                Content = aiRawResponse, // Save as JSON
                Timestamp = DateTime.Now
            };
            _context.ChatMessages.Add(aiMessage);

            await _context.SaveChangesAsync();
        }
    }
}
