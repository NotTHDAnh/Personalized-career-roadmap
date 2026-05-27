using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class RolePrerequisite
{
    public string Id { get; set; } = null!;

    public string RoleId { get; set; } = null!;

    public string SkillId { get; set; } = null!;

    public virtual CareerRole Role { get; set; } = null!;

    public virtual Skill Skill { get; set; } = null!;
}
