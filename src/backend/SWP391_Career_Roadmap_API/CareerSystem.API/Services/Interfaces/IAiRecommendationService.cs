using System.Collections.Generic;
using System.Threading.Tasks;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IAiRecommendationService
    {
        Task<MentorAskResponseDto> GetMentorAdviceAsync(string contextJson, string githubContextJson, string question);
        Task<List<AiCourseRecommendationDto>> GetRoadmapCoursesAsync(CareerRole targetRole, string passedCoursesText, string courseCatalogJson);
    }
}
