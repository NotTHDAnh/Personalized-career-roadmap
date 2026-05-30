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

<<<<<<< HEAD
            string passedCoursesText = passedCourses.Any() ? string.Join(", ", passedCourses) : "Chưa có môn nào";

            // Get all the course from database
            var allCourses = await _context.Courses
            .Select(c => new
            {
                c.CourseCode,
                c.CourseName,
                c.TotalStudyHours
            })

            .ToListAsync();

            // convert course to text
            string availableCoursesText =
            string.Join("\n",
                allCourses.Select(c =>
                    $"- {c.CourseCode}: {c.CourseName} ({c.TotalStudyHours}h)"
                )
            );

            // Lấy toàn bộ course + learning outcomes + skills từ DB
            var courseCatalog = await _context.Courses
                .Select(c => new
                {
                    courseId = c.CourseId,
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    credits = c.Credits,
                    totalStudyHours = c.TotalStudyHours,

                    learningOutcomes = _context.CourseLearningOutcomes
                        .Where(clo => clo.CourseId == c.CourseId)
                        .Select(clo => new
                        {
                            outcomeId = clo.Id,
                            skillId = clo.SkillId,
                            skillName = clo.Skill.SkillName,
                            skillCategory = clo.Skill.Category,
                            outcomeDescription = clo.OutcomeDescription
                        })
                        .ToList()
                })
                .ToListAsync();
            // serialize data to json
            var courseCatalogJson = JsonSerializer.Serialize(
                courseCatalog,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );

            // 2. Ép API Key từ appsettings.json
            string apiKey = _configuration["AiSettings:ApiKey"]
                ?? throw new Exception("Thiếu cấu hình API Key của hệ thống.");

            // 3. Viết Prompt "điều khiển" AI
            string prompt = $@"
                Bạn là Mentor IT cho sinh viên Software Engineering.

                Mục tiêu nghề nghiệp của sinh viên:
                {targetRole.RoleName}

                Các môn sinh viên đã hoàn thành:
                {passedCoursesText}

                Đây là COURSE_CATALOG_JSON lấy trực tiếp từ database.
                Bạn CHỈ được chọn courseCode và skillId tồn tại trong JSON này.

                COURSE_CATALOG_JSON:
                {courseCatalogJson}

                Yêu cầu:
                - Đề xuất các môn tiếp theo phù hợp với target role.
                - Không chọn môn sinh viên đã hoàn thành.
                - Không bịa courseCode.
                - Không bịa skillId.
                - Mỗi item phải dùng courseCode và skillId có trong COURSE_CATALOG_JSON.
                - Nếu một môn có nhiều learning outcomes, chọn skillId phù hợp nhất.

               Định dạng bắt buộc:
                [
                  {{ ""courseCode"": ""MÃ_MÔN"", ""skillName"": ""Tên Kỹ năng (Ngắn gọn)"" }}
                ]";

            // 4. Gọi Gemini API thật
            string aiJsonResponse = await CallGeminiApiAsync(prompt, apiKey);

            // 5. Khởi tạo Lộ trình
=======
            // 3. Khởi tạo Lộ trình (Roadmap) mới
>>>>>>> parent of 0cd2494 (Merge branch 'feature/AI' of https://github.com/NotTHDAnh/personalized-career-roadmap into feature/AI)
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

<<<<<<< HEAD


            if (recommendedCourses != null && recommendedCourses.Any())
=======
            if (recommendedCourses != null)
>>>>>>> parent of 0cd2494 (Merge branch 'feature/AI' of https://github.com/NotTHDAnh/personalized-career-roadmap into feature/AI)
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;

                foreach (var rec in recommendedCourses)
                {
<<<<<<< HEAD
                    // Tìm course trong DB dựa trên courseCode mà AI trả về.
                    // Nếu AI trả courseCode không tồn tại thì bỏ qua để tránh lỗi FK course_id.
                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == rec.CourseCode);

                    if (courseDb == null)
                    {
                        continue;
                    }
                    // Lấy skill thật từ DB thông qua CourseLearningOutcomes.
                    // SkillNode.SkillId là foreign key tới Skills.SkillId,
                    var skillDb = await (
                        from clo in _context.CourseLearningOutcomes
                        join skill in _context.Skills on clo.SkillId equals skill.SkillId
                        where clo.CourseId == courseDb.CourseId
                        select skill
                    ).FirstOrDefaultAsync();

                    // Nếu course chưa được map với skill nào trong DB thì bỏ qua.
                    // Làm vậy để không insert SkillNode với skill_id rác.
                    if (skillDb == null)
                    {
                        continue;
                    }

                    int totalHours = courseDb?.TotalStudyHours ?? 30; // Nếu AI bịa ra môn mới chưa có trong DB, mặc định cho 30 giờ
=======
                    // Lấy môn học từ DB để biết cần bao nhiêu giờ học (TotalStudyHours)
                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == rec.CourseCode);
>>>>>>> parent of 0cd2494 (Merge branch 'feature/AI' of https://github.com/NotTHDAnh/personalized-career-roadmap into feature/AI)

                    // Nếu môn học có trong DB thì lấy số giờ, nếu không có mặc định cho 30 giờ
                    int totalHours = courseDb?.TotalStudyHours ?? 30;

                    // Tính số ngày hoàn thành: Tổng giờ học / Giờ học mỗi ngày (Làm tròn lên)
                    int daysRequired = (int)Math.Ceiling(totalHours / request.DailyStudyHours);

                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    var node = new SkillNode
                    {
                        NodeId = Guid.NewGuid().ToString(),
                        RoadmapId = newRoadmap.RoadmapId,
                        SkillId = skillDb.SkillId,
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
<<<<<<< HEAD
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
=======
>>>>>>> parent of 0cd2494 (Merge branch 'feature/AI' of https://github.com/NotTHDAnh/personalized-career-roadmap into feature/AI)
    }
}