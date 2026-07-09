using System.Threading.Tasks;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

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
    }
}
