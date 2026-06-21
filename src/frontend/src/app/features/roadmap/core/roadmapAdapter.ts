import { RoadmapGraph, GraphNode, GraphEdge, RoadmapDetailDto } from "./types";

/**
 * Adapter: Chuyển dữ liệu DTO từ Backend thành cấu trúc Graph (Node/Edge) độc lập
 * Bổ sung thêm các trường Legacy (skills, duration) để tương thích với UI cũ.
 */
export function mapDtoToGraph(dto: RoadmapDetailDto): RoadmapGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Lặp qua từng Phase (Zone)
    dto.phases.forEach((phase, zoneIndex) => {
        phase.nodes.forEach((dtoNode) => {
            nodes.push({
                id: dtoNode.nodeId,
                zone: zoneIndex,
                // Chế biến (Adapt) dữ liệu ở đây để UI không bị sập
                data: {
                    ...dtoNode,
                    // Map các trường DTO sang định dạng mà RoadmapNode và CourseCard cần:
                    name: dtoNode.courseName,
                    shortLabel: dtoNode.courseCode || "N/A",
                    state: dtoNode.status === "COMPLETED" || dtoNode.status === "done" ? "done" : dtoNode.status === "PENDING" ? "locked" : "active",
                    source: "university", // Cứng tạm
                    duration: "8 Weeks",  // Cứng tạm
                    prerequisite: dtoNode.parentNodeId ? "Có điều kiện tiên quyết" : "Không có",
                    skills: ["#Coding", "#System"] // DÙNG MẢNG MẶC ĐỊNH ĐỂ KHÔNG BỊ LỖI .map()
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
            }
        });
    });

    return { nodes, edges };
}
