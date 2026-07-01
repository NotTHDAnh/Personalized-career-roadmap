using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    /// <summary>
    /// DTO chứa thông tin thêm mới môn học thủ công dành cho Staff.
    /// </summary>
    public class CreateCourseDto
    {
        [Required(ErrorMessage = "Mã môn học không được để trống.")]
        [MaxLength(50, ErrorMessage = "Mã môn học không được vượt quá 50 ký tự.")]
        public string CourseCode { get; set; } = null!;

        [Required(ErrorMessage = "Tên môn học không được để trống.")]
        [MaxLength(255, ErrorMessage = "Tên môn học không được vượt quá 255 ký tự.")]
        public string CourseName { get; set; } = null!;

        [Range(1, 10, ErrorMessage = "Số tín chỉ phải từ 1 đến 10.")]
        public int Credits { get; set; } = 3;

        [Range(0, 500, ErrorMessage = "Tổng số giờ học phải từ 0 đến 500.")]
        public int TotalStudyHours { get; set; } = 0;

        [Required(ErrorMessage = "Trường môn học nền tảng là bắt buộc.")]
        public bool? IsFoundationalCourse { get; set; }

        [Required(ErrorMessage = "Kỹ năng đầu ra không được để trống.")]
        public string Skills { get; set; } = null!;

        [Required(ErrorMessage = "Chuẩn đầu ra không được để trống.")]
        public string Outcomes { get; set; } = null!;
    }
}
