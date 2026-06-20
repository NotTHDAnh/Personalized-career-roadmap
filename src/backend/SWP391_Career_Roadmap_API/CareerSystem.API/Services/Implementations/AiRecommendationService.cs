using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CareerSystem.API.Services.Implementations
{
    public class AiRecommendationService : IAiRecommendationService
    {
        private readonly IGeminiService _geminiService;
        private readonly AppDbContext _context;
        private readonly ILogger<AiRecommendationService> _logger;

        public AiRecommendationService(IGeminiService geminiService, AppDbContext context, ILogger<AiRecommendationService> logger)
        {
            _geminiService = geminiService;
            _context = context;
            _logger = logger;
        }

        private async Task<MentorAskResponseDto> ProcessAndValidateAiResponseAsync(string aiJsonResponse)
        {
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

            // Validate targetRoleID to avoid AI returning garbage ID
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

        /// <summary>
        /// Thực thi tập trung các hành động gọi AI (gọi Gemini, parse JSON, validate) có đi kèm bọc try-catch lỗi.
        /// Khi xảy ra lỗi, hàm ghi nhận chi tiết (StackTrace) lỗi vào logger của backend và trả về giá trị fallback mặc định.
        /// </summary>
        /// <typeparam name="T">Kiểu dữ liệu trả về mong muốn của hành động.</typeparam>
        /// <param name="aiAction">Hành động bất đồng bộ thực tế gọi AI và xử lý dữ liệu.</param>
        /// <param name="fallbackFactory">Phương thức cung cấp đối tượng trả về mặc định tương ứng với từng Exception cụ thể.</param>
        /// <param name="contextName">Tên ngữ cảnh / tên hàm gọi AI phục vụ mục đích ghi log.</param>
        /// <returns>Kết quả thực thi AI thành công hoặc đối tượng fallback được xây dựng từ exception.</returns>
        private async Task<T> ExecuteAiActionWithFallbackAsync<T>(
            Func<Task<T>> aiAction,
            Func<Exception, T> fallbackFactory,
            string contextName)
        {
            try
            {
                return await aiAction();
            }
            catch (Exception ex)
            {
                // Ghi nhận chi tiết lỗi kèm theo StackTrace để phục vụ việc debug ở backend
                _logger.LogError(ex, "Lỗi xảy ra trong quá trình xử lý AI ({ContextName})", contextName);
                return fallbackFactory(ex);
            }
        }

        /// <summary>
        /// Gửi câu hỏi tư vấn của sinh viên và ngữ cảnh học tập / GitHub đến Gemini để lấy lời khuyên cố vấn từ Virtual Mentor.
        /// Kết quả trả về sẽ được parse thành DTO hoàn chỉnh và kiểm tra tính hợp lệ của CareerRole trong database.
        /// </summary>
        /// <param name="contextJson">Chuỗi JSON chứa thông tin sinh viên, lịch sử chat, định hướng và danh mục môn học.</param>
        /// <param name="githubContextJson">Chuỗi JSON thông tin các repository GitHub của sinh viên (nếu có).</param>
        /// <param name="question">Câu hỏi cần tư vấn của sinh viên.</param>
        /// <param name="apiKey">API Key Gemini của người dùng.</param>
        /// <returns>Đối tượng <see cref="MentorAskResponseDto"/> chứa câu trả lời tư vấn ngắn gọn và các đề xuất nghề nghiệp/kỹ năng.</returns>
        public async Task<MentorAskResponseDto> GetMentorAdviceAsync(string contextJson, string githubContextJson, string question, string apiKey)
        {
            return await ExecuteAiActionWithFallbackAsync(async () =>
            {
                // Định nghĩa câu lệnh Prompt cho Virtual Mentor, cung cấp đầy đủ dữ liệu ngữ cảnh thực tế từ DB
                string prompt = $@"
                    Bạn là Virtual Mentor cho sinh viên Software Engineering.

                    Dữ liệu dưới đây lấy trực tiếp từ database.
                    Bạn CHỈ được chọn targetRoleId có tồn tại trong careerRoles.
                    Không được bịa role, course, skill.

                    CONTEXT_JSON:
                    {contextJson}

                    Câu hỏi của sinh viên:
                    {question}

                    GitHub repositories:
                    {githubContextJson}

                    Nhiệm vụ:
                    1. Trả lời câu hỏi tư vấn nghề nghiệp của sinh viên.
                    2. Nếu xác định được nghề phù hợp, chọn đúng targetRoleId từ careerRoles.
                    3. Nếu câu hỏi chưa đủ rõ để chọn nghề, targetRoleId phải là null.
                    4. Nếu targetRoleId là null, hãy hỏi thêm 1 câu để làm rõ định hướng.
                    5. Không tạo roadmap.
                    8. Chỉ dùng GitHub Repo nếu có.
                    9. Nếu GitHub Repo trống hoặc là [], hãy bỏ qua hoàn toàn phần phân tích GitHub và tuyệt đối không nhắc đến việc thiếu GitHub trong câu trả lời.
                    10. Dùng chatHistory để hiểu ngữ cảnh trước đó, vị dụ target role đã được nhắc tới trước đó.

                    Định dạng bắt buộc, chỉ trả JSON:
                    {{
                      ""answer"": ""câu trả lời tư vấn ngắn gọn"",
                      ""targetRoleId"": ""role id hoặc null"",
                      ""targetRoleName"": ""role name hoặc null"",
                      ""recommendedCareers"": [""career 1"", ""career 2""],
                      ""missingSkills"": [""skill 1"", ""skill 2""],
                      ""followUpQuestion"": ""câu hỏi thêm nếu chưa rõ, ngược lại để rỗng""
                    }}";

                // Gọi Gemini API thông qua GeminiService
                string aiJsonResponse = await _geminiService.CallGeminiApiAsync(prompt, apiKey);
                
                // Parse kết quả trả về thành dạng DTO và validate sự tồn tại của targetRoleId trong database
                return await ProcessAndValidateAiResponseAsync(aiJsonResponse);
            },
            ex => new MentorAskResponseDto
            {
                // Khi xảy ra lỗi gọi AI hoặc parse JSON, trả về thông điệp thân thiện với người dùng cuối
                Answer = "Hệ thống cố vấn học tập AI đang bận hoặc gặp sự cố. Bạn vui lòng thử lại sau ít phút nhé.",
                TargetRoleId = "",
                TargetRoleName = "",
                RecommendedCareers = new List<string>(),
                MissingSkills = new List<string>(),
                FollowUpQuestion = ""
            },
            nameof(GetMentorAdviceAsync));
        }

        /// <summary>
        /// Đưa mục tiêu nghề nghiệp, các môn học sinh viên đã hoàn thành và danh mục môn học trong cơ sở dữ liệu
        /// cho AI phân tích để đề xuất các môn học tiếp theo tạo thành lộ trình học tập tối ưu.
        /// </summary>
        /// <param name="targetRole">Đối tượng CareerRole thể hiện vị trí công việc sinh viên hướng tới.</param>
        /// <param name="passedCoursesText">Chuỗi mô tả danh sách các mã môn học sinh viên đã hoàn thành.</param>
        /// <param name="courseCatalogJson">Chuỗi JSON danh mục tất cả môn học cùng kết quả học tập kỳ vọng từ cơ sở dữ liệu.</param>
        /// <param name="apiKey">API Key Gemini của người dùng.</param>
        /// <returns>Danh sách các đối tượng <see cref="AiCourseRecommendationDto"/> chứa các mã môn và kỹ năng đề xuất tương ứng.</returns>
        public async Task<List<AiCourseRecommendationDto>> GetRoadmapCoursesAsync(CareerRole targetRole, string passedCoursesText, string courseCatalogJson, string apiKey)
        {
            return await ExecuteAiActionWithFallbackAsync(async () =>
            {
                // Định nghĩa Prompt chỉ dẫn đề xuất lộ trình học tập phù hợp dựa trên cơ sở dữ liệu thực tế
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

                    Dưới đây là danh sách các môn học nền tảng/chung bắt buộc cho tất cả sinh viên ngành Software Engineering (SE) (chỉ chọn nếu sinh viên CHƯA hoàn thành và môn đó CÓ TỒN TẠI trong COURSE_CATALOG_JSON):
                    - CSI106 (Nhập môn Khoa học máy tính)
                    - PRF192 (Kỹ thuật lập trình)
                    - MAE101 (Toán cho ngành kỹ thuật)
                    - MAD101 (Toán rời rạc)
                    - CEA201 (Kiến trúc máy tính)
                    - PRO192 (Lập trình hướng đối tượng)
                    - DBI202 (Hệ quản trị cơ sở dữ liệu)
                    - OSG202 (Hệ điều hành)
                    - CNA201 (Mạng máy tính)
                    - LAB211 (Thực hành OOP)
                    - SWE202c (Nhập môn kỹ nghệ phần mềm)
                    - SWR302 (Kỹ nghệ yêu cầu phần mềm)
                    - SWP391 (Dự án phát triển phần mềm)
                    - MAS291 (Xác suất thống kê)
                    - SSL101c (Kỹ năng mềm)
                    - NWC204 (Mạng máy tính)
                    - CSD201 (Cấu trúc dữ liệu và giải thuật)
                    - IOT102 (Internet vạn vật)
                    - SSG104 (Kỹ năng giao tiếp)
                    - SWT301 (Kiểm thử phần mềm)
                    - ITE302c (Đạo đức nghề nghiệp)

                    Yêu cầu đề xuất lộ trình:
                    1. Lộ trình học tập đề xuất phải bao gồm cả hai nhóm môn học sau:
                       - Các môn học nền tảng/chung của ngành SE nêu trên (nếu môn đó có trong COURSE_CATALOG_JSON và sinh viên CHƯA hoàn thành).
                       - Các môn học chuyên ngành phù hợp trực tiếp để đạt được mục tiêu nghề nghiệp '{targetRole.RoleName}' (đối chiếu các kỹ năng cần thiết của role này).
                    2. Không chọn môn sinh viên đã hoàn thành (đã có trong danh sách các môn đã hoàn thành).
                    3. Sắp xếp thứ tự các môn học theo một trình tự thời gian logic:
                       - Các môn đại cương/nền tảng (như CSI106, PRF192, PRO192, MAD101, DBI202, CSD201, SSL101c, SSG104, ITE302c) phải học trước.
                       - Các môn cơ sở ngành/chuyên ngành và nâng cao hơn học tiếp theo.
                       - Môn dự án thực hành lớn (SWP391) phải nằm ở cuối lộ trình.
                    4. Không bịa courseCode hay skillId. Mỗi item phải sử dụng đúng courseCode và skillId tồn tại trong COURSE_CATALOG_JSON.
                    5. Nếu một môn có nhiều learning outcomes, chọn skillId phù hợp nhất.
                    6. Phân loại trình độ (level) cho từng môn học được chọn dựa trên các quy tắc sau:
                       - ""Beginner"": Các môn nền tảng/cơ bản đại cương (ví dụ: CSI106, PRF192, PRO192, MAD101, DBI202, CSD201, SSL101c, SSG104, ITE302c).
                       - ""Intermediate"": Các môn học core/cơ sở ngành, lập trình chuyên sâu, cơ sở mạng/hệ điều hành hoặc thiết kế web/di động (ví dụ: PRJ301, FER202, HSF302, PRM393, SDN302).
                       - ""Advanced"": Các môn chuyên ngành nâng cao, khai phá dữ liệu, AI/Machine Learning nâng cao hoặc dự án thực hành lớn (ví dụ: AIL303m, DSC302, SWP391).
                    7. Tuyệt đối không được đề xuất trùng lặp bất kỳ môn học nào (mỗi courseCode chỉ xuất hiện tối đa một lần trong toàn bộ lộ trình). Một môn học chỉ được gán cho duy nhất 1 trình độ (level) phù hợp nhất.

                   Định dạng bắt buộc, chỉ trả JSON:
                    [
                      {{ 
                        ""courseCode"": ""MÃ_MÔN"", 
                        ""skillName"": ""Tên Kỹ năng (Ngắn gọn)"",
                        ""level"": ""Beginner"" hoặc ""Intermediate"" hoặc ""Advanced""
                      }}
                    ]";

                // Gọi Gemini API thông qua GeminiService
                string aiJsonResponse = await _geminiService.CallGeminiApiAsync(prompt, apiKey);
                
                // Trích xuất phần nội dung JSON nằm trong cặp dấu ngoặc vuông [ ]
                aiJsonResponse = _geminiService.CleanJsonString(aiJsonResponse);

                // Deserialize chuỗi JSON sang danh sách DTO đề xuất khóa học
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<List<AiCourseRecommendationDto>>(aiJsonResponse, options) 
                    ?? new List<AiCourseRecommendationDto>();
            },
            ex => new List<AiCourseRecommendationDto>(), // Fallback trả về danh sách rỗng để không làm crash luồng nghiệp vụ tạo roadmap
            nameof(GetRoadmapCoursesAsync));
        }
    }
}
