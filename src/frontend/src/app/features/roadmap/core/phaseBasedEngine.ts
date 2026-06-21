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
    private topY = 60;
    private bottomY = 125;
    private zoneWidth = 275; // Bề ngang mỗi cột Phase trên bản đồ là 275px

    public layout(graph: RoadmapGraph): ComputedRoadmapGraph {
        let globalIndex = 0;

        // Đếm xem mỗi Zone (Phase) đang có bao nhiêu Node
        const nodesInZone: Record<number, number> = {};
        const localIndexTracker: Record<number, number> = {};

        graph.nodes.forEach(n => {
            nodesInZone[n.zone] = (nodesInZone[n.zone] || 0) + 1;
            localIndexTracker[n.zone] = 0; // Khởi tạo đếm thứ tự node bên trong 1 zone
        });

        const computedNodes: ComputedNode[] = graph.nodes.map((node) => {
            const zoneStart = node.zone * this.zoneWidth; // Điểm bắt đầu của cột Zone (0, 275, 550, 825)
            const localIndex = localIndexTracker[node.zone]; // Node này đứng thứ mấy trong Zone của nó?
            const countInZone = nodesInZone[node.zone];

            // Tự động chia đều không gian bên trong 1 Zone dựa theo số lượng Node
            // (Ví dụ Zone có 3 node thì chia cột làm 4 phần)
            const localStep = this.zoneWidth / (countInZone + 1);

            // X sẽ hoàn toàn nằm gọn bên trong Zone của nó
            const cx = zoneStart + localStep * (localIndex + 1);

            // Trục Y vẫn lượn zigzag chẵn/lẻ để đường S-Curve uốn lượn đẹp
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
        };
    }
}
