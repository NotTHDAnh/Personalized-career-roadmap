using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class LearningResource
{
    public string ResourceId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public string CourseId { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Url { get; set; } = null!;

    public virtual Skill Skill { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}
