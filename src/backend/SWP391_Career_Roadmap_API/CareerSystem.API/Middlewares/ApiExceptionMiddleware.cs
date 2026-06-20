using System.Net;
using System.Text.Json;

namespace CareerSystem.API.Middlewares
{
    public class ApiExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ApiExceptionMiddleware> _logger;

        public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred in the application pipeline.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var statusCode = (int)HttpStatusCode.InternalServerError;
            var message = "Internal Server Error";

            var exMessage = exception.Message;

            // Ánh xạ các lỗi validation hoặc nghiệp vụ sang mã HTTP tương ứng
            if (exception is ArgumentException ||
                exMessage.Contains("required", StringComparison.OrdinalIgnoreCase) ||
                exMessage.Contains("too long", StringComparison.OrdinalIgnoreCase) ||
                exMessage.Contains("trước khi tạo", StringComparison.OrdinalIgnoreCase) ||
                exMessage.Contains("phải lớn hơn", StringComparison.OrdinalIgnoreCase) ||
                exMessage.Contains("API Key", StringComparison.OrdinalIgnoreCase))
            {
                statusCode = (int)HttpStatusCode.BadRequest;
                message = "Bad Request";
            }
            else if (exMessage.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
                     exMessage.Contains("Không tìm thấy", StringComparison.OrdinalIgnoreCase))
            {
                statusCode = (int)HttpStatusCode.NotFound;
                message = "Not Found";
            }

            context.Response.StatusCode = statusCode;

            var response = new
            {
                statusCode = statusCode,
                message = message,
                detail = exMessage
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = JsonSerializer.Serialize(response, options);

            return context.Response.WriteAsync(json);
        }
    }
}
