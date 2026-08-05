using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/rag")]
    [ApiController]
    //[Authorize(Roles = "STAFF")]
    public class RagController : ControllerBase
    {
        private readonly IRagService _ragService;

        public RagController(IRagService ragService)
        {
            _ragService = ragService;
        }

        /// <summary>
        /// API ẩn dành riêng cho Admin bấm 1 lần: Quét toàn bộ SQL Server -> Tạo Vector Embeddings (Gemini) -> Lưu lên Pinecone.
        /// POST: /api/rag/bulk-index
        /// </summary>
        [HttpPost("bulk-index")]
        public async Task<IActionResult> BulkIndex([FromBody] BulkIndexRequestDto? request)
        {
            var indexUrlOverride = request?.IndexUrl ?? string.Empty;
            var apiKeyOverride = request?.ApiKey ?? string.Empty;

            var result = await _ragService.BulkIndexSqlToPineconeAsync(indexUrlOverride, apiKeyOverride);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }
    }

    public class BulkIndexRequestDto
    {
        public string? IndexUrl { get; set; }
        public string? ApiKey { get; set; }
    }
}
