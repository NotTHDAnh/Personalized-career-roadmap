using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class Skill
{
    public string SkillId { get; set; } = null!;

    public string SkillName { get; set; } = null!;

    public string? Category { get; set; }

    public virtual ICollection<CourseLearningOutcome> CourseLearningOutcomes { get; set; } = new List<CourseLearningOutcome>();

    public virtual ICollection<JobTrend> JobTrends { get; set; } = new List<JobTrend>();

    public virtual ICollection<LearningResource> LearningResources { get; set; } = new List<LearningResource>();

    public virtual ICollection<RolePrerequisite> RolePrerequisites { get; set; } = new List<RolePrerequisite>();

    public virtual ICollection<SkillNode> SkillNodes { get; set; } = new List<SkillNode>();

    public virtual ICollection<StudentSkill> StudentSkills { get; set; } = new List<StudentSkill>();
}
