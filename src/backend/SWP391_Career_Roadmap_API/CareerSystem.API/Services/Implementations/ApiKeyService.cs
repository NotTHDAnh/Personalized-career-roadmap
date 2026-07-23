using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class ApiKeyService : IApiKeyService
    {
        private readonly AppDbContext _context;
        private readonly IGeminiService _geminiService;

        public ApiKeyService(AppDbContext context, IGeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        public async Task<UserApiKeyStatusDto> GetApiKeyStatusAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            var hasKey = !string.IsNullOrWhiteSpace(user.GeminiApiKey);
            if (!hasKey)
            {
                throw new KeyNotFoundException("không tìm thấy cấu hình API key");
            }

            string? maskedKey = null;
            var key = user.GeminiApiKey!.Trim();
            if (key.Length > 10)
            {
                maskedKey = $"{key.Substring(0, 6)}...{key.Substring(key.Length - 4)}";
            }
            else
            {
                maskedKey = "...";
            }

            return new UserApiKeyStatusDto
            {
                HasKey = hasKey,
                MaskedKey = maskedKey
            };
        }

        public async Task UpdateApiKeyAsync(string userId, string apiKey)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            // Gọi thử API Gemini để xác thực tính hợp lệ của Key
            var isValid = await _geminiService.ValidateApiKeyAsync(apiKey);
            if (!isValid)
            {
                throw new ArgumentException("Gemini API Key không hợp lệ hoặc không hoạt động. Vui lòng kiểm tra lại.");
            }

            user.GeminiApiKey = apiKey.Trim();
            await _context.SaveChangesAsync();
        }

        public async Task DeleteApiKeyAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
            {
                throw new KeyNotFoundException("Không tìm thấy người dùng.");
            }

            user.GeminiApiKey = null;
            await _context.SaveChangesAsync();
        }
    }
}
