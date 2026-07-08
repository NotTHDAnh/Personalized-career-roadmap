using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace CareerSystem.API.Controllers
{
    [Route("api/staff")]
    [ApiController]
    [Authorize(Roles = "STAFF")]
    public class StaffController : ControllerBase
    {
        private readonly IStudentImportService _studentImportService;
        private readonly ICourseImportService _courseImportService;
        private readonly ICourseService _courseService;
        private readonly IStaffService _staffStudentService;

        public StaffController(
            IStudentImportService studentImportService,
            ICourseImportService courseImportService,
            ICourseService courseService,
            IStaffService staffStudentService)
        {
            _studentImportService = studentImportService;
            _courseImportService = courseImportService;
            _courseService = courseService;
            _staffStudentService = staffStudentService;
        }

        /// <summary>
        /// Download file template Excel mẫu để import danh sách sinh viên.
        /// GET: api/Staff/student-import-template
        /// </summary>
        [HttpGet("student-import-template")]
        [AllowAnonymous] // Cho phép download template mà không cần đăng nhập
        public IActionResult DownloadStudentImportTemplate()
        {
            var templateBytes = _studentImportService.GenerateImportTemplate();
            return File(
                templateBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "StudentImportTemplate.xlsx");
        }

        /// <summary>
        /// Import danh sách sinh viên từ file Excel (.xlsx).
        /// Staff upload file → hệ thống parse, validate, hash password và lưu vào database.
        /// POST: api/Staff/import-students
        /// </summary>
        /// <param name="file">File Excel (.xlsx) chứa danh sách sinh viên theo template.</param>
        [HttpPost("import-students")]
        public async Task<IActionResult> ImportStudents(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file Excel để upload." });
            }

            try
            {
                var result = await _studentImportService.ImportStudentsFromExcelAsync(file);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Download file template Excel mẫu để import danh sách môn học.
        /// GET: api/Staff/course-import-template
        /// </summary>
        [HttpGet("course-import-template")]
        [AllowAnonymous] // Cho phép download template mà không cần đăng nhập
        public IActionResult DownloadCourseImportTemplate()
        {
            var templateBytes = _courseImportService.GenerateImportTemplate();
            return File(
                templateBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "CourseImportTemplate.xlsx");
        }

        /// <summary>
        /// Import danh sách môn học từ file Excel (.xlsx).
        /// Staff upload file → hệ thống parse, validate, sinh mã tự động (gọi AI phân loại kỹ năng) và lưu vào database.
        /// POST: api/Staff/import-courses
        /// </summary>
        /// <param name="file">File Excel (.xlsx) chứa danh sách môn học theo template.</param>
        [HttpPost("import-courses")]
        public async Task<IActionResult> ImportCourses(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file Excel để upload." });
            }

            // Lấy staffId từ Claims
            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var result = await _courseImportService.ImportCoursesFromExcelAsync(file, staffId ?? "");
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
        /// Tạo mới môn học thủ công (Staff nhập từng thuộc tính, hệ thống tự động sinh ID tuần tự và gọi AI phân loại kỹ năng).
        /// POST: api/Staff/courses
        /// </summary>
        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] DTOs.CreateCourseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var result = await _courseService.CreateCourseAsync(dto, staffId ?? "");
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
        /// Toggles the active/deactive status of a student.
        /// PATCH: api/Staff/students/{id}/toggle-status
        /// </summary>
        [HttpPatch("students/{id}/toggle-status")]
        public async Task<IActionResult> ToggleStudentStatus(string id)
        {
            var success = await _staffStudentService.ToggleStudentStatusAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            return Ok(new { message = "Cập nhật trạng thái thành công." });
        }

        /// <summary>
        /// Soft deletes or restores a student account.
        /// PATCH: api/Staff/students/{id}/toggle-delete
        /// </summary>
        [HttpPatch("students/{id}/toggle-delete")]
        public async Task<IActionResult> ToggleStudentDelete(string id)
        {
            var success = await _staffStudentService.ToggleStudentDeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            return Ok(new { message = "Cập nhật tài khoản thành công." });
        }

        /// <summary>
        /// Retrieves counts of students, courses, and skills for the Staff Dashboard.
        /// GET: api/Staff/dashboard/stats
        /// </summary>
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _staffStudentService.GetDashboardStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Retrieves a list of all courses for the Staff Console.
        /// GET: api/Staff/courses
        /// </summary>
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _courseService.GetCoursesAsync();
            return Ok(courses);
        }

        /// Cập nhật môn học thủ công (chỉ dành cho Staff).
        /// PUT: api/Staff/courses/{courseId}
        /// </summary>
        [HttpPut("courses/{courseId}")]
        public async Task<IActionResult> UpdateCourse(string courseId, [FromBody] DTOs.UpdateCourseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            try
            {
                var result = await _courseService.UpdateCourseAsync(courseId, dto, staffId ?? "");
                if (result == null)
                {
                    return NotFound(new { message = $"Không tìm thấy môn học với ID: {courseId}" });
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
        /// Xóa môn học (chỉ ẩn khỏi màn hình hiển thị - Soft Delete).
        /// DELETE: api/Staff/courses/{courseId}
        /// </summary>
        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteCourse(string courseId)
        {
            try
            {
                var result = await _courseService.DeleteCourseAsync(courseId);
                if (!result)
                {
                    return NotFound(new { message = $"Không tìm thấy hoặc môn học đã bị xóa với ID: {courseId}" });
                }
                return Ok(new { message = "Đã xóa môn học thành công (Soft Delete)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Đã xảy ra lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// Retrieves a list of all students for the Staff Console.
        /// GET: api/Staff/students?deleted=false
        /// </summary>
        [HttpGet("students")]
        public async Task<IActionResult> GetStudents([FromQuery] bool deleted = false)
        {
            var students = await _staffStudentService.GetStudentsAsync(deleted);
            return Ok(students);
        }
    }
}
