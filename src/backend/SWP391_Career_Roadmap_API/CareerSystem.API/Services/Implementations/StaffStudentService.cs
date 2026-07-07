using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Implementations
{
    public class StaffStudentService : IStaffStudentService
    {
        private readonly AppDbContext _context;

        public StaffStudentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<StudentResponseDto>> GetStudentsAsync(bool deleted)
        {
            return await _context.Users
                .Where(u => u.Role == "STUDENT" && u.DeleteHistory == deleted)
                .Include(u => u.StudentSkills)
                    .ThenInclude(ss => ss.Skill)
                .Include(u => u.Roadmaps)
                    .ThenInclude(r => r.TargetRole)
                .Select(u => new StudentResponseDto
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
                    .OrderBy(ar => ar.Course?.CourseName)
                    .Select(ar => new StudentCourseDto
                    {
                        CourseId = ar.CourseId,
                        CourseName = ar.Course?.CourseName ?? "Unknown Course",
                        Gpa = ar.Gpa
                    }).ToList()
            };
        }

        public async Task<bool> ToggleStudentStatusAsync(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null) return false;

            student.Status = !student.Status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ToggleStudentDeleteAsync(string id)
        {
            var student = await _context.Users.FirstOrDefaultAsync(u => u.UserId == id && u.Role == "STUDENT");
            if (student == null) return false;

            student.DeleteHistory = !student.DeleteHistory;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateStudentAsync(string id, UpdateStudentDto dto, string staffId)
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
                        if (existing.Gpa != incoming.Gpa)
                        {
                            var logMessage = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}] [UPDATE] Staff: {staffId} | Student: {student.UserId} | Course: {existing.CourseId} | Old GPA: {existing.Gpa} | New GPA: {incoming.Gpa}\n";
                            await System.IO.File.AppendAllTextAsync(logPath, logMessage);
                            
                            existing.Gpa = incoming.Gpa;
                        }
                    }
                    else
                    {
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
            return true;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var studentCount = await _context.Users.CountAsync(u => u.Role == "STUDENT");
            var courseCount = await _context.Courses.CountAsync();
            var skillCount = await _context.Skills.CountAsync();

            return new DashboardStatsDto
            {
                Students = studentCount,
                Courses = courseCount,
                Skills = skillCount
            };
        }
    }
}
