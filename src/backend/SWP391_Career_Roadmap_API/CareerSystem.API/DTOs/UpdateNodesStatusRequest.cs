using System.Collections.Generic;

namespace CareerSystem.API.DTOs
{
    public class UpdateNodesStatusRequest
    {
        public string RoadmapId { get; set; } = null!;
        public List<NodeStatusUpdateDto> Updates { get; set; } = new();
    }

    public class NodeStatusUpdateDto
    {
        public string NodeId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public decimal? Gpa { get; set; }
    }
}
