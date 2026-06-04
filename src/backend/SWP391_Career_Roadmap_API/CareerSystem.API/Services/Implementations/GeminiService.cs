using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using CareerSystem.API.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CareerSystem.API.Services.Implementations
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        /// <summary>
        /// Gửi Prompt đến Gemini API và nhận phản hồi văn bản từ AI.
        /// </summary>
        public async Task<string> CallGeminiApiAsync(string prompt)
        {
            // 1. Lấy API Key từ file cấu hình hệ thống (appsettings.json)
            string apiKey = _configuration["AiSettings:ApiKey"]
                 ?? throw new Exception("Thiếu cấu hình API Key của hệ thống.");

            apiKey = apiKey.Trim();
            // 2. Thiết lập endpoint gọi tới mô hình Gemini 2.5 Flash
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var requestUri = new Uri(geminiUrl);

            // 3. Đóng gói request body theo đúng đặc tả định dạng của Gemini API
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            // 4. Thực hiện gửi yêu cầu POST đến Gemini API
            var response = await _httpClient.PostAsJsonAsync(requestUri, requestBody);

            // 5. Kiểm tra mã trạng thái HTTP trả về
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new Exception($"Lỗi gọi Gemini API: {errorMsg}");
            }

            // 6. Đọc nội dung phản hồi thô dưới dạng JSON
            var responseJson = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(responseJson);

            // 7. Trích xuất chuỗi văn bản (text) được sinh ra từ các candidates của AI
            string textResult =
                jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString()
                ?? "{}";

            // 8. Tiến hành làm sạch các tag Markdown của JSON trước khi trả về
            return CleanAiJson(textResult);
        }

        /// <summary>
        /// Loại bỏ các khối code block của Markdown (như ```json và ```) bao quanh chuỗi JSON kết quả của AI.
        /// </summary>
        public string CleanAiJson(string text)
        {
            text = text.Trim();

            // Loại bỏ ký tự ```json ở đầu chuỗi
            if (text.StartsWith("```json"))
                text = text.Substring(7);

            // Loại bỏ ký tự ``` ở đầu chuỗi (nếu có)
            if (text.StartsWith("```"))
                text = text.Substring(3);

            // Loại bỏ ký tự ``` ở cuối chuỗi
            if (text.EndsWith("```"))
                text = text.Substring(0, text.Length - 3);

            return text.Trim();
        }

        public string CleanJsonString(string text)
        {
            // Tìm vị trí của dấu ngoặc vuông mở '[' đầu tiên và đóng ']' cuối cùng
            int startIndex = text.IndexOf('[');
            int endIndex = text.LastIndexOf(']');

            // Nếu tìm thấy mảng JSON, chỉ cắt lấy đúng phần đó, bỏ toàn bộ chữ rác
            if (startIndex >= 0 && endIndex >= startIndex)
            {
                return text.Substring(startIndex, endIndex - startIndex + 1);
            }

            // Nếu không có dấu ngoặc vuông nào, trả về chuỗi gốc đã cắt khoảng trắng
            return text.Trim();
        }
    }
}
