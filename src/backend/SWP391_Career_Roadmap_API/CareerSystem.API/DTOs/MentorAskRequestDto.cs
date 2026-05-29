namespace CareerSystem.API.DTOs
{
    public class MentorAskRequestDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public string? SelectedTopic { get; set; }
    }
}
