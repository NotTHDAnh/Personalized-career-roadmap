namespace CareerSystem.API.DTOs
{
    public class CourseLearningOutcomeDto
    {
        public string Id { get; set; } = null!;
        public string SkillId { get; set; } = null!;
        public string SkillName { get; set; } = null!;
        public string? OutcomeDescription { get; set; }
    }
}
