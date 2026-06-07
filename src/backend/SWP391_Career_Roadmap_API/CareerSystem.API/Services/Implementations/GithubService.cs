using System.Collections.Concurrent;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text.Json;

using CareerSystem.API.Services.Interfaces;

namespace CareerSystem.API.Services.Implementations
{
    public class GithubService
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;
        private readonly IGeminiService _geminiService;

        // BỘ NHỚ ĐỆM LƯU THỜI GIAN ĐỒNG BỘ GITHUB GẦN NHẤT CỦA MỖI USER
        // Tránh việc spam gọi GitHub API liên tục trên mỗi tin nhắn chat khi tài khoản chưa có repo nào trong DB.
        private static readonly ConcurrentDictionary<string, DateTime> _lastSyncTimes = new();

        public GithubService(HttpClient httpClient, AppDbContext context, IGeminiService geminiService)
        {
            _httpClient = httpClient;
            _context = context;
            _geminiService = geminiService;
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
        // Không lấy fork, không lấy archive, dung lượng >= 10KB, ưu tiên repo mới cập nhật.
        public async Task<List<GithubRepoDto>> GetTopReposFromGithubAsync(string username)
        {
            var repos = await GetUserReposFromGithubAsync(username);

            return repos
                .Where(r => !r.Fork && !r.Archived && r.Size >= 10)
                .OrderByDescending(r => r.UpdatedAt)
                .ThenByDescending(r => r.StargazersCount)
                .Take(5)
                .ToList();
        }

        // Tải file README.md của repo từ GitHub API và giải mã Base64.
        public async Task<string?> GetRepoReadmeAsync(string owner, string repoName)
        {
            try
            {
                var request = new HttpRequestMessage(
                    HttpMethod.Get,
                    $"https://api.github.com/repos/{owner}/{repoName}/readme"
                );

                request.Headers.UserAgent.Add(
                    new ProductInfoHeaderValue("CareerRoadmapApp", "1.0")
                );

                request.Headers.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/vnd.github+json")
                );

                var response = await _httpClient.SendAsync(request);

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                var json = await response.Content.ReadAsStringAsync();
                var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("content", out var contentProp) &&
                    doc.RootElement.TryGetProperty("encoding", out var encodingProp) &&
                    encodingProp.GetString() == "base64")
                {
                    var base64Content = contentProp.GetString()?.Replace("\n", "").Replace("\r", "") ?? "";
                    var bytes = Convert.FromBase64String(base64Content);
                    var readmeText = System.Text.Encoding.UTF8.GetString(bytes);

                    // Giới hạn 2000 ký tự đầu tiên để tiết kiệm token gửi AI
                    if (readmeText.Length > 2000)
                    {
                        readmeText = readmeText.Substring(0, 2000);
                    }
                    return readmeText;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GithubService] Lỗi khi tải README cho {repoName}: {ex.Message}");
            }

            return null;
        }

        // Gọi Gemini API để phân tích README và bóc tách dữ liệu JSON
        public async Task<(string AiSummary, string TechStack)> AnalyzeReadmeWithAiAsync(string repoName, string readmeContent, string defaultLanguage, string defaultDescription)
        {
            try
            {
                string prompt = $@"
                    Bạn là một chuyên gia phân tích mã nguồn. Hãy phân tích nội dung file README của dự án GitHub sau:
                    ---
                    Dự án: {repoName}
                    Nội dung README:
                    {readmeContent}
                    ---
                    Nhiệm vụ của bạn là trả về một chuỗi JSON chứa 2 trường:
                    1. ""aiSummary"": Tóm tắt ngắn gọn bằng tiếng Việt (1-2 câu) về mục đích và tính năng chính của dự án này.
                    2. ""techStack"": Chuỗi các công nghệ/ngôn ngữ/framework/thư viện chính được sử dụng (ngăn cách bởi dấu phẩy, ví dụ: ""C#, .NET Core, SQL Server"").

                    Yêu cầu:
                    - Nếu nội dung README quá ngắn hoặc không có thông tin hữu ích, hãy dựa trên tên dự án để tóm tắt và ghi nhận ngôn ngữ chính là: {defaultLanguage}.
                    - Chỉ trả về định dạng JSON chính xác như sau, không được chứa các ký tự định dạng markdown như ```json hay bất kỳ văn bản giải thích nào khác:
                    {{
                      ""aiSummary"": ""nội dung tóm tắt tiếng Việt ở đây"",
                      ""techStack"": ""các công nghệ cách nhau bằng dấu phẩy ở đây""
                    }}";

                var aiResponse = await _geminiService.CallGeminiApiAsync(prompt);
                
                // Parse kết quả trả về
                var doc = JsonDocument.Parse(aiResponse);
                if (doc.RootElement.TryGetProperty("aiSummary", out var summaryProp) &&
                    doc.RootElement.TryGetProperty("techStack", out var techProp))
                {
                    var summary = summaryProp.GetString()?.Trim() ?? "";
                    var tech = techProp.GetString()?.Trim() ?? "";

                    if (!string.IsNullOrWhiteSpace(summary) && !string.IsNullOrWhiteSpace(tech))
                    {
                        return (summary, tech);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GithubService] Lỗi khi AI phân tích README cho {repoName}: {ex.Message}");
            }

            // Fallback nếu có lỗi hoặc dữ liệu rỗng
            var fallbackSummary = !string.IsNullOrWhiteSpace(defaultDescription) && defaultDescription != "No repository description."
                ? defaultDescription
                : $"Dự án mã nguồn mở viết bằng {defaultLanguage}.";

            return (fallbackSummary, defaultLanguage);
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

                // Lấy README và tóm tắt qua AI
                string aiSummary = "";
                string techStack = "";

                var readme = await GetRepoReadmeAsync(githubProfile.GithubUsername, repo.Name);
                if (!string.IsNullOrWhiteSpace(readme))
                {
                    var (summary, tech) = await AnalyzeReadmeWithAiAsync(repo.Name, readme, repo.Language ?? "Unknown", repo.Description);
                    aiSummary = summary;
                    techStack = tech;
                }
                else
                {
                    // Fallback thông minh nếu không có README
                    aiSummary = !string.IsNullOrWhiteSpace(repo.Description) && repo.Description != "No repository description."
                        ? repo.Description
                        : $"Dự án mã nguồn mở viết bằng {repo.Language ?? "Unknown"}.";
                    techStack = repo.Language ?? "Unknown";
                }

                // Lưu repo vào DB.
                _context.Repositories.Add(new Repository
                {
                    RepoId = Guid.NewGuid().ToString(),
                    ProfileId = githubProfile.ProfileId,
                    RepoName = repo.Name,
                    RepoUrl = repo.HtmlUrl,
                    AiSummary = aiSummary,
                    TechStack = techStack
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
                // Chỉ đồng bộ lại nếu chưa đồng bộ trong vòng 60 phút qua để tránh treo mạng liên tục
                if (!_lastSyncTimes.TryGetValue(userId, out var lastSync) || (DateTime.UtcNow - lastSync).TotalMinutes > 60)
                {
                    await SyncGithubReposToDatabaseAsync(userId);
                    _lastSyncTimes[userId] = DateTime.UtcNow; // Ghi lại mốc thời gian đồng bộ gần nhất
                }
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