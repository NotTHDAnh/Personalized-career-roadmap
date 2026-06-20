using System;

namespace CareerSystem.API.Entities;

public partial class UserRefreshToken
{
    public string TokenId { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public string RefreshToken { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
