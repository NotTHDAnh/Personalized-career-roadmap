using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class User
{
    public string UserId { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string FullName { get; set; } = null!;

    public string? Role { get; set; }

    public string? OauthProvider { get; set; }

    public string? OauthId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? GeminiApiKey { get; set; }

    public bool Status { get; set; } = true;

    public bool DeleteHistory { get; set; } = false;

    public virtual ICollection<AcademicRecord> AcademicRecords { get; set; } = new List<AcademicRecord>();

    public virtual GithubProfile? GithubProfile { get; set; }

    public virtual ICollection<MentorSession> MentorSessions { get; set; } = new List<MentorSession>();

    public virtual ICollection<Roadmap> Roadmaps { get; set; } = new List<Roadmap>();

    public virtual ICollection<StudentSkill> StudentSkills { get; set; } = new List<StudentSkill>();
    public virtual ICollection<UserRefreshToken> UserRefreshTokens { get; set; } = new List<UserRefreshToken>();
}
