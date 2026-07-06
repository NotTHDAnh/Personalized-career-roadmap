using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class StudentDetailDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string CreatedAt { get; set; }
        public bool Status { get; set; }
        public bool DeleteHistory { get; set; }
        public List<string> Tags { get; set; }
        public List<StudentCourseDto> Courses { get; set; } = new List<StudentCourseDto>();
    }

    public class StudentCourseDto
    {
        public string CourseId { get; set; }
        public string CourseName { get; set; }
        public decimal Gpa { get; set; }
    }
}
