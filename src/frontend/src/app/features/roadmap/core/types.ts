export interface GraphNode {
    id: string;
    data: any;       // Chứa dữ liệu gốc từ API
    zone: number;    // Vị trí cột (Phase index: 0, 1, 2...)
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
}

export interface RoadmapGraph {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface ComputedNode extends GraphNode {
    cx: number;
    cy: number;
    width?: number;
    height?: number;
}

export interface ComputedRoadmapGraph {
    nodes: ComputedNode[];
    edges: GraphEdge[];
}

// Cấu trúc DTO (Data Transfer Object) mô phỏng Backend
export interface SkillNodeDetailDto {
    nodeId: string;
    courseCode?: string;
    courseName?: string;
    status: string;
    deadline?: string;
    parentNodeId?: string;
    academicLevel?: string;
}

export interface RoadmapPhaseDto {
    phaseName: string;
    nodes: SkillNodeDetailDto[];
}

export interface RoadmapDetailDto {
    roadmapId: string;
    targetRoleName: string;
    dailyStudyHours: number;
    progressPercent: number;
    phases: RoadmapPhaseDto[];
}
