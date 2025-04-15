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

export interface CourseMaterial {
  _id: string;
  subject_id: string;
  title: string;
  description: string;
  materialType: string;
  filename: string;
  stored_filename: string;
  path: string;
  file_path?: string;
  subject_name: string;
  subject_code: string;
  upload_date: string;
  file_type: string;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
  participants?: string[];
  test_schedule?: {
    is_scheduled: boolean;
    scheduled_date: string;
    scheduled_time: string;
    time_limit: number;
    allow_late_submissions: boolean;
    access_window: {
      start: string;
      end: string;
    };
  };
  difficulty_distribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
  target_ratio?: {
    easy: number;
    medium: number;
    hard: number;
  };
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
  baseUrl: API_BASE_URL,

  // Subjects
  async addSubject(subject: Omit<Subject, '_id'>) {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: subject.name,
        code: subject.code
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to add subject');
    }
    return response.json();
  },

  async getSubjects() {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects`);
    return response.json();
  },

  async deleteSubject(subjectId: string) {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects/${subjectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete subject');
    }
    return response.json();
  },

  async deleteAllSubjects() {
    try {
      const subjects = await this.getSubjects();
      const deletePromises = subjects.map((subject: Subject) => this.deleteSubject(subject._id));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting subjects:', error);
      throw new Error('Failed to delete all subjects');
    }
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
  ): Promise<Assignment> {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF and Word documents are allowed');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size should not exceed 10MB');
    }

    const formData = new FormData();
    formData.append('subject_id', subjectId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('due_date', dueDate);
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/assignments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload assignment' }));
        throw new Error(errorData.detail || 'Failed to upload assignment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload assignment');
    }
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

  async uploadCourseMaterial(
    subject_id: string,
    title: string,
    description: string,
    materialType: string,
    file: File
  ): Promise<CourseMaterial> {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'video/mp4',
      'video/webm'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, Word, PowerPoint, and video files are allowed');
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size should not exceed 100MB');
    }

    const formData = new FormData();
    formData.append('subject_id', subject_id);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('material_type', materialType);
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/teacher/course-material`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to upload course material' }));
        throw new Error(errorData.detail || 'Failed to upload course material');
      }

      return response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Failed to upload course material');
    }
  },

  async getCourseMaterialsBySubject(subject_id: string): Promise<CourseMaterial[]> {
    const response = await fetch(`${API_BASE_URL}/teacher/course-material/${subject_id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course materials');
    }
    return response.json();
  },

  async downloadCourseMaterial(materialPath: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/materials/${materialPath}`);
    if (!response.ok) {
      throw new Error('Failed to download material');
    }
    return response.blob();
  },

  async getStudentCourseMaterials(subject_id: string): Promise<CourseMaterial[]> {
    const response = await fetch(`${API_BASE_URL}/student/course-material/${subject_id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch course materials');
    }
    return response.json();
  },

  async createTest(testData: Omit<Test, 'id'>): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    if (!response.ok) {
      throw new Error('Failed to create test');
    }
    return response.json();
  },

  async updateTest(testId: string, testData: Partial<Test>): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests/${testId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    if (!response.ok) {
      throw new Error('Failed to update test');
    }
    return response.json();
  },
};