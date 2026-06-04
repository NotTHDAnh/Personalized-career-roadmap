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

        public PromptContextService(AppDbContext context, GithubService githubService)
        {
            _context = context;
            _githubService = githubService;
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
                    gpa = a.Gpa
                }).ToListAsync();

            // Get Course + Learning OutCome, Skill from DB for contexting the AI
            var courseCatalog = await _context.Courses
                .Select(c => new
                {
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    credit = c.Credits,
                    totalStudyHours = c.TotalStudyHours,

                    learningOutcomes = _context.CourseLearningOutcomes
                    .Where(clo => clo.CourseId == c.CourseId)
                    .Select(clo => new
                    {
                        skillID = clo.SkillId,
                        skillName = clo.Skill.SkillName,
                        skillCategory = clo.Skill.Category,
                        outcomeDesc = clo.OutcomeDescription
                    })
                    .ToList()
                }).ToListAsync();

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
                .Select(a => a.Course.CourseCode)
                .ToListAsync();

            string passedCoursesText = passedCourses.Any() ? string.Join(", ", passedCourses) : "Chưa có môn nào";

            // Lấy toàn bộ course + learning outcomes + skills từ DB
            var courseCatalog = await _context.Courses
                .Select(c => new
                {
                    courseId = c.CourseId,
                    courseCode = c.CourseCode,
                    courseName = c.CourseName,
                    credits = c.Credits,
                    totalStudyHours = c.TotalStudyHours,

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

            var courseCatalogJson = JsonSerializer.Serialize(
                courseCatalog,
                new JsonSerializerOptions
                {
                    WriteIndented = false
                }
            );

            return (targetRole, passedCoursesText, courseCatalogJson);
        }
    }
}
