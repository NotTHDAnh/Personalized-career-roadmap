namespace CareerSystem.API.DTOs
{
    /// <summary>
    /// Kết quả tổng hợp sau khi import danh sách sinh viên từ file Excel.
    /// </summary>
    public class StudentImportResultDto
    {
        /// <summary>Tổng số dòng dữ liệu đọc được (không tính header).</summary>
        public int TotalRows { get; set; }

        /// <summary>Số sinh viên tạo tài khoản thành công.</summary>
        public int SuccessCount { get; set; }

        /// <summary>Số dòng bị lỗi (bỏ qua, không tạo tài khoản).</summary>
        public int FailedCount { get; set; }

        /// <summary>Chi tiết từng dòng bị lỗi.</summary>
        public List<StudentImportErrorDto> Errors { get; set; } = new();
    }

    /// <summary>
    /// Chi tiết lỗi cho một dòng trong file Excel khi import thất bại.
    /// </summary>
    public class StudentImportErrorDto
    {
        /// <summary>Số thứ tự dòng bị lỗi trong file Excel (1-indexed, không tính header).</summary>
        public int Row { get; set; }

        /// <summary>Họ và tên (nếu đọc được).</summary>
        public string? FullName { get; set; }

        /// <summary>Email (nếu đọc được).</summary>
        public string? Email { get; set; }

        /// <summary>Mô tả lỗi cụ thể.</summary>
        public string ErrorMessage { get; set; } = null!;
    }
}
