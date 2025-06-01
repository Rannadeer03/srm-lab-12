
import { supabase } from '../lib/supabase';

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at?: string;
}

export const subjectService = {
  async getSubjects(): Promise<Subject[]> {
    // For now, return mock subjects since we haven't created a subjects table
    return [
      { id: 'physics', name: 'Physics', code: 'PHY' },
      { id: 'chemistry', name: 'Chemistry', code: 'CHE' },
      { id: 'mathematics', name: 'Mathematics', code: 'MAT' },
      { id: 'biology', name: 'Biology', code: 'BIO' },
      { id: 'english', name: 'English', code: 'ENG' },
      { id: 'computer-science', name: 'Computer Science', code: 'CS' }
    ];
  },

  async getSubjectById(id: string): Promise<Subject | null> {
    const subjects = await this.getSubjects();
    return subjects.find(subject => subject.id === id) || null;
  }
};
