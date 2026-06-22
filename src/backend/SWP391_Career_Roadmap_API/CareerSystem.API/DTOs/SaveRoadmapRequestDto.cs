using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class SaveRoadmapRequestDto
    {
        public string UserId { get; set; } = string.Empty;
        public string TargetRoleId { get; set; } = string.Empty;
        public decimal DailyStudyHours { get; set; }
        public List<RoadmapPhaseDto> Phases { get; set; } = new();
    }
}
