using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class SkillService : ISkillService
    {
        private readonly AppDbContext _context;

        public SkillService(AppDbContext context)
        {
            _context = context;
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
    }
}
