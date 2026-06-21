import { ComputedRoadmapGraph } from "../core/types";
import { generateEdgePath } from "../core/edgePathGenerator";
import { RoadmapNode } from "./RoadmapNode";
import { GoalNode } from "./GoalNode";
import { COLORS } from "@/shared/constants/colors";

interface RoadmapCanvasProps {
    graph: ComputedRoadmapGraph;
    goal: { title: string; subtitle: string };
    zones: { label: string; sub: string; textColor: string; bg: string; border: string }[];
}

export function RoadmapCanvas({ graph, goal, zones }: RoadmapCanvasProps) {
    const ZONE_WIDTH = 275;
    const canvasWidth = Math.max(1100, zones.length * ZONE_WIDTH);

    return (
        <>
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${canvasWidth} 200`}
                preserveAspectRatio="none"
            >
                {/* Đổ màu nền cho các Zone */}
                {zones.map((zone, i) => (
                    <rect key={i} x={i * ZONE_WIDTH} y="0" width={ZONE_WIDTH} height="200" fill={zone.bg} opacity="0.6" />
                ))}

                {/* Vẽ vạch phân cách đứt nét */}
                {Array.from({ length: Math.max(0, zones.length - 1) }).map((_, i) => {
                    const x = (i + 1) * ZONE_WIDTH;
                    return <line key={x} x1={x} y1="0" x2={x} y2="200" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="5,4" />;
                })}

                {/* VẼ CÁC ĐƯỜNG NỐI (EDGES) TỰ ĐỘNG */}
                {graph.edges.map((edge) => {
                    const sourceNode = graph.nodes.find((n) => n.id === edge.source);
                    const targetNode = graph.nodes.find((n) => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    const pathString = generateEdgePath(sourceNode, targetNode);

                    // Trạng thái đã học (done) thì màu đậm, chưa học thì màu xám nhạt đứt nét
                    const isCompleted = sourceNode.data.status === "done" || sourceNode.data.status === "COMPLETED";
                    const strokeColor = isCompleted ? COLORS.TEAL_ACCENT : "#94A3B8";

                    return (
                        <path
                            key={edge.id}
                            d={pathString}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            strokeDasharray={!isCompleted ? "10,6" : "none"}
                        />
                    );
                })}
            </svg>

            {/* RENDER CÁC NÚT MÔN HỌC */}
            {graph.nodes.map((computedNode) => {
                // Ép kiểu tạm thời để dùng lại đúng component cũ
                const legacyNodeFormat = {
                    ...computedNode.data,
                    id: computedNode.id,
                    cx: computedNode.cx,
                    cy: computedNode.cy,
                };
                return <RoadmapNode key={computedNode.id} node={legacyNodeFormat} />;
            })}

            {/* Đích đến */}
            <GoalNode goal={goal} />
        </>
    );
}
