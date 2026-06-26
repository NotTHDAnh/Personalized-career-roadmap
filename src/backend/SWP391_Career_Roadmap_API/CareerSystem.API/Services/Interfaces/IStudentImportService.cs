using CareerSystem.API.DTOs;
using Microsoft.AspNetCore.Http;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IStudentImportService
    {
        /// <summary>
        /// Import danh sách sinh viên từ file Excel (.xlsx).
        /// Parse, validate, hash password và lưu vào database.
        /// </summary>
        /// <param name="file">File Excel upload từ client.</param>
        /// <returns>Kết quả import với chi tiết thành công/thất bại.</returns>
        Task<StudentImportResultDto> ImportStudentsFromExcelAsync(IFormFile file);

        /// <summary>
        /// Tạo file template Excel mẫu để Staff download.
        /// </summary>
        /// <returns>Byte array chứa nội dung file .xlsx.</returns>
        byte[] GenerateImportTemplate();
    }
}
