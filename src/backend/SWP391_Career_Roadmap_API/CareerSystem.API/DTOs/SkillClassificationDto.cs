namespace CareerSystem.API.DTOs
{
    /// <summary>
    /// DTO đại diện cho kết quả hoặc yêu cầu phân loại kỹ năng bằng AI.
    /// </summary>
    public class SkillClassificationDto
    {
        public string SkillId { get; set; } = null!;
        public string SkillName { get; set; } = null!;
        public string Category { get; set; } = null!;
    }
}
