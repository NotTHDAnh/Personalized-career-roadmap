using System.Text.Json.Serialization;

namespace CareerSystem.API.DTOs
{
    public class GithubRepoDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } = "";
        [JsonPropertyName("html_url")]
        public string HtmlUrl { get; set; } = "";
        [JsonPropertyName("description")]
        public string Description { get; set; }

        [JsonPropertyName("language")]
        public string? Language { get; set; }

        [JsonPropertyName("fork")]
        public bool Fork { get; set; }

        [JsonPropertyName("archived")]
        public bool Archived { get; set; }

        [JsonPropertyName("stargazers_count")]
        public int StargazersCount { get; set; }

        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
