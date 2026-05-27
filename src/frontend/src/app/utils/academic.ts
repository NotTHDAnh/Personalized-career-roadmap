import type { CourseRecord } from "../types";

export function calcWeightedGPA(courses: CourseRecord[]) {
  const valid = courses.filter((c) => c.gpa && parseFloat(c.gpa) > 0);
  if (!valid.length) return "—";
  const totalPoints = valid.reduce((s, c) => s + parseFloat(c.gpa) * c.credits, 0);
  const totalCredits = valid.reduce((s, c) => s + c.credits, 0);
  return (totalPoints / totalCredits).toFixed(2);
}

export function getMissingPrereqs(course: CourseRecord, enrolledCodes: string[]): string[] {
  return course.prereqs.filter((p) => !enrolledCodes.includes(p));
}
