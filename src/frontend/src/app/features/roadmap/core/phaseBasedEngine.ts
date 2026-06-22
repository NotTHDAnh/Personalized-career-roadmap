// import { RoadmapGraph, ComputedRoadmapGraph, ComputedNode } from "./types";
// import { RoadmapLayoutEngine } from "./layoutEngine";

// export class PhaseBasedLayoutEngine implements RoadmapLayoutEngine {
//     private startX = 75;
//     private xStep = 115;
//     private topY = 60;
//     private bottomY = 125;

//     public layout(graph: RoadmapGraph): ComputedRoadmapGraph {
//         let globalIndex = 0;

//         const computedNodes: ComputedNode[] = graph.nodes.map((node) => {
//             // Dàn đều X theo thứ tự node
//             const cx = this.startX + globalIndex * this.xStep;
//             // Trục Y nhảy zigzag lên xuống chẵn/lẻ
//             const cy = globalIndex % 2 === 0 ? this.bottomY : this.topY;

//             globalIndex++;

//             return {
//                 ...node,
//                 cx,
//                 cy,
//                 width: 64,
//                 height: 64,
//             };
//         });

//         return {
//             nodes: computedNodes,
//             edges: graph.edges, // Chuyển tiếp các đường nối
//         };
//     }
// }

import { RoadmapGraph, ComputedRoadmapGraph, ComputedNode } from "./types";
import { RoadmapLayoutEngine } from "./layoutEngine";

export class PhaseBasedLayoutEngine implements RoadmapLayoutEngine {
    private topY = 40;
    private bottomY = 100;
    private nodeSpacingX = 80; // Ultra compressed distance between nodes
    private minZoneWidth = 110; // Smaller minimum zone width to prevent empty space

    public layout(graph: RoadmapGraph): ComputedRoadmapGraph {
        let globalIndex = 0;

        // Đếm số lượng Node trong từng Zone
        const nodesInZone: Record<number, number> = {};
        const localIndexTracker: Record<number, number> = {};

        graph.nodes.forEach(n => {
            nodesInZone[n.zone] = (nodesInZone[n.zone] || 0) + 1;
            localIndexTracker[n.zone] = 0;
        });

        // Tìm số lượng zone tối đa
        const maxZone = Math.max(...Object.keys(nodesInZone).map(Number), 0);
        const computedZones: { x: number; width: number }[] = [];
        let currentX = 0;

        // Tính toán kích thước động cho từng Zone dựa trên số lượng Node
        for (let i = 0; i <= maxZone; i++) {
            const count = nodesInZone[i] || 0;
            const width = Math.max(this.minZoneWidth, count > 0 ? (count + 0.8) * this.nodeSpacingX : this.minZoneWidth);
            computedZones.push({ x: currentX, width });
            currentX += width;
        }

        const computedNodes: ComputedNode[] = graph.nodes.map((node) => {
            const zoneInfo = computedZones[node.zone];
            const localIndex = localIndexTracker[node.zone];
            const countInZone = nodesInZone[node.zone];

            // Tự động chia đều không gian bên trong 1 Zone dựa theo số lượng Node
            const localStep = zoneInfo.width / (countInZone + 1);
            const cx = zoneInfo.x + localStep * (localIndex + 1);
            const cy = globalIndex % 2 === 0 ? this.bottomY : this.topY;

            localIndexTracker[node.zone]++;
            globalIndex++;

            return {
                ...node,
                cx,
                cy,
                width: 64,
                height: 64,
            };
        });

        return {
            nodes: computedNodes,
            edges: graph.edges,
            zones: computedZones
        };
    }
}
