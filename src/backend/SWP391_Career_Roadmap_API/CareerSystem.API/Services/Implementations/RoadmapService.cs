using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes; // Thư viện dùng để đọc kết quả từ Gemini

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
            // 1. Lấy thông tin nghề nghiệp và các môn sinh viên đã học
            var targetRole = await _context.CareerRoles.FindAsync(request.TargetRoleId)
                ?? throw new Exception("Không tìm thấy nghề nghiệp mục tiêu.");

            var passedCourses = await _context.AcademicRecords
                .Where(a => a.UserId == request.UserId && a.Gpa >= 5.0m)
                .Include(a => a.Course)
                .Select(a => a.Course.CourseCode)
                .ToListAsync();

            string passedCoursesText = passedCourses.Any() ? string.Join(", ", passedCourses) : "Chưa có môn nào";

            // 2. Ép API Key từ appsettings.json
            string apiKey = _configuration["AiSettings:ApiKey"]
                ?? throw new Exception("Thiếu cấu hình API Key của hệ thống.");

            // 3. Viết Prompt "điều khiển" AI
            string prompt = $@"
                Bạn là một Mentor IT xuất sắc. 
                Mục tiêu của sinh viên là trở thành: {targetRole.RoleName}.
                Sinh viên đã hoàn thành các môn: {passedCoursesText}.
                Hãy đề xuất lộ trình học tiếp theo (gồm 3-5 môn cốt lõi, không trùng với môn đã học).
                
                QUAN TRỌNG: Chỉ trả về MỘT mảng JSON duy nhất, không kèm văn bản giải thích.
                Định dạng bắt buộc:
                [
                  {{ ""courseCode"": ""MÃ_MÔN"", ""skillName"": ""Tên Kỹ năng (Ngắn gọn)"" }}
                ]";

            // 4. Gọi Gemini API thật
            string aiJsonResponse = await CallGeminiApiAsync(prompt, apiKey);

            // 5. Khởi tạo Lộ trình
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

            // 6. Phân tích kết quả JSON & Tính toán Deadline
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var recommendedCourses = JsonSerializer.Deserialize<List<AiCourseRecommendationDto>>(aiJsonResponse, options);

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;

                foreach (var rec in recommendedCourses)
                {
                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == rec.CourseCode);
                    int totalHours = courseDb?.TotalStudyHours ?? 30; // Nếu AI bịa ra môn mới chưa có trong DB, mặc định cho 30 giờ

                    int daysRequired = (int)Math.Ceiling((decimal)totalHours / request.DailyStudyHours);
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
                    previousNodeId = node.NodeId;
                }
            }

            // 7. Lưu xuống DB
            await _context.SaveChangesAsync();

            return newRoadmap.RoadmapId;
        }

        // HÀM GỌI GEMINI API
        private async Task<string> CallGeminiApiAsync(string prompt, string apiKey)
        {
            using var client = new HttpClient();

            // 1. DỌN DẸP API KEY: Cắt bỏ mọi khoảng trắng hoặc dấu Enter thừa nếu copy bị dính
            apiKey = apiKey.Trim();

            // Model mới nhất của Google hiện tại (2.5 Flash)
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            // 2. ÉP KIỂU TƯỜNG MINH: Chuyển chuỗi thành đối tượng Uri để HttpClient không bao giờ báo lỗi
            var requestUri = new Uri(geminiUrl);

            var requestBody = new
            {
                contents = new[]
                {
            new
            {
                parts = new[] { new { text = prompt } }
            }
        }
            };

            // 3. TRUYỀN VÀO BẰNG ĐỐI TƯỢNG Uri VỪA TẠO Ở TRÊN
            var response = await client.PostAsJsonAsync(requestUri, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gọi Gemini API: {errorMsg}");
            }

            // ... (Đoạn code bóc tách JSON bên dưới bạn giữ nguyên y hệt như cũ nhé) ...

            var responseJson = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(responseJson);

            string textResult = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString() ?? "[]";

            textResult = textResult.Trim();
            if (textResult.StartsWith("```json")) textResult = textResult.Substring(7);
            if (textResult.StartsWith("```")) textResult = textResult.Substring(3);
            if (textResult.EndsWith("```")) textResult = textResult.Substring(0, textResult.Length - 3);

            return textResult.Trim();
        }

        public async Task<RoadmapDetailDto> GetRoadmapDetailAsync(string roadmapId)
        {
            // Tìm lộ trình và kết nối sang bảng CareerRoles, cùng bảng SkillNodes và Courses
            var roadmap = await _context.Roadmaps
                .Include(r => r.TargetRole)
                .Include(r => r.SkillNodes)
                    .ThenInclude(sn => sn.Course) // Đi xuyên sang bảng Courses để lấy Tên/Mã môn
                .FirstOrDefaultAsync(r => r.RoadmapId == roadmapId);

            if (roadmap == null)
            {
                throw new Exception("Không tìm thấy lộ trình yêu cầu.");
            }

            // Ánh xạ dữ liệu từ Entity (Database) sang DTO (gửi cho FE)
            var result = new RoadmapDetailDto
            {
                RoadmapId = roadmap.RoadmapId,
                TargetRoleName = roadmap.TargetRole.RoleName,
                DailyStudyHours = roadmap.DailyStudyHours ?? 0,
                ProgressPercent = roadmap.ProgressPercent ?? 0,
                // Sắp xếp các môn học theo thứ tự Deadline tăng dần để FE vẽ từ trái sang phải
                Nodes = roadmap.SkillNodes.OrderBy(sn => sn.Deadline).Select(sn => new SkillNodeDetailDto
                {
                    NodeId = sn.NodeId,
                    CourseCode = sn.Course?.CourseCode,
                    CourseName = sn.Course?.CourseName,
                    Status = sn.Status,
                    Deadline = sn.Deadline,
                    ParentNodeId = sn.ParentNodeId
                }).ToList()
            };

            return result;
        }

        //// HÀM GỌI GEMINI API
        //private async Task<string> CallGeminiApiAsync(string prompt, string apiKey)
        //{
        //    using var client = new HttpClient();

        //    // API Endpoint của Google Gemini 1.5 Flash (Model mới nhất và nhanh nhất)
        //    string geminiUrl = $"[https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=){apiKey}";

        //    // Xây dựng Body đúng chuẩn tài liệu của Google
        //    var requestBody = new
        //    {
        //        contents = new[]
        //        {
        //            new
        //            {
        //                parts = new[] { new { text = prompt } }
        //            }
        //        }
        //    };

        //    var response = await client.PostAsJsonAsync(geminiUrl, requestBody);

        //    if (!response.IsSuccessStatusCode)
        //    {
        //        var errorMsg = await response.Content.ReadAsStringAsync();
        //        throw new Exception($"Lỗi gọi Gemini API: {errorMsg}");
        //    }

        //    // Đọc cục JSON khổng lồ trả về
        //    var responseJson = await response.Content.ReadAsStringAsync();
        //    var jsonNode = JsonNode.Parse(responseJson);

        //    // Bóc tách đi sâu vào cấu trúc để lấy đúng đoạn text AI sinh ra
        //    string textResult = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString() ?? "[]";

        //    // BƯỚC QUAN TRỌNG: Dọn dẹp chuỗi (Vì AI hay bọc kết quả trong markdown ```json ... ```)
        //    textResult = textResult.Trim();
        //    if (textResult.StartsWith("```json"))
        //    {
        //        textResult = textResult.Substring(7); // Cắt bỏ chữ ```json ở đầu
        //    }
        //    if (textResult.StartsWith("```"))
        //    {
        //        textResult = textResult.Substring(3);
        //    }
        //    if (textResult.EndsWith("```"))
        //    {
        //        textResult = textResult.Substring(0, textResult.Length - 3); // Cắt bỏ ``` ở cuối
        //    }

        //    return textResult.Trim();
        //}
    }
}