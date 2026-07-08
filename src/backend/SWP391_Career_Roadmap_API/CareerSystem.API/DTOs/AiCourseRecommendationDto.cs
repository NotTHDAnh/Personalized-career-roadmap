namespace CareerSystem.API.DTOs
{
    public class AiCourseRecommendationDto
    {
        public string CourseCode { get; set; } = null!;
        public string SkillName { get; set; } = null!;
        public string? Level { get; set; }
        public decimal? LearningCoefficient { get; set; }
    }
}