import { ComputedNode } from "./types";

/**
 * Tạo một đường cong SVG (định dạng d="M ... C ...") nối 2 điểm Node
 * Sử dụng thuật toán Cubic Bezier Curve để tạo đường lượn sóng tự nhiên (S-Curve)
 */
export const generateEdgePath = (sourceNode: ComputedNode, targetNode: ComputedNode): string => {
    const x1 = sourceNode.cx;
    const y1 = sourceNode.cy;
    const x2 = targetNode.cx;
    const y2 = targetNode.cy;

    // Khoảng cách theo chiều ngang
    const dx = x2 - x1;

    // Công thức tính 2 điểm neo (Control Points) để bẻ cong nét vẽ
    // Nhân với 0.5 để nét bẻ cong mềm ở chính giữa đoạn đường
    const cp1x = x1 + dx * 0.5;
    const cp1y = y1;

    const cp2x = x2 - dx * 0.5;
    const cp2y = y2;

    // M: Move to (Điểm bắt đầu)
    // C: Cubic Bezier (Điểm neo 1, Điểm neo 2, Điểm kết thúc)
    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
};
