using System;
using System.Security.Claims;
using System.Threading.Tasks;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SkillController : ControllerBase
    {
        private readonly ISkillService _skillService;

        public SkillController(ISkillService skillService)
        {
            _skillService = skillService;
        }

        /// <summary>
        /// Lấy toàn bộ danh sách kỹ năng (Skills) của hệ thống.
        /// GET: api/Skill
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSkills()
        {
            var skills = await _skillService.GetSkillsAsync();
            return Ok(skills);
        }

        /// <summary>
        /// Tạo mới một kỹ năng hệ thống (chỉ dành cho Staff).
        /// POST: api/Skill
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> CreateSkill([FromBody] CreateSkillDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var result = await _skillService.CreateSkillAsync(dto, staffId ?? "");
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Đã xảy ra lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Cập nhật thông tin kỹ năng hệ thống (chỉ dành cho Staff).
        /// PUT: api/Skill/{skillId}
        /// </summary>
        [HttpPut("{skillId}")]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> UpdateSkill(string skillId, [FromBody] UpdateSkillDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var staffId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var result = await _skillService.UpdateSkillAsync(skillId, dto, staffId ?? "");
                if (result == null)
                {
                    return NotFound(new { message = $"Không tìm thấy kỹ năng với ID: {skillId}" });
                }
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Đã xảy ra lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Xóa kỹ năng hệ thống (chỉ dành cho Staff).
        /// DELETE: api/Skill/{skillId}
        /// </summary>
        [HttpDelete("{skillId}")]
        [Authorize(Roles = "STAFF")]
        public async Task<IActionResult> DeleteSkill(string skillId)
        {
            try
            {
                var result = await _skillService.DeleteSkillAsync(skillId);
                if (!result)
                {
                    return NotFound(new { message = $"Không tìm thấy kỹ năng với ID: {skillId}" });
                }
                return Ok(new { message = "Xóa kỹ năng thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Đã xảy ra lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
