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
  id?: string;
  question_text: string;
  type: string;
  options: string[];
  correct_option: number;
  difficulty_level: string;
  explanation?: string;
  test_id?: string;
  test_name?: string;
  test_duration?: number;
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
}

export interface QuestionCreate {
  test_id: string;
  question_text: string;
  type: string;
  options: string[];
  correct_option: number;
  difficulty_level: string;
  explanation?: string;
}

export interface QuestionUpdate {
  question_text: string;
  type: string;
  options: string[];
  correct_option: number;
  difficulty_level: string;
  explanation?: string;
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
  subject_name: string;
  subject_code: string;
  upload_date: string;
  file_type: string;
}

export interface Test {
  id?: string;
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

export interface TestResult {
  test_id: string;
  student_id: string;
  answers: { question_id: string; answer: string }[];
  score: number;
  submitted_date: string;
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

  async getSubjects(): Promise<Subject[]> {
    const response = await fetch(`${API_BASE_URL}/teacher/subjects`);
    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }
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
  async createQuestion(question: Question): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error('Failed to create question');
    }
    return response.json();
  },

  async getQuestions(testId: string): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/questions/test/${testId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  },

  async updateQuestion(questionId: string, question: Partial<Question>): Promise<Question> {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    });
    if (!response.ok) {
      throw new Error('Failed to update question');
    }
    return response.json();
  },

  async deleteQuestion(questionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question');
    }
  },

  async getAllQuestions(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/student/questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  },

  async getQuestionsBySubject(subjectId: string): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/student/questions/${subjectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
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

  // Tests
  async createTest(testData: Omit<Test, 'id'>): Promise<Test> {
    try {
      console.log('Creating test with data:', testData); // Debug log
      const response = await fetch(`${API_BASE_URL}/teacher/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Test creation error:', error); // Debug log
        throw new Error(error.detail || 'Failed to create test');
      }
      
      const result = await response.json();
      console.log('Test created successfully:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Test creation error:', error);
      throw error;
    }
  },

  async updateTest(testId: string, testData: Partial<Test>): Promise<Test> {
    try {
      console.log('Updating test with data:', testData); // Debug log
      const response = await fetch(`${API_BASE_URL}/teacher/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Test update error:', error); // Debug log
        throw new Error(error.detail || 'Failed to update test');
      }
      
      const result = await response.json();
      console.log('Test updated successfully:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Test update error:', error);
      throw error;
    }
  },

  async getTests(): Promise<Test[]> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests`);
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    return response.json();
  },

  async getTest(testId: string): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/teacher/tests/${testId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch test');
    }
    return response.json();
  },

  async submitTestResult(testId: string, result: TestResult): Promise<TestResult> {
    const response = await fetch(`${API_BASE_URL}/student/tests/${testId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit test result');
    }
    return response.json();
  },

  // Student Test Views
  async getStudentTests(): Promise<Test[]> {
    const response = await fetch(`${API_BASE_URL}/student/tests`);
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    return response.json();
  },

  async getStudentTest(testId: string): Promise<Test> {
    const response = await fetch(`${API_BASE_URL}/student/tests/${testId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch test');
    }
    return response.json();
  },

  async getStudentTestsBySubject(subjectId: string): Promise<Test[]> {
    const response = await fetch(`${API_BASE_URL}/student/tests/subject/${subjectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }
    return response.json();
  },
};