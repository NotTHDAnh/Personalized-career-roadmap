using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Implementations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GithubController : ControllerBase
    {
        private readonly GithubService _githubService;
        private readonly AppDbContext _context;

        public GithubController(GithubService githubService, AppDbContext context)
        {
            _githubService = githubService;
            _context = context;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Không xác định danh tính.");

            var profile = await _context.GithubProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return Ok(new GithubProfileResponseDto { IsConnected = false });
            }

            return Ok(new GithubProfileResponseDto
            {
                GithubUsername = profile.GithubUsername,
                AvatarUrl = profile.AvatarUrl,
                PortfolioUrl = profile.PortfolioUrl,
                IsConnected = true
            });
        }

        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromBody] GithubCallbackRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest("Mã code từ GitHub không hợp lệ.");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Không xác định danh tính.");

            // 1. Đổi code lấy access_token
            var accessToken = await _githubService.ExchangeCodeForAccessTokenAsync(request.Code);
            if (string.IsNullOrEmpty(accessToken))
            {
                return BadRequest("Không thể lấy Access Token từ GitHub OAuth.");
            }

            // 2. Lấy thông tin user profile từ GitHub
            var githubUser = await _githubService.GetGithubUserProfileAsync(accessToken);
            if (githubUser == null)
            {
                return BadRequest("Không thể lấy thông tin người dùng từ GitHub API.");
            }

            // 2.5. Kiểm tra xem tài khoản GitHub này đã được liên kết bởi người dùng khác trong hệ thống chưa
            if (!string.IsNullOrEmpty(githubUser.HtmlUrl))
            {
                var duplicateProfile = await _context.GithubProfiles
                    .FirstOrDefaultAsync(p => p.PortfolioUrl == githubUser.HtmlUrl && p.UserId != userId);
                if (duplicateProfile != null)
                {
                    return BadRequest("Tài khoản GitHub này đã được liên kết với một người dùng khác trong hệ thống.");
                }
            }

            // 3. Tìm hoặc tạo GithubProfile trong DB
            var profile = await _context.GithubProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null)
            {
                profile = new GithubProfile
                {
                    ProfileId = Guid.NewGuid().ToString(),
                    UserId = userId,
                    GithubUsername = githubUser.Login,
                    AvatarUrl = githubUser.AvatarUrl,
                    PortfolioUrl = githubUser.HtmlUrl,
                    GithubAccessToken = accessToken
                };
                _context.GithubProfiles.Add(profile);
            }
            else
            {
                profile.GithubUsername = githubUser.Login;
                profile.AvatarUrl = githubUser.AvatarUrl;
                profile.PortfolioUrl = githubUser.HtmlUrl;
                profile.GithubAccessToken = accessToken;
                _context.GithubProfiles.Update(profile);
            }

            await _context.SaveChangesAsync();

            // 4. Đồng bộ ngay lập tức các repositories của user
            try
            {
                // Kiểm tra xem User đã cấu hình Gemini API Key chưa trước khi đồng bộ (vì cần AI tóm tắt README)
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                if (user != null && !string.IsNullOrWhiteSpace(user.GeminiApiKey))
                {
                    await _githubService.SyncGithubReposToDatabaseAsync(userId);
                }
            }
            catch (Exception ex)
            {
                // Vẫn cho kết nối thành công, đồng bộ lỗi thì người dùng có thể sync lại sau khi đã nhập Gemini API Key
                return Ok(new { message = "Kết nối GitHub thành công nhưng gặp sự cố khi tự động đồng bộ dự án: " + ex.Message, username = githubUser.Login });
            }

            return Ok(new { message = "Liên kết tài khoản GitHub và đồng bộ dự án thành công!", username = githubUser.Login });
        }

        [HttpPost("sync")]
        public async Task<IActionResult> Sync()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Không xác định danh tính.");

            var profile = await _context.GithubProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Tài khoản chưa liên kết với GitHub.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null || string.IsNullOrWhiteSpace(user.GeminiApiKey))
            {
                return BadRequest("Vui lòng cấu hình Gemini API Key trước khi thực hiện đồng bộ.");
            }

            try
            {
                await _githubService.SyncGithubReposToDatabaseAsync(userId);
                return Ok(new { message = "Đồng bộ hóa dữ liệu GitHub thành công!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đồng bộ thất bại: " + ex.Message });
            }
        }

        [HttpDelete("disconnect")]
        public async Task<IActionResult> Disconnect()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized("Không xác định danh tính.");

            var profile = await _context.GithubProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile == null) return NotFound("Không tìm thấy liên kết GitHub để hủy.");

            _context.GithubProfiles.Remove(profile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Hủy liên kết tài khoản GitHub thành công." });
        }
    }
}
