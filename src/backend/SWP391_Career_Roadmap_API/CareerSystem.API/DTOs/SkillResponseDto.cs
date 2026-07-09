namespace CareerSystem.API.DTOs
{
    public class SkillResponseDto
    {
        public string SkillId { get; set; } = null!;
        public string SkillName { get; set; } = null!;
        public string? Category { get; set; }
    }
}
