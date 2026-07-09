using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    public class AddStudentSkillDto
    {
        [Required(ErrorMessage = "Mã kỹ năng không được để trống.")]
        public string SkillId { get; set; } = null!;
    }
}
