using System;
using System.Collections.Generic;

namespace CareerSystem.API.Entities;

public partial class Course
{
    public string CourseId { get; set; } = null!;

    public string CourseCode { get; set; } = null!;

    public string CourseName { get; set; } = null!;

    public int? Credits { get; set; }

    public int? TotalStudyHours { get; set; }

    public bool IsFoundationalCourse { get; set; } = false;

    public virtual ICollection<AcademicRecord> AcademicRecords { get; set; } = new List<AcademicRecord>();

    public virtual ICollection<CourseLearningOutcome> CourseLearningOutcomes { get; set; } = new List<CourseLearningOutcome>();

    public virtual ICollection<LearningResource> LearningResources { get; set; } = new List<LearningResource>();

    public virtual ICollection<SkillNode> SkillNodes { get; set; } = new List<SkillNode>();
}
