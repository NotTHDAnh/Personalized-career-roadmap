using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class StaffService : IStaffService
    {
        private readonly AppDbContext _context;

        public StaffService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentResponseDto>> GetStudentsAsync(bool deleted)
        {
            return await _context.Users
                .Where(u => u.Role == "STUDENT" && u.DeleteHistory == deleted)
                .Include(u => u.StudentSkills)
                    .ThenInclude(ss => ss.Skill)
                .Include(u => u.Roadmaps)
                    .ThenInclude(r => r.TargetRole)
                .Select(u => new StudentResponseDto
                {
                    Id = u.UserId,
                    Name = u.FullName,
                    Role = u.Roadmaps.OrderByDescending(r => r.CreatedAt).Select(r => r.TargetRole.RoleName).FirstOrDefault() ?? "Chưa xác định",
                    Code = u.UserId,
                    Tags = u.StudentSkills.Select(ss => ss.Skill.SkillName).Take(3).ToList(),
                    Date = u.CreatedAt.HasValue ? u.CreatedAt.Value.ToString("dd-MMM-yyyy") : "N/A",
                    Avatar = $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(u.FullName)}&backgroundColor=0F172A&textColor=ffffff",
                    Status = u.Status ?? true,
                    DeleteHistory = u.DeleteHistory ?? false
                })
                .ToListAsync();
        }

        public async Task<bool> ToggleStudentStatusAsync(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null) return false;

            student.Status = !(student.Status ?? true);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleStudentDeleteAsync(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null) return false;

            student.DeleteHistory = !(student.DeleteHistory ?? false);
            await _context.SaveChangesAsync();
            return true;
        }



        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var studentCount = await _context.Users.CountAsync(u => u.Role == "STUDENT");
            var courseCount = await _context.Courses.CountAsync();
            var skillCount = await _context.Skills.CountAsync();

            return new DashboardStatsDto
            {
                Students = studentCount,
                Courses = courseCount,
                Skills = skillCount
            };
        }


    }
}
