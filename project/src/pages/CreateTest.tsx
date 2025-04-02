import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Image as ImageIcon, Type, Upload } from 'lucide-react';
import { api } from '../services/api';
import type { Subject, Question, Test } from '../services/api';
import { toast } from 'react-hot-toast';

// Define proper enum for difficulty levels
enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Define proper enum for question types
enum QuestionType {
  TEXT = 'text',
  IMAGE = 'image'
}

interface DifficultyDistribution {
  [DifficultyLevel.EASY]: number;
  [DifficultyLevel.MEDIUM]: number;
  [DifficultyLevel.HARD]: number;
}

// Form handling interface that matches the component's property names
interface QuestionFormData {
  id: number;
  question_text: string;
  type: 'text' | 'image';
  image_url?: string;
  options: string[];
  correct_option: number; // Keep as number for form handling, convert to string when submitting
  difficulty_level: DifficultyLevel;
  explanation?: string;
}

// Update the participants state with proper typing and initial value
interface Participant {
  email: string;
  id: string;
}

// Add or update the TestSchedule interface
interface TestSchedule {
  isScheduled: boolean;
  scheduledDate: string;
  scheduledTime: string;
  timeLimit: number;
  allowLateSubmissions: boolean;
  accessWindow: {
    start: string;
    end: string;
  };
}

