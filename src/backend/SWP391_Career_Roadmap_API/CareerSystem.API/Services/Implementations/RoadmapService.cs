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

        public RoadmapService(AppDbContext context, IAiRecommendationService aiRecommendationService, IPromptContextService promptContextService)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _promptContextService = promptContextService;
        }

        public async Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == request.UserId);
            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng.");
            }

            //if (string.IsNullOrWhiteSpace(user.GeminiApiKey))
            //{
            //    throw new Exception("Vui lòng cấu hình Gemini API Key trong tài khoản của bạn để sử dụng tính năng này.");
            //}

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

            // 6. Bóc tách kết quả JSON, đối chiếu với Database thật, tính toán Deadline, rồi khởi tạo các Node học tập tương ứng

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;

                // Tập hợp các môn học đã được xử lý để tránh trùng lặp
                var seenCourseCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                //Tránh lỗi chia cho 0 nếu sinh viên nhập DailyStudyHours = 0
                decimal dailyHours = request.DailyStudyHours > 0 ? (decimal)request.DailyStudyHours : 2.0m;

                foreach (var rec in recommendedCourses)
                {
                    // 6.1. Đối chiếu mã môn AI chọn với Database thật
                    if (string.IsNullOrWhiteSpace(rec.CourseCode)) continue;

                    string normalizedCode = rec.CourseCode.Trim();
                    if (seenCourseCodes.Contains(normalizedCode))
                    {
                        continue; // Bỏ qua nếu môn học này đã xuất hiện trước đó trong lộ trình
                    }
                    seenCourseCodes.Add(normalizedCode);

                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == normalizedCode);
                    if (courseDb == null) continue; // Bỏ qua nếu AI bịa mã môn sai

                    // 6.2. Truy xuất kỹ năng cốt lõi của môn học (Để map vào SkillId)
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

                    // Nếu tìm mọi cách vẫn không có skill nào khớp thì bỏ qua
                    if (skillDb == null)
                    {
                        continue;
                    }


                    // 6.3. Thuật toán tính toán thời gian hoàn thành (Deadline)
                    int totalHours = courseDb.TotalStudyHours ?? 30;
                    int daysRequired = (int)Math.Ceiling(totalHours / dailyHours);
                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    // 6.4. Khởi tạo Node học tập
                    var node = new SkillNode
                    {
                        NodeId = Guid.NewGuid().ToString(),
                        RoadmapId = newRoadmap.RoadmapId,      // Nối với vỏ lộ trình vừa tạo
                        SkillId = skillDb.SkillId,             // Nối với kỹ năng chuẩn
                        CourseId = courseDb.CourseId,          // Nối với môn học chuẩn
                        ParentNodeId = previousNodeId,         // Nối tiếp với môn học trước đó (A -> B -> C)
                        Status = "PENDING",
                        Deadline = currentDeadline,
                        AcademicLevel = rec.Level ?? "Beginner"
                    };

                    _context.SkillNodes.Add(node);

                    // Cập nhật lại previousNodeId để môn tiếp theo có thể nối vào đuôi môn này
                    previousNodeId = node.NodeId;
                }
            }

            // 7. Lưu Roadmap và các SkillNode xuống Database
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

            // Sắp xếp các môn học theo thứ tự Deadline tăng dần để FE vẽ từ trái sang phải
            var orderedNodes = roadmap.SkillNodes.OrderBy(sn => sn.Deadline).Select(sn => new SkillNodeDetailDto
            {
                NodeId = sn.NodeId,
                CourseCode = sn.Course?.CourseCode,
                CourseName = sn.Course?.CourseName,
                Status = sn.Status ?? "PENDING",
                Deadline = sn.Deadline,
                ParentNodeId = sn.ParentNodeId,
                AcademicLevel = sn.AcademicLevel
            }).ToList();

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

            var targetRoleName = await _context.CareerRoles
                .Where(r => r.RoleId == request.TargetRoleId)
                .Select(r => r.RoleName)
                .FirstOrDefaultAsync() ?? "Lộ trình cá nhân";

            var orderedNodes = new List<SkillNodeDetailDto>();

            if (recommendedCourses != null && recommendedCourses.Any())
            {
                DateOnly currentDeadline = DateOnly.FromDateTime(DateTime.Now);
                string? previousNodeId = null;
                var seenCourseCodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                decimal dailyHours = request.DailyStudyHours > 0 ? (decimal)request.DailyStudyHours : 2.0m;

                foreach (var rec in recommendedCourses)
                {
                    if (string.IsNullOrWhiteSpace(rec.CourseCode)) continue;
                    string normalizedCode = rec.CourseCode.Trim();
                    if (seenCourseCodes.Contains(normalizedCode)) continue;
                    seenCourseCodes.Add(normalizedCode);

                    var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == normalizedCode);
                    if (courseDb == null) continue;

                    int totalHours = courseDb.TotalStudyHours ?? 30;
                    int daysRequired = (int)Math.Ceiling(totalHours / (double)dailyHours);
                    currentDeadline = currentDeadline.AddDays(daysRequired);

                    orderedNodes.Add(new SkillNodeDetailDto
                    {
                        NodeId = Guid.NewGuid().ToString(), // Temp Node ID
                        CourseCode = courseDb.CourseCode,
                        CourseName = courseDb.CourseName,
                        Status = "PENDING",
                        Deadline = currentDeadline,
                        ParentNodeId = previousNodeId,
                        AcademicLevel = rec.Level ?? "Beginner"
                    });

                    previousNodeId = orderedNodes.Last().NodeId;
                }
            }

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

            return new RoadmapDetailDto
            {
                RoadmapId = "preview-" + Guid.NewGuid().ToString(), // Mark as preview
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
                var courseDb = await _context.Courses.FirstOrDefaultAsync(c => c.CourseCode == nodeDto.CourseCode);
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
                .Select(r => new UserRoadmapDto
                {
                    RoadmapId = r.RoadmapId,
                    TargetRoleName = r.TargetRole != null ? r.TargetRole.RoleName : "Lộ trình cá nhân"
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteRoadmapAsync(string roadmapId)
        {
            var roadmap = await _context.Roadmaps.FindAsync(roadmapId);
            if (roadmap == null) return false;
            
            _context.Roadmaps.Remove(roadmap);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}