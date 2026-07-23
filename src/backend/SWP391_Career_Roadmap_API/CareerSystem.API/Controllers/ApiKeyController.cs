using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/users/{userId}/gemini-key")]
    [ApiController]
    [Authorize]
    public class ApiKeyController : ControllerBase
    {
        private readonly IApiKeyService _apiKeyService;

        public ApiKeyController(IApiKeyService apiKeyService)
        {
            _apiKeyService = apiKeyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetApiKeyStatus(string userId)
        {
            try
            {
                var status = await _apiKeyService.GetApiKeyStatusAsync(userId);
                return Ok(status);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateApiKey(string userId, [FromBody] GeminiKeyRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.GeminiApiKey))
            {
                return BadRequest("API Key không được để trống.");
            }

            try
            {
                await _apiKeyService.UpdateApiKeyAsync(userId, request.GeminiApiKey);
                return Ok(new { message = "Cấu hình Gemini API Key thành công!" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteApiKey(string userId)
        {
            try
            {
                await _apiKeyService.DeleteApiKeyAsync(userId);
                return Ok(new { message = "Đã xóa Gemini API Key thành công!" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
