using CareerSystem.API.DTOs;
using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IApiKeyService
    {
        Task<UserApiKeyStatusDto> GetApiKeyStatusAsync(string userId);
        Task UpdateApiKeyAsync(string userId, string apiKey);
        Task DeleteApiKeyAsync(string userId);
    }
}
