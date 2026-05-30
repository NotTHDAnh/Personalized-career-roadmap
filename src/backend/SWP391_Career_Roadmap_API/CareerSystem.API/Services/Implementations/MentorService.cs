using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace CareerSystem.API.Services.Implementations
{
    public class MentorService : IMentorService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public MentorService(AppDbContext context, IConfiguration configuration)
        {
            _configuration = configuration;
            _context = context;
        }

        public async Task<MentorAskResponseDto> AskAsync(MentorAskRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserId))
                throw new Exception("UserID is required.");

            if (string.IsNullOrWhiteSpace(request.Question))
                throw new Exception("Question is required.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);

            // Get roles that only appear in DB
            var careerRoles = await _context.CareerRoles
                .Select(r => new
                {
                    targetRoleId = r.RoleId,
                    roleName = r.RoleName,
                    description = r.Description
                }).ToListAsync();

            // Get passed course
            var passedCourse = await _context.AcademicRecords
                .Where(a => a.UserId == request.UserId && a.Gpa >= 5.0m)
                .Include(a => a.Course)
                .Select(a => new
                {
                    courseCode = a.Course.CourseCode,
                    courseName = a.Course.CourseName,
                    gpa = a.Gpa
                }).ToListAsync();

            // Get Course + Learning OutCOme, Skill from DB for contexting the AI
            var courseCatalog = await _context.Courses
                .Select(c => new
                {
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    credit = c.Credits,
                    totalStudyHours = c.TotalStudyHours,

                    learningOutcomes = _context.CourseLearningOutcomes
                    .Where(clo => clo.CourseId == c.CourseId)
                    .Select(clo => new
                    {
                        skillID = clo.SkillId,
                        skillName = clo.Skill.SkillName,
                        skillCategory = clo.Skill.Category,
                        outcomeDesc = clo.OutcomeDescription
                    })
                    .ToList()
                }).ToListAsync();

            // get context Data, contributing to AI Context
            var contextData = new
            {
                student = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                },
                question = request.Question,
                selectedTopic = request.SelectedTopic,
                careerRoles,
                passedCourse,
                courseCatalog
            };

            // convert(Serialize) data string to json
            string contextJson = JsonSerializer.Serialize(
                contextData,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );

            // get API key
            string apiKey = _configuration["AiSettings:ApiKey"]
                 ?? throw new Exception("Thiếu cấu hình API Key của hệ thống.");
            string prompt = $@"
                Bạn là Virtual Mentor cho sinh viên Software Engineering.

                Dữ liệu dưới đây lấy trực tiếp từ database.
                Bạn CHỈ được chọn targetRoleId có tồn tại trong careerRoles.
                Không được bịa role, course, skill.

                CONTEXT_JSON:
                {contextJson}

                Câu hỏi của sinh viên:
                {request.Question}

                Nhiệm vụ:
                1. Trả lời câu hỏi tư vấn nghề nghiệp của sinh viên.
                2. Nếu xác định được nghề phù hợp, chọn đúng targetRoleId từ careerRoles.
                3. Nếu câu hỏi chưa đủ rõ để chọn nghề, targetRoleId phải là null.
                4. Nếu targetRoleId là null, hãy hỏi thêm 1 câu để làm rõ định hướng.
                5. Không tạo roadmap.

                Định dạng bắt buộc, chỉ trả JSON:
                {{
                  ""answer"": ""câu trả lời tư vấn ngắn gọn"",
                  ""targetRoleId"": ""role id hoặc null"",
                  ""targetRoleName"": ""role name hoặc null"",
                  ""recommendedCareers"": [""career 1"", ""career 2""],
                  ""missingSkills"": [""skill 1"", ""skill 2""],
                  ""followUpQuestion"": ""câu hỏi thêm nếu chưa rõ, ngược lại để rỗng""
                }}";

            string aiJsonResponse = await CallGeminiApiAsync(prompt, apiKey);

            var result = JsonSerializer.Deserialize<MentorAskResponseDto>(
                aiJsonResponse,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
                );

            if (result == null)
            {
                return new MentorAskResponseDto
                {
                    Answer = "AI không trả về dữ liệu hợp lệ."
                };
            }

            // 4.Validate targetRoleID to avoid AI return garbage ID
            if (!string.IsNullOrWhiteSpace(result.TargetRoleId))
            {
                bool roleExist = await _context.CareerRoles
                    .AnyAsync(r => r.RoleId == result.TargetRoleId);

                if (!roleExist)
                {
                    result.TargetRoleId = null;
                    result.TargetRoleName = null;
                    result.FollowUpQuestion = "Bạn muốn định hướng theo mảng nào hơn: Backend, FrontEnd, FullStack, AI, Data hay Mobile?";
                }
            }

            return result;
        }

        private async Task<string> CallGeminiApiAsync(string prompt, string apiKey)
        {
            using var client = new HttpClient();

            apiKey = apiKey.Trim();
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var requestUri = new Uri(geminiUrl);

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var response = await client.PostAsJsonAsync(requestUri, requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gọi Gemini API: {errorMsg}");
            }

            var resonseJson = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(resonseJson);

            string textResult =
                jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString()
                ?? "{}";

            return CleanAiJson(textResult);
        }

        private string CleanAiJson(string text)
        {
            text = text.Trim();

            if (text.StartsWith("```json"))
                text = text.Substring(7);

            if (text.StartsWith("```"))
                text = text.Substring(3);

            if (text.EndsWith("```"))
                text = text.Substring(0, text.Length - 3);

            return text.Trim();
        }

    }
}
