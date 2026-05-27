using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class JobTrend
{
    public string TrendId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public string Keyword { get; set; } = null!;

    public int? FrequencyCount { get; set; }

    public string? SourcePlatform { get; set; }

    public DateOnly ScrapeDate { get; set; }

    public virtual Skill Skill { get; set; } = null!;
}
