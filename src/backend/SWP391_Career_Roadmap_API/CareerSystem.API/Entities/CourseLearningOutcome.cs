using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class CourseLearningOutcome
{
    public string Id { get; set; } = null!;

    public string CourseId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public string? OutcomeDescription { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Skill Skill { get; set; } = null!;
}
