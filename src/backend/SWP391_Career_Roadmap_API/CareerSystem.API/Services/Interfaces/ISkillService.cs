using System.Collections.Generic;
using System.Threading.Tasks;
using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ISkillService
    {
        Task<List<SkillResponseDto>> GetSkillsAsync();
    }
}
