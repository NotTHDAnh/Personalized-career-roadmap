using CareerSystem.API.DTOs;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IAcademicRecordImportService
    {
        /// <summary>
        /// Import danh sách bảng điểm từ file Excel (.xlsx).
        /// Validate điểm, kiểm tra tồn tại môn học, sinh ID REC_xxxx tự động hoặc cập nhật nếu đã tồn tại.
        /// </summary>
        /// <param name="file">File Excel upload từ Client.</param>
        /// <param name="studentId">ID của Student thực hiện import.</param>
        /// <returns>Kết quả import với chi tiết thành công/thất bại.</returns>
        Task<AcademicRecordImportResultDto> ImportAcademicRecordsFromExcelAsync(IFormFile file, string studentId);

        /// <summary>
        /// Tạo file template Excel bảng điểm mẫu để Student download.
        /// </summary>
        /// <returns>Byte array chứa nội dung file .xlsx.</returns>
        byte[] GenerateImportTemplate();
    }
}
