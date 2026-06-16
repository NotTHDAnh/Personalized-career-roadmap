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

export type RoadmapPreview = Record<string, unknown>;
