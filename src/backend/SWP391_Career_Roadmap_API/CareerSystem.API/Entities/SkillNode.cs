using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class SkillNode
{
    public string NodeId { get; set; } = null!;

    public string RoadmapId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public string? ParentNodeId { get; set; }

    public string? Status { get; set; }

    public DateOnly? Deadline { get; set; }

    public string? CourseId { get; set; }

    public virtual Course? Course { get; set; }

    public virtual ICollection<SkillNode> InverseParentNode { get; set; } = new List<SkillNode>();

    public virtual SkillNode? ParentNode { get; set; }

    public virtual Roadmap Roadmap { get; set; } = null!;

    public virtual Skill Skill { get; set; } = null!;
}
