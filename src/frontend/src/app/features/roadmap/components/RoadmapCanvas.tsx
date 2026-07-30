import { ComputedRoadmapGraph } from "../core/types";
import { generateEdgePath } from "../core/edgePathGenerator";
import { RoadmapNode } from "./RoadmapNode";
import { GoalNode } from "./GoalNode";

interface RoadmapCanvasProps {
    graph: ComputedRoadmapGraph;
    goal: { title: string; subtitle: string };
    zones: { label: string; sub: string; textColor: string; bg: string; border?: string }[];
}

// Background silhouettes for the bottom of each zone
const ZONE_GRAPHICS = [
    // Phase 1: Trees/Forest
    <path key="trees" d="M0,200 L0,160 L30,130 L45,150 L75,110 L105,145 L135,100 L165,140 L195,115 L230,155 L255,135 L275,160 L275,200 Z" fill="rgba(255,255,255,0.4)" />,
    // Phase 2: Mountains
    <path key="mountains" d="M0,200 L0,170 L50,110 L90,140 L160,80 L220,135 L275,105 L275,200 Z" fill="rgba(255,255,255,0.3)" />,
    // Phase 3: City Skyline
    <path key="city" d="M0,200 L0,150 L20,150 L20,110 L45,110 L45,135 L65,135 L65,80 L95,80 L95,125 L120,125 L120,60 L160,60 L160,115 L185,115 L185,90 L220,90 L220,140 L250,140 L250,110 L275,110 L275,200 Z" fill="rgba(255,255,255,0.25)" />,
    // Phase 4: Glow/Target area (no jagged silhouette, just a soft curve)
    <path key="target" d="M0,200 L0,180 Q137.5,130 275,180 L275,200 Z" fill="rgba(255,255,255,0.3)" />
];

export function RoadmapCanvas({ graph, goal, zones }: RoadmapCanvasProps) {
    const canvasWidth = graph.zones 
      ? graph.zones[graph.zones.length - 1].x + graph.zones[graph.zones.length - 1].width 
      : 1000;

    return (
        <>
            <svg 
                viewBox={`0 0 ${canvasWidth} 160`} 
                className="absolute top-0 left-0 w-full h-full"
                preserveAspectRatio="none"
            >
                {/* Draw Zones and vertical boundaries */}
                {graph.zones?.map((zoneMeta, i) => {
                    // Fallback to a default zone style if zones array is empty or undefined
                    const defaultZone = { label: "", sub: "", textColor: "#000", bg: "rgba(255, 255, 255, 0)" };
                    const zoneStyle = (zones && zones.length > 0) 
                        ? (zones[i] || zones[zones.length - 1]) 
                        : defaultZone;
                        
                    return (
                        <g key={`zone-${i}`} transform={`translate(${zoneMeta.x}, 0)`}>
                            {/* Flat Background */}
                            <rect x="0" y="0" width={zoneMeta.width} height="160" fill={zoneStyle.bg} />
                            {/* Vertical Boundary line */}
                            {i > 0 && (
                                <line 
                                    x1="0" y1="0" x2="0" y2="160" 
                                    stroke="rgba(200,200,200,0.5)" 
                                    strokeWidth="1" 
                                    strokeDasharray="6,6" 
                                />
                            )}
                        </g>
                    );
                })}

                {/* VẼ CÁC ĐƯỜNG NỐI (EDGES) TỰ ĐỘNG */}
                {graph.edges.map((edge) => {
                    const sourceNode = graph.nodes.find((n) => n.id === edge.source);
                    const targetNode = graph.nodes.find((n) => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;

                    const pathString = generateEdgePath(sourceNode, targetNode);

                    const isCompleted = sourceNode.data.status === "done" || sourceNode.data.status === "COMPLETED";
                    
                    const phaseColors = ["#4CAF50", "#3B82F6", "#8B5CF6"];
                    const sourceZoneIdx = sourceNode.zone !== undefined ? sourceNode.zone : 0;
                    const strokeColor = phaseColors[sourceZoneIdx % phaseColors.length];

                    return (
                        <path
                            key={edge.id}
                            d={pathString}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={isCompleted ? "none" : "8, 12"}
                            opacity={isCompleted ? 1 : 0.8}
                        />
                    );
                })}
            </svg>

            {/* RENDER CÁC NÚT MÔN HỌC */}
            {graph.nodes.map((computedNode) => {
                const legacyNodeFormat = {
                    ...computedNode.data,
                    id: computedNode.id,
                    zone: computedNode.zone,
                    cx: computedNode.cx,
                    cy: computedNode.cy,
                };
                return <RoadmapNode key={computedNode.id} node={legacyNodeFormat} canvasWidth={canvasWidth} />;
            })}

        </>
    );
}