export const CreateTest: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const testToEdit = location.state?.testToEdit;
    const isEditing = !!testToEdit;

    const [testTitle, setTestTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [duration, setDuration] = useState('');
    const [questions, setQuestions] = useState<QuestionFormData[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData>({
      id: 1,
      question_text: '',
      type: 'text',
      options: ['', '', '', ''],
      correct_option: -1,
      difficulty_level: DifficultyLevel.MEDIUM
    });

    const [targetRatio, setTargetRatio] = useState({
      [DifficultyLevel.EASY]: testToEdit?.targetDifficultyRatio?.easy || 30,
      [DifficultyLevel.MEDIUM]: testToEdit?.targetDifficultyRatio?.medium || 50,
      [DifficultyLevel.HARD]: testToEdit?.targetDifficultyRatio?.hard || 20
    });

    const [difficultyDistribution, setDifficultyDistribution] = useState<DifficultyDistribution>({
      [DifficultyLevel.EASY]: testToEdit?.difficultyDistribution?.easy || 0,
      [DifficultyLevel.MEDIUM]: testToEdit?.difficultyDistribution?.medium || 0,
      [DifficultyLevel.HARD]: testToEdit?.difficultyDistribution?.hard || 0
    });

    const [error, setError] = useState<string | null>(null);
  const [testSchedule, setTestSchedule] = useState<TestSchedule>({
      isScheduled: false,
      scheduledDate: '',
      scheduledTime: '',
      timeLimit: 60,
      allowLateSubmissions: false,
      accessWindow: {
        start: '',
        end: ''
      }
    });


    // Update the participants state with proper typing and initial value
    const [participants, setParticipants] = useState<Participant[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch subjects when component mounts
    useEffect(() => {
      const fetchSubjects = async () => {
        try {
          setLoading(true);
          const fetchedSubjects = await api.getSubjects();
          setSubjects(fetchedSubjects);
          
          // If editing, keep the existing subject, otherwise set to first available subject
          if (!isEditing && fetchedSubjects.length > 0) {
            setSubject(fetchedSubjects[0].name);
          }
        } catch (err) {
          console.error('Error fetching subjects:', err);
          setError('Failed to load subjects. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchSubjects();
    }, [isEditing]);

    useEffect(() => {
      if (testToEdit) {
        setTestTitle(testToEdit.name);
        setSubject(testToEdit.subject);
        setDuration(testToEdit.duration.toString());
        setQuestions(testToEdit.questions);
        setCurrentQuestion(testToEdit.questions[0] || {
          id: 1,
          question_text: '',
          type: 'text',
          options: ['', '', '', ''],
          correct_option: -1,
          difficulty_level: DifficultyLevel.MEDIUM
        });
        setDifficultyDistribution(testToEdit.difficultyDistribution);
        setTargetRatio(testToEdit.targetDifficultyRatio || {
          [DifficultyLevel.EASY]: 30,
          [DifficultyLevel.MEDIUM]: 50,
          [DifficultyLevel.HARD]: 20
        });
      }
    }, [testToEdit]);

    useEffect(() => {
      const newDistribution = questions.reduce(
        (acc: DifficultyDistribution, q) => {
          acc[q.difficulty_level as DifficultyLevel]++;
          return acc;
        },
        {
          [DifficultyLevel.EASY]: 0,
          [DifficultyLevel.MEDIUM]: 0,
          [DifficultyLevel.HARD]: 0
        }
      );
      setDifficultyDistribution(newDistribution);
    }, [questions]);

    const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    const handleOptionImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('image', file);

          const response = await fetch(`${api.baseUrl}/upload-image`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          const newOptions = [...currentQuestion.options];
          newOptions[index] = data.imageUrl;
          setCurrentQuestion({ ...currentQuestion, options: newOptions });
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        }
      }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          // Create FormData for file upload
          const formData = new FormData();
          formData.append('image', file);

          // Upload image to server
          const response = await fetch(`${api.baseUrl}/upload-image`, {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload image');
          }

          const data = await response.json();
          setCurrentQuestion({
            ...currentQuestion,
            image_url: data.imageUrl
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Failed to upload image. Please try again.');
        }
      }
    };

    const handleSaveQuestion = () => {
      if (currentQuestionIndex < questions.length) {
        // Update existing question
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex] = currentQuestion;
        setQuestions(updatedQuestions);
      } else {
        // Add new question
        setQuestions([...questions, currentQuestion]);
      }

      // Prepare for new question
      const newQuestion: QuestionFormData = {
        id: questions.length + 1,
        question_text: '',
        type: 'text',
        options: ['', '', '', ''],
        correct_option: -1,
        difficulty_level: DifficultyLevel.MEDIUM
      };

      // Set the new question as current and move to it
      setCurrentQuestion(newQuestion);
      setCurrentQuestionIndex(questions.length);

      // Show success message
      setError('Question saved successfully! Please enter the next question.');
    };

    const handleNextQuestion = () => {
      if (currentQuestionIndex < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentQuestion(questions[currentQuestionIndex + 1] || {
          id: questions.length + 1,
          question_text: '',
          type: 'text',
          options: ['', '', '', ''],
          correct_option: -1,
          difficulty_level: DifficultyLevel.MEDIUM
        });
      }
    };

    const handlePreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setCurrentQuestion(questions[currentQuestionIndex - 1]);
      }
    };

    const handleDeleteQuestion = () => {
      const updatedQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
      setQuestions(updatedQuestions);
      if (currentQuestionIndex >= updatedQuestions.length) {
        setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
      }
      if (updatedQuestions.length === 0) {
        setCurrentQuestion({
          id: 1,
          question_text: '',
          type: 'text',
          options: ['', '', '', ''],
          correct_option: -1,
          difficulty_level: DifficultyLevel.MEDIUM
        });
      } else {
        setCurrentQuestion(updatedQuestions[currentQuestionIndex]);
      }
    };

    const handleSubmitTest = async () => {
      try {
        // Validate test data
        if (!testTitle.trim()) {
          toast.error('Please enter a test title');
          return;
        }
        if (!subject) {
          toast.error('Please select a subject');
          return;
        }
        if (!duration || parseInt(duration) <= 0) {
          toast.error('Please enter a valid duration');
          return;
        }
        if (questions.length === 0) {
          toast.error('Please add at least one question');
          return;
        }

        // Validate all questions
        for (const question of questions) {
          if (!question.question_text.trim()) {
            toast.error('All questions must have text');
            return;
          }
          if (!question.options || question.options.length < 2) {
            toast.error('All questions must have at least 2 options');
            return;
          }
          if (question.correct_option === undefined || question.correct_option < 0) {
            toast.error('All questions must have a correct option selected');
            return;
          }
          if (!question.difficulty_level) {
            toast.error('All questions must have a difficulty level');
            return;
          }
        }

        // Find the subject ID from the subjects array
        const selectedSubject = subjects.find(s => s.name === subject);
        if (!selectedSubject) {
          throw new Error('Selected subject not found');
        }

        // Prepare test data
        const testData: Omit<Test, 'id'> = {
          title: testTitle,
          subject: selectedSubject._id,
          duration: parseInt(duration),
          questions: questions.map(q => ({
            question_text: q.question_text,
            type: q.type || 'multiple_choice',
            options: q.options,
            correct_option: q.correct_option,
            difficulty_level: q.difficulty_level,
            explanation: q.explanation
          })),
          participants: [],
          test_schedule: {
            is_scheduled: false,
            scheduled_date: '',
            scheduled_time: '',
            time_limit: 0,
            allow_late_submissions: false,
            access_window: {
              start: '',
              end: ''
            }
          },
          difficulty_distribution: {
            easy: questions.filter(q => q.difficulty_level === 'easy').length,
            medium: questions.filter(q => q.difficulty_level === 'medium').length,
            hard: questions.filter(q => q.difficulty_level === 'hard').length
          },
          target_ratio: {
            easy: 0.3,
            medium: 0.5,
            hard: 0.2
          }
        };

        console.log('Submitting test data:', testData); // Debug log

        // Submit test
        await api.createTest(testData);
        
        toast.success('Test created successfully!');
        navigate('/teacher/tests');
      } catch (error) {
        console.error('Error creating test:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to create test');
      }
    };

    const handleRatioChange = (level: DifficultyLevel, value: number) => {
      const newRatio = { ...targetRatio, [level]: value };
      const total = Object.values(newRatio).reduce((sum, val) => sum + val, 0);
      
      if (total <= 100) {
        setTargetRatio(newRatio);
      }
    };

    const isTestValid = () => {
      // Basic validation for required fields
      const hasRequiredFields = 
        testTitle.trim() !== '' &&
        subject !== '' &&
        duration !== '' &&
        parseInt(duration) > 0;

      // Check if there's at least one question
      const hasQuestions = questions.length > 0;

      // Check if the current question is valid
      const isCurrentQuestionValid = 
        currentQuestion.question_text.trim() !== '' &&
        currentQuestion.options.every(opt => opt.trim() !== '') &&
        currentQuestion.correct_option !== -1;

      // If we're on the last question, it must be valid
      const isLastQuestionValid = currentQuestionIndex === questions.length ? isCurrentQuestionValid : true;

      return hasRequiredFields && hasQuestions && isLastQuestionValid;
    };


    const getRatioStatus = () => {
      const total = Object.values(targetRatio).reduce((sum, val) => sum + val, 0);
      if (total < 100) return `${100 - total}% remaining to allocate`;
      if (total > 100) return `${total - 100}% over allocation`;
      return 'Ratio properly allocated';
    };

    // Add a function to handle adding participants
    const handleAddParticipant = (email: string) => {
      if (email && !participants.some(p => p.email === email)) {
        setParticipants([
          ...participants,
          { 
            email,
            id: Math.random().toString(36).substr(2, 9) // Simple unique ID generation
          }
        ]);
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Test' : 'Create New Test'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in the test details and add questions below.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading subjects...</p>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Title</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter test title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subj) => (
                      <option key={subj._id} value={subj.name}>
                        {subj.name} ({subj.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter duration"
                  />
                </div>
              </div>

              {/* Test Details Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Student Test' : 'Create New Student Test'}
              </h1>

                  <button
                    onClick={handleSubmitTest}
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                    {isEditing ? 'Update Test' : 'Submit Test'}

                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Test Schedule Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Schedule</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isScheduled"
                      checked={testSchedule.isScheduled}
                      onChange={(e) => setTestSchedule({ ...testSchedule, isScheduled: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isScheduled" className="ml-2 block text-sm text-gray-900">
                      Schedule Test
                    </label>
                  </div>

                  {testSchedule.isScheduled && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date</label>
                          <input
                            type="date"
                            value={testSchedule.scheduledDate}
                            onChange={(e) => setTestSchedule({ ...testSchedule, scheduledDate: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Time</label>
                          <input
                            type="time"
                            value={testSchedule.scheduledTime}
                            onChange={(e) => setTestSchedule({ ...testSchedule, scheduledTime: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                        <input
                          type="number"
                          value={testSchedule.timeLimit}
                          onChange={(e) => setTestSchedule({ ...testSchedule, timeLimit: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="allowLateSubmissions"
                          checked={testSchedule.allowLateSubmissions}
                          onChange={(e) => setTestSchedule({ ...testSchedule, allowLateSubmissions: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowLateSubmissions" className="ml-2 block text-sm text-gray-900">
                          Allow Late Submissions
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Access Window Start</label>
                          <input
                            type="datetime-local"
                            value={testSchedule.accessWindow.start}
                            onChange={(e) => setTestSchedule({
                              ...testSchedule,
                              accessWindow: { ...testSchedule.accessWindow, start: e.target.value }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Access Window End</label>
                          <input
                            type="datetime-local"
                            value={testSchedule.accessWindow.end}
                            onChange={(e) => setTestSchedule({
                              ...testSchedule,
                              accessWindow: { ...testSchedule.accessWindow, end: e.target.value }
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Test Schedule Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Participant Management</h2>
                <div className="space-y-6">
                  {/* Add Individual Participant */}
                  <div>
                    <label htmlFor="participant-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Add Participant
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="participant-email"
                        type="email"
                        placeholder="Enter participant email"
                        className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.currentTarget;
                            handleAddParticipant(input.value);
                            input.value = '';
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById('participant-email') as HTMLInputElement;
                          handleAddParticipant(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Participant List */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Participants ({participants.length})
                      </label>
                      {participants.length > 0 && (
                        <button
                          onClick={() => setParticipants([])}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {participants.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No participants added yet
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {participants.map((participant) => (
                            <li key={participant.id} className="flex justify-between items-center p-3 hover:bg-gray-50">
                              <span className="text-sm text-gray-700">{participant.email}</span>
                              <button
                                onClick={() => {
                                  setParticipants(participants.filter(p => p.id !== participant.id));
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Difficulty Ratio Settings */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Target Difficulty Distribution</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Easy Questions ({targetRatio[DifficultyLevel.EASY]}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={targetRatio[DifficultyLevel.EASY]}
                      onChange={(e) => handleRatioChange(DifficultyLevel.EASY, parseInt(e.target.value))}
                      className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medium Questions ({targetRatio[DifficultyLevel.MEDIUM]}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={targetRatio[DifficultyLevel.MEDIUM]}
                      onChange={(e) => handleRatioChange(DifficultyLevel.MEDIUM, parseInt(e.target.value))}
                      className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hard Questions ({targetRatio[DifficultyLevel.HARD]}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={targetRatio[DifficultyLevel.HARD]}
                      onChange={(e) => handleRatioChange(DifficultyLevel.HARD, parseInt(e.target.value))}
                      className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {getRatioStatus()}
                  </div>
                </div>
              </div>

              {/* Current Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Current Question Distribution</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Easy</span>
                      <span className="text-lg font-semibold text-green-700">{difficultyDistribution[DifficultyLevel.EASY]}</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: `${(difficultyDistribution[DifficultyLevel.EASY] / questions.length) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-yellow-700">Medium</span>
                      <span className="text-lg font-semibold text-yellow-700">{difficultyDistribution[DifficultyLevel.MEDIUM]}</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2">
                      <div
                        className="bg-yellow-600 rounded-full h-2"
                        style={{ width: `${(difficultyDistribution[DifficultyLevel.MEDIUM] / questions.length) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-red-700">Hard</span>
                      <span className="text-lg font-semibold text-red-700">{difficultyDistribution[DifficultyLevel.HARD]}</span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div
                        className="bg-red-600 rounded-full h-2"
                        style={{ width: `${(difficultyDistribution[DifficultyLevel.HARD] / questions.length) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Navigation and Counter */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Questions ({questions.length})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </button>
                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex >= questions.length}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>

                {/* Question Navigation Dots */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setCurrentQuestion(questions[index]);
                      }}
                      className={`w-8 h-8 rounded-full text-sm font-medium ${
                        currentQuestionIndex === index
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCurrentQuestionIndex(questions.length);
                      setCurrentQuestion({
                        id: questions.length + 1,
                        question_text: '',
                        type: 'text',
                        options: ['', '', '', ''],
                        correct_option: -1,
                        difficulty_level: DifficultyLevel.MEDIUM
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Question Preview */}
                {questions.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Question Preview</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">{questions[currentQuestionIndex].question_text}</p>
                      <div className="space-y-1">
                        {questions[currentQuestionIndex].options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`text-sm p-2 rounded ${
                              idx === questions[currentQuestionIndex].correct_option
                                ? 'bg-green-100 text-green-800'
                                : 'bg-white text-gray-800'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Difficulty: {questions[currentQuestionIndex].difficulty_level}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Question Form */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  {isEditing ? 'Edit Question' : 'Add Question'}
                </h2>
                <div className="space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Question Text</label>
                    <textarea
                      value={currentQuestion.question_text}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Question Type</label>
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as QuestionType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                    </select>
                  </div>

                  {/* Image Upload for Question */}
                  {currentQuestion.type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                      {currentQuestion.image_url && (
                        <div className="mt-2">
                          <img
                            src={currentQuestion.image_url}
                            alt="Question"
                            className="max-w-xs rounded-lg shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <div className="mt-2 space-y-2">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...currentQuestion.options];
                              newOptions[index] = e.target.value;
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          <button
                            onClick={() => {
                              const newOptions = currentQuestion.options.filter((_, i) => i !== index);
                              setCurrentQuestion({ ...currentQuestion, options: newOptions });
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCurrentQuestion({
                            ...currentQuestion,
                            options: [...currentQuestion.options, '']
                          });
                        }}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </button>
                    </div>
                  </div>

                  {/* Correct Option Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Correct Option</label>
                    <div className="mt-2">
                      <select
                        value={currentQuestion.correct_option}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct_option: parseInt(e.target.value) })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value={-1}>Select correct option</option>
                        {currentQuestion.options.map((_, index) => (
                          <option key={index} value={index}>
                            Option {index + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Difficulty Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                    <select
                      value={currentQuestion.difficulty_level}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty_level: e.target.value as DifficultyLevel })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value={DifficultyLevel.EASY}>Easy</option>
                      <option value={DifficultyLevel.MEDIUM}>Medium</option>
                      <option value={DifficultyLevel.HARD}>Hard</option>
                    </select>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Explanation</label>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>

                  {/* Save Question Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleSaveQuestion}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      Save Question
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  };
