namespace CareerSystem.API.DTOs
{
    public class UserApiKeyStatusDto
    {
        public bool HasKey { get; set; }
        public string? MaskedKey { get; set; }
    }
}
