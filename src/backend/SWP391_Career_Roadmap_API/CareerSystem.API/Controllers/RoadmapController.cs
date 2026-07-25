using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/roadmap")]
    [ApiController]
    [Authorize]
    public class RoadmapController : ControllerBase
    {
        private readonly IRoadmapService _roadmapService;

        public RoadmapController(IRoadmapService roadmapService)
        {
            _roadmapService = roadmapService;
        }

        //API get missing skills
        [HttpGet("missing-skills")]
        public async Task<IActionResult> GetMissingSkills([FromQuery] string roadmapId)
        {
            var result = await _roadmapService.GetMissingSkillsAsync(roadmapId);
            if (result == null) return NotFound(new { message = "không tìm thấy roadmap" });
            else return Ok(result);
        }

        //API tạo roadmap
        [HttpPost("generate-personalized")]
        [ValidateGeminiApiKey]
        public async Task<IActionResult> GeneratePersonalizedRoadmap([FromBody] PersonalizedRoadmapRequest request)
        {
            if (request.DailyStudyHours <= 0)
                return BadRequest("Số giờ học mỗi ngày phải lớn hơn 0.");

            var roadmapId = await _roadmapService.GeneratePersonalizedRoadmapAsync(request);
            return Ok(new { message = "Lộ trình đã tạo thành công!", roadmapId = roadmapId });
        }

        //API xem trước roadmap
        [HttpPost("generate-preview")]
        [ValidateGeminiApiKey]
        public async Task<IActionResult> GenerateRoadmapPreview([FromBody] PersonalizedRoadmapRequest request)
        {
            if (request.DailyStudyHours <= 0)
                return BadRequest("Số giờ học mỗi ngày phải lớn hơn 0.");

            try
            {
                var preview = await _roadmapService.GenerateRoadmapPreviewAsync(request);
                return Ok(preview);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        //API lưu roadmap
        [HttpPost("save")]
        public async Task<IActionResult> SaveRoadmap([FromBody] SaveRoadmapRequestDto request)
        {
            if (request.DailyStudyHours <= 0)
                return BadRequest("Số giờ học mỗi ngày phải lớn hơn 0.");

            try
            {
                var roadmapId = await _roadmapService.SaveRoadmapAsync(request);
                return Ok(new { message = "Lộ trình đã lưu thành công!", roadmapId = roadmapId });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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

        //API xóa roadmap
        [HttpDelete("{roadmapId}")]
        public async Task<IActionResult> DeleteRoadmap(string roadmapId)
        {
            var result = await _roadmapService.DeleteRoadmapAsync(roadmapId);
            if (!result) return NotFound(new { message = "Không tìm thấy lộ trình để xóa." });
            return Ok(new { message = "Đã xóa lộ trình thành công." });
        }

        //API cập nhật trạng thái các node
        [HttpPut("update-nodes-status")]
        public async Task<IActionResult> UpdateNodesStatus([FromBody] UpdateNodesStatusRequest request)
        {
            var success = await _roadmapService.UpdateNodesStatusAsync(request);
            if (!success) return NotFound(new { message = "Không tìm thấy lộ trình hoặc node cần cập nhật." });
            return Ok(new { message = "Cập nhật trạng thái các môn học thành công!" });
        }
    }
}