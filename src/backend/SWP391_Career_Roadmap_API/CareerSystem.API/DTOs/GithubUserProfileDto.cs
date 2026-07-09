namespace CareerSystem.API.DTOs
{
    public class GithubUserProfileDto
    {
        public string Login { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string? HtmlUrl { get; set; }
    }
}
