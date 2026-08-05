using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IPineconeService
    {
        Task<bool> UpsertVectorsAsync(List<PineconeVectorDto> vectors, string indexUrlOverride = "", string apiKeyOverride = "");
        Task<List<string>> QuerySimilarVectorsAsync(float[] vector, int topK = 3);
    }
}
