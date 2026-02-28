export interface GradeRecord {
  studentId: string;
  courseId: string;
  sectionId: string;
  assignmentId: string;
  score: number;
  grade: string;
  passingScore?: number;
}

export interface SummaryStats {
  totalStudents: number;
  overallPassRate: number;
  passCount: number;
  failCount: number;
  averageScore: number;
}

export interface AssignmentStats {
  assignmentId: string;
  passRate: number;
  averageScore: number;
  totalStudents: number;
}

export interface CourseStats {
  courseId: string;
  passRate: number;
  averageScore: number;
}
