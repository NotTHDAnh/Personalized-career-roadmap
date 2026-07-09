namespace CareerSystem.API.DTOs
{
    public class GithubProfileResponseDto
    {
        public string GithubUsername { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string? PortfolioUrl { get; set; }
        public bool IsConnected { get; set; }
    }
}
