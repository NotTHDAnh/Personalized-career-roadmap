// ─── Staff Types ───────────────────────────────────────────────────────────
// Centralized from: StaffPanel.tsx, CourseForm.tsx

export interface CourseFormData {
  courseName: string;
  courseCode: string;
  duration: string;
  hashtags: string;
}

export interface StaffCourse {
  code: string;
  name: string;
  duration?: string;
  skills?: string[];
}
