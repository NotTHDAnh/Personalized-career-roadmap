using System.Text.RegularExpressions;
using CareerSystem.API.Data;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;
using CareerSystem.API.Services.Interfaces;
using CareerSystem.API.Utilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System.Drawing;

namespace CareerSystem.API.Services.Implementations
{
    public class StudentImportService : IStudentImportService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<StudentImportService> _logger;

        // Regex đơn giản kiểm tra format email
        private static readonly Regex EmailRegex = new(
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase);

        // Các header chuẩn trong template (5 cột)
        private static readonly string[] ExpectedHeaders =
            { "STT", "Mã số sinh viên", "Họ và tên", "Email", "Mật khẩu" };

        private const int ColCount = 5;

        public StudentImportService(AppDbContext context, IEmailService emailService, ILogger<StudentImportService> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<StudentImportResultDto> ImportStudentsFromExcelAsync(IFormFile file)
        {
            var result = new StudentImportResultDto();

            using var validatedPackage = await ExcelValidationUtility.ValidateAndLoadAsync(
                file,
                ExpectedHeaders,
                "Header file Excel không đúng định dạng. Vui lòng sử dụng template mẫu. Header cần có: STT, Mã số sinh viên, Họ và tên, Email, Mật khẩu",
                "File Excel không chứa dữ liệu sinh viên nào (chỉ có header)."
            );

            var worksheet = validatedPackage.Worksheet;
            int totalRows = validatedPackage.TotalRows;

            // Lấy tất cả email đã tồn tại trong DB (để kiểm tra trùng)
            var existingEmails = await _context.Users
                .Select(u => u.Email.ToLower())
                .ToListAsync();
            var existingEmailSet = new HashSet<string>(existingEmails, StringComparer.OrdinalIgnoreCase);

            // Lấy tất cả user_id đã tồn tại trong DB (để kiểm tra trùng)
            var existingUserIds = await _context.Users
                .Select(u => u.UserId)
                .ToListAsync();
            var existingUserIdSet = new HashSet<string>(existingUserIds, StringComparer.OrdinalIgnoreCase);

            // Set theo dõi trùng trong file
            var emailsInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var userIdsInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var usersToAdd = new List<User>();
            var usersWithPasswords = new List<(User User, string Password)>();

            for (int row = 2; row <= totalRows; row++)
            {
                var studentId = worksheet.Cells[row, 2].Text?.Trim();  // Mã số sinh viên
                var fullName = worksheet.Cells[row, 3].Text?.Trim();   // Họ và tên
                var email = worksheet.Cells[row, 4].Text?.Trim();      // Email
                var password = worksheet.Cells[row, 5].Text?.Trim();   // Mật khẩu

                int displayRow = row - 1; // Số thứ tự hiển thị (không tính header)

                // Bỏ qua dòng hoàn toàn trống
                if (string.IsNullOrWhiteSpace(studentId) &&
                    string.IsNullOrWhiteSpace(fullName) &&
                    string.IsNullOrWhiteSpace(email) &&
                    string.IsNullOrWhiteSpace(password))
                {
                    continue;
                }

                result.TotalRows++;

                // === VALIDATION ===
                var errors = new List<string>();

                // Validate Mã số sinh viên
                if (string.IsNullOrWhiteSpace(studentId))
                {
                    errors.Add("Mã số sinh viên không được để trống.");
                }
                else
                {
                    if (studentId.Length > 50)
                        errors.Add("Mã số sinh viên không được vượt quá 50 ký tự.");

                    // Kiểm tra trùng MSSV trong file
                    if (!userIdsInFile.Add(studentId))
                        errors.Add($"Mã số sinh viên '{studentId}' bị trùng với dòng khác trong file.");

                    // Kiểm tra trùng MSSV trong database
                    if (existingUserIdSet.Contains(studentId))
                        errors.Add($"Mã số sinh viên '{studentId}' đã tồn tại trong hệ thống.");
                }

                // Validate Họ và tên
                if (string.IsNullOrWhiteSpace(fullName))
                    errors.Add("Họ và tên không được để trống.");
                else if (fullName.Length > 255)
                    errors.Add("Họ và tên không được vượt quá 255 ký tự.");

                // Validate Email
                if (string.IsNullOrWhiteSpace(email))
                {
                    errors.Add("Email không được để trống.");
                }
                else
                {
                    if (email.Length > 255)
                        errors.Add("Email không được vượt quá 255 ký tự.");
                    else if (!EmailRegex.IsMatch(email))
                        errors.Add("Email không đúng định dạng.");

                    // Kiểm tra trùng email trong file
                    if (!emailsInFile.Add(email))
                        errors.Add($"Email '{email}' bị trùng với dòng khác trong file.");

                    // Kiểm tra trùng email trong database
                    if (existingEmailSet.Contains(email))
                        errors.Add($"Email '{email}' đã tồn tại trong hệ thống.");
                }

                // Validate Mật khẩu
                if (string.IsNullOrWhiteSpace(password))
                    errors.Add("Mật khẩu không được để trống.");

                // Nếu có lỗi → ghi nhận và bỏ qua dòng này
                if (errors.Count > 0)
                {
                    result.FailedCount++;
                    result.Errors.Add(new StudentImportErrorDto
                    {
                        Row = displayRow,
                        FullName = fullName,
                        Email = email,
                        ErrorMessage = string.Join(" | ", errors)
                    });
                    continue;
                }

                // === TẠO USER ===
                var user = new User
                {
                    UserId = studentId!,
                    FullName = fullName!,
                    Email = email!,
                    PasswordHash = PassHashValidation.HashPassword(password!),
                    Role = "STUDENT",
                    OauthProvider = "LOCAL",
                    CreatedAt = DateTime.Now
                };

                usersToAdd.Add(user);
                usersWithPasswords.Add((user, password!));
                result.SuccessCount++;
            }

            // 5. Lưu tất cả user mới vào database
            if (usersToAdd.Count > 0)
            {
                await _context.Users.AddRangeAsync(usersToAdd);
                await _context.SaveChangesAsync();

                // 6. Gửi email thông tin tài khoản cho sinh viên
                foreach (var item in usersWithPasswords)
                {
                    try
                    {
                        var subject = "Thông tin tài khoản Career Orientation System";
                        var body = $@"
                            <h3>Chào {item.User.FullName},</h3>
                            <p>Tài khoản của bạn trên hệ thống Career Orientation System đã được tạo thành công.</p>
                            <p>Dưới đây là thông tin đăng nhập của bạn:</p>
                            <ul>
                                <li><strong>Email (Tên đăng nhập):</strong> {item.User.Email}</li>
                                <li><strong>Mật khẩu:</strong> {item.Password}</li>
                            </ul>
                            <p>Vui lòng đăng nhập và đổi mật khẩu để bảo mật tài khoản.</p>
                            <br/>
                            <p>Trân trọng,<br/>Ban Quản Trị Hệ Thống</p>";

                        await _emailService.SendEmailAsync(item.User.Email, subject, body);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Không thể gửi email thông tin tài khoản cho {item.User.Email}");
                    }
                }
            }

            return result;
        }

        /// <inheritdoc />
        public byte[] GenerateImportTemplate()
        {
            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("Danh sách sinh viên");

            // Headers
            for (int i = 0; i < ExpectedHeaders.Length; i++)
            {
                worksheet.Cells[1, i + 1].Value = ExpectedHeaders[i];
            }

            // Header styling
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

            // Dữ liệu mẫu
            var sampleData = new object[,]
            {
                { 1, "SE170001", "Nguyễn Văn A", "nguyenvana@fpt.edu.vn", "Student@123" },
                { 2, "SE170002", "Trần Thị B",   "tranthib@fpt.edu.vn",   "Student@123" },
                { 3, "SE170003", "Lê Minh C",    "leminhc@fpt.edu.vn",    "Student@123" }
            };

            for (int row = 0; row < 3; row++)
            {
                for (int col = 0; col < ColCount; col++)
                {
                    worksheet.Cells[row + 2, col + 1].Value = sampleData[row, col];
                }
            }

            // Column widths
            worksheet.Column(1).Width = 8;   // STT
            worksheet.Column(2).Width = 20;  // Mã số sinh viên
            worksheet.Column(3).Width = 30;  // Họ và tên
            worksheet.Column(4).Width = 35;  // Email
            worksheet.Column(5).Width = 20;  // Mật khẩu

            // Border cho toàn bộ dữ liệu (header + 3 dòng mẫu)
            using (var range = worksheet.Cells[1, 1, 4, ColCount])
            {
                range.Style.Border.Top.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Left.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Right.Style = ExcelBorderStyle.Thin;
                range.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;
            }

            // STT + MSSV column center aligned
            worksheet.Column(1).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            worksheet.Column(2).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;

            // Row height cho header
            worksheet.Row(1).Height = 25;

            return package.GetAsByteArray();
        }


    }
}
