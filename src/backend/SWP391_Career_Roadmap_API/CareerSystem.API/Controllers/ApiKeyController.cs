using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CareerSystem.API.Controllers
{
    [Route("api/users/{userId}/gemini-key")]
    [ApiController]
    public class ApiKeyController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IGeminiService _geminiService;

        public ApiKeyController(AppDbContext context, IGeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        [HttpGet]
        public async Task<IActionResult> GetApiKeyStatus(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            var hasKey = !string.IsNullOrWhiteSpace(user.GeminiApiKey);
            if (!hasKey)
            {
                return NotFound("không tìm thấy cấu hình API key");
            }
            string? maskedKey = null;

            if (hasKey)
            {
                var key = user.GeminiApiKey!.Trim();
                if (key.Length > 10)
                {
                    maskedKey = $"{key.Substring(0, 6)}...{key.Substring(key.Length - 4)}";
                }
                else
                {
                    maskedKey = "...";
                }
            }

            return Ok(new UserApiKeyStatusDto
            {
                HasKey = hasKey,
                MaskedKey = maskedKey
            });
        }

        [HttpPost]
        public async Task<IActionResult> UpdateApiKey(string userId, [FromBody] GeminiKeyRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.GeminiApiKey))
            {
                return BadRequest("API Key không được để trống.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            // Gọi thử API Gemini để xác thực tính hợp lệ của Key
            var isValid = await _geminiService.ValidateApiKeyAsync(request.GeminiApiKey);
            if (!isValid)
            {
                return BadRequest("Gemini API Key không hợp lệ hoặc không hoạt động. Vui lòng kiểm tra lại.");
            }

            user.GeminiApiKey = request.GeminiApiKey.Trim();
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cấu hình Gemini API Key thành công!" });
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteApiKey(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                return NotFound("Không tìm thấy người dùng.");
            }

            user.GeminiApiKey = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa Gemini API Key thành công!" });
        }
    }
}
