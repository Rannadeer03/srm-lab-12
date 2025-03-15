export interface Question {
  id?: number;
  text: string;
  type: 'text' | 'image';
  options: string[];
  correctAnswer: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  subject?: string;
  explanation?: string;
} 