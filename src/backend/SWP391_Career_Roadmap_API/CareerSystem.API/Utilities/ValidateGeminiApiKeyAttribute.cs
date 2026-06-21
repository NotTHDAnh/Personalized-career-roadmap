using CareerSystem.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CareerSystem.API.Utilities
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class ValidateGeminiApiKeyAttribute : TypeFilterAttribute
    {
        public ValidateGeminiApiKeyAttribute() : base(typeof(ValidateGeminiApiKeyFilter))
        {
        }

        private class ValidateGeminiApiKeyFilter : IAsyncActionFilter
        {
            private readonly AppDbContext _context;

            public ValidateGeminiApiKeyFilter(AppDbContext context)
            {
                _context = context;
            }

            public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
            {
                string? userId = null;

                // 1. Tìm userId từ route parameter hoặc query parameter
                if (context.ActionArguments.TryGetValue("userId", out var userIdObj) && userIdObj is string uid)
                {
                    userId = uid;
                }
                else
                {
                    // 2. Tìm userId từ Request Body (Dùng Reflection lấy thuộc tính UserId trong DTO)
                    var requestDto = context.ActionArguments.Values
                        .FirstOrDefault(arg => arg != null && arg.GetType().GetProperty("UserId") != null);

                    if (requestDto != null)
                    {
                        userId = requestDto.GetType().GetProperty("UserId")?.GetValue(requestDto) as string;
                    }
                }

                // Nếu không tìm thấy userId, trả về Bad Request luôn
                if (string.IsNullOrWhiteSpace(userId))
                {
                    context.Result = new BadRequestObjectResult(new { message = "Không tìm thấy thông tin UserId trong yêu cầu." });
                    return;
                }

                // 3. Truy vấn database kiểm tra API Key
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                if (user == null)
                {
                    context.Result = new NotFoundObjectResult(new { message = "Không tìm thấy người dùng." });
                    return;
                }

                if (string.IsNullOrWhiteSpace(user.GeminiApiKey))
                {
                    // Trả thẳng về JSON lỗi 400 mà không cần ném Exception (IDE sẽ không bị khựng)
                    context.Result = new BadRequestObjectResult(new
                    {
                        statusCode = 400,
                        message = "Bad Request",
                        detail = "Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để sử dụng tính năng này."
                    });
                    return;
                }

                // Nếu mọi thứ hợp lệ, tiếp tục thực thi Controller Action
                await next();
            }
        }
    }
}
