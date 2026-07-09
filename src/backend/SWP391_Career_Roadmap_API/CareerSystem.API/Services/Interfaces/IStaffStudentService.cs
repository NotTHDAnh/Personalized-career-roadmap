using CareerSystem.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IStaffStudentService
    {
        Task<List<StudentResponseDto>> GetStudentsAsync(bool deleted);
        Task<StudentDetailDto?> GetStudentDetailAsync(string id);
        Task<bool> ToggleStudentStatusAsync(string id);
        Task<bool> ToggleStudentDeleteAsync(string id);
        Task<bool> UpdateStudentAsync(string id, UpdateStudentDto dto, string staffId);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<bool> DeleteStudentCourseRecordAsync(string studentId, string courseId, string staffId);
    }
}
