using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class CareerRole
{
    public string RoleId { get; set; } = null!;

    public string RoleName { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Roadmap> Roadmaps { get; set; } = new List<Roadmap>();

    public virtual ICollection<RolePrerequisite> RolePrerequisites { get; set; } = new List<RolePrerequisite>();
}
