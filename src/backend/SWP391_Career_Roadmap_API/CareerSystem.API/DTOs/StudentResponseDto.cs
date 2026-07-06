using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class StudentResponseDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public string Code { get; set; }
        public List<string> Tags { get; set; }
        public string Date { get; set; }
        public string Avatar { get; set; }
        public bool Status { get; set; }
        public bool DeleteHistory { get; set; }
    }
}
