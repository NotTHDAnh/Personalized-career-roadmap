using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IMentorService
    {
        Task<MentorAskResponseDto> AskAsync(MentorAskRequestDto request);
        Task<CursorPagedResponseDto<ChatMessageDto>> GetSessionHistoryAsync(string userId, string? cursor = null, int limit = 20);
        Task<SessionInitializationDto> InitializeChatSessionAsync(string userId);
        Task<bool> ClearSessionHistoryAsync(string userId);
    }
}
