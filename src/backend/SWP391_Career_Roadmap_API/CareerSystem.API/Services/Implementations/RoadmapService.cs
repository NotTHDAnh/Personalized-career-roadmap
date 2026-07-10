using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace CareerSystem.API.Services.Implementations
{
    public class RoadmapService : IRoadmapService
    {
        private readonly AppDbContext _context;
        private readonly IAiRecommendationService _aiRecommendationService;
        private readonly IPromptContextService _promptContextService;
        private const decimal DefaultDailyStudyHours = 2.0m;
        // Defining Alpha Coefficient for each Phase, which is used for determined the level of courses
        // There are 3 types of Alpha represents for 3 Phase: Beginner, Intermediate, Advanced
        private const decimal APLPHA_PHASE_1 = 1.0M;
        private const decimal APLPHA_PHASE_2 = 1.2M;
        private const decimal APLPHA_PHASE_3 = 1.5M;

        public RoadmapService(AppDbContext context, IAiRecommendationService aiRecommendationService, IPromptContextService promptContextService)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _promptContextService = promptContextService;
        }

        /// <summary>
        /// Đệ quy mở rộng danh sách môn học bằng cách bổ sung tất cả các môn tiên quyết còn thiếu từ DB.
        /// </summary>
        private async Task ExpandPrerequisitesAsync(
            List<AiCourseRecommendationDto> list,
            HashSet<string> passedCodes,
            Dictionary<string, Course> courseCache)
        {
            var queue = new Queue<string>(list.Select(r => r.CourseCode).Distinct(StringComparer.OrdinalIgnoreCase));
            var visited = new HashSet<string>(list.Select(r => r.CourseCode), StringComparer.OrdinalIgnoreCase);

            while (queue.Count > 0)
            {
                var code = queue.Dequeue();

                if (!courseCache.TryGetValue(code, out var course))
                {
                    course = await _context.Courses.FirstOrDefaultAsync(c => c.IsActive && c.CourseCode == code);
                    if (course == null) continue;
                    courseCache[code] = course;
                }

                if (string.IsNullOrWhiteSpace(course.Prerequisites)) continue;

                // Tách danh sách tiên quyết (phân cách bằng ; hoặc ,)
                var prereqCodes = course.Prerequisites
                    .Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();

                foreach (var prereqCode in prereqCodes)
                {
                    if (visited.Contains(prereqCode)) continue;
                    if (passedCodes.Contains(prereqCode)) continue; // Sinh viên đã hoàn thành → không cần thêm

                    var prereqCourse = await _context.Courses.FirstOrDefaultAsync(c => c.IsActive && c.CourseCode == prereqCode);
                    if (prereqCourse == null) continue;

                    courseCache[prereqCode] = prereqCourse;
                    visited.Add(prereqCode);

                    // Thêm vào danh sách với level mặc định Beginner, LC 1.0 (sẽ được sort lại sau)
                    list.Add(new AiCourseRecommendationDto
                    {
                        CourseCode = prereqCode,
                        SkillName = null,
                        Level = prereqCourse.IsFoundationalCourse ? "Beginner" : "Intermediate",
                        LearningCoefficient = 1.0m
                    });

                    queue.Enqueue(prereqCode);
                }
            }
        }

        /// <summary>
        /// Sắp xếp Topo (DFS) danh sách môn học theo thứ tự tiên quyết: môn tiên quyết luôn xuất hiện trước.
        /// </summary>
        private static List<AiCourseRecommendationDto> TopologicalSort(
            List<AiCourseRecommendationDto> courses,
            Dictionary<string, Course> courseCache)
        {
            var lookup = courses.ToDictionary(c => c.CourseCode, StringComparer.OrdinalIgnoreCase);
            var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var result = new List<AiCourseRecommendationDto>();

            void Dfs(string code)
            {
                if (!visited.Add(code)) return;
                if (!lookup.TryGetValue(code, out var rec)) return;

                // Duyệt các tiên quyết trước
                if (courseCache.TryGetValue(code, out var course) && !string.IsNullOrWhiteSpace(course.Prerequisites))
                {
                    foreach (var prereq in course.Prerequisites
                        .Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim())
                        .Where(s => !string.IsNullOrEmpty(s)))
                    {
                        Dfs(prereq);
                    }
                }

                result.Add(rec);
            }

            foreach (var course in courses)
                Dfs(course.CourseCode);

            return result;
        }

        public async Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng.");
            }

            var (targetRole, passedCoursesText, courseCatalogJson) = await _promptContextService.BuildRoadmapContextAsync(request);

            var recommendedCourses = await _aiRecommendationService.GetRoadmapCoursesAsync(targetRole, passedCoursesText, courseCatalogJson, user.GeminiApiKey);

            // 5. Khởi tạo Roadmap
            var newRoadmap = new Roadmap
            {
                RoadmapId = Guid.NewGuid().ToString(),
                UserId = request.UserId,
                TargetRoleId = request.TargetRoleId,
                DailyStudyHours = request.DailyStudyHours,
                ProgressPercent = 0,
                CreatedAt = DateTime.Now
            };
            _context.Roadmaps.Add(newRoadmap);

            // Lấy danh sách mã/id môn học đã học từ học bạ của sinh viên
            var passedCourseIds = await _context.AcademicRecords
                .Include(ar => ar.Course)
                .Where(ar => ar.UserId == request.UserId && ar.Gpa >= 5.0m && ar.Course.IsActive)
                .Select(ar => ar.CourseId)
                .ToListAsync();

            var passedCourseCodes = await _context.AcademicRecords
                .Include(ar => ar.Course)
                .Where(ar => ar.UserId == request.UserId && ar.Gpa >= 5.0m && ar.Course.IsActive)
                .Select(ar => ar.Course.CourseCode)
                .ToHashSetAsync(StringComparer.OrdinalIgnoreCase);

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                // Bước 1: Loại bỏ trùng lặp từ kết quả AI
                var deduped = recommendedCourses
                    .Where(r => !string.IsNullOrWhiteSpace(r.CourseCode))
                    .GroupBy(r => r.CourseCode.Trim(), StringComparer.OrdinalIgnoreCase)
                    .Select(g => g.First())
                    .ToList();

                // Bước 2: Bổ sung đệ quy các môn tiên quyết còn thiếu từ DB
                var courseCache = new Dictionary<string, Course>(StringComparer.OrdinalIgnoreCase);
                await ExpandPrerequisitesAsync(deduped, passedCourseCodes, courseCache);

                // Bước 3: Pre-load course cache cho những môn chưa load
                foreach (var rec in deduped.Where(r => !courseCache.ContainsKey(r.CourseCode)))
                {
                    var c = await _context.Courses.FirstOrDefaultAsync(x => x.IsActive && x.CourseCode == rec.CourseCode);
                    if (c != null) courseCache[rec.CourseCode] = c;
                }

                // Bước 4: Topological Sort – đảm bảo tiên quyết luôn đứng trước
                var sorted = TopologicalSort(deduped, courseCache);

                // Log thứ tự sau khi Topo Sort kèm tiên quyết
                var sortedCodes = sorted.Select(s => s.CourseCode).ToHashSet(StringComparer.OrdinalIgnoreCase);
                Console.WriteLine("[RoadmapService][Personalized] Topological Sort result:");
                for (int i = 0; i < sorted.Count; i++)
                {
                    var code = sorted[i].CourseCode;
                    courseCache.TryGetValue(code, out var dbCourse);
                    var prereqs = string.IsNullOrWhiteSpace(dbCourse?.Prerequisites)
                        ? "(none)"
                        : string.Join(", ", dbCourse.Prerequisites
                            .Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(p => p.Trim())
                            .Select(p => $"{p}:{sortedCodes.Contains(p)}"));
                    Console.WriteLine($"  [{i + 1:D2}] {code,-12} -> prereqs: [{prereqs}]");
                }

                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;
                decimal dailyHours = request.DailyStudyHours > 0 ? (decimal)request.DailyStudyHours : DefaultDailyStudyHours;

                foreach (var rec in sorted)
                {
                    string normalizedCode = rec.CourseCode.Trim();

                    if (!courseCache.TryGetValue(normalizedCode, out var courseDb)) continue;

                    // Bỏ qua môn đã hoàn thành
                    if (passedCourseIds.Contains(courseDb.CourseId)) continue;

                    // Tìm Skill DB
                    var skillDb = await (
                        from clo in _context.CourseLearningOutcomes
                        join skill in _context.Skills on clo.SkillId equals skill.SkillId
                        where clo.CourseId == courseDb.CourseId
                        select skill
                    ).FirstOrDefaultAsync();

                    if (skillDb == null && !string.IsNullOrWhiteSpace(rec.SkillName))
                    {
                        skillDb = await _context.Skills.FirstOrDefaultAsync(s =>
                            s.SkillName.Contains(rec.SkillName) || rec.SkillName.Contains(s.SkillName));
                    }

                    if (skillDb == null) continue;

                    // Tính deadline
                    decimal alpha = rec.Level switch
                    {
                        "Beginner" => APLPHA_PHASE_1,
                        "Intermediate" => APLPHA_PHASE_2,
                        "Advanced" => APLPHA_PHASE_3,
                        _ => APLPHA_PHASE_1
                    };
                    decimal lc = rec.LearningCoefficient ?? 1.0m;
                    int totalHours = courseDb.TotalStudyHours ?? 30;
                    int daysRequired = (int)Math.Ceiling((totalHours * alpha) / (dailyHours * lc));
                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    var node = new SkillNode
                    {
                        NodeId = Guid.NewGuid().ToString(),
                        RoadmapId = newRoadmap.RoadmapId,
                        SkillId = skillDb.SkillId,
                        CourseId = courseDb.CourseId,
                        ParentNodeId = previousNodeId,
                        Status = "PENDING",
                        Deadline = currentDeadline,
                        AcademicLevel = rec.Level ?? "Beginner"
                    };

                    _context.SkillNodes.Add(node);
                    previousNodeId = node.NodeId;
                }
            }

            await _context.SaveChangesAsync();
            return newRoadmap.RoadmapId;
        }





        public async Task<RoadmapDetailDto> GetRoadmapDetailAsync(string roadmapId)
        {
            // Tìm lộ trình và kết nối sang bảng CareerRoles, cùng bảng SkillNodes và Courses
            var roadmap = await _context.Roadmaps
                .Include(r => r.TargetRole)
                .Include(r => r.SkillNodes)
                    .ThenInclude(sn => sn.Course) // Đi xuyên sang bảng Courses để lấy Tên/Mã môn
                .FirstOrDefaultAsync(r => r.RoadmapId == roadmapId);

            if (roadmap == null)
            {
                throw new Exception("Không tìm thấy lộ trình yêu cầu.");
            }

            // Lấy danh sách các CourseId đã học và gpa từ học bạ của người dùng sở hữu roadmap này (chỉ lấy môn học đang hoạt động)
            var academicRecords = await _context.AcademicRecords
                .Include(ar => ar.Course)
                .Where(ar => ar.UserId == roadmap.UserId && ar.Course.IsActive)
                .ToDictionaryAsync(ar => ar.CourseId, ar => ar.Gpa);

            // Sắp xếp các môn học theo thứ tự Deadline tăng dần để FE vẽ từ trái sang phải
            var sortedSkillNodes = roadmap.SkillNodes.OrderBy(sn => sn.Deadline).ToList();
            var orderedNodes = new List<SkillNodeDetailDto>();
            bool hasChanges = false;

            foreach (var sn in sortedSkillNodes)
            {
                bool isCompleted = sn.CourseId != null && academicRecords.ContainsKey(sn.CourseId);
                string computedStatus = isCompleted ? "COMPLETED" : "PENDING";
                decimal? gpa = isCompleted ? academicRecords[sn.CourseId] : null;

                if (sn.Status != computedStatus)
                {
                    sn.Status = computedStatus;
                    hasChanges = true;
                }

                orderedNodes.Add(new SkillNodeDetailDto
                {
                    NodeId = sn.NodeId,
                    CourseId = sn.CourseId,
                    CourseCode = sn.Course?.CourseCode,
                    CourseName = sn.Course?.CourseName,
                    Status = computedStatus,
                    Deadline = sn.Deadline,
                    ParentNodeId = sn.ParentNodeId,
                    AcademicLevel = sn.AcademicLevel,
                    Gpa = gpa
                });
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }

            // Nhóm các node theo level (Beginner, Intermediate, Advanced)
            var phases = new List<RoadmapPhaseDto>();
            var groupedByLevel = orderedNodes.GroupBy(n => n.AcademicLevel ?? "Beginner");

            var phaseOrder = new List<string> { "Beginner", "Intermediate", "Advanced" };

            foreach (var phaseName in phaseOrder)
            {
                var group = groupedByLevel.FirstOrDefault(g => g.Key.Equals(phaseName, StringComparison.OrdinalIgnoreCase));
                if (group != null)
                {
                    phases.Add(new RoadmapPhaseDto
                    {
                        PhaseName = phaseName,
                        Nodes = group.ToList()
                    });
                }
            }

            // Catch-all for any other levels not in the standard order
            foreach (var group in groupedByLevel)
            {
                if (!phaseOrder.Contains(group.Key, StringComparer.OrdinalIgnoreCase))
                {
                    phases.Add(new RoadmapPhaseDto
                    {
                        PhaseName = group.Key,
                        Nodes = group.ToList()
                    });
                }
            }

            // Ánh xạ dữ liệu từ Entity (Database) sang DTO (gửi cho FE)
            var result = new RoadmapDetailDto
            {
                RoadmapId = roadmap.RoadmapId,
                TargetRoleName = roadmap.TargetRole.RoleName,
                DailyStudyHours = roadmap.DailyStudyHours ?? 0,
                ProgressPercent = roadmap.ProgressPercent ?? 0,
                Phases = phases
            };

            return result;
        }

        public async Task<RoadmapDetailDto> GenerateRoadmapPreviewAsync(PersonalizedRoadmapRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null) throw new Exception("Không tìm thấy người dùng.");
            if (string.IsNullOrWhiteSpace(user.GeminiApiKey))
                throw new Exception("Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để sử dụng tính năng này.");

            var (targetRole, passedCoursesText, courseCatalogJson) = await _promptContextService.BuildRoadmapContextAsync(request);
            var recommendedCourses = await _aiRecommendationService.GetRoadmapCoursesAsync(targetRole, passedCoursesText, courseCatalogJson, user.GeminiApiKey);

            var passedCourseIds = await _context.AcademicRecords
                .Include(ar => ar.Course)
                .Where(ar => ar.UserId == request.UserId && ar.Gpa >= 5.0m && ar.Course.IsActive)
                .Select(ar => ar.CourseId)
                .ToListAsync();

            var passedCourseCodes = await _context.AcademicRecords
                .Include(ar => ar.Course)
                .Where(ar => ar.UserId == request.UserId && ar.Gpa >= 5.0m && ar.Course.IsActive)
                .Select(ar => ar.Course.CourseCode)
                .ToHashSetAsync(StringComparer.OrdinalIgnoreCase);

            var targetRoleName = await _context.CareerRoles
                .Where(r => r.RoleId == request.TargetRoleId)
                .Select(r => r.RoleName)
                .FirstOrDefaultAsync() ?? "Lộ trình cá nhân";

            var orderedNodes = new List<SkillNodeDetailDto>();

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                // Bước 1: Loại bỏ trùng lặp
                var deduped = recommendedCourses
                    .Where(r => !string.IsNullOrWhiteSpace(r.CourseCode))
                    .GroupBy(r => r.CourseCode.Trim(), StringComparer.OrdinalIgnoreCase)
                    .Select(g => g.First())
                    .ToList();

                // Bước 2: Bổ sung đệ quy các môn tiên quyết còn thiếu
                var courseCache = new Dictionary<string, Course>(StringComparer.OrdinalIgnoreCase);
                await ExpandPrerequisitesAsync(deduped, passedCourseCodes, courseCache);

                // Bước 3: Pre-load course cache cho các môn chưa được load
                foreach (var rec in deduped.Where(r => !courseCache.ContainsKey(r.CourseCode)))
                {
                    var c = await _context.Courses.FirstOrDefaultAsync(x => x.IsActive && x.CourseCode == rec.CourseCode);
                    if (c != null) courseCache[rec.CourseCode] = c;
                }

                // Bước 4: Topological Sort
                var sorted = TopologicalSort(deduped, courseCache);

                // Log thứ tự sau khi Topo Sort kèm tiên quyết
                var sortedCodes = sorted.Select(s => s.CourseCode).ToHashSet(StringComparer.OrdinalIgnoreCase);
                Console.WriteLine("[RoadmapService][Preview] Topological Sort result:");
                for (int i = 0; i < sorted.Count; i++)
                {
                    var code = sorted[i].CourseCode;
                    courseCache.TryGetValue(code, out var dbCourse);
                    var prereqs = string.IsNullOrWhiteSpace(dbCourse?.Prerequisites)
                        ? "(none)"
                        : string.Join(", ", dbCourse.Prerequisites
                            .Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(p => p.Trim())
                            .Select(p => $"{p}:{sortedCodes.Contains(p)}"));
                    Console.WriteLine($"  [{i + 1:D2}] {code,-12} -> prereqs: [{prereqs}]");
                }

                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;
                decimal dailyHours = request.DailyStudyHours > 0 ? (decimal)request.DailyStudyHours : DefaultDailyStudyHours;

                foreach (var rec in sorted)
                {
                    string normalizedCode = rec.CourseCode.Trim();
                    if (!courseCache.TryGetValue(normalizedCode, out var courseDb)) continue;

                    if (passedCourseIds.Contains(courseDb.CourseId)) continue;

                    decimal alpha = rec.Level switch
                    {
                        "Beginner" => APLPHA_PHASE_1,
                        "Intermediate" => APLPHA_PHASE_2,
                        "Advanced" => APLPHA_PHASE_3,
                        _ => APLPHA_PHASE_1
                    };
                    decimal lc = rec.LearningCoefficient ?? 1.0m;
                    int totalHours = courseDb.TotalStudyHours ?? 30;
                    int daysRequired = (int)Math.Ceiling((totalHours * alpha) / (dailyHours * lc));
                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    var tempNodeId = Guid.NewGuid().ToString();
                    orderedNodes.Add(new SkillNodeDetailDto
                    {
                        NodeId = tempNodeId,
                        CourseId = courseDb.CourseId,
                        CourseCode = courseDb.CourseCode,
                        CourseName = courseDb.CourseName,
                        Status = "PENDING",
                        Deadline = currentDeadline,
                        ParentNodeId = previousNodeId,
                        AcademicLevel = rec.Level ?? "Beginner"
                    });

                    previousNodeId = tempNodeId;
                }
            }

            var phases = new List<RoadmapPhaseDto>();
            var groupedByLevel = orderedNodes.GroupBy(n => n.AcademicLevel ?? "Beginner");
            var phaseOrder = new List<string> { "Beginner", "Intermediate", "Advanced" };

            foreach (var phaseName in phaseOrder)
            {
                var group = groupedByLevel.FirstOrDefault(g => g.Key.Equals(phaseName, StringComparison.OrdinalIgnoreCase));
                if (group != null)
                    phases.Add(new RoadmapPhaseDto { PhaseName = phaseName, Nodes = group.ToList() });
            }

            foreach (var group in groupedByLevel)
            {
                if (!phaseOrder.Contains(group.Key, StringComparer.OrdinalIgnoreCase))
                    phases.Add(new RoadmapPhaseDto { PhaseName = group.Key, Nodes = group.ToList() });
            }

            return new RoadmapDetailDto
            {
                RoadmapId = "preview-" + Guid.NewGuid().ToString(),
                TargetRoleName = targetRoleName,
                DailyStudyHours = (decimal)request.DailyStudyHours,
                ProgressPercent = 0,
                Phases = phases
            };
        }

        public async Task<string> SaveRoadmapAsync(SaveRoadmapRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null) throw new Exception("Không tìm thấy người dùng.");

            // 1. Create Roadmap
            var newRoadmap = new Roadmap
            {
                RoadmapId = Guid.NewGuid().ToString(),
                UserId = request.UserId,
                TargetRoleId = request.TargetRoleId,
                DailyStudyHours = request.DailyStudyHours,
                ProgressPercent = 0,
                CreatedAt = DateTime.Now
            };
            _context.Roadmaps.Add(newRoadmap);

            // 2. Loop through phases and save SkillNodes
            string? previousNodeId = null;

            // Collect all nodes from phases in order of standard phase order
            var orderedNodes = new List<SkillNodeDetailDto>();
            var phaseOrder = new List<string> { "Beginner", "Intermediate", "Advanced" };

            // Flatten phases in logical order
            foreach (var phaseName in phaseOrder)
            {
                var phase = request.Phases.FirstOrDefault(p => p.PhaseName.Equals(phaseName, StringComparison.OrdinalIgnoreCase));
                if (phase != null)
                {
                    orderedNodes.AddRange(phase.Nodes);
                }
            }

            // Add remaining phases if any
            foreach (var phase in request.Phases)
            {
                if (!phaseOrder.Contains(phase.PhaseName, StringComparer.OrdinalIgnoreCase))
                {
                    orderedNodes.AddRange(phase.Nodes);
                }
            }

            foreach (var nodeDto in orderedNodes)
            {
                var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.IsActive && c.CourseCode == nodeDto.CourseCode);
                if (courseDb == null) continue;

                var skillDb = await (
                    from clo in _context.CourseLearningOutcomes
                    join skill in _context.Skills on clo.SkillId equals skill.SkillId
                    where clo.CourseId == courseDb.CourseId
                    select skill
                ).FirstOrDefaultAsync();

                if (skillDb == null) continue;

                var node = new SkillNode
                {
                    NodeId = Guid.NewGuid().ToString(),
                    RoadmapId = newRoadmap.RoadmapId,
                    SkillId = skillDb.SkillId,
                    CourseId = courseDb.CourseId,
                    ParentNodeId = previousNodeId,
                    Status = "PENDING",
                    Deadline = nodeDto.Deadline,
                    AcademicLevel = nodeDto.AcademicLevel
                };

                _context.SkillNodes.Add(node);
                previousNodeId = node.NodeId;
            }

            await _context.SaveChangesAsync();
            return newRoadmap.RoadmapId;
        }

        public async Task<List<UserRoadmapDto>> GetUserRoadmapsAsync(string userId)
        {
            return await _context.Roadmaps
                .Where(r => r.UserId == userId)
                .OrderBy(r => r.CreatedAt)
                .Select(r => new UserRoadmapDto
                {
                    RoadmapId = r.RoadmapId,
                    TargetRoleName = r.TargetRole != null ? r.TargetRole.RoleName : "Lộ trình cá nhân",
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteRoadmapAsync(string roadmapId)
        {
            var roadmap = await _context.Roadmaps.FindAsync(roadmapId);
            if (roadmap == null) return false;

            // Fetch all associated SkillNodes
            var skillNodes = await _context.SkillNodes.Where(sn => sn.RoadmapId == roadmapId).ToListAsync();

            // Remove self-referencing foreign keys to avoid constraint violations during deletion
            foreach (var node in skillNodes)
            {
                node.ParentNodeId = null;
            }

            if (skillNodes.Any())
            {
                await _context.SaveChangesAsync(); // Apply ParentNodeId = null
                _context.SkillNodes.RemoveRange(skillNodes); // Remove the skill nodes
            }

            _context.Roadmaps.Remove(roadmap);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateNodesStatusAsync(UpdateNodesStatusRequest request)
        {
            var roadmap = await _context.Roadmaps
                .Include(r => r.SkillNodes)
                .FirstOrDefaultAsync(r => r.RoadmapId == request.RoadmapId);

            if (roadmap == null) return false;

            foreach (var node in roadmap.SkillNodes)
            {
                var updateDto = request.Updates.FirstOrDefault(u => u.NodeId == node.NodeId);
                if (updateDto != null)
                {
                    node.Status = updateDto.Status;

                    if (updateDto.Status == "COMPLETED" && node.CourseId != null && updateDto.Gpa.HasValue)
                    {
                        var record = await _context.AcademicRecords
                            .FirstOrDefaultAsync(ar => ar.UserId == roadmap.UserId && ar.CourseId == node.CourseId);

                        if (record == null)
                        {
                            _context.AcademicRecords.Add(new AcademicRecord
                            {
                                RecordId = Guid.NewGuid().ToString(),
                                UserId = roadmap.UserId,
                                CourseId = node.CourseId,
                                Gpa = updateDto.Gpa.Value,
                                ExamAttempts = 1
                            });
                        }
                        else
                        {
                            record.Gpa = updateDto.Gpa.Value;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
