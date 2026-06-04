using System.Threading.Tasks;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IGeminiService
    {
        Task<string> CallGeminiApiAsync(string prompt);
        string CleanAiJson(string text);
        string CleanJsonString(string text);
    }
}
