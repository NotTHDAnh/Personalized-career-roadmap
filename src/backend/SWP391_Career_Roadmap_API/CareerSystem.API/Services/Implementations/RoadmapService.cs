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

            // 5. Khởi tạo Roadmap
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

            // 6. Bóc tách kết quả JSON, đối chiếu với Database thật, tính toán Deadline, rồi khởi tạo các Node học tập tương ứng
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var recommendedCourses = JsonSerializer.Deserialize<List<AiCourseRecommendationDto>>(aiJsonResponse, options);

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;

                //Tránh lỗi chia cho 0 nếu sinh viên nhập DailyStudyHours = 0
                decimal dailyHours = request.DailyStudyHours > 0 ? (decimal)request.DailyStudyHours : 2.0m;

                foreach (var rec in recommendedCourses)
                {
                    // 6.1. Đối chiếu mã môn AI chọn với Database thật
                    if (string.IsNullOrWhiteSpace(rec.CourseCode)) continue;

                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == rec.CourseCode);
                    if (courseDb == null) continue; // Bỏ qua nếu AI bịa mã môn sai

                    // 6.2. Truy xuất kỹ năng cốt lõi của môn học (Để map vào SkillId)
                    var skillDb = await (
                        from clo in _context.CourseLearningOutcomes
                        join skill in _context.Skills on clo.SkillId equals skill.SkillId
                        where clo.CourseId == courseDb.CourseId
                        select skill
                    ).FirstOrDefaultAsync();

                    if (skillDb == null && !string.IsNullOrWhiteSpace(rec.SkillName))
                    {
                        skillDb = await _context.Skills.FirstOrDefaultAsync(s =>
                            s.SkillName.Contains(rec.SkillName) || rec.SkillName.Contains(s.SkillName));
                    }

                    // Nếu tìm mọi cách vẫn không có skill nào khớp thì bỏ qua
                    if (skillDb == null)
                    {
                        continue;
                    }

                    // 6.3. Thuật toán tính toán thời gian hoàn thành (Deadline)
                    int totalHours = courseDb.TotalStudyHours ?? 30;
                    int daysRequired = (int)Math.Ceiling(totalHours / dailyHours);
                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    // 6.4. Khởi tạo Node học tập
                    var node = new SkillNode
                    {
                        NodeId = Guid.NewGuid().ToString(),
                        RoadmapId = newRoadmap.RoadmapId,      // Nối với vỏ lộ trình vừa tạo
                        SkillId = skillDb.SkillId,             // Nối với kỹ năng chuẩn
                        CourseId = courseDb.CourseId,          // Nối với môn học chuẩn
                        ParentNodeId = previousNodeId,         // Nối tiếp với môn học trước đó (A -> B -> C)
                        Status = "PENDING",
                        Deadline = currentDeadline
                    };

                    _context.SkillNodes.Add(node);

                    // Cập nhật lại previousNodeId để môn tiếp theo có thể nối vào đuôi môn này
                    previousNodeId = node.NodeId;
                }
            }

            // 7. Lưu Roadmap và các SkillNode xuống Database
            await _context.SaveChangesAsync();

            return newRoadmap.RoadmapId;
        }


        // HÀM GỌI GEMINI API
        private async Task<string> CallGeminiApiAsync(string prompt, string apiKey)
        {
            using var client = new HttpClient();

            // 1. CHUẨN HOÁ API KEY
            apiKey = apiKey.Trim();
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";
            var requestUri = new Uri(geminiUrl);

            // 2. ĐÓNG GÓI YÊU CẦU
            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            // 3. GỌI API
            var response = await client.PostAsJsonAsync(requestUri, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gọi Gemini API: {errorMsg}");
            }

            // 4. BÓC TÁCH KẾT QUẢ
            var responseJson = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(responseJson);

            string textResult = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString() ?? "[]";

            // 5. TRUYỀN QUA HÀM CHUẨN HOÁ TRƯỚC KHI TRẢ VỀ
            return CleanJsonString(textResult);
        }

        // HÀM CHUẨN HOÁ JSON
        private string CleanJsonString(string text)
        {
            // Tìm vị trí của dấu ngoặc vuông mở '[' đầu tiên và đóng ']' cuối cùng
            int startIndex = text.IndexOf('[');
            int endIndex = text.LastIndexOf(']');

            // Nếu tìm thấy mảng JSON, chỉ cắt lấy đúng phần đó, bỏ toàn bộ chữ rác
            if (startIndex >= 0 && endIndex >= startIndex)
            {
                return text.Substring(startIndex, endIndex - startIndex + 1);
            }

            // Nếu không có dấu ngoặc vuông nào, trả về chuỗi gốc đã cắt khoảng trắng
            return text.Trim();
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
    }
}