using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

namespace CareerSystem.API.Services.Implementations
{
    public class RagService : IRagService
    {
        private readonly AppDbContext _context;
        private readonly IGeminiEmbeddingService _embeddingService;
        private readonly IPineconeService _pineconeService;
        private readonly ILogger<RagService> _logger;

        public RagService(
            AppDbContext context,
            IGeminiEmbeddingService embeddingService,
            IPineconeService pineconeService,
            ILogger<RagService> logger)
        {
            _context = context;
            _embeddingService = embeddingService;
            _pineconeService = pineconeService;
            _logger = logger;
        }

        public async Task<BulkIndexResultDto> BulkIndexSqlToPineconeAsync(string indexUrlOverride = "", string apiKeyOverride = "")
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new BulkIndexResultDto();
            var vectorsToUpsert = new List<PineconeVectorDto>();

            try
            {
                // 1. Quét dữ liệu Môn học (Courses)
                var courses = await _context.Courses
                    .AsNoTracking()
                    .Include(c => c.CourseLearningOutcomes)
                    .Include(c => c.LearningResources)
                    .ToListAsync();

                foreach (var course in courses)
                {
                    try
                    {
                        var outcomes = string.Join("; ", course.CourseLearningOutcomes.Select(o => o.OutcomeDescription));
                        var resources = string.Join("; ", course.LearningResources.Select(r => r.Title));
                        var text = $"Môn học: {course.CourseCode} - {course.CourseName}. Tín chỉ: {course.Credits}. Tổng giờ học: {course.TotalStudyHours}. Môn tiên quyết: {course.Prerequisites ?? "Không có"}. Chuẩn đầu ra: {outcomes}. Tài nguyên bổ trợ: {resources}";

                        var vectorValues = await _embeddingService.GetEmbeddingAsync(text);
                        vectorsToUpsert.Add(new PineconeVectorDto
                        {
                            Id = $"course_{course.CourseId}",
                            Values = vectorValues,
                            Metadata = new Dictionary<string, object>
                            {
                                { "entity_type", "Course" },
                                { "entity_id", course.CourseId },
                                { "code", course.CourseCode ?? "" },
                                { "title", course.CourseName ?? "" },
                                { "text", text }
                            }
                        });
                        result.CoursesIndexed++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi tạo embedding cho môn học {CourseId}", course.CourseId);
                        result.Errors.Add($"Môn học {course.CourseCode}: {ex.Message}");
                    }
                }

                // 2. Quét dữ liệu Kỹ năng (Skills)
                var skills = await _context.Skills
                    .AsNoTracking()
                    .ToListAsync();

                foreach (var skill in skills)
                {
                    try
                    {
                        var text = $"Kỹ năng chuyên môn: {skill.SkillName}. Danh mục/Nhóm kỹ năng: {skill.Category ?? "Chưa phân loại"}.";

                        var vectorValues = await _embeddingService.GetEmbeddingAsync(text);
                        vectorsToUpsert.Add(new PineconeVectorDto
                        {
                            Id = $"skill_{skill.SkillId}",
                            Values = vectorValues,
                            Metadata = new Dictionary<string, object>
                            {
                                { "entity_type", "Skill" },
                                { "entity_id", skill.SkillId },
                                { "title", skill.SkillName ?? "" },
                                { "category", skill.Category ?? "" },
                                { "text", text }
                            }
                        });
                        result.SkillsIndexed++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi tạo embedding cho kỹ năng {SkillId}", skill.SkillId);
                        result.Errors.Add($"Kỹ năng {skill.SkillName}: {ex.Message}");
                    }
                }

                // 3. Quét dữ liệu Vị trí nghề nghiệp (Career Roles)
                var roles = await _context.CareerRoles
                    .AsNoTracking()
                    .Include(r => r.RolePrerequisites)
                        .ThenInclude(rp => rp.Skill)
                    .ToListAsync();

                foreach (var role in roles)
                {
                    try
                    {
                        var reqSkills = string.Join(", ", role.RolePrerequisites.Where(p => p.Skill != null).Select(p => p.Skill!.SkillName));
                        var text = $"Vị trí nghề nghiệp: {role.RoleName}. Mô tả công việc: {role.Description}. Các kỹ năng yêu cầu: {reqSkills}.";

                        var vectorValues = await _embeddingService.GetEmbeddingAsync(text);
                        vectorsToUpsert.Add(new PineconeVectorDto
                        {
                            Id = $"role_{role.RoleId}",
                            Values = vectorValues,
                            Metadata = new Dictionary<string, object>
                            {
                                { "entity_type", "CareerRole" },
                                { "entity_id", role.RoleId },
                                { "title", role.RoleName ?? "" },
                                { "text", text }
                            }
                        });
                        result.RolesIndexed++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi tạo embedding cho vai trò {RoleId}", role.RoleId);
                        result.Errors.Add($"Nghề nghiệp {role.RoleName}: {ex.Message}");
                    }
                }

                // 4. Quét dữ liệu Tài nguyên học tập (Learning Resources)
                var resourcesList = await _context.LearningResources
                    .AsNoTracking()
                    .Include(lr => lr.Course)
                    .Include(lr => lr.Skill)
                    .ToListAsync();

                foreach (var resource in resourcesList)
                {
                    try
                    {
                        var text = $"Tài nguyên học tập bổ trợ: {resource.Title}. Liên kết: {resource.Url}. Thuộc môn học: {resource.Course?.CourseName ?? "N/A"}. Thuộc kỹ năng: {resource.Skill?.SkillName ?? "N/A"}.";

                        var vectorValues = await _embeddingService.GetEmbeddingAsync(text);
                        vectorsToUpsert.Add(new PineconeVectorDto
                        {
                            Id = $"resource_{resource.ResourceId}",
                            Values = vectorValues,
                            Metadata = new Dictionary<string, object>
                            {
                                { "entity_type", "LearningResource" },
                                { "entity_id", resource.ResourceId },
                                { "title", resource.Title ?? "" },
                                { "url", resource.Url ?? "" },
                                { "text", text }
                            }
                        });
                        result.ResourcesIndexed++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Lỗi tạo embedding cho tài nguyên {ResourceId}", resource.ResourceId);
                        result.Errors.Add($"Tài nguyên {resource.Title}: {ex.Message}");
                    }
                }

                // 5. Upsert batch vectors lên Pinecone (mỗi batch 50 items)
                const int batchSize = 50;
                for (int i = 0; i < vectorsToUpsert.Count; i += batchSize)
                {
                    var batch = vectorsToUpsert.Skip(i).Take(batchSize).ToList();
                    await _pineconeService.UpsertVectorsAsync(batch, indexUrlOverride, apiKeyOverride);
                }

                result.TotalIndexed = vectorsToUpsert.Count;
                result.Success = true;
                result.Message = $"Đã quét và đồng bộ thành công {result.TotalIndexed} bản ghi dữ liệu SQL Server sang Vector Pinecone!";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện bulk index SQL -> Vector -> Pinecone");
                result.Success = false;
                result.Message = $"Đồng bộ thất bại: {ex.Message}";
                result.Errors.Add(ex.ToString());
            }
            finally
            {
                stopwatch.Stop();
                result.DurationSeconds = Math.Round(stopwatch.Elapsed.TotalSeconds, 2);
            }

