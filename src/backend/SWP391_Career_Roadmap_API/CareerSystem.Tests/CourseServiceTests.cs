using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Implementations;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CareerSystem.Tests
{
    public class CourseServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IGeminiService> _mockGeminiService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly CourseService _service;

        public CourseServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new AppDbContext(options);
            _mockGeminiService = new Mock<IGeminiService>();
            _mockConfig = new Mock<IConfiguration>();

            // Setup default api key config
            _mockConfig.Setup(c => c["AiSettings:ApiKey"]).Returns("dummy-api-key");

            _service = new CourseService(_context, _mockGeminiService.Object, _mockConfig.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task CreateCourseAsync_WithNewSkill_AIClassificationMapsCorrectlyBySkillName()
        {
            // Arrange
            var dto = new CreateCourseDto
            {
                CourseCode = "TEST101",
                CourseName = "Test Course",
                Credits = 3,
                TotalStudyHours = 45,
                IsFoundationalCourse = false,
                Skills = "New AI Skill",
                Outcomes = "Test outcome description that is quite simple"
            };

            // AI returns JSON classification string
            string aiJsonResponse = "{\"classifications\": [{\"skillId\": \"SKL_001\", \"skillName\": \"New AI Skill\", \"category\": \"Advanced AI Category\"}]}";

            _mockGeminiService.Setup(s => s.CallGeminiApiAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync(aiJsonResponse);

            // Act
            var result = await _service.CreateCourseAsync(dto, "staff-id");

            // Assert
            var savedSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "New AI Skill");
            Assert.NotNull(savedSkill);
            Assert.Equal("Advanced AI Category", savedSkill.Category); // Verify category was correctly mapped from AI by name!
            
            var savedCourse = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == "TEST101");
            Assert.NotNull(savedCourse);

            var savedClo = await _context.CourseLearningOutcomes.FirstOrDefaultAsync(c => c.CourseId == savedCourse.CourseId);
            Assert.NotNull(savedClo);
            Assert.Equal("Test outcome description that is quite simple", savedClo.OutcomeDescription);
            Assert.NotNull(savedClo.Skill);
            Assert.NotNull(savedClo.Course);
        }
    }
}
