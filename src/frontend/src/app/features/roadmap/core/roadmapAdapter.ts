import { RoadmapGraph, GraphNode, GraphEdge, RoadmapDetailDto } from "./types";

/**
 * Adapter: Chuyển dữ liệu DTO từ Backend thành cấu trúc Graph (Node/Edge) độc lập
 * Bổ sung thêm các trường Legacy (skills, duration) để tương thích với UI cũ.
 */
export function mapDtoToGraph(dto: RoadmapDetailDto): RoadmapGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Collect all completed node IDs for fast lookup
    const completedNodeIds = new Set<string>();
    dto.phases.forEach((phase) => {
        phase.nodes.forEach((dtoNode) => {
            if (dtoNode.status === "COMPLETED" || dtoNode.status === "done") {
                completedNodeIds.add(dtoNode.nodeId);
            }
        });
    });

    let previousNodeId: string | null = null;

    // Lặp qua từng Phase (Zone)
    dto.phases.forEach((phase, zoneIndex) => {
        phase.nodes.forEach((dtoNode) => {
            let state: "done" | "active" | "locked" = "locked";

            if (dtoNode.status === "COMPLETED" || dtoNode.status === "done") {
                state = "done";
            } else {
                // Node is not completed yet (status is PENDING)
                if (!dtoNode.parentNodeId && !previousNodeId) {
                    // No prerequisite -> Active (ready to study)
                    state = "active";
                } else {
                    // Has prerequisite -> Active only if parent is completed
                    const parentId = dtoNode.parentNodeId || previousNodeId;
                    state = parentId && completedNodeIds.has(parentId) ? "active" : "locked";
                }
            }

            nodes.push({
                id: dtoNode.nodeId,
                zone: zoneIndex,
                data: {
                    ...dtoNode,
                    code: dtoNode.courseCode || "N/A",
                    name: dtoNode.courseName,
                    shortLabel: dtoNode.courseCode || "N/A",
                    state: state,
                    source: "university",
                    duration: "8 Weeks",
                    prerequisite: dtoNode.parentNodeId ? "Có điều kiện tiên quyết" : "Không có",
                    deadline: dtoNode.deadline,
                    academicLevel: dtoNode.academicLevel,
                    skills: ["#Coding", "#System"],
                    gpa: dtoNode.gpa
                },
            });

            // Nếu node này có cha (có đường nối từ cha tới nó)
            if (dtoNode.parentNodeId) {
                edges.push({
                    id: `edge-${dtoNode.parentNodeId}-${dtoNode.nodeId}`,
                    source: dtoNode.parentNodeId,
                    target: dtoNode.nodeId,
                    type: "required",
                });
            } else if (previousNodeId) {
                // Fallback: connect sequentially to ensure continuous roadmap line
                edges.push({
                    id: `edge-${previousNodeId}-${dtoNode.nodeId}`,
                    source: previousNodeId,
                    target: dtoNode.nodeId,
                    type: "required",
                });
            }
            
            previousNodeId = dtoNode.nodeId;
        });
    });

    return { nodes, edges };
}
