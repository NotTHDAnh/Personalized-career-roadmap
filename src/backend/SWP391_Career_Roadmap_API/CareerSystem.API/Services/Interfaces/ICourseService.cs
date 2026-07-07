using System.Threading.Tasks;
using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseDetailDto?> GetCourseDetailAsync(string courseId);
        Task<CourseDetailDto> CreateCourseAsync(CreateCourseDto dto, string staffId);
        Task<CourseDetailDto?> UpdateCourseAsync(string courseId, UpdateCourseDto dto, string staffId);
        Task<bool> DeleteCourseAsync(string courseId);
    }
}
