using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    public class CreateSkillDto
    {
        [Required(ErrorMessage = "Tên kỹ năng không được để trống.")]
        [MaxLength(100, ErrorMessage = "Tên kỹ năng không được vượt quá 100 ký tự.")]
        public string SkillName { get; set; } = null!;

        [MaxLength(100, ErrorMessage = "Phân loại không được vượt quá 100 ký tự.")]
        public string? Category { get; set; }
    }
}
