using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CareerSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMentorService _mentorService;
        private readonly IEmailService _emailService;

        // Constructor: Nhúng AppDbContext, IConfiguration, IMentorService và IEmailService
        public AuthService(AppDbContext context, IConfiguration configuration, IMentorService mentorService, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _mentorService = mentorService;
            _emailService = emailService;
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

            if (user.Status == false || user.DeleteHistory == true)
            {
                throw new UnauthorizedAccessException("Google account does not exist or is not authorized to access the system.");
            }

            if (string.IsNullOrWhiteSpace(user.PasswordHash) || string.IsNullOrEmpty(request.Password) || !PassHashValidation.VerifyPassword(request.Password, user.PasswordHash))
            {
                return null;
            }
            var accessToken = GenerateJwtToken(user);
            var refreshToken = await GenerateAndSaveRefreshToken(user.UserId);

            var loginResponse = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
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

        public async Task<LoginResponse?> LoginWithGoogleAsync(GoogleLoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.IdToken))
            {
                return null;
            }

            string email;
            string name = string.Empty;
            string googleSub = string.Empty;

            // Support mock tokens for developer testing
            if (request.IdToken.StartsWith("mock-google-token-"))
            {
                email = request.IdToken.Substring("mock-google-token-".Length);
                if (string.IsNullOrWhiteSpace(email))
                {
                    return null;
                }
                name = email.Split('@')[0];
                googleSub = "mock-google-sub-" + email;
            }
            else
            {
                try
                {
                    using var httpClient = new HttpClient();
                    var response = await httpClient.GetAsync($"https://oauth2.googleapis.com/tokeninfo?id_token={request.IdToken}");
                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"[AuthService] Google tokeninfo API failed. Status: {response.StatusCode}, Content: {errorContent}");
                        return null;
                    }

                    var jsonString = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"[AuthService] Google tokeninfo response: {jsonString}");
                    using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
                    var root = doc.RootElement;

                    if (!root.TryGetProperty("email_verified", out var emailVerifiedProp))
                    {
                        Console.WriteLine("[AuthService] Google tokeninfo missing 'email_verified' property.");
                        return null;
                    }

                    bool isEmailVerified = false;
                    if (emailVerifiedProp.ValueKind == System.Text.Json.JsonValueKind.True)
                    {
                        isEmailVerified = true;
                    }
                    else if (emailVerifiedProp.ValueKind == System.Text.Json.JsonValueKind.String && emailVerifiedProp.GetString() == "true")
                    {
                        isEmailVerified = true;
                    }

                    if (!isEmailVerified)
                    {
                        Console.WriteLine("[AuthService] Google account email is not verified.");
                        return null;
                    }

                    if (!root.TryGetProperty("email", out var emailProp) ||
                        string.IsNullOrWhiteSpace(emailProp.GetString()))
                    {
                        Console.WriteLine("[AuthService] Google tokeninfo missing or empty 'email' property.");
                        return null;
                    }
                    email = emailProp.GetString()!;

                    if (root.TryGetProperty("name", out var nameProp))
                    {
                        name = nameProp.GetString() ?? string.Empty;
                    }
                    if (root.TryGetProperty("sub", out var subProp))
                    {
                        googleSub = subProp.GetString() ?? string.Empty;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[AuthService] Exception in Google token verification: {ex.Message}\n{ex.StackTrace}");
                    return null;
                }
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (user == null)
            {
                Console.WriteLine($"[AuthService] Google login failed: Email '{email}' does not exist in local database.");
                return null;
            }

            if (user.Status == false || user.DeleteHistory == true)
            {
                throw new UnauthorizedAccessException("Google account does not exist or is not authorized to access the system.");
            }

            // Sync google credentials if user has LOCAL provider
            if (string.IsNullOrEmpty(user.OauthProvider) || user.OauthProvider == "LOCAL")
            {
                user.OauthProvider = "GOOGLE";
                user.OauthId = googleSub;
                await _context.SaveChangesAsync();
            }

            var accessToken = GenerateJwtToken(user);
            var refreshToken = await GenerateAndSaveRefreshToken(user.UserId);

            var loginResponse = new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
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

            if (user.Status == false || user.DeleteHistory == true)
            {
                return "Google account does not exist or is not authorized to access the system.";
            }

            // 3. Kiểm tra mật khẩu bằng hàm Verify (PBKDF2)
            if (string.IsNullOrWhiteSpace(user.PasswordHash) || !PassHashValidation.VerifyPassword(request.Password, user.PasswordHash))
            {
                return "Mật khẩu không chính xác!";
            }

            // 4. Thành công
            return $"Đăng nhập thành công! Chào mừng {user.FullName} (Quyền: {user.Role})";
        }

        private string GenerateJwtToken(Entities.User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecret = _configuration["JwtSettings:Secret"] ?? "nevergonnagiveyouupnevergonnaletyoudown";
            var jwtIssuer = _configuration["JwtSettings:Issuer"] ?? "CareerSystemAPI";
            var jwtAudience = _configuration["JwtSettings:Audience"] ?? "CareerSystemClient";
            var expiryMinutes = double.Parse(_configuration["JwtSettings:ExpiryInMinutes"] ?? "15");

            var key = Encoding.UTF8.GetBytes(jwtSecret);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role ?? "STUDENT")
                }),
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private async Task<string> GenerateAndSaveRefreshToken(string userId)
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            var refreshTokenString = Convert.ToBase64String(randomNumber);

            var refreshExpiryDays = double.Parse(_configuration["JwtSettings:RefreshExpiryInDays"] ?? "7");

            var tokenEntity = new Entities.UserRefreshToken
            {
                TokenId = Guid.NewGuid().ToString(),
                UserId = userId,
                RefreshToken = refreshTokenString,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            // Revoke previous tokens for this user for security hygiene
            var existingTokens = await _context.UserRefreshTokens
                .Where(t => t.UserId == userId && !t.IsRevoked)
                .ToListAsync();

            foreach (var token in existingTokens)
            {
                token.IsRevoked = true;
            }

            await _context.UserRefreshTokens.AddAsync(tokenEntity);
            await _context.SaveChangesAsync();

            return refreshTokenString;
        }

        public async Task<LoginResponse?> RefreshTokenAsync(RefreshTokenRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.RefreshToken))
            {
                return null;
            }

            var storedToken = await _context.UserRefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.RefreshToken == request.RefreshToken);

            if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiresAt < DateTime.UtcNow)
            {
                return null;
            }

            storedToken.IsRevoked = true;

            var newAccessToken = GenerateJwtToken(storedToken.User);
            var newRefreshToken = await GenerateAndSaveRefreshToken(storedToken.UserId);

            return new LoginResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = new Entities.User
                {
                    UserId = storedToken.User.UserId,
                    FullName = storedToken.User.FullName,
                    Email = storedToken.User.Email,
                    Role = storedToken.User.Role
                }
            };
        }

        private string BuildForgotPasswordEmailBody(string fullName, string newPassword)
        {
            string template = $@"<div style=""font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; color: #1f2937; background-color: #ffffff;"">
                                <h3 style=""color: #4f46e5; margin-top: 0; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;"">Khôi phục mật khẩu</h3>
                                <p>Xin chào <strong>{fullName}</strong>,</p>
                                <p>Hệ thống đã cấp lại mật khẩu cho tài khoản của bạn:</p>
                                <div style=""background-color: #f3f4f6; border-radius: 6px; padding: 12px; text-align: center; margin: 20px 0; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #4f46e5; font-family: monospace;"">
                                    {newPassword}
                                </div>
                                <div style=""border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: 20px; font-size: 11px; color: #9ca3af; text-align: center;"">
                                    Email tự động từ Career Roadmap. Vui lòng không trả lời thư này.
                                </div>
                            </div>";

            return template;
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email))
            {
                return false;
            }

            var emailLower = request.Email.ToLower();
            // 1. Kiểm tra Email có tồn tại trong hệ thống hay không (AsNoTracking)
            var userCheck = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailLower);

            if (userCheck == null)
            {
                return false;
            }

            // 2. Tạo một mật khẩu ngẫu nhiên mới 
            var newPassword = GenerateRandomPassword(8);

            // 3. Băm mật khẩu mới dùng PassHashValidation.HashPassword và lưu vào DB
            var passwordHash = PassHashValidation.HashPassword(newPassword);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userCheck.UserId);
            if (user == null)
            {
                return false;
            }

            user.PasswordHash = passwordHash;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            // 4. Gửi mail mật khẩu gốc (chưa hash) cho người dùng qua IEmailService
            await _emailService.SendEmailAsync(
                user.Email,
                "Khôi phục mật khẩu - CareerSystem",
                BuildForgotPasswordEmailBody(user.FullName, newPassword)
            );

            return true;
        }

        private static string GenerateRandomPassword(int length)
        {
            if (length < 4) length = 8;

            const string upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string lower = "abcdefghijklmnopqrstuvwxyz";
            const string digits = "0123456789";
            const string specials = "!@#$%^&*()_+-=[]{}|;:,.<>?";
            const string allChars = upper + lower + digits + specials;
            var password = new char[length];

            password[0] = upper[RandomNumberGenerator.GetInt32(upper.Length)];
            password[1] = lower[RandomNumberGenerator.GetInt32(upper.Length)];
            password[2] = digits[RandomNumberGenerator.GetInt32(upper.Length)];
            password[3] = specials[RandomNumberGenerator.GetInt32(upper.Length)];
            for (int i = 4; i < length; ++i)
            {
                password[i] = allChars[RandomNumberGenerator.GetInt32(allChars.Length)];
            }

            return new string(password.OrderBy(x => Guid.NewGuid()).ToArray());
        }
    }
}
