using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class Repository
{
    public string RepoId { get; set; } = null!;

    public string ProfileId { get; set; } = null!;

    public string RepoName { get; set; } = null!;

    public string RepoUrl { get; set; } = null!;

    public string? AiSummary { get; set; }

    public string? TechStack { get; set; }

    public virtual GithubProfile Profile { get; set; } = null!;
}
