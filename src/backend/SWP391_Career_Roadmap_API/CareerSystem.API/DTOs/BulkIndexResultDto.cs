namespace CareerSystem.API.DTOs
{
    public class BulkIndexResultDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int TotalIndexed { get; set; }
        public int CoursesIndexed { get; set; }
        public int SkillsIndexed { get; set; }
        public int RolesIndexed { get; set; }
        public int ResourcesIndexed { get; set; }
        public double DurationSeconds { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public class PineconeVectorDto
    {
        public string Id { get; set; } = string.Empty;
        public float[] Values { get; set; } = Array.Empty<float>();
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();
    }
}
