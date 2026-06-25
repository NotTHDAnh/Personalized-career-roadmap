namespace CareerSystem.API.DTOs
{
    /// <summary>
    /// Kết quả tổng hợp sau khi import bảng điểm từ file Excel.
    /// </summary>
    public class AcademicRecordImportResultDto
    {
        /// <summary>Tổng số dòng dữ liệu đọc được (không tính header).</summary>
        public int TotalRows { get; set; }

        /// <summary>Số bản ghi học tập import/cập nhật thành công.</summary>
        public int SuccessCount { get; set; }

        /// <summary>Số dòng bị lỗi.</summary>
        public int FailedCount { get; set; }

        /// <summary>Chi tiết từng dòng bị lỗi.</summary>
        public List<AcademicRecordImportErrorDto> Errors { get; set; } = new();
    }

    /// <summary>
    /// Chi tiết lỗi cho một dòng trong file Excel khi import thất bại.
    /// </summary>
    public class AcademicRecordImportErrorDto
    {
        /// <summary>Số thứ tự dòng bị lỗi trong file Excel (1-indexed, không tính header).</summary>
        public int Row { get; set; }

        /// <summary>Mã môn học (nếu đọc được).</summary>
        public string? CourseCode { get; set; }

        /// <summary>Mô tả lỗi cụ thể.</summary>
        public string ErrorMessage { get; set; } = null!;
    }
}
