using CareerSystem.API.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IRoadmapService
    {
        Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request);
        Task<RoadmapDetailDto> GetRoadmapDetailAsync(string roadmapId);
        Task<List<UserRoadmapDto>> GetUserRoadmapsAsync(string userId);
        Task<bool> DeleteRoadmapAsync(string roadmapId);
        Task<bool> UpdateNodesStatusAsync(UpdateNodesStatusRequest request);
        Task<RoadmapDetailDto> GenerateRoadmapPreviewAsync(PersonalizedRoadmapRequest request);
        Task<string> SaveRoadmapAsync(SaveRoadmapRequestDto request);
    }
}