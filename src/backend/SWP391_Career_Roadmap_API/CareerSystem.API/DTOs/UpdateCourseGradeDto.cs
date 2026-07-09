using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    public class UpdateCourseGradeDto
    {
        [Required(ErrorMessage = "Mã môn học là bắt buộc.")]
        public string CourseId { get; set; } = null!;

        [Range(0.0, 10.0, ErrorMessage = "Điểm GPA phải nằm trong khoảng từ 0.0 đến 10.0.")]
        public decimal? Gpa { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Số lần thi phải lớn hơn hoặc bằng 1.")]
        public int ExamAttempts { get; set; } = 1;
    }
}
