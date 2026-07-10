using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using CareerSystem.API.Services.Interfaces;

namespace CareerSystem.API.Services.Implementations
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private const int MaxRetryAttempts = 3;
        private const int InitialRetryDelayMs = 1000;
        private const int MarkdownJsonPrefixLength = 7;
        private const int MarkdownPrefixLength = 3;

        public GeminiService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        /// <summary>
        /// Gửi Prompt đến Gemini API và nhận phản hồi văn bản từ AI với cơ chế thử lại tự động khi gặp lỗi tạm thời.
        /// </summary>
        public async Task<string> CallGeminiApiAsync(string prompt, string apiKey, int thinkingBudget = 0)
        {
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new Exception("Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để sử dụng tính năng này.");
            }

            apiKey = apiKey.Trim();
            // 2. Thiết lập endpoint gọi tới mô hình Gemini 2.5 Flash
            string geminiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}";

            var requestUri = new Uri(geminiUrl);

            // 3. Đóng gói request body theo đúng đặc tả định dạng của Gemini API.
            // Cấu hình thêm generationConfig để tắt/bật tính năng suy nghĩ (thinkingBudget) của Gemini 2.5 Flash
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
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    thinkingConfig = new
                    {
                        thinkingBudget = thinkingBudget
                    }
                }
            };

            // CẤU HÌNH TỰ ĐỘNG THỬ LẠI (RETRY CONTROLLER)
            int maxRetries = MaxRetryAttempts; // Số lần thử lại tối đa khi gặp lỗi tạm thời
            int delayMs = InitialRetryDelayMs; // Độ trễ ban đầu (1 giây)
            HttpResponseMessage? response = null;

            // Vòng lặp tự động thử lại khi gặp lỗi tạm thời (HTTP 429, 503, 504, 500 hoặc sự cố mạng)
            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    // Ghi prompt ra file phục vụ mục đích gỡ lỗi và kiểm tra dung lượng token
                    // System.IO.File.WriteAllText(@"d:\Code\swp-project\last_prompt.txt", prompt);
                    Console.WriteLine($"[GeminiService] Attempt {i + 1} - Sending HTTP request. Prompt length: {prompt.Length} chars.");

                    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
                    response = await _httpClient.PostAsJsonAsync(requestUri, requestBody);
                    stopwatch.Stop();
                    Console.WriteLine($"[GeminiService] Attempt {i + 1} - End processing HTTP request after {stopwatch.ElapsedMilliseconds}ms - HTTP {(int)response.StatusCode}");

                    if (response.IsSuccessStatusCode)
                    {
                        break;
                    }

                    var statusCode = (int)response.StatusCode;
                    // Kiểm tra xem có phải các mã lỗi tạm thời (Transient) có thể tự phục hồi hay không
                    if (statusCode == 429 || statusCode == 503 || statusCode == 504 || statusCode == 500)
                    {
                        if (i < maxRetries - 1)
                        {
                            // Áp dụng thuật toán Exponential Backoff: tăng độ trễ theo lũy thừa 2 (1s, 2s, 4s...)
                            await Task.Delay(delayMs * (int)Math.Pow(2, i));
                            continue;
                        }
                    }

                    // Nếu là lỗi khác hoặc đã hết số lần thử lại, ném Exception
                    var errorMsg = await response.Content.ReadAsStringAsync();
                    if (statusCode == 400 || statusCode == 403)
                    {
                        throw new Exception("Gemini API Key của bạn đã hết hạn, không hợp lệ hoặc hết hạn mức sử dụng. Vui lòng cấu hình lại.");
                    }
                    throw new Exception($"Lỗi gọi Gemini API: HTTP {(int)response.StatusCode} - {errorMsg}");
                }
                catch (HttpRequestException ex) when (i < maxRetries - 1)
                {
                    // Lỗi mạng, DNS tạm thời hoặc rớt mạng kết nối
                    Console.WriteLine($"[GeminiService] Attempt {i + 1} failed with HttpRequestException: {ex.Message}. Retrying...");
                    await Task.Delay(delayMs * (int)Math.Pow(2, i));
                }
                catch (TaskCanceledException ex) when (i < maxRetries - 1)
                {
                    // Lỗi hết thời gian chờ (Timeout)
                    Console.WriteLine($"[GeminiService] Attempt {i + 1} timed out. Retrying...");
                    await Task.Delay(delayMs * (int)Math.Pow(2, i));
                }
            }

            if (response == null || !response.IsSuccessStatusCode)
            {
                throw new Exception("Lỗi gọi Gemini API: Không nhận được phản hồi hợp lệ từ máy chủ.");
            }

            // 4. Đọc nội dung phản hồi thô dưới dạng JSON
            var responseJson = await response.Content.ReadAsStringAsync();
            var jsonNode = JsonNode.Parse(responseJson);

            // 5. Trích xuất chuỗi văn bản (text) được sinh ra từ các candidates của AI
            string textResult =
                jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString()
                ?? "{}";

            Console.WriteLine($"[GeminiService] Received response text (Length: {textResult.Length} chars):\n{textResult}");

            // 6. Tiến hành làm sạch các tag Markdown của JSON trước khi trả về
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
                text = text.Substring(MarkdownJsonPrefixLength);

            // Loại bỏ ký tự ``` ở đầu chuỗi (nếu có)
            if (text.StartsWith("```"))
                text = text.Substring(MarkdownPrefixLength);

            // Loại bỏ ký tự ``` ở cuối chuỗi
            if (text.EndsWith("```"))
                text = text.Substring(0, text.Length - 3);

            return text.Trim();
        }

        public string CleanJsonString(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            text = text.Trim();

            // Tìm dấu ngoặc nhọn '{' và ngoặc vuông '[' đầu tiên
            int firstBrace = text.IndexOf('{');
            int firstBracket = text.IndexOf('[');

            // Tìm dấu ngoặc nhọn '}' và ngoặc vuông ']' cuối cùng
            int lastBrace = text.LastIndexOf('}');
            int lastBracket = text.LastIndexOf(']');

            // Nếu là JSON Object (dấu { xuất hiện trước hoặc không có [)
            if (firstBrace >= 0 && (firstBracket < 0 || firstBrace < firstBracket))
            {
                if (lastBrace >= firstBrace)
                {
                    return text.Substring(firstBrace, lastBrace - firstBrace + 1);
                }
            }
            // Nếu là JSON Array (dấu [ xuất hiện trước hoặc không có {)
            else if (firstBracket >= 0)
            {
                if (lastBracket >= firstBracket)
                {
                    return text.Substring(firstBracket, lastBracket - firstBracket + 1);
                }
            }

            return text;
        }

        public async Task<bool> ValidateApiKeyAsync(string apiKey)
        {
            if (string.IsNullOrWhiteSpace(apiKey)) return false;
            try
            {
                string testUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey.Trim()}";
                var testBody = new
                {
                    contents = new[] { new { parts = new[] { new { text = "ping" } } } }
                };

                var response = await _httpClient.PostAsJsonAsync(testUrl, testBody);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
