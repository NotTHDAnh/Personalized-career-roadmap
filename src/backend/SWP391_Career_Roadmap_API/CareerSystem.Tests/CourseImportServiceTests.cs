using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Implementations;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CareerSystem.Tests
{
    public class CourseImportServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IAiRecommendationService> _mockAiRecommendationService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly Mock<IGeminiService> _mockGeminiService;
        private readonly CourseImportService _service;

        public CourseImportServiceTests()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new AppDbContext(options);
            _mockAiRecommendationService = new Mock<IAiRecommendationService>();
            _mockConfig = new Mock<IConfiguration>();
            _mockGeminiService = new Mock<IGeminiService>();

            _mockConfig.Setup(c => c["AiSettings:ApiKey"]).Returns("dummy-api-key");

            _mockGeminiService.Setup(s => s.ValidateApiKeyAsync(It.IsAny<string>()))
                .ReturnsAsync((string key) => !string.IsNullOrWhiteSpace(key) && key == "dummy-api-key");

            _service = new CourseImportService(_context, _mockAiRecommendationService.Object, _mockConfig.Object, _mockGeminiService.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        private IFormFile CreateMockExcelFile(string fileName, string[,] data)
        {
            var stream = new MemoryStream();
            using (var package = new ExcelPackage(stream))
            {
                var worksheet = package.Workbook.Worksheets.Add("Sheet1");
                
                // Write headers
                string[] expectedHeaders = { "STT", "Mã môn học", "Tên môn học", "Số tín chỉ", "Tổng số giờ học", "Kỹ năng đầu ra", "Chuẩn đầu ra", "Môn học nền tảng" };
                for (int i = 0; i < expectedHeaders.Length; i++)
                {
                    worksheet.Cells[1, i + 1].Value = expectedHeaders[i];
                }

                // Write data
                int rows = data.GetLength(0);
                int cols = data.GetLength(1);
                for (int row = 0; row < rows; row++)
                {
                    for (int col = 0; col < cols; col++)
                    {
                        worksheet.Cells[row + 2, col + 1].Value = data[row, col];
                    }
                }
                package.Save();
            }
            stream.Position = 0;

            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(_ => _.FileName).Returns(fileName);
            fileMock.Setup(_ => _.Length).Returns(stream.Length);
            fileMock.Setup(_ => _.OpenReadStream()).Returns(stream);
            fileMock.Setup(_ => _.CopyToAsync(It.IsAny<Stream>(), It.IsAny<System.Threading.CancellationToken>()))
                .Callback<Stream, System.Threading.CancellationToken>((s, token) =>
                {
                    stream.Position = 0;
                    stream.CopyTo(s);
                })
                .Returns(Task.CompletedTask);

            return fileMock.Object;
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_SuccessfulImport_SavesCorrectly()
        {
            // Arrange
            var sampleData = new string[,]
            {
                { "1", "PRJ301", "Java Web Application Development", "3", "90", "Servlet; JSP", "Hiểu kiến trúc MVC; Phát triển ứng dụng Web động", "Không" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_001", SkillName = "Servlet", Category = "Java Web" },
                    new SkillClassificationDto { SkillId = "SKL_002", SkillName = "JSP", Category = "Java Web" }
                });

            // Act
            var result = await _service.ImportCoursesFromExcelAsync(file, "staff-id");

            // Assert
            Assert.Equal(1, result.SuccessCount);
            Assert.Equal(0, result.FailedCount);

            // Verify skills created with category from AI
            var servletSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "Servlet");
            Assert.NotNull(servletSkill);
            Assert.Equal("Java Web", servletSkill.Category);

            var jspSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "JSP");
            Assert.NotNull(jspSkill);
            Assert.Equal("Java Web", jspSkill.Category);

            // Verify course created
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == "PRJ301");
            Assert.NotNull(course);

            // Verify CourseLearningOutcomes created and populated with navigation properties and correct outcome description from Excel
            var clos = await _context.CourseLearningOutcomes.Where(c => c.CourseId == course.CourseId).ToListAsync();
            Assert.Equal(2, clos.Count);

            var servletClo = clos.FirstOrDefault(c => c.SkillId == servletSkill.SkillId);
            Assert.NotNull(servletClo);
            Assert.Equal("Hiểu kiến trúc MVC", servletClo.OutcomeDescription);
            Assert.NotNull(servletClo.Course);
            Assert.NotNull(servletClo.Skill);

            var jspClo = clos.FirstOrDefault(c => c.SkillId == jspSkill.SkillId);
            Assert.NotNull(jspClo);
            Assert.Equal("Phát triển ứng dụng Web động", jspClo.OutcomeDescription);
            Assert.NotNull(jspClo.Course);
            Assert.NotNull(jspClo.Skill);
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_AiServiceThrows_FallsBackToGeneral()
        {
            // Arrange
            var sampleData = new string[,]
            {
                { "1", "PRJ301", "Java Web Application Development", "3", "90", "Servlet; JSP", "Hiểu kiến trúc MVC; Phát triển ứng dụng Web động", "Không" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ThrowsAsync(new Exception("AI service error"));

            // Act
            var result = await _service.ImportCoursesFromExcelAsync(file, "staff-id");

            // Assert
            Assert.Equal(1, result.SuccessCount);
            var servletSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "Servlet");
            Assert.NotNull(servletSkill);
            Assert.Equal("General", servletSkill.Category);
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_SplitOutcomeBySemicolonOnly()
        {
            // Arrange
            var sampleData = new string[,]
            {
                { "1", "PRJ301", "Java Web Application Development", "3", "90", "Servlet; JSP", "Hiểu MVC, phát phát; Phát triển Web", "Không" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_001", SkillName = "Servlet", Category = "Java Web" },
                    new SkillClassificationDto { SkillId = "SKL_002", SkillName = "JSP", Category = "Java Web" }
                });

            // Act
            var result = await _service.ImportCoursesFromExcelAsync(file, "staff-id");

            // Assert
            Assert.Equal(1, result.SuccessCount);

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == "PRJ301");
            Assert.NotNull(course);
            var clos = await _context.CourseLearningOutcomes.Where(c => c.CourseId == course.CourseId).ToListAsync();

            var servletSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "Servlet");
            Assert.NotNull(servletSkill);
            var servletClo = clos.FirstOrDefault(c => c.SkillId == servletSkill.SkillId);
            Assert.NotNull(servletClo);
            // Semicolon splits outcomes, so the first outcome is "Hiểu MVC, phát phát"
            Assert.Equal("Hiểu MVC, phát phát", servletClo.OutcomeDescription);

            var jspSkill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillName == "JSP");
            Assert.NotNull(jspSkill);
            var jspClo = clos.FirstOrDefault(c => c.SkillId == jspSkill.SkillId);
            Assert.NotNull(jspClo);
            // The second outcome is "Phát triển Web"
            Assert.Equal("Phát triển Web", jspClo.OutcomeDescription);
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_NewSkillsAndNoApiKey_ThrowsArgumentException()
        {
            // Arrange
            _mockConfig.Setup(c => c["AiSettings:ApiKey"]).Returns(string.Empty);

            var sampleData = new string[,]
            {
                { "1", "PRJ301", "Java Web Application Development", "3", "90", "Servlet; JSP", "Hiểu kiến trúc MVC; Phát triển ứng dụng Web động", "Không" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _service.ImportCoursesFromExcelAsync(file, "staff-id"));
            Assert.Contains("Phát hiện kỹ năng mới chưa có trong hệ thống", ex.Message);
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_NoNewSkillsAndNoApiKey_Succeeds()
        {
            // Arrange
            _mockConfig.Setup(c => c["AiSettings:ApiKey"]).Returns(string.Empty);

            _context.Skills.Add(new Skill { SkillId = "SKL_001", SkillName = "Servlet", Category = "Java Web" });
            _context.Skills.Add(new Skill { SkillId = "SKL_002", SkillName = "JSP", Category = "Java Web" });
            await _context.SaveChangesAsync();

            var sampleData = new string[,]
            {
                { "1", "PRJ301", "Java Web Application Development", "3", "90", "Servlet; JSP", "Hiểu kiến trúc MVC; Phát triển ứng dụng Web động", "Không" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            // Act
            var result = await _service.ImportCoursesFromExcelAsync(file, "staff-id");

            // Assert
            Assert.Equal(1, result.SuccessCount);
            Assert.Equal(0, result.FailedCount);
        }

        [Fact]
        public async Task ImportCoursesFromExcelAsync_FoundationalCourseMappedToTrue()
        {
            // Arrange
            var sampleData = new string[,]
            {
                { "1", "MAE101", "Mathematics", "3", "45", "Maths", "Math outcome", "Có" }
            };
            var file = CreateMockExcelFile("courses.xlsx", sampleData);

            _mockAiRecommendationService.Setup(s => s.ClassifySkillsAsync(It.IsAny<List<SkillClassificationDto>>(), It.IsAny<string>()))
                .ReturnsAsync(new List<SkillClassificationDto>
                {
                    new SkillClassificationDto { SkillId = "SKL_001", SkillName = "Maths", Category = "Mathematics" }
                });

            // Act
            var result = await _service.ImportCoursesFromExcelAsync(file, "staff-id");

            // Assert
            Assert.Equal(1, result.SuccessCount);
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == "MAE101");
            Assert.NotNull(course);
            Assert.True(course.IsFoundationalCourse);
        }
    }
}
