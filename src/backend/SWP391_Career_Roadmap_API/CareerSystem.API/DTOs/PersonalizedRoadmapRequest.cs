namespace CareerSystem.API.DTOs
{
    public class PersonalizedRoadmapRequest
    {
        public string UserId { get; set; } = null!;
        public string TargetRoleId { get; set; } = null!;
        public decimal DailyStudyHours { get; set; } // Giờ cam kết học mỗi ngày
    }
}