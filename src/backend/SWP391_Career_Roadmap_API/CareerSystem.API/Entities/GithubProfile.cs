using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class GithubProfile
{
    public string ProfileId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string GithubUsername { get; set; } = null!;

    public string? PortfolioUrl { get; set; }

    public string? GithubAccessToken { get; set; }

    public string? AvatarUrl { get; set; }

    public virtual ICollection<Repository> Repositories { get; set; } = new List<Repository>();

    public virtual User User { get; set; } = null!;
}
