using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class StudentSkill
{
    public string StudentSkillId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public string? Source { get; set; }

    public virtual Skill Skill { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
