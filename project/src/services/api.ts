import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../config';

interface ProfileData {
  name: string;
  email: string;
  role: 'student' | 'teacher';
  registration_number?: string;
  faculty_id?: string;
  department?: string;
}

// Types
export interface Question {
  teacher_id: number;
  subject_id: string;
  question_text: string;
  options: string[];
  correct_option: string;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
}

export interface Assignment {
  _id: string;
  subject_id: string;
  title: string;
  description: string;
  due_date: string;
  filename: string;
  path: string;
  subject_name: string;
  subject_code: string;
}

export interface StudyMaterial {
  folder: string;
  subfolders: string[];
  files: string[];
}

export const authService = {
  async createProfile(data: ProfileData) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  },

  async updateProfile(id: string, data: Partial<ProfileData>) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async getProfile(id: string) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
};

// API Service
export const api = {
  // Subjects
  async addSubject(subject: Omit<Subject, '_id'>) {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subject),
    });
    return response.json();
  },

  async getSubjects() {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects`);
    return response.json();
  },

  // Questions
  async addQuestion(question: Question) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    return response.json();
  },

  async updateQuestion(questionId: string, updates: Partial<Question>) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  async deleteQuestion(questionId: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/questions/${questionId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getQuestions() {
    const response = await fetch(`${API_BASE_URL}/student/questions`);
    return response.json();
  },

  async getQuestionsBySubject(subjectId: string) {
    const response = await fetch(`${API_BASE_URL}/student/questions/${subjectId}`);
    return response.json();
  },

  // Assignments
  async uploadAssignment(
    subjectId: string,
    title: string,
    description: string,
    dueDate: string,
    file: File
  ) {
    const formData = new FormData();
    formData.append('subject_id', subjectId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate);
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/teacher/assignments`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async getAssignments() {
    const response = await fetch(`${API_BASE_URL}/teacher/assignments`);
    return response.json();
  },

  async getAssignmentsBySubject(subjectId: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/assignments/${subjectId}`);
    return response.json();
  },

  async deleteAssignment(assignmentId: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // Student Assignment Views
  async getStudentAssignments() {
    const response = await fetch(`${API_BASE_URL}/student/assignments`);
    return response.json();
  },

  async getStudentAssignmentsBySubject(subjectId: string) {
    const response = await fetch(`${API_BASE_URL}/student/assignments/${subjectId}`);
    return response.json();
  },

  // Study Materials
  async createStudyMaterialFolder(folderName: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/study-material/folders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder_name: folderName }),
    });
    return response.json();
  },

  async uploadStudyMaterial(subject: string, file: File) {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/teacher/study-material/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },

  async deleteStudyMaterialFolder(folderName: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/study-material/folders/${folderName}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  async getStudyMaterials() {
    const response = await fetch(`${API_BASE_URL}/student/study-material`);
    return response.json();
  },
};