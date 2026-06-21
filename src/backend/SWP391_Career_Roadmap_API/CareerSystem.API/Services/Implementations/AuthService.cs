using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace CareerSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IMentorService _mentorService;

        public AuthService(AppDbContext context, IMentorService mentorService)
        {
            _context = context;
            _mentorService = mentorService;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return null;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
            if (user == null)
            {
                return null;
            }

            if (string.IsNullOrWhiteSpace(user.PasswordHash) || string.IsNullOrEmpty(request.Password) || !PassHashValidation.VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }

            var loginResponse = new LoginResponse
            {
                AccessToken = $"demo-token-{user.UserId}",
                User = new Entities.User
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    Role = user.Role,
                }
            };

            var sessionData = await _mentorService.InitializeChatSessionAsync(user.UserId);
            loginResponse.MentorSessionData = sessionData;

            return loginResponse;
        }
        public string Login(LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return "Tài khoản không tồn tại!";
            }
            if (string.IsNullOrEmpty(request.Password))
            {
                return "Mật khẩu không chính xác!";
            }

            // 1. Tìm user trong bảng Users có Email khớp với dữ liệu gửi lên
            var user = _context.Users.FirstOrDefault(u => u.Email.ToLower() == request.Email.ToLower());

            // 2. Nếu không tìm thấy
            if (user == null)
            {
                return "Tài khoản không tồn tại!";
            }

            // 3. Kiểm tra mật khẩu bằng hàm Verify (PBKDF2)
            if (string.IsNullOrWhiteSpace(user.PasswordHash) || !PassHashValidation.VerifyPassword(request.Password, user.PasswordHash))
            {
                return "Mật khẩu không chính xác!";
            }

            // 4. Thành công
            return $"Đăng nhập thành công! Chào mừng {user.FullName} (Quyền: {user.Role})";
        }
    }
}