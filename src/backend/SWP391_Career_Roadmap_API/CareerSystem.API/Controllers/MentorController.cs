using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
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
        public async Task<IActionResult> Ask([FromBody] MentorAskRequestDto request)
        {
            var result = await _mentorService.AskAsync(request);
            return Ok(result);
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetChatHistory(string userId)
        {
            var history = await _mentorService.GetSessionHistoryAsync(userId);
            return Ok(history);
        }
    }
}
