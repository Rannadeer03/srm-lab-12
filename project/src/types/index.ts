export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface Question {
  teacher_id: number;
  subject_id: string;
  question_text: string;
  options: string[];
  correct_option: string;
  type: 'text' | 'image';
  image_url?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface Test {
  id?: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  participants?: string[];
  test_schedule?: {
    isScheduled: boolean;
    scheduledDate: string;
    scheduledTime: string;
    timeLimit: number;
    allowLateSubmissions: boolean;
    accessWindow: { start: string; end: string };
  };
  difficulty_distribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  target_difficulty_ratio?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface TestResult {
  id: string;
  testId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}