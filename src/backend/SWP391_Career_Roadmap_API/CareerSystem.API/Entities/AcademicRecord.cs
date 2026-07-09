using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class AcademicRecord
{
    public string RecordId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string CourseId { get; set; } = null!;

    public decimal? Gpa { get; set; }

    public int? ExamAttempts { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
