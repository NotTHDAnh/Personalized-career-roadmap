using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CareerSystem.API.Controllers
{
    [Route("api/course")]
    [ApiController]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        /// <summary>
        /// API Lấy thông tin chi tiết môn học cùng các khoá học gợi ý (Learning Resources).
        /// GET: api/Course/{courseId}
        /// </summary>
        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetCourseDetail(string courseId)
        {
            var courseDetail = await _courseService.GetCourseDetailAsync(courseId);
            if (courseDetail == null)
            {
                return NotFound(new { message = $"Không tìm thấy môn học với ID: {courseId}" });
            }
            return Ok(courseDetail);
        }

        /// <summary>
        /// Retrieves a list of all courses for Student Dashboard
        /// GET: api/Staff/courses
        /// </summary>
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _courseService.GetCoursesAsync();
            return Ok(courses);
        }

    }
}
