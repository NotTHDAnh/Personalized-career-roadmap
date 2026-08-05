using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
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
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.IsActive);

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
                Prerequisites = course.Prerequisites,
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
            var skillTokens = SmartSplit(dto.Skills);
            var outcomeTokens = SmartSplit(dto.Outcomes);

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
                var skillsToClassify = new List<SkillClassificationDto>();
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
                    skillsToClassify.Add(new SkillClassificationDto { SkillId = newSkillId, SkillName = name });
                }

                // Lấy API key của Staff hoặc config hệ thống
                string? apiKey = null;
                if (!string.IsNullOrWhiteSpace(staffId))
                {
                    var staffUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == staffId);
                    apiKey = EncryptionUtility.Decrypt(staffUser?.GeminiApiKey);
                }
                if (string.IsNullOrWhiteSpace(apiKey))
                {
                    apiKey = _configuration["AiSettings:ApiKey"];
                }

                try
                {
                    var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey ?? "");
                    foreach (var cls in classifications)
                    {
                        var matchedSkill = newSkillsToRegister.FirstOrDefault(s => s.SkillId == cls.SkillId);
                        if (matchedSkill != null && !string.IsNullOrWhiteSpace(cls.Category))
                        {
                            matchedSkill.Category = cls.Category.Trim();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CourseService] AI classification failed: {ex.Message}. Fallback to default 'General'.");
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
                IsFoundationalCourse = dto.IsFoundationalCourse ?? false,
                Prerequisites = NormalizePrerequisites(dto.Prerequisites),
            };

            // Validate prerequisites existence
            if (!string.IsNullOrEmpty(newCourse.Prerequisites))
            {
                var prereqCodes = newCourse.Prerequisites.Split(';');
                var missingCodes = new List<string>();
                foreach (var code in prereqCodes)
                {
                    if (code.Equals(newCourse.CourseCode, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new ArgumentException("Môn học không thể làm môn học tiên quyết của chính nó.");
                    }

                    var exists = await _context.Courses.AnyAsync(c => c.IsActive && c.CourseCode.ToLower() == code.ToLower());
                    if (!exists)
                    {
                        missingCodes.Add(code);
                    }
                }

                if (missingCodes.Count > 0)
                {
                    throw new ArgumentException($"Các môn học tiên quyết sau không tồn tại trong hệ thống: {string.Join(", ", missingCodes)}. Vui lòng thêm các môn học này trước.");
                }
            }

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
                Prerequisites = newCourse.Prerequisites,
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

        public async Task<System.Collections.Generic.List<CourseResponseDto>> GetCoursesAsync()
        {
            return await _context.Courses
                .Where(c => c.IsActive)
                .Include(c => c.CourseLearningOutcomes)
                    .ThenInclude(clo => clo.Skill)
                .Select(c => new CourseResponseDto
                {
                    CourseId = c.CourseId,
                    CourseCode = c.CourseCode,
                    CourseName = c.CourseName,
                    Credits = c.Credits ?? 3,
                    TotalStudyHours = c.TotalStudyHours ?? 0,
                    Skills = c.CourseLearningOutcomes.Select(clo => clo.Skill.SkillName).ToList()
                })
                .ToListAsync();
        }
        public async Task<CourseDetailDto?> UpdateCourseAsync(string courseId, UpdateCourseDto dto, string staffId)
        {
            if (dto == null)
                throw new ArgumentException("Dữ liệu đầu vào không hợp lệ.");

            // 1. Tìm môn học cần sửa
            var course = await _context.Courses
                .Include(c => c.LearningResources)
                    .ThenInclude(lr => lr.Skill)
                .Include(c => c.CourseLearningOutcomes)
                    .ThenInclude(clo => clo.Skill)
                .FirstOrDefaultAsync(c => c.CourseId == courseId && c.IsActive);

            if (course == null)
            {
                return null;
            }

            // 2. Kiểm tra trùng lặp mã môn học với môn học khác (chỉ khi dto.CourseCode được truyền lên)
            if (dto.CourseCode != null)
            {
                var isDuplicate = await _context.Courses
                    .AnyAsync(c => c.CourseId != courseId && c.CourseCode.ToLower() == dto.CourseCode.Trim().ToLower());
                if (isDuplicate)
                {
                    throw new ArgumentException($"Mã môn học '{dto.CourseCode}' đã tồn tại trong hệ thống.");
                }
                course.CourseCode = dto.CourseCode.Trim();
            }

            // Cập nhật các trường thông tin cơ bản khác nếu được truyền lên
            if (dto.CourseName != null)
            {
                course.CourseName = dto.CourseName.Trim();
            }
            if (dto.Credits.HasValue)
            {
                course.Credits = dto.Credits.Value;
            }
            if (dto.TotalStudyHours.HasValue)
            {
                course.TotalStudyHours = dto.TotalStudyHours.Value;
            }
            if (dto.IsFoundationalCourse.HasValue)
            {
                course.IsFoundationalCourse = dto.IsFoundationalCourse.Value;
            }
            if (dto.Prerequisites != null)
            {
                var normalizedPrereq = NormalizePrerequisites(dto.Prerequisites);
                if (!string.IsNullOrEmpty(normalizedPrereq))
                {
                    var prereqCodes = normalizedPrereq.Split(';');
                    var missingCodes = new List<string>();
                    foreach (var code in prereqCodes)
                    {
                        if (code.Equals(course.CourseCode, StringComparison.OrdinalIgnoreCase))
                        {
                            throw new ArgumentException("Môn học không thể làm môn học tiên quyết của chính nó.");
                        }

                        var exists = await _context.Courses.AnyAsync(c => c.IsActive && c.CourseCode.ToLower() == code.ToLower());
                        if (!exists)
                        {
                            missingCodes.Add(code);
                        }
                    }

                    if (missingCodes.Count > 0)
                    {
                        throw new ArgumentException($"Các môn học tiên quyết sau không tồn tại trong hệ thống: {string.Join(", ", missingCodes)}. Vui lòng thêm các môn học này trước.");
                    }
                }
                course.Prerequisites = normalizedPrereq;
            }
            else if (!string.IsNullOrEmpty(course.Prerequisites))
            {
                // Nếu không cập nhật Prerequisites nhưng cập nhật CourseCode, kiểm tra xem có bị tự tham chiếu không
                var prereqCodes = course.Prerequisites.Split(';');
                if (prereqCodes.Any(code => code.Equals(course.CourseCode, StringComparison.OrdinalIgnoreCase)))
                {
                    throw new ArgumentException("Môn học không thể làm môn học tiên quyết của chính nó.");
                }
            }

            // 3. Cập nhật CourseLearningOutcome (chỉ khi Skills hoặc Outcomes được truyền lên)
            List<CourseLearningOutcome> outcomesToAdd = new List<CourseLearningOutcome>();
            List<CourseLearningOutcome> oldClos = new List<CourseLearningOutcome>();
            List<Skill> newSkillsToRegister = new List<Skill>();

            if (dto.Skills != null || dto.Outcomes != null)
            {
                // Tách kỹ năng từ DTO hoặc lấy từ database hiện tại
                List<string> skillTokens;
                if (dto.Skills != null)
                {
                    skillTokens = SmartSplit(dto.Skills);
                }
                else
                {
                    skillTokens = course.CourseLearningOutcomes.Select(c => c.Skill.SkillName).ToList();
                }

                // Tách chuẩn đầu ra từ DTO hoặc lấy từ database hiện tại
                List<string> outcomeTokens;
                if (dto.Outcomes != null)
                {
                    outcomeTokens = SmartSplit(dto.Outcomes);
                }
                else
                {
                    outcomeTokens = course.CourseLearningOutcomes.Select(c => c.OutcomeDescription ?? "").ToList();
                }

                if (skillTokens.Count == 0)
                {
                    throw new ArgumentException("Môn học phải chứa ít nhất một kỹ năng đầu ra.");
                }

                // Truy vấn các kỹ năng hiện có trong DB
                var existingSkills = await _context.Skills
                    .Where(s => skillTokens.Contains(s.SkillName))
                    .ToListAsync();
                var existingSkillMap = existingSkills.ToDictionary(s => s.SkillName, s => s, StringComparer.OrdinalIgnoreCase);

                var missingSkillNames = skillTokens
                    .Where(name => !existingSkillMap.ContainsKey(name))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                // Sinh ID tuần tự cho kỹ năng mới
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

                if (missingSkillNames.Count > 0)
                {
                    var skillsToClassify = new List<SkillClassificationDto>();
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
                        skillsToClassify.Add(new SkillClassificationDto { SkillId = newSkillId, SkillName = name });
                    }

                    // Lấy API key của Staff hoặc config hệ thống
                    string? apiKey = null;
                    if (!string.IsNullOrWhiteSpace(staffId))
                    {
                        var staffUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == staffId);
                        apiKey = EncryptionUtility.Decrypt(staffUser?.GeminiApiKey);
                    }
                    if (string.IsNullOrWhiteSpace(apiKey))
                    {
                        apiKey = _configuration["AiSettings:ApiKey"];
                    }

                    try
                    {
                        var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey ?? "");
                        foreach (var cls in classifications)
                        {
                            var matchedSkill = newSkillsToRegister.FirstOrDefault(s => s.SkillId == cls.SkillId);
                            if (matchedSkill != null && !string.IsNullOrWhiteSpace(cls.Category))
                            {
                                matchedSkill.Category = cls.Category.Trim();
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[CourseService] AI classification failed: {ex.Message}. Fallback to default 'General'.");
                    }

                    // Đưa các skill mới vào cache map để dùng lúc sinh outcomes
                    foreach (var skill in newSkillsToRegister)
                    {
                        existingSkillMap[skill.SkillName] = skill;
                    }
                }

                // Sinh ID tuần tự cho chuẩn đầu ra
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

                // Xóa các CourseLearningOutcome cũ
                oldClos = await _context.CourseLearningOutcomes
                    .Where(clo => clo.CourseId == courseId)
                    .ToListAsync();

                // Tạo các CourseLearningOutcome kết nối Course & Skill mới
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
                            outcomeDesc = $"Đạt kỹ năng {skillEntity.SkillName} sau khi hoàn thành môn học {course.CourseName}";
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
                            CourseId = courseId,
                            SkillId = skillEntity.SkillId,
                            OutcomeDescription = outcomeDesc,
                            Skill = skillEntity,
                            Course = course
                        };
                        outcomesToAdd.Add(clo);
                    }
                }
            }

            // Thực hiện lưu database trong Transaction
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (newSkillsToRegister.Count > 0)
                {
                    await _context.Skills.AddRangeAsync(newSkillsToRegister);
                    await _context.SaveChangesAsync();
                }

                if (oldClos.Count > 0)
                {
                    _context.CourseLearningOutcomes.RemoveRange(oldClos);
                    await _context.SaveChangesAsync();
                }

                _context.Courses.Update(course);
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
                throw new Exception($"Lỗi xảy ra khi cập nhật môn học trong database: {ex.Message}", ex);
            }

            // Trả về DTO kết quả
            return new CourseDetailDto
            {
                CourseId = course.CourseId,
                CourseCode = course.CourseCode,
                CourseName = course.CourseName,
                Credits = course.Credits,
                TotalStudyHours = course.TotalStudyHours,
                IsFoundationalCourse = course.IsFoundationalCourse,
                Prerequisites = course.Prerequisites,
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
                LearningOutcomes = (dto.Skills != null || dto.Outcomes != null)
                    ? outcomesToAdd.Select(clo => new CourseLearningOutcomeDto
                    {
                        Id = clo.Id,
                        SkillId = clo.SkillId,
                        SkillName = clo.Skill.SkillName,
                        OutcomeDescription = clo.OutcomeDescription
                    }).ToList()
                    : course.CourseLearningOutcomes.Select(clo => new CourseLearningOutcomeDto
                    {
                        Id = clo.Id,
                        SkillId = clo.SkillId,
                        SkillName = clo.Skill.SkillName,
                        OutcomeDescription = clo.OutcomeDescription
                    }).ToList()
            };
        }

        private static List<string> SmartSplit(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return new List<string>();

            string[] separators;
            if (input.Contains(';') || input.Contains('；'))
            {
                separators = new[] { ";", "；" };
            }
            else if (input.Contains('、'))
            {
                separators = new[] { "、" };
            }
            else
            {
                separators = new[] { ",", "，" };
            }

            return input.Split(separators, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim().Replace("\n", " ").Replace("\r", " "))
                .Where(s => !string.IsNullOrEmpty(s))
                .ToList();
        }

        public async Task<bool> DeleteCourseAsync(string courseId)
        {
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId && c.IsActive);
            if (course == null)
            {
                return false;
            }

            course.IsActive = false;
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();
            return true;
        }

        private static string? NormalizePrerequisites(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return null;

            var tokens = input.Split(new[] { ',', ';', '，', '；' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(t => t.Trim())
                .Where(t => !string.IsNullOrEmpty(t))
                .ToList();

            if (tokens.Count == 0)
                return null;

            return string.Join(";", tokens);
        }
    }


}
