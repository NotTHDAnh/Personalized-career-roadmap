using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IRoadmapService
    {
        Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request);

        // Hàm xem lộ trình sau khi AI gen
        Task<RoadmapDetailDto> GetRoadmapDetailAsync(string roadmapId);

        Task<RoadmapDetailDto> GenerateRoadmapPreviewAsync(PersonalizedRoadmapRequest request);
        Task<string> SaveRoadmapAsync(SaveRoadmapRequestDto request);
        Task<List<UserRoadmapDto>> GetUserRoadmapsAsync(string userId);
        Task<bool> DeleteRoadmapAsync(string roadmapId);
    }
}