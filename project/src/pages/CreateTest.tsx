import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, Image as ImageIcon, Type, Upload } from 'lucide-react';
import { api } from '../services/api';
import type { Subject, Question } from '../services/api';

// Define proper enum for difficulty levels
enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
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
  accessWindow: { start: string; end: string };
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
      accessWindow: { start: '', end: '' }
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

    const handleOptionImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newOptions = [...currentQuestion.options];
          newOptions[index] = `[IMG]${reader.result}`; // Prefix to identify image content
          setCurrentQuestion({ ...currentQuestion, options: newOptions });
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentQuestion({
            ...currentQuestion,
            image_url: reader.result as string
          });
        };
        reader.readAsDataURL(file);
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
      handleNextQuestion();
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
        setIsSubmitting(true);
        setError(null);

        // Find the subject ID from the subjects array
        const selectedSubject = subjects.find(s => s.name === subject);
        if (!selectedSubject) {
          throw new Error('Selected subject not found');
        }

        // Get teacher ID from localStorage and convert to number
        const teacherId = parseInt(localStorage.getItem('teacherId') || '0');
        if (!teacherId) {
          throw new Error('Teacher ID not found');
        }

        // Transform QuestionFormData to API Question type
        const transformedQuestions: Question[] = questions.map(q => ({
          teacher_id: teacherId,
          subject_id: selectedSubject._id,
          question_text: q.question_text,
          type: q.type,
          image_url: q.image_url,
          options: q.options,
          correct_option: q.correct_option.toString(),
          difficulty_level: q.difficulty_level.toLowerCase(),
          explanation: q.explanation
        }));

        const testData = {
          title: testTitle,
          subject,
          duration: parseInt(duration),
          questions: transformedQuestions,
          participants: participants.map(p => p.email),
          test_schedule: {
            is_scheduled: testSchedule.isScheduled,
            scheduled_date: testSchedule.scheduledDate,
            scheduled_time: testSchedule.scheduledTime,
            time_limit: testSchedule.timeLimit,
            allow_late_submissions: testSchedule.allowLateSubmissions,
            access_window: testSchedule.accessWindow
          },
          difficulty_distribution: difficultyDistribution,
          target_ratio: targetRatio
        };

        // Make API call using the api service
        if (isEditing) {
          await api.updateTest(testToEdit.id, testData);
        } else {
          await api.createTest(testData);
        }

        // Success - navigate to tests page
        navigate('/tests');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Submit error:', err);
      } finally {
        setIsSubmitting(false);
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
      // Check for at least one valid question
      const hasValidQuestion = questions.some(q => 
        q.question_text.trim() !== '' && 
        q.correct_option !== -1 &&
        q.options.every(opt => opt.trim() !== '')
      );
      
      return (
        testTitle.trim() !== '' &&
        subject !== '' &&
        duration !== '' &&
        parseInt(duration) > 0 &&
        questions.length > 0 &&
        hasValidQuestion
      );
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
                    disabled={isSubmitting || !isTestValid()}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isSubmitting || !isTestValid()
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
                    {isEditing ? 'Update Test' : 'Submit Student Test'}

                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Test Schedule Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Schedule</h2>
                <div className="space-y-6">
                  {/* Enable Scheduling Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Enable Test Scheduling</label>
                    <button
                      onClick={() => setTestSchedule(prev => ({
                        ...prev,
                        isScheduled: !prev.isScheduled
                      }))}
                      className={`relative inline-block w-12 h-6 ${
                        testSchedule.isScheduled ? 'bg-indigo-600' : 'bg-gray-200'
                      } rounded-full transition-colors duration-200 ease-in-out`}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform transition-transform duration-200 ease-in-out bg-white rounded-full shadow-md ${
                          testSchedule.isScheduled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                        style={{ marginTop: '4px' }}
                      />
                    </button>
                  </div>

                  {testSchedule.isScheduled && (
                    <>
                      {/* Date and Time Selection */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Test Date</label>
                          <input
                            type="date"
                            value={testSchedule.scheduledDate}
                            onChange={(e) => setTestSchedule({
                              ...testSchedule,
                              scheduledDate: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Start Time</label>
                          <input
                            type="time"
                            value={testSchedule.scheduledTime}
                            onChange={(e) => setTestSchedule({
                              ...testSchedule,
                              scheduledTime: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Access Window */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Access Window</label>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-xs text-gray-500">Start Time</label>
                            <input
                              type="datetime-local"
                              value={testSchedule.accessWindow.start}
                              onChange={(e) => setTestSchedule({
                                ...testSchedule,
                                accessWindow: {
                                  ...testSchedule.accessWindow,
                                  start: e.target.value
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">End Time</label>
                            <input
                              type="datetime-local"
                              value={testSchedule.accessWindow.end}
                              onChange={(e) => setTestSchedule({
                                ...testSchedule,
                                accessWindow: {
                                  ...testSchedule.accessWindow,
                                  end: e.target.value
                                }
                              })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Time Limit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                        <input
                          type="number"
                          value={testSchedule.timeLimit}
                          onChange={(e) => setTestSchedule({
                            ...testSchedule,
                            timeLimit: parseInt(e.target.value)
                          })}
                          min="1"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Late Submissions */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="allowLateSubmissions"
                          checked={testSchedule.allowLateSubmissions}
                          onChange={(e) => setTestSchedule({
                            ...testSchedule,
                            allowLateSubmissions: e.target.checked
                          })}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowLateSubmissions" className="text-sm text-gray-700">
                          Allow late submissions
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>

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

              {/* Question Editor */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Question {currentQuestionIndex + 1} of {Math.max(questions.length, 1)}
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDeleteQuestion}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                    <button
                      onClick={handleSaveQuestion}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save & Next
                    </button>
                  </div>
                </div>

                {/* Question Type Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'text' })}
                      className={`inline-flex items-center px-4 py-2 rounded-md ${
                        currentQuestion.type === 'text'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Type className="h-5 w-5 mr-2" />
                      Text Only
                    </button>
                    <button
                      onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'image' })}
                      className={`inline-flex items-center px-4 py-2 rounded-md ${
                        currentQuestion.type === 'image'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Image + Text
                    </button>
                  </div>
                </div>

                {/* Difficulty Level Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <div className="flex space-x-4">
                    {([DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setCurrentQuestion({ ...currentQuestion, difficulty_level: level })}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentQuestion.difficulty_level === level
                            ? level === DifficultyLevel.EASY
                              ? 'bg-green-600 text-white'
                              : level === DifficultyLevel.MEDIUM
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <textarea
                    value={currentQuestion.question_text}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter your question here"
                  />
                </div>

                {/* Image Upload (if image type) */}
                {currentQuestion.type === 'image' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {currentQuestion.image_url ? (
                          <div>
                            <img
                              src={currentQuestion.image_url}
                              alt="Question"
                              className="mx-auto h-32 w-auto"
                            />
                            <button
                              onClick={() => setCurrentQuestion({ ...currentQuestion, image_url: undefined })}
                              className="mt-2 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                />
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="option-container">
                      <input
                        type="text"
                        value={option.startsWith('[IMG]') ? '' : option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOptionImageUpload(index, e)}
                      />
                      {option.startsWith('[IMG]') && (
                        <img 
                          src={option.replace('[IMG]', '')} 
                          alt={`Option ${index + 1}`} 
                          style={{ maxWidth: '200px', marginTop: '10px' }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    value={currentQuestion.explanation || ''}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })
                    }
                    rows={2}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Explain the correct answer (optional)"
                  />
                </div>

                {/* Question Navigation */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
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
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                </div>

                {/* Distribution Warnings */}
                {questions.length > 0 && (
                  <div className="mt-6">
                    {Math.abs(difficultyDistribution[DifficultyLevel.EASY] - difficultyDistribution[DifficultyLevel.HARD]) > questions.length * 0.4 && (
                      <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-4 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">
                          Consider balancing the difficulty levels for a better assessment
                        </span>
                      </div>
                    )}
                    {Object.values(targetRatio).reduce((sum, val) => sum + val, 0) !== 100 && (
                      <div className="mt-2 flex items-center space-x-2 text-red-700 bg-red-50 p-4 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">
                          The difficulty ratio must total 100%
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  };
