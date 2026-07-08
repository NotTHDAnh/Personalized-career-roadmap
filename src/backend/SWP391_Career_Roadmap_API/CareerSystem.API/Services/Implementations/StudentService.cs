using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class StudentService : IStudentService
    {
        private readonly AppDbContext _context;

        public StudentService(AppDbContext context)
        {
            _context = context;
        }



        public async Task<StudentDetailDto?> GetStudentDetailAsync(string id)
        {
            var student = await _context.Users
                .Where(u => u.Role == "STUDENT" && u.UserId == id)
                .Include(u => u.StudentSkills)
                    .ThenInclude(ss => ss.Skill)
                .Include(u => u.AcademicRecords)
                    .ThenInclude(ar => ar.Course)
                .FirstOrDefaultAsync();

            if (student == null) return null;

            return new StudentDetailDto
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
                    .Where(ar => ar.Course != null && ar.Course.IsActive)
                    .OrderBy(ar => ar.Course?.CourseName)
                    .Select(ar => new StudentCourseDto
                    {
                        CourseId = ar.CourseId,
                        CourseName = ar.Course?.CourseName ?? "Unknown Course",
                        Gpa = ar.Gpa,
                        ExamAttempts = ar.ExamAttempts
                    }).ToList()
            };
        }

        public async Task<bool> DeleteStudentCourseRecordAsync(string studentId, string courseId)
        {
            var record = await _context.AcademicRecords
                .FirstOrDefaultAsync(r => r.UserId == studentId && r.CourseId == courseId);

            if (record == null) return false;

            var currentDir = Directory.GetCurrentDirectory();
            var srcDir = currentDir;
            while (srcDir != null && !srcDir.EndsWith("src", StringComparison.OrdinalIgnoreCase))
            {
                srcDir = Directory.GetParent(srcDir)?.FullName;
            }
            if (srcDir == null) srcDir = currentDir;
            var logPath = Path.Combine(srcDir, "AuditLog_Course.txt");

            //var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [DELETE_DIRECT] Staff: {staffId} | Student: {studentId} | Course: {courseId} | Old GPA: {record.Gpa} | New GPA: N/A\n";
            //await System.IO.File.AppendAllTextAsync(logPath, logMessage);

            _context.AcademicRecords.Remove(record);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStudentAsync(string id, UpdateStudentDto dto)
        {
            var student = await _context.Users
                .Include(u => u.AcademicRecords)
                .FirstOrDefaultAsync(u => u.UserId == id);

            if (student == null) return false;

            student.FullName = dto.FullName;
            student.Email = dto.Email;
            student.Role = dto.Role;
            student.Status = dto.Status;

            if (dto.CreatedAt.HasValue)
            {
                student.CreatedAt = dto.CreatedAt.Value;
            }

            var currentDir = Directory.GetCurrentDirectory();
            var srcDir = currentDir;
            while (srcDir != null && !srcDir.EndsWith("src", StringComparison.OrdinalIgnoreCase))
            {
                srcDir = Directory.GetParent(srcDir)?.FullName;
            }
            if (srcDir == null) srcDir = currentDir;
            var logPath = Path.Combine(srcDir, "AuditLog_Course.txt");

            if (dto.Courses != null)
            {
                var existingRecords = student.AcademicRecords.ToList();
                var incomingCourses = dto.Courses.ToList();

                foreach (var incoming in incomingCourses)
                {
                    var existing = existingRecords.FirstOrDefault(r => r.CourseId == incoming.CourseId);
                    if (existing != null)
                    {
                        if (existing.Gpa != incoming.Gpa || existing.ExamAttempts != incoming.ExamAttempts)
                        {
                            //var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [UPDATE] Staff: {staffId} | Student: {student.UserId} | Course: {existing.CourseId} | Old GPA: {existing.Gpa} | New GPA: {incoming.Gpa} | Old Attempts: {existing.ExamAttempts} | New Attempts: {incoming.ExamAttempts}\n";
                            //await System.IO.File.AppendAllTextAsync(logPath, logMessage);

                            existing.Gpa = incoming.Gpa;
                            existing.ExamAttempts = incoming.ExamAttempts;
                        }
                    }
                    else
                    {
                        var targetCourse = await _context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.CourseId == incoming.CourseId);
                        if (targetCourse == null || !targetCourse.IsActive)
                        {
                            throw new ArgumentException($"Môn học '{incoming.CourseId}' không tồn tại hoặc đã bị xóa mềm.");
                        }

                        var newRecord = new Entities.AcademicRecord
                        {
                            RecordId = Guid.NewGuid().ToString(),
                            UserId = student.UserId,
                            CourseId = incoming.CourseId,
                            Gpa = incoming.Gpa,
                            ExamAttempts = incoming.ExamAttempts ?? 1
                        };
                        _context.AcademicRecords.Add(newRecord);

                        //var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [CREATE] Staff: {staffId} | Student: {student.UserId} | Course: {incoming.CourseId} | Old GPA: N/A | New GPA: {incoming.Gpa}\n";
                        //await System.IO.File.AppendAllTextAsync(logPath, logMessage);
                    }
                }

                var incomingCourseIds = incomingCourses.Select(c => c.CourseId).ToList();
                var toDelete = existingRecords.Where(r => !incomingCourseIds.Contains(r.CourseId)).ToList();
                foreach (var del in toDelete)
                {
                    //var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [DELETE] Staff: {staffId} | Student: {student.UserId} | Course: {del.CourseId} | Old GPA: {del.Gpa} | New GPA: N/A\n";
                    //await System.IO.File.AppendAllTextAsync(logPath, logMessage);

                    _context.AcademicRecords.Remove(del);
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
