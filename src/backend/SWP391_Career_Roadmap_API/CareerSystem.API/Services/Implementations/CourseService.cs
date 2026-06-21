using System.Linq;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CourseDetailDto?> GetCourseDetailAsync(string courseId)
        {
            // Eager load LearningResources và Skill của từng resource
            var course = await _context.Courses
                .Include(c => c.LearningResources)
                    .ThenInclude(lr => lr.Skill)
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
                SuggestedResources = course.LearningResources
                    .Select(lr => new LearningResourceDto
                    {
                        ResourceId = lr.ResourceId,
                        Title = lr.Title,
                        Url = lr.Url,
                        SkillId = lr.SkillId,
                        SkillName = lr.Skill.SkillName
                    })
                    .ToList()
            };

            return courseDetailDto;
        }
    }
}
