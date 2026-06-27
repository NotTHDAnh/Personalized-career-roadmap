using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace CareerSystem.API.Services.Implementations
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;
        private readonly IAiRecommendationService _aiRecommendationService;
        private readonly IConfiguration _configuration;

        public CourseService(AppDbContext context, IAiRecommendationService aiRecommendationService, IConfiguration configuration)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _configuration = configuration;
        }

        public async Task<CourseDetailDto?> GetCourseDetailAsync(string courseId)
        {
            // Eager load LearningResources và Skill của từng resource, cùng CourseLearningOutcomes
            var course = await _context.Courses
                .Include(c => c.LearningResources)
                    .ThenInclude(lr => lr.Skill)
                .Include(c => c.CourseLearningOutcomes)
                    .ThenInclude(clo => clo.Skill)
                .FirstOrDefaultAsync(c => c.CourseId == courseId);

            if (course == null)
            {
                return null;
            }

            var courseDetailDto = new CourseDetailDto
            {
                CourseId = course.CourseId,
                CourseCode = course.CourseCode,
                CourseName = course.CourseName,
                Credits = course.Credits,
                TotalStudyHours = course.TotalStudyHours,
                IsFoundationalCourse = course.IsFoundationalCourse,
                SuggestedResources = course.LearningResources
                    .Select(lr => new LearningResourceDto
                    {
                        ResourceId = lr.ResourceId,
                        Title = lr.Title,
                        Url = lr.Url,
                        SkillId = lr.SkillId,
                        SkillName = lr.Skill.SkillName
                    })
                    .ToList(),
                LearningOutcomes = course.CourseLearningOutcomes
                    .Select(clo => new CourseLearningOutcomeDto
                    {
                        Id = clo.Id,
                        SkillId = clo.SkillId,
                        SkillName = clo.Skill.SkillName,
                        OutcomeDescription = clo.OutcomeDescription
                    })
                    .ToList()
            };

            return courseDetailDto;
        }

        public async Task<CourseDetailDto> CreateCourseAsync(CreateCourseDto dto, string staffId)
        {
            if (dto == null)
                throw new ArgumentException("Dữ liệu đầu vào không hợp lệ.");

            // 1. Kiểm tra trùng lặp mã môn học
            var isDuplicate = await _context.Courses
                .AnyAsync(c => c.CourseCode.ToLower() == dto.CourseCode.Trim().ToLower());
            if (isDuplicate)
            {
                throw new ArgumentException($"Mã môn học '{dto.CourseCode}' đã tồn tại trong hệ thống.");
            }

            // 2. Tách kỹ năng và chuẩn đầu ra từ DTO
            var skillTokens = dto.Skills.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();

            var outcomeTokens = dto.Outcomes.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(d => d.Trim())
                .Where(d => !string.IsNullOrEmpty(d))
                .ToList();

            if (skillTokens.Count == 0)
            {
                throw new ArgumentException("Môn học phải chứa ít nhất một kỹ năng đầu ra.");
            }

            // 3. Truy vấn các kỹ năng hiện có trong DB
            var existingSkills = await _context.Skills
                .Where(s => skillTokens.Contains(s.SkillName))
                .ToListAsync();
            var existingSkillMap = existingSkills.ToDictionary(s => s.SkillName, s => s, StringComparer.OrdinalIgnoreCase);

            var missingSkillNames = skillTokens
                .Where(name => !existingSkillMap.ContainsKey(name))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // 4. Sinh ID tuần tự cho kỹ năng
            int maxSkillNumber = 0;
            var skillIdsInDb = await _context.Skills.Select(s => s.SkillId).ToListAsync();
            foreach (var id in skillIdsInDb)
            {
                if (id.StartsWith("SKL_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxSkillNumber) maxSkillNumber = num;
                }
            }
            int nextSkillNum = maxSkillNumber + 1;

            // 5. Sinh ID tuần tự cho chuẩn đầu ra
            int maxCloNumber = 0;
            var cloIdsInDb = await _context.CourseLearningOutcomes.Select(c => c.Id).ToListAsync();
            foreach (var id in cloIdsInDb)
            {
                if (id.StartsWith("CLO_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxCloNumber) maxCloNumber = num;
                }
            }
            int nextCloNum = maxCloNumber + 1;

            // 6. Xử lý phân loại kỹ năng mới qua AI
            var newSkillsToRegister = new List<Skill>();
            if (missingSkillNames.Count > 0)
            {
                // Lấy API key của Staff hoặc config hệ thống
                string? apiKey = null;
                if (!string.IsNullOrWhiteSpace(staffId))
                {
                    var staffUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == staffId);
                    apiKey = staffUser?.GeminiApiKey;
                }
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    apiKey = _configuration["AiSettings:ApiKey"];
                }

                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    throw new ArgumentException(
                        "Môn học chứa các kỹ năng mới chưa có trong hệ thống. " +
                        "Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để hệ thống tự động phân loại các kỹ năng này.");
                }

                foreach (var name in missingSkillNames)
                {
                    var newSkillId = $"SKL_{nextSkillNum++:D3}";
                    var skill = new Skill
                    {
                        SkillId = newSkillId,
                        SkillName = name,
                        Category = "General" // Mặc định nếu AI lỗi
                    };
                    newSkillsToRegister.Add(skill);
                }

                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    try
                    {
                        var skillsToClassify = newSkillsToRegister.Select(s => (s.SkillId, s.SkillName)).ToList();
                        var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey);

                        if (classifications != null && classifications.Any())
                        {
                            foreach (var item in classifications)
                            {
                                var matchedSkill = newSkillsToRegister.FirstOrDefault(s => s.SkillId == item.SkillId);
                                if (matchedSkill != null && !string.IsNullOrWhiteSpace(item.Category))
                                {
                                    matchedSkill.Category = item.Category.Trim();
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[CourseService] AI classification failed: {ex.Message}. Fallback to default 'General'.");
                    }
                }

                // Đưa các skill mới vào cache map để dùng lúc sinh outcomes
                foreach (var skill in newSkillsToRegister)
                {
                    existingSkillMap[skill.SkillName] = skill;
                }
            }

            // 7. Sinh CourseId tuần tự
            int maxCourseNumber = 0;
            var courseIdsInDb = await _context.Courses.Select(c => c.CourseId).ToListAsync();
            foreach (var id in courseIdsInDb)
            {
                if (id.StartsWith("CRS_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxCourseNumber) maxCourseNumber = num;
                }
            }
            string newCourseId = $"CRS_{maxCourseNumber + 1:D3}";

            // 8. Tạo thực thể Course
            var newCourse = new Course
            {
                CourseId = newCourseId,
                CourseCode = dto.CourseCode.Trim(),
                CourseName = dto.CourseName.Trim(),
                Credits = dto.Credits,
                TotalStudyHours = dto.TotalStudyHours,
                IsFoundationalCourse = dto.IsFoundationalCourse
            };

            // 9. Tạo các CourseLearningOutcome kết nối Course & Skill
            var outcomesToAdd = new List<CourseLearningOutcome>();
            var processedSkillsInRow = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < skillTokens.Count; i++)
            {
                var skillName = skillTokens[i];
                if (!processedSkillsInRow.Add(skillName))
                {
                    continue;
                }

                if (existingSkillMap.TryGetValue(skillName, out var skillEntity))
                {
                    string outcomeDesc;
                    if (outcomeTokens.Count == 0)
                    {
                        outcomeDesc = $"Đạt kỹ năng {skillEntity.SkillName} sau khi hoàn thành môn học {newCourse.CourseName}";
                    }
                    else if (outcomeTokens.Count == 1)
                    {
                        outcomeDesc = outcomeTokens[0];
                    }
                    else if (i < outcomeTokens.Count)
                    {
                        outcomeDesc = outcomeTokens[i];
                    }
                    else
                    {
                        outcomeDesc = $"{outcomeTokens.Last()} (Kỹ năng: {skillEntity.SkillName})";
                    }

                    var clo = new CourseLearningOutcome
                    {
                        Id = $"CLO_{nextCloNum++:D4}",
                        CourseId = newCourseId,
                        SkillId = skillEntity.SkillId,
                        OutcomeDescription = outcomeDesc,
                        Skill = skillEntity,
                        Course = newCourse
                    };
                    outcomesToAdd.Add(clo);
                }
            }

            // 10. Thực hiện lưu database trong Transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (newSkillsToRegister.Count > 0)
                {
                    await _context.Skills.AddRangeAsync(newSkillsToRegister);
                    await _context.SaveChangesAsync();
                }

                await _context.Courses.AddAsync(newCourse);
                await _context.SaveChangesAsync();

                if (outcomesToAdd.Count > 0)
                {
                    await _context.CourseLearningOutcomes.AddRangeAsync(outcomesToAdd);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Lỗi xảy ra khi lưu môn học vào database: {ex.Message}", ex);
            }

            // 11. Trả về DTO kết quả
            return new CourseDetailDto
            {
                CourseId = newCourse.CourseId,
                CourseCode = newCourse.CourseCode,
                CourseName = newCourse.CourseName,
                Credits = newCourse.Credits,
                TotalStudyHours = newCourse.TotalStudyHours,
                IsFoundationalCourse = newCourse.IsFoundationalCourse,
                SuggestedResources = new List<LearningResourceDto>(),
                LearningOutcomes = outcomesToAdd.Select(clo => new CourseLearningOutcomeDto
                {
                    Id = clo.Id,
                    SkillId = clo.SkillId,
                    SkillName = clo.Skill.SkillName,
                    OutcomeDescription = clo.OutcomeDescription
                }).ToList()
            };
        }
    }
}
