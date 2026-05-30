using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IRoadmapService
    {
        Task<string> GeneratePersonalizedRoadmapAsync(PersonalizedRoadmapRequest request);
    }
}