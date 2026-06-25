using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : ControllerBase
    {
        private readonly IAcademicRecordImportService _academicRecordImportService;

        public StudentController(IAcademicRecordImportService academicRecordImportService)
        {
            _academicRecordImportService = academicRecordImportService;
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
    }
}
