namespace CareerSystem.API.DTOs
{
    public class MentorAskResponseDto
    {
        public string? TargetRoleId { get; set; }
        public string? TargetRoleName { get; set; }
        public string? FollowUpQuestion { get; set; }
        public string Answer { get; set; } = string.Empty;
        public List<string> RecommendedCareers { get; set; } = new();
        public List<string> MissingSkills { get; set; } = new();
    }
}
