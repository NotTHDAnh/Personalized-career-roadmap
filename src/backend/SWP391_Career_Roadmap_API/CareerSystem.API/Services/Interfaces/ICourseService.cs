using System.Threading.Tasks;
using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseDetailDto?> GetCourseDetailAsync(string courseId);
        Task<CourseDetailDto> CreateCourseAsync(CreateCourseDto dto, string staffId);
        Task<System.Collections.Generic.List<CourseResponseDto>> GetCoursesAsync();
    }
}
