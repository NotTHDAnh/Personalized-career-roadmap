using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IRoadmapService
    {
        Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request);

        // Hàm xem lộ trình sau khi AI gen
        Task<RoadmapDetailDto> GetRoadmapDetailAsync(string roadmapId);
    }
}