using CareerSystem.API.Entities;

namespace CareerSystem.API.DTOs
{
    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public User User { get; set; } = new User();
    }
}
