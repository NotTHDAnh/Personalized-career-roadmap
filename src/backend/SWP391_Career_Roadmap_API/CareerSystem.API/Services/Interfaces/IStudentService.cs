using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IStudentService
    {
        Task<StudentDetailDto?> GetStudentDetailAsync(string id);

        Task<bool> UpdateStudentAsync(string id, UpdateStudentDto dto);

        Task<bool> DeleteStudentCourseRecordAsync(string studentId, string courseId);
    }
}