            return result;
        }

        public async Task IndexCourseAsync(string courseId, string title, string description)
        {
            var text = $"Môn học: {title}. Mô tả: {description}";
            var vector = await _embeddingService.GetEmbeddingAsync(text);
            var pineconeVector = new PineconeVectorDto
            {
                Id = $"course_{courseId}",
                Values = vector,
                Metadata = new Dictionary<string, object>
                {
                    { "entity_type", "Course" },
                    { "entity_id", courseId },
                    { "title", title },
                    { "text", text }
                }
            };
            await _pineconeService.UpsertVectorsAsync(new List<PineconeVectorDto> { pineconeVector });
        }

        public async Task<string> SearchRagContextAsync(string userQuestion, int topK = 3)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userQuestion)) return string.Empty;

                var vector = await _embeddingService.GetEmbeddingAsync(userQuestion);
                var matches = await _pineconeService.QuerySimilarVectorsAsync(vector, topK);

                if (matches == null || matches.Count == 0) return string.Empty;

                return string.Join("\n---\n", matches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi tìm kiếm RAG Context từ Pinecone cho câu hỏi: {Question}", userQuestion);
                return string.Empty; // Trả về chuỗi rỗng để không làm crash luồng Virtual Mentor khi RAG bị gián đoạn
            }
        }
    }
}
