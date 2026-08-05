using CareerSystem.API.Services.Interfaces;
using System.Text.Json;

namespace CareerSystem.API.Services.Implementations
{
    public class GeminiEmbeddingService : IGeminiEmbeddingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GeminiEmbeddingService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"]
                ?? configuration["AiSettings:ApiKey"]
                ?? string.Empty;
        }

        public async Task<float[]> GetEmbeddingAsync(string text)
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                throw new InvalidOperationException("Gemini ApiKey chưa được cấu hình trong appsettings.json (AiSettings:ApiKey hoặc Gemini:ApiKey).");
            }

            var cleanKey = _apiKey.Trim();

            // Gọi API gemini-embedding-001 kèm tham số outputDimensionality = 768 để khớp 100% với Dimension của Pinecone Index
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={cleanKey}";
            var requestBody = new
            {
                model = "models/gemini-embedding-001",
                content = new
                {
                    parts = new[] { new { text = text } }
                },
                outputDimensionality = 768 // Cấu hình ép Gemini trả về Vector 768 chiều khớp với Pinecone
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);
            var response = await _httpClient.PostAsync(url, new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json"));
            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                // Fallback thử gemini-embedding-2 kèm outputDimensionality = 768
                var fallbackUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key={cleanKey}";
                var fallbackBody = new
                {
                    model = "models/gemini-embedding-2",
                    content = new { parts = new[] { new { text = text } } },
                    outputDimensionality = 768
                };
                response = await _httpClient.PostAsync(fallbackUrl, new StringContent(JsonSerializer.Serialize(fallbackBody), System.Text.Encoding.UTF8, "application/json"));
                responseText = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Gemini Embedding API Error ({(int)response.StatusCode}): {responseText}");
                }
            }

            using var doc = JsonDocument.Parse(responseText);
            return doc.RootElement
                .GetProperty("embedding")
                .GetProperty("values")
                .EnumerateArray()
                .Select(x => x.GetSingle())
                .ToArray();
        }
    }
}
