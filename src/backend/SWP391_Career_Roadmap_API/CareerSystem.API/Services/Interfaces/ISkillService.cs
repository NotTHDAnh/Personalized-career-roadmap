using System.Collections.Generic;
using System.Threading.Tasks;
using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ISkillService
    {
        Task<List<SkillResponseDto>> GetSkillsAsync();
        Task<SkillResponseDto> CreateSkillAsync(CreateSkillDto dto, string staffId);
        Task<SkillResponseDto?> UpdateSkillAsync(string skillId, UpdateSkillDto dto, string staffId);
        Task<bool> DeleteSkillAsync(string skillId);
    }
}
