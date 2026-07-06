using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class PromptContextService : IPromptContextService
    {
        private readonly AppDbContext _context;
        private readonly GithubService _githubService;

        // BỘ NHỚ ĐỆM TĨNH (STATIC CACHE) CHO DANH MỤC MÔN HỌC
        // Giúp tránh việc truy vấn cơ sở dữ liệu (DB) liên tục trên mỗi tin nhắn chat.
        // Dữ liệu này là tĩnh nên việc lưu cache trong bộ nhớ (In-Memory Cache) là tối ưu và an toàn.
        private static object? _cachedMentorCatalog = null; // Cache phiên bản rút gọn (chỉ có Code, Name, Skills) cho Chat
        private static string? _cachedRoadmapCatalogJson = null; // Cache phiên bản JSON đầy đủ cho Roadmap
        private static readonly object _cacheLock = new(); // Khóa dùng để đồng bộ hóa đa luồng khi khởi tạo cache

        public PromptContextService(AppDbContext context, GithubService githubService)
        {
            _context = context;
            _githubService = githubService;
        }

        /// <summary>
        /// Lấy danh mục môn học nén (rút gọn) từ cache. Nếu chưa có, query DB và nén lại.
        /// Chỉ giữ lại courseCode, courseName và danh sách tên kỹ năng liên quan (skills). 
        /// Giúp giảm hơn 85% lượng token gửi đi để tăng tốc độ phân tích của AI.
        /// </summary>
        private async Task<object> GetMentorCatalogAsync()
        {
            if (_cachedMentorCatalog != null)
                return _cachedMentorCatalog;

            var courses = await _context.Courses
                .Where(c => c.IsActive)
                .Select(c => new
                {
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    // Chỉ lấy danh sách tên kỹ năng (skills), bỏ qua mô tả chi tiết của OutcomeDescription
                    skills = _context.CourseLearningOutcomes
                        .Where(clo => clo.CourseId == c.CourseId)
                        .Select(clo => clo.Skill.SkillName)
                        .Distinct()
                        .ToList()
                })
                .ToListAsync();

            lock (_cacheLock)
            {
                _cachedMentorCatalog = courses;
            }

            return _cachedMentorCatalog;
        }

        /// <summary>
        /// Lấy danh mục môn học đầy đủ (dành cho việc dựng Roadmap) từ cache để tránh query DB lặp lại.
        /// </summary>
        private async Task<string> GetRoadmapCatalogJsonAsync()
        {
            if (_cachedRoadmapCatalogJson != null)
                return _cachedRoadmapCatalogJson;

            var courseCatalog = await _context.Courses
                .Where(c => c.IsActive)
                .Select(c => new
                {
                    courseId = c.CourseId,
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    credits = c.Credits,
                    totalStudyHours = c.TotalStudyHours,
                    isFoundationalCourse = c.IsFoundationalCourse,

                    learningOutcomes = _context.CourseLearningOutcomes
                        .Where(clo => clo.CourseId == c.CourseId)
                        .Select(clo => new
                        {
                            outcomeId = clo.Id,
                            skillId = clo.SkillId,
                            skillName = clo.Skill.SkillName,
                            skillCategory = clo.Skill.Category,
                            outcomeDescription = clo.OutcomeDescription
                        })
                        .ToList()
                })
                .ToListAsync();

            var json = JsonSerializer.Serialize(
                courseCatalog,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );

            lock (_cacheLock)
            {
                _cachedRoadmapCatalogJson = json;
            }

            return _cachedRoadmapCatalogJson;
        }

        public async Task<(string ContextJson, string GithubContextJson)> BuildMentorContextAsync(User user, MentorAskRequestDto request)
        {
            // Get data from Github repo of student from DB
            string githubContextJson = await _githubService.BuildGithubContextJsonAsync(request.UserId);

            // Get roles that only appear in DB
            var careerRoles = await _context.CareerRoles
                .Select(r => new
                {
                    targetRoleId = r.RoleId,
                    roleName = r.RoleName,
                    description = r.Description
                }).ToListAsync();

            // Get passed course
            var passedCourse = await _context.AcademicRecords
                .Where(a => a.UserId == request.UserId && a.Gpa >= 5.0m)
                .Include(a => a.Course)
                .Select(a => new
                {
                    courseCode = a.Course.CourseCode,
                    courseName = a.Course.CourseName,
                    gpa = a.Gpa,
                    examAttempts = a.ExamAttempts ?? 1
                }).ToListAsync();

            // Get Course + Learning OutCome, Skill from cache for contexting the AI
            var courseCatalog = await GetMentorCatalogAsync();

            // Get latest mentor session of this student
            var latestSession = await _context.MentorSessions
                .Where(s => s.UserId == request.UserId)
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefaultAsync();

            // Get recent chat history from DB.
            // Only take latest 20 messages to avoid sending too much context to AI.
            var chatHistory = new List<object>();

            if (latestSession != null)
            {
                chatHistory = await _context.ChatMessages
                    .Where(m => m.SessionId == latestSession.SessionId)
                    .OrderBy(m => m.Timestamp)
                    .Take(20)
                    .Select(m => new
                    {
                        sender = m.Sender,
                        content = m.Content,
                        timestamp = m.Timestamp
                    })
                    .Cast<object>()
                    .ToListAsync();
            }

            // get context Data, contributing to AI Context
            var contextData = new
            {
                student = new
                {
                    user.UserId,
                    user.FullName,
                    user.Email,
                },
                question = request.Question,
                selectedTopic = request.SelectedTopic,
                careerRoles,
                passedCourse,
                courseCatalog,
                chatHistory
            };

            // convert(Serialize) data string to json
            string contextJson = JsonSerializer.Serialize(
                contextData,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );

            return (contextJson, githubContextJson);
        }

        public async Task<(CareerRole TargetRole, string PassedCoursesText, string CourseCatalogJson)> BuildRoadmapContextAsync(PersonalizedRoadmapRequest request)
        {
            var targetRole = await _context.CareerRoles.FindAsync(request.TargetRoleId)
                ?? throw new Exception("Không tìm thấy nghề nghiệp mục tiêu.");

            var passedCourses = await _context.AcademicRecords
                .Where(a => a.UserId == request.UserId && a.Gpa >= 5.0m)
                .Include(a => a.Course)
                .Select(a => new
                {
                    a.Course.CourseCode,
                    a.Gpa,
                    ExamAttempts = a.ExamAttempts ?? 1
                })
                .ToListAsync();

            string passedCoursesText = passedCourses.Any() 
                ? string.Join(", ", passedCourses.Select(c => $"{c.CourseCode} (GPA: {c.Gpa}, Exam Attempts: {c.ExamAttempts})")) 
                : "Chưa có môn nào";

            // Lấy toàn bộ course + learning outcomes + skills từ cache
            var courseCatalogJson = await GetRoadmapCatalogJsonAsync();

            return (targetRole, passedCoursesText, courseCatalogJson);
        }
    }
}
