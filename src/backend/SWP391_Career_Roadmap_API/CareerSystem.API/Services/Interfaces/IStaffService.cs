using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IStaffService
    {
        Task<List<StudentResponseDto>> GetStudentsAsync(bool deleted);
        Task<bool> ToggleStudentStatusAsync(string id);
        Task<bool> ToggleStudentDeleteAsync(string id);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
    }
}
