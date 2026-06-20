// ─── Mentor Types ──────────────────────────────────────────────────────────
// Centralized from: MentorTab.tsx

export type MentorAskResponse = {
  targetRoleId?: string;
  targetRoleName?: string;
  followUpQuestion?: string;
  answer?: string;
  recommendedCareers?: string[];
  missingSkills?: string[];
};

export type GenerateRoadmapResponse = {
  message?: string;
  roadmapId?: string;
};

// export type RoadmapPreview = Record<string, unknown>;

export type SkillNodeDetail = {
  nodeId: string;
  courseCode?: string | null;
  courseName?: string | null;
  status: string;
  deadline?: string | null;
  parentNodeId?: string | null;
};

export type RoadmapPreview = {
  roadmapId: string;
  targetRoleName: string;
  dailyStudyHours: number;
  progressPercent: number;
  nodes: SkillNodeDetail[];
};
