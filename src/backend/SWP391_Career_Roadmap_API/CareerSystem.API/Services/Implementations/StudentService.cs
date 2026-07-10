using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
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

            // Đồng bộ roadmap nodes (GPA set về null để đưa node về PENDING và khóa các node phụ thuộc)
            await SyncRoadmapNodesAsync(studentId, courseId, null);

            // Đồng bộ lại kỹ năng của sinh viên (thu hồi kỹ năng của môn vừa xóa)
            await SyncStudentSkillsAsync(studentId);

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

                            // Sync node roadmap
                            await SyncRoadmapNodesAsync(student.UserId, incoming.CourseId, incoming.Gpa);
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
                            ExamAttempts = incoming.ExamAttempts
                        };
                        _context.AcademicRecords.Add(newRecord);

                        // Sync node roadmap
                        await SyncRoadmapNodesAsync(student.UserId, incoming.CourseId, incoming.Gpa);

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

                    // Sync node roadmap thành PENDING
                    await SyncRoadmapNodesAsync(student.UserId, del.CourseId, null);
                }
            }

            // Lưu thay đổi của AcademicRecords trước
            await _context.SaveChangesAsync();

            // Sync lại toàn bộ skill của sinh viên dựa trên học bạ mới nhất
            await SyncStudentSkillsAsync(student.UserId);

            // Lưu thay đổi của StudentSkills
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddStudentSkillAsync(string studentId, string skillId)
        {
            var studentExists = await _context.Users.AnyAsync(u => u.UserId == studentId && u.Role == "STUDENT");
            if (!studentExists)
            {
                throw new ArgumentException("Không tìm thấy sinh viên hợp lệ.");
            }

            var skillExists = await _context.Skills.AnyAsync(s => s.SkillId == skillId);
            if (!skillExists)
            {
                throw new ArgumentException("Kỹ năng này không tồn tại trong hệ thống.");
            }

            var hasSkillAlready = await _context.StudentSkills
                .AnyAsync(ss => ss.UserId == studentId && ss.SkillId == skillId);
            if (hasSkillAlready)
            {
                throw new ArgumentException("Kỹ năng này đã có sẵn trong hồ sơ của sinh viên.");
            }

            // Sinh mã StudentSkillId tuần tự dạng SSK_xxxx
            int maxNum = 0;
            var ids = await _context.StudentSkills.Select(ss => ss.StudentSkillId).ToListAsync();
            foreach (var id in ids)
            {
                if (id != null && id.StartsWith("SSK_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxNum) maxNum = num;
                }
            }
            string newStudentSkillId = $"SSK_{maxNum + 1:D4}";

            var studentSkill = new StudentSkill
            {
                StudentSkillId = newStudentSkillId,
                UserId = studentId,
                SkillId = skillId,
                Source = "MANUAL"
            };

            _context.StudentSkills.Add(studentSkill);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveStudentSkillAsync(string studentId, string skillId)
        {
            var studentSkill = await _context.StudentSkills
                .FirstOrDefaultAsync(ss => ss.UserId == studentId && ss.SkillId == skillId);

            if (studentSkill == null)
            {
                return false;
            }

            _context.StudentSkills.Remove(studentSkill);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateCourseGradeAsync(string studentId, UpdateCourseGradeDto dto)
        {
            var studentExists = await _context.Users.AnyAsync(u => u.UserId == studentId && u.Role == "STUDENT");
            if (!studentExists)
            {
                throw new ArgumentException("Không tìm thấy sinh viên hợp lệ.");
            }

            var course = await _context.Courses.AsNoTracking().FirstOrDefaultAsync(c => c.CourseId == dto.CourseId && c.IsActive);
            if (course == null)
            {
                throw new ArgumentException("Môn học không tồn tại hoặc đã bị xóa mềm.");
            }

            var record = await _context.AcademicRecords
                .FirstOrDefaultAsync(ar => ar.UserId == studentId && ar.CourseId == dto.CourseId);

            if (record == null)
            {
                int maxRecordNumber = 0;
                var recordIdsInDb = await _context.AcademicRecords.Select(r => r.RecordId).ToListAsync();
                foreach (var id in recordIdsInDb)
                {
                    if (id != null && id.StartsWith("REC_") && int.TryParse(id.Substring(4), out int num))
                    {
                        if (num > maxRecordNumber) maxRecordNumber = num;
                    }
                }
                string newRecordId = $"REC_{maxRecordNumber + 1:D4}";

                record = new AcademicRecord
                {
                    RecordId = newRecordId,
                    UserId = studentId,
                    CourseId = dto.CourseId,
                    Gpa = dto.Gpa,
                    ExamAttempts = dto.ExamAttempts
                };
                _context.AcademicRecords.Add(record);
            }
            else
            {
                record.Gpa = dto.Gpa;
                record.ExamAttempts = dto.ExamAttempts;
            }

            // Lưu thay đổi của AcademicRecords trước để SyncStudentSkillsAsync truy vấn được GPA mới
            await _context.SaveChangesAsync();

            // Sync roadmap nodes
            await SyncRoadmapNodesAsync(studentId, dto.CourseId, dto.Gpa);

            // Sync student skills
            await SyncStudentSkillsAsync(studentId);

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCourseGradeAsync(string studentId, string courseId)
        {
            var record = await _context.AcademicRecords
                .FirstOrDefaultAsync(ar => ar.UserId == studentId && ar.CourseId == courseId);

            if (record == null)
            {
                return false;
            }

            _context.AcademicRecords.Remove(record);
            // Lưu thay đổi xóa AcademicRecord trước để SyncStudentSkillsAsync không lấy môn học bị xóa này
            await _context.SaveChangesAsync();

            // Sync roadmap nodes (GPA as null, sets node to PENDING and locks descendants)
            await SyncRoadmapNodesAsync(studentId, courseId, null);

            // Sync student skills
            await SyncStudentSkillsAsync(studentId);

            await _context.SaveChangesAsync();
            return true;
        }

        private async Task SyncStudentSkillsAsync(string studentId)
        {
            var passedCourseIds = await _context.AcademicRecords
                .AsNoTracking()
                .Where(ar => ar.UserId == studentId && ar.Gpa >= 5.0m && ar.Course.IsActive)
                .Select(ar => ar.CourseId)
                .ToListAsync();

            var courseSkillIds = await _context.CourseLearningOutcomes
                .AsNoTracking()
                .Where(clo => passedCourseIds.Contains(clo.CourseId))
                .Select(clo => clo.SkillId)
                .Distinct()
                .ToListAsync();

            var studentSkills = await _context.StudentSkills
                .Where(ss => ss.UserId == studentId)
                .ToListAsync();

            // Remove COURSE source skills that are no longer passed
            var skillsToRemove = studentSkills
                .Where(ss => ss.Source == "COURSE" && !courseSkillIds.Contains(ss.SkillId))
                .ToList();
            if (skillsToRemove.Any())
            {
                _context.StudentSkills.RemoveRange(skillsToRemove);
            }

            // Add COURSE source skills that are passed but not in profile
            var existingSkillIds = studentSkills.Select(ss => ss.SkillId).ToHashSet();
            var skillsToAdd = courseSkillIds.Where(sid => !existingSkillIds.Contains(sid)).ToList();

            if (skillsToAdd.Any())
            {
                int maxNum = 0;
                var allIds = await _context.StudentSkills.Select(ss => ss.StudentSkillId).ToListAsync();
                foreach (var id in allIds)
                {
                    if (id != null && id.StartsWith("SSK_") && int.TryParse(id.Substring(4), out int num))
                    {
                        if (num > maxNum) maxNum = num;
                    }
                }

                foreach (var skillId in skillsToAdd)
                {
                    string newStudentSkillId = $"SSK_{++maxNum:D4}";
                    _context.StudentSkills.Add(new StudentSkill
                    {
                        StudentSkillId = newStudentSkillId,
                        UserId = studentId,
                        SkillId = skillId,
                        Source = "COURSE"
                    });
                }
            }
        }

        private async Task SyncRoadmapNodesAsync(string studentId, string courseId, decimal? gpa)
        {
            var roadmaps = await _context.Roadmaps
                .Include(r => r.SkillNodes)
                .Where(r => r.UserId == studentId)
                .ToListAsync();

            if (!roadmaps.Any()) return;

            bool isPassed = gpa.HasValue && gpa.Value >= 5.0m;

            foreach (var roadmap in roadmaps)
            {
                var targetNodes = roadmap.SkillNodes.Where(n => n.CourseId == courseId).ToList();
                if (!targetNodes.Any()) continue;

                foreach (var node in targetNodes)
                {
                    if (isPassed)
                    {
                        node.Status = "COMPLETED";
                    }
                    else
                    {
                        node.Status = "PENDING";
                        LockDescendants(roadmap.SkillNodes.ToList(), node.NodeId);
                    }
                }
            }
        }

        private void LockDescendants(List<SkillNode> allNodes, string parentId)
        {
            var children = allNodes.Where(n => n.ParentNodeId == parentId).ToList();
            foreach (var child in children)
            {
                child.Status = "PENDING";
                LockDescendants(allNodes, child.NodeId);
            }
        }
    }
}
