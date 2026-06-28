using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Implementations
{
    public class CourseImportService : ICourseImportService
    {
        private readonly AppDbContext _context;
        private readonly IAiRecommendationService _aiRecommendationService;
        private readonly IConfiguration _configuration;

        // Header tiêu chuẩn của file Excel import môn học (7 cột)
        private static readonly string[] ExpectedHeaders =
            { "STT", "Mã môn học", "Tên môn học", "Số tín chỉ", "Tổng số giờ học", "Kỹ năng đầu ra", "Chuẩn đầu ra" };

        private const int ColCount = 7;

        public CourseImportService(AppDbContext context, IAiRecommendationService aiRecommendationService, IConfiguration configuration)
        {
            _context = context;
            _aiRecommendationService = aiRecommendationService;
            _configuration = configuration;
        }

        /// <inheritdoc />
        public async Task<CourseImportResultDto> ImportCoursesFromExcelAsync(IFormFile file, string staffId)
        {
            var result = new CourseImportResultDto();

            // 1. Validate file
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không được để trống.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Chỉ chấp nhận file định dạng .xlsx");

            if (file.Length > 5 * 1024 * 1024) // 5MB
                throw new ArgumentException("File không được vượt quá 5MB.");

            // 2. Đọc file Excel
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault();

            if (worksheet == null)
                throw new ArgumentException("File Excel không chứa worksheet nào.");

            // 3. Validate header
            if (!ValidateHeaders(worksheet))
                throw new ArgumentException(
                    "Header file Excel không đúng định dạng. Vui lòng sử dụng template mẫu. " +
                    "Header cần có: STT, Mã môn học, Tên môn học, Số tín chỉ, Tổng số giờ học, Kỹ năng đầu ra");

            int totalRows = worksheet.Dimension?.Rows ?? 0;
            if (totalRows <= 1)
                throw new ArgumentException("File Excel không chứa dữ liệu môn học nào (chỉ có header).");

            // 4. Lấy API Key của Staff hoặc config hệ thống
            string? apiKey = null;
            if (!string.IsNullOrWhiteSpace(staffId))
            {
                var staffUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == staffId);
                apiKey = staffUser?.GeminiApiKey;
            }
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                apiKey = _configuration["AiSettings:ApiKey"];
            }

            // 5. Lấy toàn bộ Skill hiện có trong DB để làm cache tra cứu nhanh
            var existingSkills = await _context.Skills.ToListAsync();
            var existingSkillMap = existingSkills.ToDictionary(s => s.SkillName, s => s, StringComparer.OrdinalIgnoreCase);

            // 6. Quét file Excel để thu thập tất cả kỹ năng độc bản và tìm kỹ năng mới cần tạo
            var uniqueSkillNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            for (int row = 2; row <= totalRows; row++)
            {
                var skillsText = worksheet.Cells[row, 6].Text?.Trim();
                if (!string.IsNullOrWhiteSpace(skillsText))
                {
                    var tokens = skillsText.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var t in tokens)
                    {
                        var trimmed = t.Trim();
                        if (!string.IsNullOrEmpty(trimmed))
                        {
                            uniqueSkillNames.Add(trimmed);
                        }
                    }
                }
            }

            var missingSkillNames = uniqueSkillNames
                .Where(name => !existingSkillMap.ContainsKey(name))
                .ToList();

            // 7. Sinh ID tuần tự tự động cho các đối tượng mới
            // Lấy chỉ số lớn nhất hiện tại trong database
            int maxCourseNumber = 0;
            var courseIdsInDb = await _context.Courses.Select(c => c.CourseId).ToListAsync();
            foreach (var id in courseIdsInDb)
            {
                if (id.StartsWith("CRS_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxCourseNumber) maxCourseNumber = num;
                }
            }

            int maxSkillNumber = 0;
            var skillIdsInDb = await _context.Skills.Select(s => s.SkillId).ToListAsync();
            foreach (var id in skillIdsInDb)
            {
                if (id.StartsWith("SKL_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxSkillNumber) maxSkillNumber = num;
                }
            }

            int maxCloNumber = 0;
            var cloIdsInDb = await _context.CourseLearningOutcomes.Select(c => c.Id).ToListAsync();
            foreach (var id in cloIdsInDb)
            {
                if (id.StartsWith("CLO_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxCloNumber) maxCloNumber = num;
                }
            }

            int nextCourseNum = maxCourseNumber + 1;
            int nextSkillNum = maxSkillNumber + 1;
            int nextCloNum = maxCloNumber + 1;

            // 8. Tự động xử lý kỹ năng mới bằng AI (nếu có)
            var newSkillsToRegister = new List<Skill>();
            if (missingSkillNames.Count > 0)
            {
                var skillsToClassify = new List<SkillClassificationDto>();
                foreach (var name in missingSkillNames)
                {
                    var newSkillId = $"SKL_{nextSkillNum++:D3}";
                    var skill = new Skill
                    {
                        SkillId = newSkillId,
                        SkillName = name,
                        Category = "General" // Giá trị mặc định phòng hờ khi AI lỗi
                    };
                    newSkillsToRegister.Add(skill);
                    skillsToClassify.Add(new SkillClassificationDto { SkillId = newSkillId, SkillName = name });
                }

                try
                {
                    var classifications = await _aiRecommendationService.ClassifySkillsAsync(skillsToClassify, apiKey ?? "");
                    foreach (var cls in classifications)
                    {
                        var matchedSkill = newSkillsToRegister.FirstOrDefault(s => s.SkillId == cls.SkillId);
                        if (matchedSkill != null && !string.IsNullOrWhiteSpace(cls.Category))
                        {
                            matchedSkill.Category = cls.Category.Trim();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[CourseImportService] AI classification failed: {ex.Message}. Fallback to default 'General'.");
                }

                // Cập nhật các kỹ năng mới vào cache để map ở bước sau
                foreach (var skill in newSkillsToRegister)
                {
                    existingSkillMap[skill.SkillName] = skill;
                }
            }

            // 9. Phân tích dữ liệu từng dòng trong Excel
            var existingCourseCodes = await _context.Courses
                .Select(c => c.CourseCode.ToLower())
                .ToListAsync();
            var existingCourseCodeSet = new HashSet<string>(existingCourseCodes, StringComparer.OrdinalIgnoreCase);
            var courseCodesInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var coursesToAdd = new List<Course>();
            var outcomesToAdd = new List<CourseLearningOutcome>();

            for (int row = 2; row <= totalRows; row++)
            {
                var courseCode = worksheet.Cells[row, 2].Text?.Trim();
                var courseName = worksheet.Cells[row, 3].Text?.Trim();
                var creditsStr = worksheet.Cells[row, 4].Text?.Trim();
                var totalHoursStr = worksheet.Cells[row, 5].Text?.Trim();
                var skillsText = worksheet.Cells[row, 6].Text?.Trim();
                var outcomesText = worksheet.Cells[row, 7].Text?.Trim();

                int displayRow = row - 1;

                // Bỏ qua dòng hoàn toàn trống
                if (string.IsNullOrWhiteSpace(courseCode) &&
                    string.IsNullOrWhiteSpace(courseName) &&
                    string.IsNullOrWhiteSpace(creditsStr) &&
                    string.IsNullOrWhiteSpace(totalHoursStr) &&
                    string.IsNullOrWhiteSpace(skillsText) &&
                    string.IsNullOrWhiteSpace(outcomesText))
                {
                    continue;
                }

                result.TotalRows++;
                var errors = new List<string>();

                // Validate Mã môn học
                if (string.IsNullOrWhiteSpace(courseCode))
                {
                    errors.Add("Mã môn học không được để trống.");
                }
                else
                {
                    if (courseCode.Length > 50)
                        errors.Add("Mã môn học không được vượt quá 50 ký tự.");

                    if (!courseCodesInFile.Add(courseCode))
                        errors.Add($"Mã môn học '{courseCode}' bị trùng với dòng khác trong file.");

                    if (existingCourseCodeSet.Contains(courseCode))
                        errors.Add($"Mã môn học '{courseCode}' đã tồn tại trong hệ thống.");
                }

                // Validate Tên môn học
                if (string.IsNullOrWhiteSpace(courseName))
                {
                    errors.Add("Tên môn học không được để trống.");
                }
                else if (courseName.Length > 255)
                {
                    errors.Add("Tên môn học không được vượt quá 255 ký tự.");
                }

                // Validate Số tín chỉ (Mặc định là 3 nếu trống)
                int credits = 3;
                if (!string.IsNullOrWhiteSpace(creditsStr))
                {
                    if (!int.TryParse(creditsStr, out credits) || credits <= 0)
                    {
                        errors.Add("Số tín chỉ phải là số nguyên dương.");
                    }
                }

                // Validate Tổng số giờ học (Mặc định là 0 nếu trống)
                int totalHours = 0;
                if (!string.IsNullOrWhiteSpace(totalHoursStr))
                {
                    if (!int.TryParse(totalHoursStr, out totalHours) || totalHours < 0)
                    {
                        errors.Add("Tổng số giờ học phải là số nguyên không âm.");
                    }
                }

                // Validate Kỹ năng đầu ra
                if (string.IsNullOrWhiteSpace(skillsText))
                {
                    errors.Add("Kỹ năng đầu ra không được để trống.");
                }

                if (errors.Count > 0)
                {
                    result.FailedCount++;
                    result.Errors.Add(new CourseImportErrorDto
                    {
                        Row = displayRow,
                        CourseCode = courseCode,
                        CourseName = courseName,
                        ErrorMessage = string.Join(" | ", errors)
                    });
                    continue;
                }

                // Tạo mới Course
                string newCourseId = $"CRS_{nextCourseNum++:D3}";
                var course = new Course
                {
                    CourseId = newCourseId,
                    CourseCode = courseCode!,
                    CourseName = courseName!,
                    Credits = credits,
                    TotalStudyHours = totalHours
                };
                coursesToAdd.Add(course);

                // Tạo các CourseLearningOutcome tương ứng
                var tokens = skillsText!.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();

                var descriptions = string.IsNullOrWhiteSpace(outcomesText)
                    ? new List<string>()
                    : outcomesText.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(d => d.Trim())
                        .Where(d => !string.IsNullOrEmpty(d))
                        .ToList();

                var processedSkillsInRow = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

                for (int i = 0; i < tokens.Count; i++)
                {
                    var trimmedSkillName = tokens[i];
                    if (!processedSkillsInRow.Add(trimmedSkillName))
                    {
                        continue;
                    }

                    if (existingSkillMap.TryGetValue(trimmedSkillName, out var skillEntity))
                    {
                        string outcomeDesc;
                        if (descriptions.Count == 0)
                        {
                            outcomeDesc = $"Đạt kỹ năng {skillEntity.SkillName} sau khi hoàn thành môn học {course.CourseName}";
                        }
                        else if (descriptions.Count == 1)
                        {
                            outcomeDesc = descriptions[0];
                        }
                        else if (i < descriptions.Count)
                        {
                            outcomeDesc = descriptions[i];
                        }
                        else
                        {
                            outcomeDesc = $"{descriptions.Last()} (Kỹ năng: {skillEntity.SkillName})";
                        }

                        var clo = new CourseLearningOutcome
                        {
                            Id = $"CLO_{nextCloNum++:D4}",
                            CourseId = newCourseId,
                            SkillId = skillEntity.SkillId,
                            OutcomeDescription = outcomeDesc
                        };
                        outcomesToAdd.Add(clo);
                    }
                }

                result.SuccessCount++;
            }

            // 10. Lưu tất cả thay đổi vào Database (sử dụng Transaction)
            if (result.SuccessCount > 0)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    if (newSkillsToRegister.Count > 0)
                    {
                        await _context.Skills.AddRangeAsync(newSkillsToRegister);
                        await _context.SaveChangesAsync();
                    }

                    if (coursesToAdd.Count > 0)
                    {
                        await _context.Courses.AddRangeAsync(coursesToAdd);
                        await _context.SaveChangesAsync();
                    }

                    if (outcomesToAdd.Count > 0)
                    {
                        await _context.CourseLearningOutcomes.AddRangeAsync(outcomesToAdd);
                        await _context.SaveChangesAsync();
                    }

                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception($"Lỗi xảy ra khi lưu dữ liệu môn học vào database: {ex.Message}", ex);
                }
            }

            return result;
        }

        /// <inheritdoc />
        public byte[] GenerateImportTemplate()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Danh sách môn học");

            // Thêm Headers
            for (int i = 0; i < ExpectedHeaders.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = ExpectedHeaders[i];
            }

            // Style cho Header
            using (var range = worksheet.Cells[1, 1, 1, ColCount])
            {
                range.Style.Font.Bold = true;
                range.Style.Font.Size = 12;
                range.Style.Fill.PatternType = ExcelFillStyle.Solid;
                range.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(70, 130, 180));
                range.Style.Font.Color.SetColor(Color.White);
                range.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                range.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thick;
            }

            // Dữ liệu mẫu (3 môn học)
            var sampleData = new object[,]
            {
                { 1, "PRN211", "Basic Cross-Platform Application Programming", 3, 90, "C#, .NET, Entity Framework, LINQ", "Hiểu ngôn ngữ C# cơ bản; Lập trình hướng đối tượng với .NET; Truy vấn DB bằng Entity Framework Core; Sử dụng LINQ nâng cao" },
                { 2, "PRN221", "Advanced Cross-Platform Application Programming", 3, 90, "C#, .NET, WPF, SignalR", "Lập trình desktop với WPF; Xây dựng ứng dụng thời gian thực bằng SignalR" },
                { 3, "PRN231", "Web Application Development", 3, 90, "ASP.NET Core, RESTful API, Web API", "Xây dựng web app với ASP.NET Core; Thiết kế RESTful Web API chuẩn chỉnh" }
            };

            for (int row = 0; row < 3; row++)
            {
                for (int col = 0; col < ColCount; col++)
                {
                    worksheet.Cells[row + 2, col + 1].Value = sampleData[row, col];
                }
            }

            // Cấu hình chiều rộng các cột
            worksheet.Column(1).Width = 8;   // STT
            worksheet.Column(2).Width = 15;  // Mã môn học
            worksheet.Column(3).Width = 45;  // Tên môn học
            worksheet.Column(4).Width = 12;  // Số tín chỉ
            worksheet.Column(5).Width = 18;  // Tổng số giờ học
            worksheet.Column(6).Width = 45;  // Kỹ năng đầu ra
            worksheet.Column(7).Width = 60;  // Chuẩn đầu ra

            // Border cho toàn bộ bảng
            using (var range = worksheet.Cells[1, 1, 4, ColCount])
            {
                range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            }

            // Định vị căn lề
            worksheet.Column(1).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Column(2).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Column(4).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Column(5).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            worksheet.Row(1).Height = 25;

            return package.GetAsByteArray();
        }

        private static bool ValidateHeaders(ExcelWorksheet worksheet)
        {
            if (worksheet.Dimension == null || worksheet.Dimension.Columns < ColCount)
                return false;

            for (int col = 0; col < ExpectedHeaders.Length; col++)
            {
                var cellValue = worksheet.Cells[1, col + 1].Text?.Trim();
                if (!string.Equals(cellValue, ExpectedHeaders[col], StringComparison.OrdinalIgnoreCase))
                    return false;
            }

            return true;
        }
    }


}
