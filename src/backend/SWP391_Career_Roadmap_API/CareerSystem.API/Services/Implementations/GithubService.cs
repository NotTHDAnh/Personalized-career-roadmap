using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text.Json;

namespace CareerSystem.API.Services.Implementations
{
    public class GithubService
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;

        public GithubService(HttpClient httpClient, AppDbContext context)
        {
            _httpClient = httpClient;
            _context = context;
        }

        // Lấy danh sách repo public từ GitHub API bằng github username.
        public async Task<List<GithubRepoDto>> GetUserReposFromGithubAsync(string username)
        {
            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"https://api.github.com/users/{username}/repos?per_page=100&sort=updated"
            );

            // GitHub API bắt buộc có User-Agent.
            request.Headers.UserAgent.Add(
                new ProductInfoHeaderValue("CareerRoadmapApp", "1.0")
            );

            request.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/vnd.github+json")
            );

            var response = await _httpClient.SendAsync(request);

            // Nếu GitHub lỗi hoặc username không tồn tại thì trả list rỗng.
            if (!response.IsSuccessStatusCode)
            {
                return new List<GithubRepoDto>();
            }

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<List<GithubRepoDto>>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            ) ?? new List<GithubRepoDto>();
        }

        // Lọc repo tốt nhất để phân tích.
        // Không lấy fork, không lấy archive, ưu tiên repo update gần đây.
        public async Task<List<GithubRepoDto>> GetTopReposFromGithubAsync(string username)
        {
            var repos = await GetUserReposFromGithubAsync(username);

            return repos
                .Where(r => !r.Fork && !r.Archived)
                .OrderByDescending(r => r.UpdatedAt)
                .ThenByDescending(r => r.StargazersCount)
                .Take(5)
                .ToList();
        }

        // Sync repo từ GitHub vào DB.
        // Nếu repo đã có trong DB thì bỏ qua, không insert trùng.
        public async Task SyncGithubReposToDatabaseAsync(string userId)
        {
            var githubProfile = await _context.GithubProfiles
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (githubProfile == null)
            {
                return;
            }

            var repos = await GetTopReposFromGithubAsync(githubProfile.GithubUsername);

            foreach (var repo in repos)
            {
                var exists = await _context.Repositories
                    .AnyAsync(r =>
                        r.ProfileId == githubProfile.ProfileId &&
                        r.RepoName == repo.Name
                    );

                if (exists)
                {
                    continue;
                }

                // Lưu repo vào DB.
                // Hiện tại ai_summary lấy description tạm.
                // tech_stack lấy language tạm.
                _context.Repositories.Add(new Repository
                {
                    RepoId = Guid.NewGuid().ToString(),
                    ProfileId = githubProfile.ProfileId,
                    RepoName = repo.Name,
                    RepoUrl = repo.HtmlUrl,
                    AiSummary = repo.Description ?? "No repository description.",
                    TechStack = repo.Language ?? "Unknown"
                });
            }

            await _context.SaveChangesAsync();
        }

        // Lấy repo context từ DB để đưa vào prompt AI.
        public async Task<string> BuildGithubContextJsonAsync(string userId)
        {
            var githubProfile = await _context.GithubProfiles
                .FirstOrDefaultAsync(g => g.UserId == userId);

            if (githubProfile == null)
            {
                return "[]";
            }

            // Nếu DB chưa có repo thì sync từ GitHub về trước.
            var hasRepos = await _context.Repositories
                .AnyAsync(r => r.ProfileId == githubProfile.ProfileId);

            if (!hasRepos)
            {
                await SyncGithubReposToDatabaseAsync(userId);
            }

            var repos = await _context.Repositories
                .Where(r => r.ProfileId == githubProfile.ProfileId)
                .Select(r => new
                {
                    repoName = r.RepoName,
                    repoUrl = r.RepoUrl,
                    aiSummary = r.AiSummary,
                    techStack = r.TechStack
                })
                .ToListAsync();

            return JsonSerializer.Serialize(
                repos,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );
        }
    }
}