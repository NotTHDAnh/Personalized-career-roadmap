using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
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
        public async Task<IActionResult> GeneratePersonalizedRoadmap([FromBody] PersonalizedRoadmapRequest request)
        {
            if (request.DailyStudyHours <= 0)
                return BadRequest("Số giờ học mỗi ngày phải lớn hơn 0.");

            var roadmapId = await _roadmapService.GeneratePersonalizedRoadmapAsync(request);
            return Ok(new { message = "Lộ trình đã tạo thành công!", roadmapId = roadmapId });
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