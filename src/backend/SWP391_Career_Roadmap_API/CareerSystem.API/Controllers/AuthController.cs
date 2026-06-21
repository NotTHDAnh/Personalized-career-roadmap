using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
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
            if(string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email and password are required.");
            }
            var res = await _authService.LoginAsync(request);
            if(res == null)
            {
                return Unauthorized("Invalid email or password.");
            }
            return Ok(res);
        }
        
        //public IActionResult Login([FromBody] LoginRequest request)
        //{
        //    var resultMessage = _authService.Login(request);

        //    if (resultMessage.Contains("thành công"))
        //    {
        //        return Ok(new { message = resultMessage }); // Trả về mã 200 (Xanh lá)
        //    }

        //    return Unauthorized(new { message = resultMessage }); // Trả về mã 401 (Lỗi đỏ)
        //}
    }
}