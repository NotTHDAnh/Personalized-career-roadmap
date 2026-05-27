using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace CareerSystem.API.Services.Implementations
{
    public class RoadmapService : IRoadmapService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public RoadmapService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request)
        {
            // 1. Kiểm tra xem user và role có tồn tại không
            var targetRole = await _context.CareerRoles.FindAsync(request.TargetRoleId)
                ?? throw new Exception("Không tìm thấy nghề nghiệp mục tiêu.");

            // 2. Tạm thời dùng hàm Mock để giả lập kết quả AI (tránh lỗi gọi mạng khi đang code)
            string aiJsonResponse = GetMockAiResponse();

            // 3. Khởi tạo Lộ trình (Roadmap) mới
            var newRoadmap = new Roadmap
            {
                RoadmapId = Guid.NewGuid().ToString(),
                UserId = request.UserId,
                TargetRoleId = request.TargetRoleId,
                DailyStudyHours = request.DailyStudyHours,
                ProgressPercent = 0,
                CreatedAt = DateTime.Now
            };
            _context.Roadmaps.Add(newRoadmap);

            // 4. Đọc kết quả AI & TÍNH TOÁN DEADLINE nối tiếp
            var recommendedCourses = JsonSerializer.Deserialize<List<AiCourseRecommendationDto>>(aiJsonResponse);

            if (recommendedCourses != null)
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;

                foreach (var rec in recommendedCourses)
                {
                    // Lấy môn học từ DB để biết cần bao nhiêu giờ học (TotalStudyHours)
                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == rec.CourseCode);

                    // Nếu môn học có trong DB thì lấy số giờ, nếu không có mặc định cho 30 giờ
                    int totalHours = courseDb?.TotalStudyHours ?? 30;

                    // Tính số ngày hoàn thành: Tổng giờ học / Giờ học mỗi ngày (Làm tròn lên)
                    int daysRequired = (int)Math.Ceiling(totalHours / request.DailyStudyHours);

                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    var node = new SkillNode
                    {
                        NodeId = Guid.NewGuid().ToString(),
                        RoadmapId = newRoadmap.RoadmapId,
                        SkillId = "SKILL_AUTO_GEN",
                        CourseId = courseDb?.CourseId,
                        ParentNodeId = previousNodeId,
                        Status = "PENDING",
                        Deadline = currentDeadline
                    };

                    _context.SkillNodes.Add(node);
                    previousNodeId = node.NodeId; // Lưu lại ID để môn sau nối đuôi vào môn trước
                }
            }

            // 5. Lưu toàn bộ xuống SQL Server
            await _context.SaveChangesAsync();

            return newRoadmap.RoadmapId;
        }

        // Hàm giả lập dữ liệu trả về từ AI 
        private string GetMockAiResponse()
        {
            return @"[
                { ""courseCode"": ""PRJ301"", ""skillName"": ""Java Web Development"" },
                { ""courseCode"": ""IOT102"", ""skillName"": ""Internet of Things"" }
            ]";
        }
    }
}