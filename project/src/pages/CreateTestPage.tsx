import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight, AlertTriangle, Image as ImageIcon, Type, Upload, CheckCircle } from 'lucide-react';
import { testService, questionService } from '../services/supabaseApi';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface QuestionFormData {
  id: number;
  question_text: string;
  type: 'text' | 'image';
  options: string[];
  correct_option: string;
  subject_id: string;
  image_url?: string;
  explanation?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
}

interface Participant {
  email: string;
  name: string;
}

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

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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
    correct_option: '',
    subject_id: subject,
    difficulty_level: 'medium'
  });
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjects = [
    'Engineering Mathematics',
    'Electric Circuits',
    'Electromagnetic Fields',
    'Signals and Systems',
    'Electrical Machines',
    'Power Systems',
    'Control Systems',
    'Electrical and Electronic Measurements',
    'Analog and Digital Electronics',
    'Power Electronics',
  ];

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

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const uploadImageToStorage = async (file: File, type: 'question' | 'option'): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('test_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('test_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleOptionImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImageToStorage(file, 'option');
        const newOptions = [...currentQuestion.options];
        newOptions[index] = `[IMG]${imageUrl}`;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
      } catch (error) {
        console.error('Error uploading option image:', error);
        // Handle error (show error message to user)
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await uploadImageToStorage(file, 'question');
        setCurrentQuestion({
          ...currentQuestion,
          image_url: imageUrl
        });
      } catch (error) {
        console.error('Error uploading question image:', error);
        // Handle error (show error message to user)
      }
    }
  };

  const handleSaveQuestion = () => {
    if (currentQuestionIndex < questions.length) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex] = currentQuestion;
      setQuestions(updatedQuestions);
    } else {
      const newQuestions = [...questions, currentQuestion];
      setQuestions(newQuestions);
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
        correct_option: '',
        subject_id: subject,
        difficulty_level: 'medium'
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentQuestion(questions[currentQuestionIndex - 1]);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };

  const isTestValid = () => {
    const validations = {
      title: testTitle.trim() !== '',
      subject: subject !== '',
      duration: duration !== '' && !isNaN(parseInt(duration)) && parseInt(duration) > 0,
      hasQuestions: questions.length > 0,
      hasValidQuestion: questions.some(q => {
        // Check if question text is not empty
        const hasQuestionText = q.question_text.trim() !== '';
        
        // Check if correct option is selected and valid
        const hasCorrectOption = q.correct_option !== '' && 
          !isNaN(parseInt(q.correct_option)) && 
          parseInt(q.correct_option) >= 0 && 
          parseInt(q.correct_option) < q.options.length;
        
        // Check if all options have content
        const hasValidOptions = q.options.every(opt => 
          opt.trim() !== '' || opt.startsWith('[IMG]')
        );

        // Debug logging for this question
        console.log('Question validation:', {
          questionText: q.question_text,
          correctOption: q.correct_option,
          options: q.options,
          hasQuestionText,
          hasCorrectOption,
          hasValidOptions
        });

        return hasQuestionText && hasCorrectOption && hasValidOptions;
      })
    };

    // Debug logging
    console.log('Test Title:', testTitle);
    console.log('Subject:', subject);
    console.log('Duration:', duration);
    console.log('Questions:', questions);
    console.log('Validation Results:', validations);

    // Check each validation and log which one fails
    if (!validations.title) {
      console.log('❌ Test title is empty');
    }
    if (!validations.subject) {
      console.log('❌ Subject is not selected');
    }
    if (!validations.duration) {
      console.log('❌ Duration is invalid');
    }
    if (!validations.hasQuestions) {
      console.log('❌ No questions added');
    }
    if (!validations.hasValidQuestion) {
      console.log('❌ No valid questions found');
    }

    return Object.values(validations).every(v => v);
  };

  // Add a useEffect to log validation status whenever relevant state changes
  useEffect(() => {
    console.log('Validation Status:', isTestValid());
  }, [testTitle, subject, duration, questions]);

  const handleSubmitTest = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!isTestValid()) {
      setError('Please fill in all required fields and ensure the test is valid');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // First, create the test
      const testData = {
        title: testTitle,
        subject: subject,
        duration: parseInt(duration),
        teacher_id: user.id,
        is_active: true,
        participants: participants.map(p => p.email),
        is_scheduled: testSchedule.isScheduled,
        scheduled_date: testSchedule.scheduledDate || null,
        scheduled_time: testSchedule.scheduledTime || null,
        time_limit: testSchedule.timeLimit || null,
        allow_late_submissions: testSchedule.allowLateSubmissions,
        access_window_start: testSchedule.accessWindow.start ? new Date(testSchedule.accessWindow.start).toISOString() : null,
        access_window_end: testSchedule.accessWindow.end ? new Date(testSchedule.accessWindow.end).toISOString() : null,
        easy_count: 0,
        medium_count: 0,
        hard_count: 0,
        target_easy: 0.0,
        target_medium: 0.0,
        target_hard: 0.0
      };

      console.log('Creating test with data:', testData);
      const createdTest = await testService.createTest(testData);
      console.log('Test created:', createdTest);

      if (!createdTest || !createdTest.id) {
        throw new Error('Failed to create test');
      }

      // Then, create all questions
      console.log('Creating questions...');
      const questionPromises = questions.map(async (q) => {
        const questionData = {
          question_text: q.question_text,
          type: q.type,
          options: q.options,
          correct_option: q.options[parseInt(q.correct_option)],
          difficulty_level: q.difficulty_level,
          subject_id: subject,
          image_url: q.image_url,
          explanation: q.explanation
        };
        return questionService.createQuestion(questionData);
      });

      const createdQuestions = await Promise.all(questionPromises);
      console.log('Questions created:', createdQuestions);

      // Finally, add questions to the test
      console.log('Adding questions to test...');
      await testService.addQuestionsToTest(
        createdTest.id,
        createdQuestions.map(q => q.id!)
      );
      console.log('Questions added to test successfully');

      // Navigate to teacher dashboard on success
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error creating test:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddParticipant = (email: string) => {
    if (email && !participants.some(p => p.email === email)) {
      setParticipants([
        ...participants,
        { 
          email,
          name: Math.random().toString(36).substr(2, 9)
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Test</h1>
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
                  <Save className="h-5 w-5 mr-2" />
                  Submit Test
                </>
              )}
            </button>
          </div>
          
          {/* Basic Test Details */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Test Title</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter test title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select a subject</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
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

          {/* Test Schedule Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Test Schedule</h2>
            <div className="space-y-6">
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

          {/* Participant Management */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Participant Management</h2>
            <div className="space-y-6">
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
                        <li key={participant.name} className="flex justify-between items-center p-3 hover:bg-gray-50">
                          <span className="text-sm text-gray-700">{participant.email}</span>
                          <button
                            onClick={() => {
                              setParticipants(participants.filter(p => p.name !== participant.name));
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

          {/* Question Editor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Question {currentQuestionIndex + 1} of {Math.max(questions.length, 1)}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDeleteQuestion(currentQuestionIndex)}
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
                <div key={index} className="option-container flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={currentQuestion.correct_option === index.toString()}
                    onChange={() => setCurrentQuestion({ ...currentQuestion, correct_option: index.toString() })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option.startsWith('[IMG]') ? '' : option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleOptionImageUpload(index, e)}
                    className="hidden"
                    id={`option-image-${index}`}
                  />
                  <label
                    htmlFor={`option-image-${index}`}
                    className="cursor-pointer p-2 text-gray-500 hover:text-gray-700"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </label>
                  {option.startsWith('[IMG]') && (
                    <img 
                      src={option.replace('[IMG]', '')} 
                      alt={`Option ${index + 1}`} 
                      className="h-10 w-10 object-cover rounded"
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
                        correct_option: '',
                        subject_id: subject,
                        difficulty_level: 'medium'
                      });
                    }}
                    className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error submitting test
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage; 