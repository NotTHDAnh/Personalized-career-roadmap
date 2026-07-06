using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
namespace CareerSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "STAFF")]
    public class StaffController : ControllerBase
    {
        private readonly IStudentImportService _studentImportService;
        private readonly ICourseImportService _courseImportService;
        private readonly ICourseService _courseService;

        private readonly AppDbContext _context;

        public StaffController(
            IStudentImportService studentImportService, 
            ICourseImportService courseImportService, 
            ICourseService courseService,
            AppDbContext context)
        {
            _studentImportService = studentImportService;
            _courseImportService = courseImportService;
            _courseService = courseService;
            _context = context;
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
        /// Retrieves a list of all students for the Staff Console.
        /// GET: api/Staff/students?deleted=false
        /// </summary>
        [HttpGet("students")]
        public async Task<IActionResult> GetStudents([FromQuery] bool deleted = false)
        {
            var students = await _context.Users
                .Where(u => u.Role == "STUDENT" && u.DeleteHistory == deleted)
                .Include(u => u.StudentSkills)
                    .ThenInclude(ss => ss.Skill)
                .Include(u => u.Roadmaps)
                    .ThenInclude(r => r.TargetRole)
                .Select(u => new CareerSystem.API.DTOs.StudentResponseDto
                {
                    Id = u.UserId,
                    Name = u.FullName,
                    Role = u.Roadmaps.OrderByDescending(r => r.CreatedAt).Select(r => r.TargetRole.RoleName).FirstOrDefault() ?? "Chưa xác định",
                    Code = u.UserId,
                    Tags = u.StudentSkills.Select(ss => ss.Skill.SkillName).Take(3).ToList(),
                    Date = u.CreatedAt.HasValue ? u.CreatedAt.Value.ToString("dd-MMM-yyyy") : "N/A",
                    Avatar = $"https://api.dicebear.com/7.x/initials/svg?seed={Uri.EscapeDataString(u.FullName)}&backgroundColor=0F172A&textColor=ffffff",
                    Status = u.Status,
                    DeleteHistory = u.DeleteHistory
                })
                .ToListAsync();

            return Ok(students);
        }

        /// <summary>
        /// Retrieves detailed information of a student.
        /// GET: api/Staff/students/{id}
        /// </summary>
        [HttpGet("students/{id}")]
        public async Task<IActionResult> GetStudentDetail(string id)
        {
            var student = await _context.Users
                .Where(u => u.Role == "STUDENT" && u.UserId == id)
                .Include(u => u.StudentSkills)
                    .ThenInclude(ss => ss.Skill)
                .Include(u => u.AcademicRecords)
                    .ThenInclude(ar => ar.Course)
                .FirstOrDefaultAsync();

            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            var detail = new CareerSystem.API.DTOs.StudentDetailDto
            {
                Id = student.UserId,
                Name = student.FullName,
                Email = student.Email,
                Role = student.Role,
                CreatedAt = student.CreatedAt?.ToString("dd-MMM-yyyy HH:mm") ?? "N/A",
                Status = student.Status,
                DeleteHistory = student.DeleteHistory,
                Tags = student.StudentSkills.Select(ss => ss.Skill.SkillName).ToList(),
                Courses = student.AcademicRecords
                .OrderBy(ar => ar.Course?.CourseName)
                .Select(ar => new CareerSystem.API.DTOs.StudentCourseDto
                {
                    CourseId = ar.CourseId,
                    CourseName = ar.Course?.CourseName ?? "Unknown Course",
                    Gpa = ar.Gpa
                }).ToList()
            };

            return Ok(detail);
        }

        /// <summary>
        /// Toggles the active/deactive status of a student.
        /// PATCH: api/Staff/students/{id}/toggle-status
        /// </summary>
        [HttpPatch("students/{id}/toggle-status")]
        public async Task<IActionResult> ToggleStudentStatus(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            student.Status = !student.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật trạng thái thành công.", status = student.Status });
        }

        /// <summary>
        /// Soft deletes or restores a student account.
        /// PATCH: api/Staff/students/{id}/toggle-delete
        /// </summary>
        [HttpPatch("students/{id}/toggle-delete")]
        public async Task<IActionResult> ToggleStudentDelete(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            student.DeleteHistory = !student.DeleteHistory;
            await _context.SaveChangesAsync();

            var action = student.DeleteHistory ? "Xóa" : "Khôi phục";
            return Ok(new { message = $"{action} tài khoản thành công.", deleteHistory = student.DeleteHistory });
        }

        /// <summary>
        /// Updates a student's basic information.
        /// PUT: api/Staff/students/{id}
        /// </summary>
        [HttpPut("students/{id}")]
        public async Task<IActionResult> UpdateStudent(string id, [FromBody] CareerSystem.API.DTOs.UpdateStudentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var student = await _context.Users
                .Include(u => u.AcademicRecords)
                .FirstOrDefaultAsync(u => u.UserId == id);
                
            if (student == null)
                return NotFound(new { message = "Không tìm thấy sinh viên." });

            var staffId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "SYSTEM";

            student.FullName = dto.FullName;
            student.Email = dto.Email;
            student.Role = dto.Role;
            student.Status = dto.Status;
            
            if (dto.CreatedAt.HasValue)
            {
                student.CreatedAt = dto.CreatedAt.Value;
            }

            // Tìm thư mục src tự động
            var currentDir = Directory.GetCurrentDirectory();
            var srcDir = currentDir;
            while (srcDir != null && !srcDir.EndsWith("src", StringComparison.OrdinalIgnoreCase))
            {
                srcDir = Directory.GetParent(srcDir)?.FullName;
            }
            if (srcDir == null) srcDir = currentDir; // fallback
            var logPath = Path.Combine(srcDir, "AuditLog_Course.txt");

            // Xử lý AcademicRecords
            if (dto.Courses != null)
            {
                var existingRecords = student.AcademicRecords.ToList();
                var incomingCourses = dto.Courses.ToList();

                // 1. Cập nhật hoặc thêm mới
                foreach (var incoming in incomingCourses)
                {
                    var existing = existingRecords.FirstOrDefault(r => r.CourseId == incoming.CourseId);
                    if (existing != null)
                    {
                        // Update if GPA changed
                        if (existing.Gpa != incoming.Gpa)
                        {
                            var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [UPDATE] Staff: {staffId} | Student: {student.UserId} | Course: {existing.CourseId} | Old GPA: {existing.Gpa} | New GPA: {incoming.Gpa}\n";
                            await System.IO.File.AppendAllTextAsync(logPath, logMessage);
                            
                            existing.Gpa = incoming.Gpa;
                        }
                    }
                    else
                    {
                        // Add new
                        var newRecord = new Entities.AcademicRecord
                        {
                            RecordId = Guid.NewGuid().ToString(),
                            UserId = student.UserId,
                            CourseId = incoming.CourseId,
                            Gpa = incoming.Gpa,
                            ExamAttempts = 1
                        };
                        _context.AcademicRecords.Add(newRecord);
                        
                        var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [CREATE] Staff: {staffId} | Student: {student.UserId} | Course: {incoming.CourseId} | Old GPA: N/A | New GPA: {incoming.Gpa}\n";
                        await System.IO.File.AppendAllTextAsync(logPath, logMessage);
                    }
                }

                // 2. Xóa các record không còn trong danh sách gửi lên
                var incomingCourseIds = incomingCourses.Select(c => c.CourseId).ToList();
                var toDelete = existingRecords.Where(r => !incomingCourseIds.Contains(r.CourseId)).ToList();
                foreach (var del in toDelete)
                {
                    var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [DELETE] Staff: {staffId} | Student: {student.UserId} | Course: {del.CourseId} | Old GPA: {del.Gpa} | New GPA: N/A\n";
                    await System.IO.File.AppendAllTextAsync(logPath, logMessage);
                    
                    _context.AcademicRecords.Remove(del);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thông tin sinh viên thành công." });
        }

        /// <summary>
        /// Retrieves counts of students, courses, and skills for the Staff Dashboard.
        /// GET: api/Staff/dashboard/stats
        /// </summary>
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var studentCount = await _context.Users.CountAsync(u => u.Role == "STUDENT");
            var courseCount = await _context.Courses.CountAsync();
            var skillCount = await _context.Skills.CountAsync();

            var stats = new CareerSystem.API.DTOs.DashboardStatsDto
            {
                Students = studentCount,
                Courses = courseCount,
                Skills = skillCount
            };

            return Ok(stats);
        }

        /// <summary>
        /// Retrieves a list of all courses for the Staff Console.
        /// GET: api/Staff/courses
        /// </summary>
        [HttpGet("courses")]
        public async Task<IActionResult> GetCourses()
        {
            var courses = await _context.Courses
                .Include(c => c.CourseLearningOutcomes)
                    .ThenInclude(clo => clo.Skill)
                .Select(c => new CareerSystem.API.DTOs.CourseResponseDto
                {
                    CourseId = c.CourseId,
                    CourseCode = c.CourseCode,
                    CourseName = c.CourseName,
                    Credits = c.Credits ?? 3,
                    TotalStudyHours = c.TotalStudyHours ?? 0,
                    Skills = c.CourseLearningOutcomes.Select(clo => clo.Skill.SkillName).ToList()
                })
                .ToListAsync();

            return Ok(courses);
        }
    }
}
