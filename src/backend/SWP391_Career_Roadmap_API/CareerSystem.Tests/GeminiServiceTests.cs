using System.Net.Http;
using Xunit;
using Moq;
using Microsoft.Extensions.Configuration;
using CareerSystem.API.Services.Implementations;

namespace CareerSystem.Tests
{
    public class GeminiServiceTests
    {
        private readonly GeminiService _service;

        public GeminiServiceTests()
        {
            var mockHttpClient = new Mock<HttpClient>();
            var mockConfig = new Mock<IConfiguration>();
            _service = new GeminiService(mockHttpClient.Object, mockConfig.Object);
        }

        [Fact]
        public void CleanJsonString_WithJsonObject_ExtractsCorrectly()
        {
            // Arrange
            string rawResponse = "Here is the response: {\n  \"classifications\": [\n    {\n      \"skillId\": \"SKL_001\"\n    }\n  ]\n} hope you like it!";

            // Act
            string cleaned = _service.CleanJsonString(rawResponse);

            // Assert
            Assert.StartsWith("{", cleaned);
            Assert.EndsWith("}", cleaned);
            Assert.Contains("\"classifications\"", cleaned);
        }

        [Fact]
        public void CleanJsonString_WithJsonArray_ExtractsCorrectly()
        {
            // Arrange
            string rawResponse = "Result: [\n  {\n    \"courseCode\": \"PRN211\"\n  }\n] end.";

            // Act
            string cleaned = _service.CleanJsonString(rawResponse);

            // Assert
            Assert.StartsWith("[", cleaned);
            Assert.EndsWith("]", cleaned);
            Assert.Contains("\"courseCode\"", cleaned);
        }

        [Fact]
        public void CleanJsonString_WithCodeFencedJson_ExtractsCorrectly()
        {
            // Arrange
            string rawResponse = "```json\n{\n  \"status\": \"ok\"\n}\n```";

            // Act
            string cleaned = _service.CleanJsonString(rawResponse);

            // Assert
            Assert.Equal("{\n  \"status\": \"ok\"\n}", cleaned);
        }
    }
}
