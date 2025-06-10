import { supabase } from '../lib/supabase';

export interface Question {
  id?: string;
  question_text: string;
  options: string[];
  correct_option: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  type: string;
  image_url?: string;
  marks?: number;
  negative_marks?: number;
  subject_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Test {
  id?: string;
  title: string;
  subject: string;
  duration: number;
  teacher_id?: string;
  is_active?: boolean;
  participants?: string[];
  
  // Test scheduling
  is_scheduled?: boolean;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  time_limit?: number | null;
  allow_late_submissions?: boolean;
  access_window_start?: string | null;
  access_window_end?: string | null;
  
  // Difficulty distribution
  easy_count?: number;
  medium_count?: number;
  hard_count?: number;
  
  // Target ratio
  target_easy?: number;
  target_medium?: number;
  target_hard?: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface TestResult {
  id?: string;
  test_id: string;
  student_id: string;
  score: number;
  total_marks: number;
  percentage: number;
  time_taken?: number;
  answers?: any;
  started_at?: string;
  submitted_at?: string;
  created_at?: string;
}

// Question operations
export const questionService = {
  async createQuestion(question: Question): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQuestionsBySubject(subjectId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId);

    if (error) throw error;
    return data || [];
  },

  async getQuestionsByDifficulty(subjectId: string, difficulty: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('difficulty_level', difficulty);

    if (error) throw error;
    return data || [];
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Test operations
export const testService = {
  async createTest(test: Test): Promise<Test> {
    const { data, error } = await supabase
      .from('tests')
      .insert([test])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTest(testId: string): Promise<Test | null> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getTestsByTeacher(teacherId: string): Promise<Test[]> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAvailableTests(subjectId?: string): Promise<Test[]> {
    let query = supabase
      .from('tests')
      .select('*')
      .eq('is_active', true);

    if (subjectId) {
      query = query.eq('subject', subjectId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateTestStatus(testId: string, isActive: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('tests')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', testId);

    if (error) throw error;
    return true;
  },

  async addQuestionsToTest(testId: string, questionIds: string[]): Promise<void> {
    const testQuestions = questionIds.map((questionId, index) => ({
      test_id: testId,
      question_id: questionId,
      question_order: index + 1
    }));

    const { error } = await supabase
      .from('test_questions')
      .insert(testQuestions);

    if (error) throw error;
  },

  async getTestQuestions(testId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('test_questions')
      .select(`
        question_order,
        questions (*)
      `)
      .eq('test_id', testId)
      .order('question_order');

    if (error) throw error;
    return data?.map(item => item.questions as Question) || [];
  }
};

// Test result operations
export const testResultService = {
  async createTestResult(testResult: TestResult): Promise<TestResult> {
    const { data, error } = await supabase
      .from('test_results')
      .insert([testResult])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTestResultsByStudent(studentId: string): Promise<TestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        tests (title, subject)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTestResultsByTest(testId: string): Promise<TestResult[]> {
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        profiles (name, email)
      `)
      .eq('test_id', testId)
      .order('score', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getStudentTestResult(testId: string, studentId: string): Promise<TestResult | null> {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('test_id', testId)
      .eq('student_id', studentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};
