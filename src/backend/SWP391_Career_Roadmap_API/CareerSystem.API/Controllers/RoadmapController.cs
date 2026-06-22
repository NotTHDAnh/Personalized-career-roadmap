using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

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

        //API xem trước roadmap
        [HttpPost("generate-preview")]
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