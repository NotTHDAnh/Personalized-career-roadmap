using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class CourseDetailDto
    {
        public string CourseId { get; set; } = null!;
        public string CourseCode { get; set; } = null!;
        public string CourseName { get; set; } = null!;
        public int? Credits { get; set; }
        public int? TotalStudyHours { get; set; }
        public List<LearningResourceDto> SuggestedResources { get; set; } = new();
    }
}
