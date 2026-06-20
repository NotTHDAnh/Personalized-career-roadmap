using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;

namespace CareerSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        // Constructor: Nhúng AppDbContext và IConfiguration
        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
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
            var accessToken = GenerateJwtToken(user);
            var refreshToken = await GenerateAndSaveRefreshToken(user.UserId);

            return new LoginResponse
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
                        return null;
                    }

                    var jsonString = await response.Content.ReadAsStringAsync();
                    using var doc = System.Text.Json.JsonDocument.Parse(jsonString);
                    var root = doc.RootElement;

                    if (!root.TryGetProperty("email_verified", out var emailVerifiedProp) ||
                        emailVerifiedProp.GetString() != "true")
                    {
                        return null;
                    }

                    if (!root.TryGetProperty("email", out var emailProp) ||
                        string.IsNullOrWhiteSpace(emailProp.GetString()))
                    {
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
                catch
                {
                    return null;
                }
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
            if (user == null)
            {
                return null;
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

            return new LoginResponse
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
                User = storedToken.User
            };
        }
    }
}