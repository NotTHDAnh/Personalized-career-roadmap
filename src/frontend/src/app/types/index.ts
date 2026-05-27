export type Screen = "login" | "dashboard" | "staff";
export type DashTab = "profile" | "roadmap" | "mentor";

export interface CourseRecord {
  code: string;
  name: string;
  credits: number;
  prereqs: string[];
  gpa: string;
  semester: string;
}

export interface Message {
  id: number;
  role: "user" | "ai";
  content: string;
}

export type RoadmapPhase = {
  phase: string;
  colorClass: string;
  headerColor: string;
  nodes: {
    code: string;
    name: string;
    skill: string;
    status: "completed" | "in-progress" | "pending";
  }[];
};
