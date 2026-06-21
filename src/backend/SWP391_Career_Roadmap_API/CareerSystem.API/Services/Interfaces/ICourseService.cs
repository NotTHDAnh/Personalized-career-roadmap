using System.Threading.Tasks;
using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseDetailDto?> GetCourseDetailAsync(string courseId);
    }
}
