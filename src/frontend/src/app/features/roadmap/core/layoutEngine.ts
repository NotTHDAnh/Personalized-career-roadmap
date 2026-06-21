import { RoadmapGraph, ComputedRoadmapGraph } from "./types";

export interface RoadmapLayoutEngine {
    layout(graph: RoadmapGraph): ComputedRoadmapGraph;
}
