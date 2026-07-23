using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CareerSystem.API.Utilities
{
    public class ValidatedExcelPackage : IDisposable
    {
        public ExcelPackage Package { get; }
        public ExcelWorksheet Worksheet { get; }
        public int TotalRows { get; }

        public ValidatedExcelPackage(ExcelPackage package, ExcelWorksheet worksheet, int totalRows)
        {
            Package = package;
            Worksheet = worksheet;
            TotalRows = totalRows;
        }

        public void Dispose()
        {
            Package?.Dispose();
        }
    }

    public static class ExcelValidationUtility
    {
        public static async Task<ValidatedExcelPackage> ValidateAndLoadAsync(
            IFormFile file,
            string[] expectedHeaders,
            string customHeaderErrorMessage,
            string noDataErrorMessage,
            int maxFileSizeBytes = 10 * 1024 * 1024)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không được để trống.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Chỉ chấp nhận file định dạng .xlsx");

            if (file.Length > maxFileSizeBytes)
            {
                int maxMb = maxFileSizeBytes / (1024 * 1024);
                throw new ArgumentException($"File không được vượt quá {maxMb}MB.");
            }

            var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            stream.Position = 0;

            ExcelPackage package;
            try
            {
                package = new ExcelPackage(stream);
            }
            catch (Exception)
            {
                stream.Dispose();
                throw new ArgumentException("Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng tệp.");
            }

            var worksheet = package.Workbook.Worksheets.FirstOrDefault();
            if (worksheet == null)
            {
                package.Dispose();
                throw new ArgumentException("File Excel không chứa worksheet nào.");
            }

            // Validate headers
            if (worksheet.Dimension == null || worksheet.Dimension.Columns < expectedHeaders.Length)
            {
                package.Dispose();
                throw new ArgumentException(customHeaderErrorMessage);
            }

            for (int col = 0; col < expectedHeaders.Length; col++)
            {
                var cellValue = worksheet.Cells[1, col + 1].Text?.Trim();
                if (!string.Equals(cellValue, expectedHeaders[col], StringComparison.OrdinalIgnoreCase))
                {
                    package.Dispose();
                    throw new ArgumentException(customHeaderErrorMessage);
                }
            }

            int totalRows = worksheet.Dimension?.Rows ?? 0;
            if (totalRows <= 1)
            {
                package.Dispose();
                throw new ArgumentException(noDataErrorMessage);
            }

            return new ValidatedExcelPackage(package, worksheet, totalRows);
        }
    }
}
