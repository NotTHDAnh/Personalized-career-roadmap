using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    /// <summary>
    /// DTO chứa thông tin cập nhật môn học dành cho Staff.
    /// </summary>
    public class UpdateCourseDto
    {
        [MaxLength(50, ErrorMessage = "Mã môn học không được vượt quá 50 ký tự.")]
        public string? CourseCode { get; set; }

        [MaxLength(255, ErrorMessage = "Tên môn học không được vượt quá 255 ký tự.")]
        public string? CourseName { get; set; }

        [Range(1, 10, ErrorMessage = "Số tín chỉ phải từ 1 đến 10.")]
        public int? Credits { get; set; }

        [Range(0, 500, ErrorMessage = "Tổng số giờ học phải từ 0 đến 500.")]
        public int? TotalStudyHours { get; set; }

        public bool? IsFoundationalCourse { get; set; }

        public string? Skills { get; set; }

        public string? Outcomes { get; set; }

        public string? Prerequisites { get; set; }
    }
}
