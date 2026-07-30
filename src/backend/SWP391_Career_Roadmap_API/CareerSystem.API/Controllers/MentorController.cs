using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CareerSystem.API.Controllers
{
    [ApiController]
    [Route("api/mentor")]
    [Authorize]
    public class MentorController : ControllerBase
    {
        private readonly IMentorService _mentorService;

        public MentorController(IMentorService mentorService)
        {
            _mentorService = mentorService;
        }

        [HttpPost("ask")]
        [ValidateGeminiApiKey]
        public async Task<IActionResult> Ask([FromBody] MentorAskRequestDto request)
        {
            var result = await _mentorService.AskAsync(request);
            return Ok(result);
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetChatHistory(string userId, [FromQuery] string? cursor = null, [FromQuery] int limit = 20)
        {
            var history = await _mentorService.GetSessionHistoryAsync(userId, cursor, limit);
            return Ok(history);
        }

        [HttpDelete("history/{userId}")]
        public async Task<IActionResult> ClearChatHistory(string userId)
        {
            var success = await _mentorService.ClearSessionHistoryAsync(userId);
            if (!success)
            {
                return NotFound(new { message = "No chat session found for this user." });
            }
            return Ok(new { message = "Chat history cleared successfully." });
        }
    }
}
