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

        // Constructor: Nhúng AppDbContext vào để gọi Database
        public AuthService(AppDbContext context)
        {
            _context = context;
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

            // If stored password hash is missing or verification fails, deny access
            if (string.IsNullOrWhiteSpace(user.PasswordHash) || string.IsNullOrEmpty(request.Password) || !PassHashValidation.VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }
            return new LoginResponse
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