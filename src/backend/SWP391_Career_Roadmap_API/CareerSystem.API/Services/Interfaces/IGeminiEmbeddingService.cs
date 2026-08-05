namespace CareerSystem.API.Services.Interfaces
{
    public interface IGeminiEmbeddingService
    {
        Task<float[]> GetEmbeddingAsync(string text);
    }
}
