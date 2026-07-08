export interface StudentCourseDto {
  courseId: string;
  courseName: string;
  gpa: number;
  examAttempts: number | null;
}

export interface StudentDetailDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: string;
  deleteHistory: boolean;
  tags: string[];
  courses: StudentCourseDto[];
}
