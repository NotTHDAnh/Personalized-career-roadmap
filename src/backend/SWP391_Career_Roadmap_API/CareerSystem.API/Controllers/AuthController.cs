using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required.");
            }
            try
            {
                var res = await _authService.LoginAsync(request);
                if (res == null)
                {
                    return Unauthorized("Invalid email or password.");
                }
                return Ok(res);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (string.IsNullOrEmpty(request.IdToken))
            {
                return BadRequest("IdToken is required.");
            }
            try
            {
                var res = await _authService.LoginWithGoogleAsync(request);
                if (res == null)
                {
                    return Unauthorized("Google account does not exist or is not authorized to access the system.");
                }
                return Ok(res);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.RefreshToken))
            {
                return BadRequest("RefreshToken is required.");
            }
            var res = await _authService.RefreshTokenAsync(request);
            if (res == null)
            {
                return Unauthorized("Phiên làm việc đã hết hạn hoặc refresh token không hợp lệ.");
            }
            return Ok(res);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest("Email là bắt buộc.");
            }

            var result = await _authService.ForgotPasswordAsync(request);
            if (!result)
            {
                return BadRequest("Email không tồn tại trong hệ thống.");
            }

            return Ok(new { message = "Mật khẩu mới đã được gửi vào Email của bạn." });
        }
    }
}