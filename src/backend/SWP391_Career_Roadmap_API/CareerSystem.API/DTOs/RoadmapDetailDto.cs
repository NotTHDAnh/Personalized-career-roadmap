namespace CareerSystem.API.DTOs
{
    public class RoadmapDetailDto
    {
        public string RoadmapId { get; set; } = null!;
        public string TargetRoleName { get; set; } = null!;
        public decimal DailyStudyHours { get; set; }
        public decimal ProgressPercent { get; set; }
        public List<RoadmapPhaseDto> Phases { get; set; } = new();
    }

    public class RoadmapPhaseDto
    {
        public string PhaseName { get; set; } = null!;
        public List<SkillNodeDetailDto> Nodes { get; set; } = new();
    }

    public class SkillNodeDetailDto
    {
        public string NodeId { get; set; } = null!;
        public string? CourseCode { get; set; }
        public string? CourseName { get; set; }
        public string Status { get; set; } = null!;
        public DateOnly? Deadline { get; set; }
        public string? ParentNodeId { get; set; }
        public string? AcademicLevel { get; set; }
        public decimal? Gpa { get; set; }
    }
}