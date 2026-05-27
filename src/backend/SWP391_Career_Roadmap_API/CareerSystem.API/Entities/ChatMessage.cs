using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class ChatMessage
{
    public string MessageId { get; set; } = null!;

    public string SessionId { get; set; } = null!;

    public string Sender { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime? Timestamp { get; set; }

    public virtual MentorSession Session { get; set; } = null!;
}
