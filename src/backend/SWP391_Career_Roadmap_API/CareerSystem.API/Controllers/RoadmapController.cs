using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoadmapController : ControllerBase
    {
        private readonly IRoadmapService _roadmapService;

        public RoadmapController(IRoadmapService roadmapService)
        {
            _roadmapService = roadmapService;
        }

        //API tạo roadmap
        [HttpPost("generate-personalized")]
        [ValidateGeminiApiKey]
        public async Task<IActionResult> GeneratePersonalizedRoadmap([FromBody] PersonalizedRoadmapRequest request)
        {
            if (request.DailyStudyHours <= 0)
                return BadRequest("Số giờ học mỗi ngày phải lớn hơn 0.");

            var previewDto = await _roadmapService.GenerateRoadmapPreviewAsync(request);
            return Ok(previewDto);
        }

        //API lưu roadmap vào DB
        [HttpPost("save")]
        public async Task<IActionResult> SaveRoadmap([FromBody] SaveRoadmapRequestDto request)
        {
            var roadmapId = await _roadmapService.SaveRoadmapAsync(request);
            return Ok(new { message = "Lộ trình đã lưu thành công!", roadmapId = roadmapId });
        }

        //API lấy danh sách roadmap của một User
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserRoadmaps(string userId)
        {
            var roadmaps = await _roadmapService.GetUserRoadmapsAsync(userId);
            return Ok(roadmaps);
        }

        //API xem chi tiết roadmap
        [HttpGet("{roadmapId}")]
        public async Task<IActionResult> GetRoadmapDetail(string roadmapId)
        {
            var roadmap = await _roadmapService.GetRoadmapDetailAsync(roadmapId);
            return Ok(roadmap);
        }
    }
}