using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IMentorService
    {
        Task<MentorAskResponseDto> AskAsync(MentorAskRequestDto request);
        Task<List<ChatMessageDto>> GetSessionHistoryAsync(string userId);
        Task<SessionInitializationDto> InitializeChatSessionAsync(string userId);
    }
}
