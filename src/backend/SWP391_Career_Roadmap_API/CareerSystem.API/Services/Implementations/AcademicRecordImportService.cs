using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Implementations
{
    public class AcademicRecordImportService : IAcademicRecordImportService
    {
        private readonly AppDbContext _context;

        // Header tiêu chuẩn của file Excel import bảng điểm (4 cột)
        private static readonly string[] ExpectedHeaders =
            { "STT", "Mã môn học", "GPA", "Số lần thi" };

        private const int ColCount = 4;

        public AcademicRecordImportService(AppDbContext context)
        {
            _context = context;
        }

        /// <inheritdoc />
        public async Task<AcademicRecordImportResultDto> ImportAcademicRecordsFromExcelAsync(IFormFile file, string studentId)
        {
            var result = new AcademicRecordImportResultDto();

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
                    "Header cần có: STT, Mã môn học, GPA, Số lần thi");

            int totalRows = worksheet.Dimension?.Rows ?? 0;
            if (totalRows <= 1)
                throw new ArgumentException("File Excel không chứa dữ liệu bảng điểm nào (chỉ có header).");

            // 4. Lấy danh sách Môn học hiện có trong DB để kiểm tra mã môn học nhập vào
            var existingCourses = await _context.Courses.ToListAsync();
            var existingCourseMap = existingCourses.ToDictionary(c => c.CourseCode, c => c, StringComparer.OrdinalIgnoreCase);

            // 5. Lấy danh sách điểm hiện tại của sinh viên này để xác định thêm mới hay cập nhật
            var studentRecords = await _context.AcademicRecords
                .Where(r => r.UserId == studentId)
                .ToListAsync();
            var studentRecordMap = studentRecords.ToDictionary(r => r.CourseId, r => r);

            // 6. Tìm mã REC_xxxx lớn nhất hiện tại trong Database để tự sinh ID tuần tự
            int maxRecordNumber = 0;
            var recordIdsInDb = await _context.AcademicRecords.Select(r => r.RecordId).ToListAsync();
            foreach (var id in recordIdsInDb)
            {
                if (id.StartsWith("REC_") && int.TryParse(id.Substring(4), out int num))
                {
                    if (num > maxRecordNumber) maxRecordNumber = num;
                }
            }
            int nextRecordNum = maxRecordNumber + 1;

            // Bộ theo dõi trùng lặp mã môn học trong cùng file Excel
            var courseCodesInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var recordsToAdd = new List<AcademicRecord>();
            var recordsToUpdate = new List<AcademicRecord>();

            // 7. Quét dữ liệu từng dòng
            for (int row = 2; row <= totalRows; row++)
            {
                var courseCode = worksheet.Cells[row, 2].Text?.Trim();
                var gpaStr = worksheet.Cells[row, 3].Text?.Trim();
                var attemptsStr = worksheet.Cells[row, 4].Text?.Trim();

                int displayRow = row - 1;

                // Bỏ qua dòng hoàn toàn trống
                if (string.IsNullOrWhiteSpace(courseCode) &&
                    string.IsNullOrWhiteSpace(gpaStr) &&
                    string.IsNullOrWhiteSpace(attemptsStr))
                {
                    continue;
                }

                result.TotalRows++;
                var errors = new List<string>();

                // Validate Mã môn học
                Course? matchedCourse = null;
                if (string.IsNullOrWhiteSpace(courseCode))
                {
                    errors.Add("Mã môn học không được để trống.");
                }
                else
                {
                    if (!courseCodesInFile.Add(courseCode))
                    {
                        errors.Add($"Mã môn học '{courseCode}' bị trùng lặp ở dòng khác trong file.");
                    }
                    else if (!existingCourseMap.TryGetValue(courseCode, out matchedCourse))
                    {
                        errors.Add($"Mã môn học '{courseCode}' không tồn tại trong hệ thống. Vui lòng liên hệ Admin/Staff để thêm môn học này trước.");
                    }
                }

                // Validate GPA
                decimal gpa = 0;
                if (string.IsNullOrWhiteSpace(gpaStr))
                {
                    errors.Add("Điểm GPA không được để trống.");
                }
                else
                {
                    if (!decimal.TryParse(gpaStr, out gpa) || gpa < 0 || gpa > 10)
                    {
                        errors.Add("Điểm GPA phải là số thực nằm trong khoảng từ 0.0 đến 10.0.");
                    }
                }

                // Validate Số lần thi (Mặc định là 1 nếu trống)
                int examAttempts = 1;
                if (!string.IsNullOrWhiteSpace(attemptsStr))
                {
                    if (!int.TryParse(attemptsStr, out examAttempts) || examAttempts < 1)
                    {
                        errors.Add("Số lần thi phải là số nguyên dương lớn hơn hoặc bằng 1.");
                    }
                }

                // Ghi nhận lỗi nếu có
                if (errors.Count > 0)
                {
                    result.FailedCount++;
                    result.Errors.Add(new AcademicRecordImportErrorDto
                    {
                        Row = displayRow,
                        CourseCode = courseCode,
                        ErrorMessage = string.Join(" | ", errors)
                    });
                    continue;
                }

                // 8. Tiến hành thêm mới hoặc cập nhật điểm môn học
                if (matchedCourse != null)
                {
                    if (studentRecordMap.TryGetValue(matchedCourse.CourseId, out var existingRecord))
                    {
                        existingRecord.Gpa = gpa;
                        existingRecord.ExamAttempts = examAttempts;
                        recordsToUpdate.Add(existingRecord);
                    }
                    else
                    {
                        var newRecord = new AcademicRecord
                        {
                            RecordId = $"REC_{nextRecordNum++:D4}",
                            UserId = studentId,
                            CourseId = matchedCourse.CourseId,
                            Gpa = gpa,
                            ExamAttempts = examAttempts
                        };
                        recordsToAdd.Add(newRecord);
                        
                        // Cập nhật map để tránh conflict nếu có sự cố
                        studentRecordMap[matchedCourse.CourseId] = newRecord;
                    }
                    
                    result.SuccessCount++;
                }
            }

            // 9. Lưu dữ liệu sử dụng Transaction
            if (result.SuccessCount > 0)
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    if (recordsToAdd.Count > 0)
                    {
                        await _context.AcademicRecords.AddRangeAsync(recordsToAdd);
                    }

                    if (recordsToUpdate.Count > 0)
                    {
                        _context.AcademicRecords.UpdateRange(recordsToUpdate);
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw new Exception($"Lỗi xảy ra khi lưu dữ liệu bảng điểm vào database: {ex.Message}", ex);
                }
            }

            return result;
        }

        /// <inheritdoc />
        public byte[] GenerateImportTemplate()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Bảng điểm sinh viên");

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
                { 1, "PRN211", 8.2, 1 },
                { 2, "PRN221", 6.5, 2 },
                { 3, "PRN231", 7.0, 1 }
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
            worksheet.Column(3).Width = 15;  // GPA
            worksheet.Column(4).Width = 15;  // Số lần thi

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
            worksheet.Column(3).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Column(4).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

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
