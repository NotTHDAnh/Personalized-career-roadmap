using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace CareerSystem.API.Services.Implementations
{
    public class PineconeService : IPineconeService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PineconeService> _logger;

        public PineconeService(HttpClient httpClient, IConfiguration configuration, ILogger<PineconeService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> UpsertVectorsAsync(List<PineconeVectorDto> vectors, string indexUrlOverride = "", string apiKeyOverride = "")
        {
            if (vectors == null || vectors.Count == 0) return true;

            var apiKey = !string.IsNullOrWhiteSpace(apiKeyOverride)
                ? apiKeyOverride
                : _configuration["Pinecone:ApiKey"];

            var indexUrl = !string.IsNullOrWhiteSpace(indexUrlOverride)
                ? indexUrlOverride
                : _configuration["Pinecone:IndexUrl"];

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(indexUrl))
            {
                _logger.LogWarning("Pinecone ApiKey hoặc IndexUrl chưa được cấu hình.");
                throw new InvalidOperationException("Pinecone ApiKey hoặc IndexUrl chưa được cấu hình trong appsettings.json.");
            }

            // Normalization of Pinecone host URL
            indexUrl = indexUrl.Trim();
            if (!indexUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !indexUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                indexUrl = "https://" + indexUrl;
            }

            if (!indexUrl.EndsWith("/vectors/upsert", StringComparison.OrdinalIgnoreCase))
            {
                indexUrl = indexUrl.TrimEnd('/') + "/vectors/upsert";
            }

            var requestBody = new
            {
                vectors = vectors.Select(v => new
                {
                    id = v.Id,
                    values = v.Values,
                    metadata = v.Metadata
                }).ToList()
            };

            var jsonContent = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, indexUrl);
            request.Headers.Add("Api-Key", apiKey);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError("Lỗi khi gửi vectors lên Pinecone: {StatusCode} - {Error}", response.StatusCode, errorResponse);
                throw new HttpRequestException($"Pinecone upsert error ({response.StatusCode}): {errorResponse}");
            }

            return true;
        }

        public async Task<List<string>> QuerySimilarVectorsAsync(float[] vector, int topK = 3)
        {
            var apiKey = _configuration["Pinecone:ApiKey"];
            var indexUrl = _configuration["Pinecone:IndexUrl"];

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(indexUrl))
                return new List<string>();

            indexUrl = indexUrl.Trim();
            if (!indexUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !indexUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                indexUrl = "https://" + indexUrl;
            }

            if (indexUrl.EndsWith("/vectors/upsert", StringComparison.OrdinalIgnoreCase))
            {
                indexUrl = indexUrl.Substring(0, indexUrl.Length - "/vectors/upsert".Length);
            }

            var queryUrl = indexUrl.TrimEnd('/') + "/query";

            var requestBody = new
            {
                vector = vector,
                topK = topK,
                includeMetadata = true
            };

            var jsonContent = JsonSerializer.Serialize(requestBody, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            using var request = new HttpRequestMessage(HttpMethod.Post, queryUrl);
            request.Headers.Add("Api-Key", apiKey);
            request.Content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogError("Lỗi query Pinecone RAG: {StatusCode} - {Error}", response.StatusCode, err);
                return new List<string>();
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonResponse);

            var results = new List<string>();
            if (doc.RootElement.TryGetProperty("matches", out var matches))
            {
                foreach (var match in matches.EnumerateArray())
                {
                    if (match.TryGetProperty("metadata", out var meta) && meta.TryGetProperty("text", out var text))
                    {
                        var textVal = text.GetString();
                        if (!string.IsNullOrWhiteSpace(textVal))
                        {
                            results.Add(textVal);
                        }
                    }
                }
            }

            return results;
        }
    }
}
