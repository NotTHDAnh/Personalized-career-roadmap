using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CareerSystem.API.Controllers
{
    [Route("api/student")]
    [ApiController]
    [Authorize]
    public class StudentController : ControllerBase
    {
        private readonly IAcademicRecordImportService _academicRecordImportService;
        private readonly IStudentService _studentService;

        public StudentController(IAcademicRecordImportService academicRecordImportService, IStudentService studentService)
        {
            _academicRecordImportService = academicRecordImportService;
            _studentService = studentService;
        }

        /// <summary>
        /// Download file template Excel mẫu để import bảng điểm cho Student.
        /// GET: api/Student/academic-records/template
        /// </summary>
        [HttpGet("academic-records/template")]
        [AllowAnonymous] // Cho phép download template công khai
        public IActionResult DownloadAcademicRecordsTemplate()
        {
            var templateBytes = _academicRecordImportService.GenerateImportTemplate();
            return File(
                templateBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "AcademicRecordsTemplate.xlsx");
        }

        /// <summary>
        /// Import bảng điểm cá nhân từ file Excel (.xlsx) dành cho Student.
        /// Student upload file → hệ thống parse, validate môn học, tự động sinh REC_xxxx / cập nhật điểm vào database.
        /// POST: api/Student/academic-records/import
        /// </summary>
        /// <param name="file">File Excel (.xlsx) chứa danh sách điểm môn học theo template.</param>
        [HttpPost("academic-records/import")]
        [Authorize(Roles = "STUDENT")] // Chỉ cho phép người dùng có role STUDENT thực hiện
        public async Task<IActionResult> ImportAcademicRecords(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Vui lòng chọn file Excel để upload." });
            }

            // Lấy studentId (UserId) từ Claims của token JWT
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(studentId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính sinh viên. Vui lòng đăng nhập lại." });
            }

            try
            {
                var result = await _academicRecordImportService.ImportAcademicRecordsFromExcelAsync(file, studentId);
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
        /// Retrieves detailed information of a student.
        /// GET: api/Student/students/{id}
        /// </summary>
        [HttpGet("students/{id}")]
        public async Task<IActionResult> GetStudentDetail(string id)
        {
            var detail = await _studentService.GetStudentDetailAsync(id);

            if (detail == null)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            return Ok(detail);
        }

        /// <summary>
        /// Xóa trực tiếp điểm môn học của một sinh viên.
        /// DELETE: api/Student/students/{studentId}/courses/{courseId}
        /// </summary>
        [HttpDelete("students/{studentId}/courses/{courseId}")]
        public async Task<IActionResult> DeleteStudentCourseRecord(string studentId, string courseId)
        {
            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "SYSTEM";

            var success = await _studentService.DeleteStudentCourseRecordAsync(studentId, courseId);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy bản ghi điểm của sinh viên cho môn học này." });
            }

            return Ok(new { message = "Xóa điểm môn học thành công." });
        }

        /// <summary>
        /// Updates a student's basic information.
        /// PUT: api/Student/students/{id}
        /// </summary>
        [HttpPut("students/{id}")]
        public async Task<IActionResult> UpdateStudent(string id, [FromBody] CareerSystem.API.DTOs.UpdateStudentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "SYSTEM";

            var success = await _studentService.UpdateStudentAsync(id, dto);
            if (!success)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            return Ok(new { message = "Cập nhật thông tin sinh viên thành công." });
        }

        /// <summary>
        /// Sinh viên tự thêm một kỹ năng từ danh sách có sẵn vào hồ sơ cá nhân.
        /// POST: api/Student/skills
        /// </summary>
        [HttpPost("skills")]
        [Authorize(Roles = "STUDENT")]
        public async Task<IActionResult> AddStudentSkill([FromBody] CareerSystem.API.DTOs.AddStudentSkillDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(studentId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính sinh viên. Vui lòng đăng nhập lại." });
            }

            try
            {
                var success = await _studentService.AddStudentSkillAsync(studentId, dto.SkillId);
                return Ok(new { message = "Đã thêm kỹ năng vào hồ sơ thành công." });
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
        /// Sinh viên tự xóa một kỹ năng ra khỏi hồ sơ cá nhân.
        /// DELETE: api/Student/skills/{skillId}
        /// </summary>
        [HttpDelete("skills/{skillId}")]
        [Authorize(Roles = "STUDENT")]
        public async Task<IActionResult> RemoveStudentSkill(string skillId)
        {
            var studentId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(studentId))
            {
                return Unauthorized(new { message = "Không xác định được danh tính sinh viên. Vui lòng đăng nhập lại." });
            }

            try
            {
                var success = await _studentService.RemoveStudentSkillAsync(studentId, skillId);
                if (!success)
                {
                    return NotFound(new { message = "Kỹ năng này không tồn tại trong hồ sơ của sinh viên." });
                }
                return Ok(new { message = "Đã xóa kỹ năng khỏi hồ sơ thành công." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Đã xảy ra lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}
