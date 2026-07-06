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
        private readonly Mock<IAiRecommendationService> _mockAiRecommendationService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly CourseService _service;

        public CourseServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new AppDbContext(options);
            _mockAiRecommendationService = new Mock<IAiRecommendationService>();
            _mockConfig = new Mock<IConfiguration>();

            // Setup default api key config
            _mockConfig.Setup(c => c["AiSettings:ApiKey"]).Returns("dummy-api-key");

            _service = new CourseService(_context, _mockAiRecommendationService.Object, _mockConfig.Object);
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

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_001", SkillName = "New AI Skill", Category = "Advanced AI Category" }
                });

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

        [Fact]
        public async Task CreateCourseAsync_SplitSkillsAndOutcomesBySemicolonOnly()
        {
            // Arrange
            var dto = new CreateCourseDto
            {
                CourseCode = "CSD201",
                CourseName = "Data Structures and Algorithms",
                Credits = 10,
                TotalStudyHours = 90,
                IsFoundationalCourse = true,
                Skills = "Data Structures; Algorithm Design & Analysis; OOP",
                Outcomes = "Cài đặt các cấu trúc dữ liệu cơ bản như Tree, Graph, Stack, Queue; Đánh giá độ phức tạp thuật toán"
            };

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_001", SkillName = "Data Structures", Category = "General" },
                    new SkillClassificationDto { SkillId = "SKL_002", SkillName = "Algorithm Design & Analysis", Category = "General" },
                    new SkillClassificationDto { SkillId = "SKL_003", SkillName = "OOP", Category = "General" }
                });

            // Act
            var result = await _service.CreateCourseAsync(dto, "staff-id");

            // Assert
            Assert.NotNull(result);
            var clos = await _context.CourseLearningOutcomes.Where(c => c.CourseId == result.CourseId).ToListAsync();
            Assert.Equal(3, clos.Count);

            // First outcome should keep the commas: "Cài đặt các cấu trúc dữ liệu cơ bản như Tree, Graph, Stack, Queue"
            var firstClo = clos.FirstOrDefault(c => c.Skill.SkillName == "Data Structures");
            Assert.NotNull(firstClo);
            Assert.Equal("Cài đặt các cấu trúc dữ liệu cơ bản như Tree, Graph, Stack, Queue", firstClo.OutcomeDescription);

            // Second outcome should be: "Đánh giá độ phức tạp thuật toán"
            var secondClo = clos.FirstOrDefault(c => c.Skill.SkillName == "Algorithm Design & Analysis");
            Assert.NotNull(secondClo);
            Assert.Equal("Đánh giá độ phức tạp thuật toán", secondClo.OutcomeDescription);
        }

        [Fact]
        public async Task UpdateCourseAsync_Succeeds_UpdatesDetailsAndClos()
        {
            // Arrange
            var existingCourse = new Course
            {
                CourseId = "CRS_001",
                CourseCode = "OLD101",
                CourseName = "Old Course Name",
                Credits = 3,
                TotalStudyHours = 45,
                IsFoundationalCourse = false
            };
            var existingSkill = new Skill { SkillId = "SKL_001", SkillName = "Old Skill", Category = "General" };
            var existingClo = new CourseLearningOutcome
            {
                Id = "CLO_0001",
                CourseId = "CRS_001",
                SkillId = "SKL_001",
                OutcomeDescription = "Old outcome",
                Skill = existingSkill,
                Course = existingCourse
            };
            _context.Courses.Add(existingCourse);
            _context.Skills.Add(existingSkill);
            _context.CourseLearningOutcomes.Add(existingClo);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateCourseDto
            {
                CourseCode = "NEW101",
                CourseName = "New Course Name",
                Credits = 4,
                TotalStudyHours = 60,
                IsFoundationalCourse = true,
                Skills = "New Skill; Another Skill",
                Outcomes = "New outcome 1; New outcome 2"
            };

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_002", SkillName = "New Skill", Category = "Category A" },
                    new SkillClassificationDto { SkillId = "SKL_003", SkillName = "Another Skill", Category = "Category B" }
                });

            // Act
            var result = await _service.UpdateCourseAsync("CRS_001", updateDto, "staff-id");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("CRS_001", result.CourseId);
            Assert.Equal("NEW101", result.CourseCode);
            Assert.Equal("New Course Name", result.CourseName);
            Assert.Equal(4, result.Credits);
            Assert.Equal(60, result.TotalStudyHours);
            Assert.True(result.IsFoundationalCourse);

            // Verify old CLO was deleted and new ones were created
            var dbClos = await _context.CourseLearningOutcomes.Where(c => c.CourseId == "CRS_001").ToListAsync();
            Assert.Equal(2, dbClos.Count);
            Assert.Contains(dbClos, c => c.OutcomeDescription == "New outcome 1");
            Assert.Contains(dbClos, c => c.OutcomeDescription == "New outcome 2");
        }

        [Fact]
        public async Task UpdateCourseAsync_CourseNotFound_ReturnsNull()
        {
            // Arrange
            var updateDto = new UpdateCourseDto
            {
                CourseCode = "NEW101",
                CourseName = "New Course Name",
                Credits = 3,
                TotalStudyHours = 45,
                IsFoundationalCourse = false,
                Skills = "Skill A",
                Outcomes = "Outcome A"
            };

            // Act
            var result = await _service.UpdateCourseAsync("NON_EXISTENT", updateDto, "staff-id");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task UpdateCourseAsync_DuplicateCourseCode_ThrowsArgumentException()
        {
            // Arrange
            var course1 = new Course { CourseId = "CRS_001", CourseCode = "CRS101", CourseName = "Course 1" };
            var course2 = new Course { CourseId = "CRS_002", CourseCode = "CRS102", CourseName = "Course 2" };
            _context.Courses.AddRange(course1, course2);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateCourseDto
            {
                CourseCode = "CRS102", // Try to use course 2's code
                CourseName = "Updated Course 1",
                Credits = 3,
                TotalStudyHours = 45,
                IsFoundationalCourse = false,
                Skills = "Skill A",
                Outcomes = "Outcome A"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() =>
                _service.UpdateCourseAsync("CRS_001", updateDto, "staff-id"));
        }

        [Fact]
        public async Task UpdateCourseAsync_PartialUpdate_KeepsOtherFieldsIntact()
        {
            // Arrange
            var existingCourse = new Course
            {
                CourseId = "CRS_001",
                CourseCode = "OLD101",
                CourseName = "Old Course Name",
                Credits = 3,
                TotalStudyHours = 45,
                IsFoundationalCourse = false
            };
            var existingSkill = new Skill { SkillId = "SKL_001", SkillName = "Old Skill", Category = "General" };
            var existingClo = new CourseLearningOutcome
            {
                Id = "CLO_0001",
                CourseId = "CRS_001",
                SkillId = "SKL_001",
                OutcomeDescription = "Old outcome description",
                Skill = existingSkill,
                Course = existingCourse
            };
            _context.Courses.Add(existingCourse);
            _context.Skills.Add(existingSkill);
            _context.CourseLearningOutcomes.Add(existingClo);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateCourseDto
            {
                Credits = 5 // Only update credits
            };

            // Act
            var result = await _service.UpdateCourseAsync("CRS_001", updateDto, "staff-id");

            // Assert
            Assert.NotNull(result);
            Assert.Equal("CRS_001", result.CourseId);
            Assert.Equal("OLD101", result.CourseCode); // Kept unchanged
            Assert.Equal("Old Course Name", result.CourseName); // Kept unchanged
            Assert.Equal(5, result.Credits); // Updated
            Assert.Equal(45, result.TotalStudyHours); // Kept unchanged
            Assert.False(result.IsFoundationalCourse); // Kept unchanged

            // Verify CLO was NOT changed
            var dbClos = await _context.CourseLearningOutcomes.Where(c => c.CourseId == "CRS_001").ToListAsync();
            Assert.Single(dbClos);
            Assert.Equal("Old outcome description", dbClos[0].OutcomeDescription);
        }
    }
}
