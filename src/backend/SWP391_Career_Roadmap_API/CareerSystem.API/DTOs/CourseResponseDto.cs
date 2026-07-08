using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class CourseResponseDto
    {
        public string CourseId { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public int Credits { get; set; }
        public int TotalStudyHours { get; set; }
        public List<string> Skills { get; set; }
    }
}
