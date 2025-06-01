import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Upload, Save } from 'lucide-react';
import axios from 'axios';
import { api, Question as APIQuestion } from '../services/api';

interface Question extends APIQuestion {
  difficulty_level: 'easy' | 'medium' | 'hard';
  type: 'text' | 'image';
  image_url?: string;
  marks?: number;
  negative_marks?: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

const CreateTest: React.FC = () => {
    const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [instructions, setInstructions] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question_text: '',
      options: ['', '', '', ''],
      correct_option: '',
      difficulty_level: 'medium',
      type: 'text',
      teacher_id: 0,
      subject_id: subjectId
    }
  ]);

    useEffect(() => {
      const fetchSubjects = async () => {
        try {
        const subjectsData = await api.getSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSubjects();
  }, []);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
          question_text: '',
        options: ['', '', '', ''],
        correct_option: '',
        difficulty_level: 'medium',
          type: 'text',
        teacher_id: 0,
        subject_id: subjectId
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleQuestionChange = (questionIndex: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (questionIndex: number, value: string) => {
        const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].correct_option = value;
        setQuestions(updatedQuestions);
  };

  const handleImageUpload = async (questionIndex: number, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question_index', questionIndex.toString());

      interface ImageUploadResponse {
        image_path: string;
      }

      const response = await axios.post<ImageUploadResponse>(`/api/tests/upload-image`, formData);
      handleQuestionChange(questionIndex, 'image_url', response.data.image_path);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!title || !subjectId || !duration || !totalMarks || !instructions) {
        alert('Please fill in all required fields');
        return;
      }

      // Validate questions
      if (questions.length === 0) {
        alert('Please add at least one question');
        return;
      }

      for (const question of questions) {
        if (!question.question_text || !question.correct_option || question.options.some(opt => !opt)) {
          alert('Please fill in all question details');
          return;
        }
      }

      // Format questions for submission
      const formattedQuestions = questions.map(q => ({
        text: q.question_text,
        options: q.options.filter(opt => opt !== ''), // Remove empty options
        correct_answer: q.correct_option,
        subject_id: subjectId,
        teacher_id: "1" // TODO: Replace with actual teacher ID
      }));

      // Create test data
      const testData = {
        title,
        description: instructions,
        subject_id: subjectId,
        teacher_id: "1", // TODO: Replace with actual teacher ID
        questions: formattedQuestions, // Send the complete question objects
        duration_minutes: duration,
        status: "active"
      };

      console.log('Submitting test data:', testData);

      const response = await axios.post('http://localhost:8000/tests', testData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        alert('Test created successfully!');
        navigate('/teacher-dashboard');
      } else {
        throw new Error('Failed to create test');
      }
    } catch (error: any) {
      console.error('Error creating test:', error);
      if (error.response) {
        alert(`Error creating test: ${error.response.data?.detail || error.message}`);
      } else {
        alert('An error occurred while creating the test');
      }
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Test</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Test Title</label>
                  <input
                    type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  {loading ? (
                    <div className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 h-10 animate-pulse" />
                  ) : (
                  <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  />
                </div>
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instructions</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                required
              />
              </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">Questions</h2>
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-md font-medium">Question {questionIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Question Text</label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) => handleQuestionChange(questionIndex, 'question_text', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={2}
                        required
                      />
                    </div>

                        <div>
                      <label className="block text-sm font-medium text-gray-700">Question Image (Optional)</label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(questionIndex, e.target.files[0])}
                          className="hidden"
                          id={`image-upload-${questionIndex}`}
                        />
                        <label
                          htmlFor={`image-upload-${questionIndex}`}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload Image
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`correct-answer-${questionIndex}`}
                            value={option}
                            checked={question.correct_option === option}
                            onChange={(e) => handleCorrectOptionChange(questionIndex, e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder={`Option ${optionIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                      </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Marks</label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) => handleQuestionChange(questionIndex, 'marks', Number(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Negative Marks</label>
                        <input
                          type="number"
                          value={question.negative_marks}
                          onChange={(e) => handleQuestionChange(questionIndex, 'negative_marks', Number(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          step="0.25"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

                            <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                <Plus className="h-5 w-5 mr-2" />
                Add Question
                            </button>
                          </div>

            <div className="flex justify-end">
                      <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-5 w-5 mr-2" />
                Create Test
                      </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
  };

export default CreateTest;