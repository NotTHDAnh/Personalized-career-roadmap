using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class Roadmap
{
    public string RoadmapId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string TargetRoleId { get; set; } = null!;

    public decimal? ProgressPercent { get; set; }

    public DateTime? CreatedAt { get; set; }

    public decimal? DailyStudyHours { get; set; }

    public virtual ICollection<SkillNode> SkillNodes { get; set; } = new List<SkillNode>();

    public virtual CareerRole TargetRole { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
