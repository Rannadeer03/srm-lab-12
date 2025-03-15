export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  dueDate: string;
}

export interface TestResult {
  id: string;
  testId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}