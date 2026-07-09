using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IStudentService
    {
        Task<StudentDetailDto?> GetStudentDetailAsync(string id);

        Task<bool> UpdateStudentAsync(string id, UpdateStudentDto dto);

        Task<bool> DeleteStudentCourseRecordAsync(string studentId, string courseId);

        Task<bool> AddStudentSkillAsync(string studentId, string skillId);

        Task<bool> RemoveStudentSkillAsync(string studentId, string skillId);

        Task<bool> UpdateCourseGradeAsync(string studentId, UpdateCourseGradeDto dto);

        Task<bool> DeleteCourseGradeAsync(string studentId, string courseId);
    }
}
