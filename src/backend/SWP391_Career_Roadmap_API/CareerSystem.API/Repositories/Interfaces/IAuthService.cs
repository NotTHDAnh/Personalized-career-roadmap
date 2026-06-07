using CareerSystem.API.DTOs;

namespace CareerSystem.API.Services.Interfaces
{
    public interface IAuthService
    {
        // Nhận vào khay LoginRequest, trả về một chuỗi thông báo (tạm thời)
        string Login(LoginRequest request);
        Task<LoginResponse?> LoginAsync(LoginRequest request);
    }
}