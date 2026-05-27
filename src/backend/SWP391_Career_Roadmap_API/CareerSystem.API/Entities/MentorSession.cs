using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class MentorSession
{
    public string SessionId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual User User { get; set; } = null!;
}
