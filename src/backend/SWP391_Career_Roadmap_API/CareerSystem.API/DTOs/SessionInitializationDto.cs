namespace CareerSystem.API.DTOs
{
    public class SessionInitializationDto
    {
        public string SessionId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "STUDENT";
        public DateTime CreatedAt { get; set; }
        public List<ChatMessageDto> ChatHistory { get; set; } = new();
        public bool IsNewSession { get; set; }
    }
}
