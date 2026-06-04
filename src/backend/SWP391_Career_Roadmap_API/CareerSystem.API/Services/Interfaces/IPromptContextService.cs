using System.Threading.Tasks;
using CareerSystem.API.DTOs;
using CareerSystem.API.Entities;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IPromptContextService
    {
        Task<(string ContextJson, string GithubContextJson)> BuildMentorContextAsync(User user, MentorAskRequestDto request);
        Task<(CareerRole TargetRole, string PassedCoursesText, string CourseCatalogJson)> BuildRoadmapContextAsync(PersonalizedRoadmapRequest request);
    }
}
