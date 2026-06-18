using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Implementations;
using CareerSystem.API.Services.Interfaces;

namespace CareerSystem.Tests
{
    public class MentorServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IAiRecommendationService> _mockAiService;
        private readonly Mock<IPromptContextService> _mockPromptService;
        private readonly MentorService _service;

        public MentorServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockAiService = new Mock<IAiRecommendationService>();
            _mockPromptService = new Mock<IPromptContextService>();
            _service = new MentorService(_context, _mockAiService.Object, _mockPromptService.Object);

            SeedData();
        }

        private void SeedData()
        {
            _context.Users.Add(new User
            {
                UserId = "valid-user-guid",
                FullName = "Test User",
                Email = "test@pcr.com",
                Role = "Student"
            });
            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // UTCID01: Normal Ask
        [Fact]
        public async Task AskAsync_ValidRequest_ReturnsAdviceAndSavesSession()
        {
            var request = new MentorAskRequestDto
            {
                UserId = "valid-user-guid",
                Question = "Valid advice request question",
                SelectedTopic = "Career Path"
            };

            var mockResponse = new MentorAskResponseDto(); // empty response or mock data

            _mockPromptService.Setup(p => p.BuildMentorContextAsync(It.IsAny<User>(), request))
                .ReturnsAsync(("mock-context-json", "mock-github-json"));

            _mockAiService.Setup(a => a.GetMentorAdviceAsync("mock-context-json", "mock-github-json", request.Question))
                .ReturnsAsync(mockResponse);

            var result = await _service.AskAsync(request);

            Assert.NotNull(result);
            // Verify chat message saved in DB
            var chatMessages = await _context.ChatMessages.ToListAsync();
            Assert.Equal(2, chatMessages.Count); // 1 USER, 1 AI
        }

        // UTCID02: Abnormal Ask - Null UserId
        [Fact]
        public async Task AskAsync_NullUserId_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = null!, Question = "Valid question" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("UserID is required.", ex.Message);
        }

        // UTCID03: Abnormal Ask - Empty UserId
        [Fact]
        public async Task AskAsync_EmptyUserId_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "", Question = "Valid question" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("UserID is required.", ex.Message);
        }

        // UTCID04: Abnormal Ask - Whitespace UserId
        [Fact]
        public async Task AskAsync_WhitespaceUserId_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "   ", Question = "Valid question" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("UserID is required.", ex.Message);
        }

        // UTCID05: Abnormal Ask - Null Question
        [Fact]
        public async Task AskAsync_NullQuestion_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "valid-user-guid", Question = null! };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("Question is required.", ex.Message);
        }

        // UTCID06: Abnormal Ask - Empty Question
        [Fact]
        public async Task AskAsync_EmptyQuestion_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "valid-user-guid", Question = "" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("Question is required.", ex.Message);
        }

        // UTCID08: Abnormal Ask - Question too long
        [Fact]
        public async Task AskAsync_QuestionTooLong_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "valid-user-guid", Question = new string('a', 1001) };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("Question is too long.", ex.Message);
        }

        // UTCID11: Abnormal Ask - User not found
        [Fact]
        public async Task AskAsync_UserNotFound_ThrowsException()
        {
            var request = new MentorAskRequestDto { UserId = "nonexistent-user-guid", Question = "Valid question" };
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AskAsync(request));
            Assert.Equal("User not found.", ex.Message);
        }
    }
}
