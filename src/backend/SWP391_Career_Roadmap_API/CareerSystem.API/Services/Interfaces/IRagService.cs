using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IRagService
    {
        Task<BulkIndexResultDto> BulkIndexSqlToPineconeAsync(string indexUrlOverride = "", string apiKeyOverride = "");
        Task IndexCourseAsync(string courseId, string title, string description);
        Task<string> SearchRagContextAsync(string userQuestion, int topK = 3);
    }
}
