namespace CareerSystem.API.DTOs
{
    public class ChatMessageDto
    {
        public string MessageId { get; set; } = string.Empty;
        public string Sender { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime? Timestamp { get; set; }
    }
}