using System;
using System.ComponentModel.DataAnnotations;

namespace CareerSystem.API.DTOs
{
    public class UpdateStudentDto
    {
        [Required]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Role { get; set; }

        public bool Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public System.Collections.Generic.List<UpdateStudentCourseDto> Courses { get; set; }
    }

    public class UpdateStudentCourseDto
    {
        [Required]
        public string CourseId { get; set; }

        [Range(5.0, 10.0, ErrorMessage = "GPA must be between 5.0 and 10.0")]
        public decimal Gpa { get; set; }

        [Range(1, 100, ErrorMessage = "Exam Attempts must be at least 1")]
        public int? ExamAttempts { get; set; }
    }
}
