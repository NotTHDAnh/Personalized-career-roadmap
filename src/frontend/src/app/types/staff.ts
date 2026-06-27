// ─── Staff Types ───────────────────────────────────────────────────────────
// Centralized from: StaffPanel.tsx, CourseForm.tsx

export interface CourseFormData {
  courseName: string;
  courseCode: string;
  credits: string;
  totalStudyHours: string;
  hashtags: string;
  outcomes: string;
}

export interface StaffCourse {
  code: string;
  name: string;
  duration?: string;
  skills?: string[];
}
