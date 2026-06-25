using CareerSystem.API.DTOs;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface ICourseImportService
    {
        /// <summary>
        /// Import danh sách môn học từ file Excel (.xlsx).
        /// Parse, validate, sinh khóa chính tự động và liên kết kỹ năng đầu ra (gọi AI phân loại nếu kỹ năng mới).
        /// </summary>
        /// <param name="file">File Excel upload từ client.</param>
        /// <param name="staffId">ID của nhân viên (Staff) thực hiện import.</param>
        /// <returns>Kết quả import với chi tiết thành công/thất bại.</returns>
        Task<CourseImportResultDto> ImportCoursesFromExcelAsync(IFormFile file, string staffId);

        /// <summary>
        /// Tạo file template Excel mẫu để Staff download.
        /// </summary>
        /// <returns>Byte array chứa nội dung file .xlsx.</returns>
        byte[] GenerateImportTemplate();
    }
}
