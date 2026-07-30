namespace CareerSystem.API.DTOs
{
    public class UserRoadmapDto
    {
        public string RoadmapId { get; set; } = string.Empty;
        public string TargetRoleId { get; set; } = string.Empty;
        public string TargetRoleName { get; set; } = string.Empty;
        public System.DateTime? CreatedAt { get; set; }
    }
}
