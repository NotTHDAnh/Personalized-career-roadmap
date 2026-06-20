using System;
using System.Collections.Generic;
using System.Linq;
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
    public class RoadmapServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly Mock<IAiRecommendationService> _mockAiService;
        private readonly Mock<IPromptContextService> _mockPromptService;
        private readonly RoadmapService _service;

        public RoadmapServiceTests()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _mockAiService = new Mock<IAiRecommendationService>();
            _mockPromptService = new Mock<IPromptContextService>();
            _service = new RoadmapService(_context, _mockAiService.Object, _mockPromptService.Object);

            SeedData();
        }

        private void SeedData()
        {
            var targetRole = new CareerRole
            {
                RoleId = "role-backend-developer",
                RoleName = "Backend Developer",
                Description = "Builds APIs"
            };
            _context.CareerRoles.Add(targetRole);

            var skill = new Skill
            {
                SkillId = "skill-csharp",
                SkillName = "C# Programming",
                Category = "Development"
            };
            _context.Skills.Add(skill);

            // 1. Valid Roadmap with 3 nodes unsorted by deadline
            var roadmap1 = new Roadmap
            {
                RoadmapId = "valid-roadmap-guid",
                UserId = "user-student-id",
                TargetRoleId = "role-backend-developer",
                DailyStudyHours = 3.5m,
                ProgressPercent = 25.0m,
                TargetRole = targetRole
            };
            _context.Roadmaps.Add(roadmap1);

            var course1 = new Course { CourseId = "c1", CourseCode = "CS101", CourseName = "Intro to CS" };
            var course2 = new Course { CourseId = "c2", CourseCode = "CS102", CourseName = "Data Structures" };
            _context.Courses.AddRange(course1, course2);

            var node1 = new SkillNode { NodeId = "n1", RoadmapId = "valid-roadmap-guid", SkillId = "skill-csharp", Deadline = DateOnly.FromDateTime(DateTime.Now.AddDays(10)), Course = course1 };
            var node2 = new SkillNode { NodeId = "n2", RoadmapId = "valid-roadmap-guid", SkillId = "skill-csharp", Deadline = DateOnly.FromDateTime(DateTime.Now.AddDays(5)), Course = course2 };
            _context.SkillNodes.AddRange(node1, node2);

            // 2. Roadmap with 0 nodes
            var roadmap2 = new Roadmap
            {
                RoadmapId = "roadmap-zero-nodes",
                UserId = "user-student-id",
                TargetRoleId = "role-backend-developer",
                DailyStudyHours = 2.0m,
                ProgressPercent = 0.0m,
                TargetRole = targetRole
            };
            _context.Roadmaps.Add(roadmap2);

            // 3. Roadmap with null Course properties
            var roadmap3 = new Roadmap
            {
                RoadmapId = "roadmap-null-courses",
                UserId = "user-student-id",
                TargetRoleId = "role-backend-developer",
                DailyStudyHours = 2.0m,
                ProgressPercent = 0.0m,
                TargetRole = targetRole
            };
            _context.Roadmaps.Add(roadmap3);
            _context.SkillNodes.Add(new SkillNode { NodeId = "n3", RoadmapId = "roadmap-null-courses", SkillId = "skill-csharp", Deadline = DateOnly.FromDateTime(DateTime.Now), Course = null });

            // 4. Roadmap with null DailyStudyHours and ProgressPercent
            var roadmap4 = new Roadmap
            {
                RoadmapId = "roadmap-null-values",
                UserId = "user-student-id",
                TargetRoleId = "role-backend-developer",
                DailyStudyHours = null,
                ProgressPercent = null,
                TargetRole = targetRole
            };
            _context.Roadmaps.Add(roadmap4);

            // 5. Roadmap with null TargetRole (to trigger null reference exception)
            var roadmap5 = new Roadmap
            {
                RoadmapId = "roadmap-null-role",
                UserId = "user-student-id",
                TargetRoleId = "role-nonexistent", // Nonexistent to prevent relation auto-fixup
                DailyStudyHours = 2.0m,
                ProgressPercent = 0.0m,
                TargetRole = null! // Navigation property set to null
            };
            _context.Roadmaps.Add(roadmap5);

            _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        // UTCID01: Normal Get (Multiple nodes sorted by deadline)
        [Fact]
        public async Task GetRoadmapDetailAsync_ValidRoadmap_ReturnsSortedNodes()
        {
            var result = await _service.GetRoadmapDetailAsync("valid-roadmap-guid");

            Assert.NotNull(result);
            Assert.Equal("valid-roadmap-guid", result.RoadmapId);
            Assert.Equal("Backend Developer", result.TargetRoleName);
            Assert.Equal(3.5m, result.DailyStudyHours);
            Assert.Equal(25.0m, result.ProgressPercent);
            
            // Assert sorting order (n2 has 5 days deadline, n1 has 10 days)
            var beginnerPhase = result.Phases.FirstOrDefault(p => p.PhaseName.Equals("Beginner", StringComparison.OrdinalIgnoreCase));
            Assert.NotNull(beginnerPhase);
            Assert.Equal(2, beginnerPhase.Nodes.Count);
            Assert.Equal("n2", beginnerPhase.Nodes[0].NodeId);
            Assert.Equal("CS102", beginnerPhase.Nodes[0].CourseCode);
            Assert.Equal("n1", beginnerPhase.Nodes[1].NodeId);
            Assert.Equal("CS101", beginnerPhase.Nodes[1].CourseCode);
        }

        // UTCID04: Abnormal Get - Non-existent roadmapId
        [Fact]
        public async Task GetRoadmapDetailAsync_NonExistentId_ThrowsException()
        {
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.GetRoadmapDetailAsync("nonexistent-guid"));
            Assert.Equal("Không tìm thấy lộ trình yêu cầu.", ex.Message);
        }

        // UTCID02 & UTCID03: Abnormal Get - Null/Empty roadmapId
        [Fact]
        public async Task GetRoadmapDetailAsync_NullOrEmptyId_ThrowsException()
        {
            await Assert.ThrowsAsync<Exception>(() => _service.GetRoadmapDetailAsync(null!));
            await Assert.ThrowsAsync<Exception>(() => _service.GetRoadmapDetailAsync(""));
        }

        // UTCID05: Normal Get - 0 nodes
        [Fact]
        public async Task GetRoadmapDetailAsync_ZeroNodes_ReturnsEmptyList()
        {
            var result = await _service.GetRoadmapDetailAsync("roadmap-zero-nodes");
            Assert.Empty(result.Phases);
        }

        // UTCID07: Normal Get - Null Course properties
        [Fact]
        public async Task GetRoadmapDetailAsync_NullCourse_ReturnsNullCourseDetails()
        {
            var result = await _service.GetRoadmapDetailAsync("roadmap-null-courses");
            var beginnerPhase = result.Phases.FirstOrDefault(p => p.PhaseName.Equals("Beginner", StringComparison.OrdinalIgnoreCase));
            Assert.NotNull(beginnerPhase);
            Assert.Single(beginnerPhase.Nodes);
            Assert.Null(beginnerPhase.Nodes[0].CourseCode);
            Assert.Null(beginnerPhase.Nodes[0].CourseName);
        }

        // UTCID08: Abnormal Get - Null TargetRole throws Exception
        [Fact]
        public async Task GetRoadmapDetailAsync_NullTargetRole_ThrowsException()
        {
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.GetRoadmapDetailAsync("roadmap-null-role"));
            Assert.Equal("Không tìm thấy lộ trình yêu cầu.", ex.Message);
        }

        // UTCID09 & UTCID10: Normal Get - Null values fallback to 0
        [Fact]
        public async Task GetRoadmapDetailAsync_NullHoursAndProgress_DefaultsToZero()
        {
            var result = await _service.GetRoadmapDetailAsync("roadmap-null-values");
            Assert.Equal(0m, result.DailyStudyHours);
            Assert.Equal(0m, result.ProgressPercent);
        }
    }
}
