// ─── Roadmap Types ─────────────────────────────────────────────────────────
// Centralized from: RoadmapTab.tsx, RoadmapNode.tsx, CourseCard.tsx

export type NodeState = "done" | "active" | "locked";

export interface SuggestedResource {
  resourceId: string;
  title: string;
  url: string;
  skillId: string;
  skillName: string;
}

export interface LearningOutcome {
  id: string;
  skillId: string;
  skillName: string;
  outcomeDescription?: string;
}

export interface CourseNode {
  id: number | string;
  name: string;
  code: string;
  shortLabel: string;
  state: NodeState;
  zone: number;
  source: "university" | "external";
  duration: string;
  prerequisite: string;
  skills: string[];
  /** Expected completion date */
  deadline?: string;
  /** Academic Level */
  academicLevel?: string;
  /** SVG coords (viewBox 0 0 1100 200) */
  cx: number;
  /** SVG coords (viewBox 0 0 1100 200) */
  cy: number;
  /** GPA score */
  gpa?: number;
  credits?: number;
  totalStudyHours?: number;
  suggestedResources?: SuggestedResource[];
  learningOutcomes?: LearningOutcome[];
}

export interface RoadmapGoal {
  title: string;
  subtitle: string;
}

export interface ZoneConfig {
  label: string;
  sub: string;
  textColor: string;
  bg: string;
  border: string;
}
