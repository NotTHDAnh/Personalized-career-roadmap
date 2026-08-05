using System;
using System.Collections.Generic;
using System.Linq;
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
    public class SkillService : ISkillService
    {
        private readonly AppDbContext _context;
        private readonly IAiRecommendationService _aiRecommendationService;
        private readonly IConfiguration _configuration;

        public SkillService(AppDbContext context, IAiRecommendationService aiRecommendationService, IConfiguration configuration)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _configuration = configuration;
        }

        public async Task<List<SkillResponseDto>> GetSkillsAsync()
        {
            return await _context.Skills
                .Select(s => new SkillResponseDto
                {
                    SkillId = s.SkillId,
                    SkillName = s.SkillName,
                    Category = s.Category
                })
                .ToListAsync();
        }

        public async Task<SkillResponseDto> CreateSkillAsync(CreateSkillDto dto, string staffId)
        {
            if (dto == null)
                throw new ArgumentException("Dữ liệu đầu vào không hợp lệ.");

            var isDuplicate = await _context.Skills
                .AnyAsync(s => s.SkillName.ToLower() == dto.SkillName.Trim().ToLower());
            if (isDuplicate)
            {
                throw new ArgumentException($"Kỹ năng '{dto.SkillName}' đã tồn tại trong hệ thống.");
            }

            // Sinh mã ID tuần tự SKL_xxx
            int maxSkillNumber = 0;
            var skillIdsInDb = await _context.Skills.Select(s => s.SkillId).ToListAsync();
            foreach (var id in skillIdsInDb)
            {
                if (id != null && id.StartsWith("SKL_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxSkillNumber) maxSkillNumber = num;
                }
            }
            string newSkillId = $"SKL_{maxSkillNumber + 1:D3}";

            // Phân tích danh mục bằng AI nếu Category trống
            string category = "General";
            if (!string.IsNullOrWhiteSpace(dto.Category))
            {
                category = dto.Category.Trim();
            }
            else
            {
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

                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    try
                    {
                        var skillsToClassify = new List<SkillClassificationDto>
                        {
                            new SkillClassificationDto { SkillId = newSkillId, SkillName = dto.SkillName }
                        };
                        var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey);
                        var cls = classifications?.FirstOrDefault();
                        if (cls != null && !string.IsNullOrWhiteSpace(cls.Category))
                        {
                            category = cls.Category.Trim();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SkillService] AI classification failed: {ex.Message}. Fallback to 'General'.");
                    }
                }
            }

            var newSkill = new Skill
            {
                SkillId = newSkillId,
                SkillName = dto.SkillName.Trim(),
                Category = category
            };

            _context.Skills.Add(newSkill);
            await _context.SaveChangesAsync();

            return new SkillResponseDto
            {
                SkillId = newSkill.SkillId,
                SkillName = newSkill.SkillName,
                Category = newSkill.Category
            };
        }

        public async Task<SkillResponseDto?> UpdateSkillAsync(string skillId, UpdateSkillDto dto, string staffId)
        {
            if (dto == null)
                throw new ArgumentException("Dữ liệu đầu vào không hợp lệ.");

            var skill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillId == skillId);
            if (skill == null) return null;

            var normalizedNewName = dto.SkillName.Trim();
            bool nameChanged = !string.Equals(skill.SkillName, normalizedNewName, StringComparison.OrdinalIgnoreCase);

            if (nameChanged)
            {
                var isDuplicate = await _context.Skills
                    .AnyAsync(s => s.SkillName.ToLower() == normalizedNewName.ToLower() && s.SkillId != skillId);
                if (isDuplicate)
                {
                    throw new ArgumentException($"Tên kỹ năng '{dto.SkillName}' đã được sử dụng bởi một kỹ năng khác.");
                }
                skill.SkillName = normalizedNewName;
            }

            // Cập nhật hoặc phân tích lại danh mục nếu Category truyền vào trống
            if (!string.IsNullOrWhiteSpace(dto.Category))
            {
                skill.Category = dto.Category.Trim();
            }
            else if (nameChanged || string.IsNullOrWhiteSpace(skill.Category))
            {
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

                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    try
                    {
                        var skillsToClassify = new List<SkillClassificationDto>
                        {
                            new SkillClassificationDto { SkillId = skillId, SkillName = skill.SkillName }
                        };
                        var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey);
                        var cls = classifications?.FirstOrDefault();
                        if (cls != null && !string.IsNullOrWhiteSpace(cls.Category))
                        {
                            skill.Category = cls.Category.Trim();
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[SkillService] AI classification failed during update: {ex.Message}. Fallback to 'General'.");
                        skill.Category = "General";
                    }
                }
                else
                {
                    skill.Category = "General";
                }
            }

            await _context.SaveChangesAsync();

            return new SkillResponseDto
            {
                SkillId = skill.SkillId,
                SkillName = skill.SkillName,
                Category = skill.Category
            };
        }

        public async Task<bool> DeleteSkillAsync(string skillId)
        {
            var skill = await _context.Skills.FirstOrDefaultAsync(s => s.SkillId == skillId);
            if (skill == null) return false;

            // Kiểm tra ràng buộc dữ liệu liên quan
            bool hasDependencies = await _context.CourseLearningOutcomes.AnyAsync(c => c.SkillId == skillId)
                || await _context.JobTrends.AnyAsync(j => j.SkillId == skillId)
                || await _context.LearningResources.AnyAsync(l => l.SkillId == skillId)
                || await _context.RolePrerequisites.AnyAsync(r => r.SkillId == skillId)
                || await _context.SkillNodes.AnyAsync(sn => sn.SkillId == skillId)
                || await _context.StudentSkills.AnyAsync(ss => ss.SkillId == skillId);

            if (hasDependencies)
            {
                throw new InvalidOperationException("Không thể xóa kỹ năng này vì đang được sử dụng ở môn học, gợi ý, định hướng nghề nghiệp, lộ trình học hoặc kỹ năng cá nhân của sinh viên.");
            }

            _context.Skills.Remove(skill);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
