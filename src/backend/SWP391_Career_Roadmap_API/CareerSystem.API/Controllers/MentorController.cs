using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [ApiController]
    [Route("api/mentor")]
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
            try
            {
                var result = await _mentorService.AskAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("history/{userId}")]
        public async Task<IActionResult> GetChatHistory(string userId)
        {
            try
            {
                var history = await _mentorService.GetSessionHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
