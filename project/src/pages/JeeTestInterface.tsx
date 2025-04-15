import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

interface Question {
  _id: string;
  text: string;
  options: string[];
  correct_answer: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  subject_id: string;
  teacher_id: string;
  questions: Question[];
  duration: number;
  total_marks: number;
  created_at: string;
  duration_minutes?: number;
}

const JeeTestInterface: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching test with ID:', testId);
        if (!testId) {
          setError('No test ID provided');
          return;
        }
        const response = await axios.get(`http://localhost:8000/tests/${testId}`);
        console.log('Raw test data received:', JSON.stringify(response.data, null, 2));
        
        if (!response.data) {
          setError('Test data is empty');
          return;
        }

        const testData = response.data as Test;
        console.log('Questions received:', JSON.stringify(testData.questions, null, 2));
        
        if (!testData.questions || testData.questions.length === 0) {
          setError('Test has no questions');
          return;
        }

        // Ensure all questions have the required fields
        const validQuestions = testData.questions.filter(q => {
          const isValid = q && q.text && q.options && Array.isArray(q.options) && q.options.length > 0 && q.correct_answer;
          if (!isValid) {
            console.log('Invalid question found:', JSON.stringify(q, null, 2));
          }
          return isValid;
        });

        console.log('Valid questions:', JSON.stringify(validQuestions, null, 2));

        if (validQuestions.length === 0) {
          setError('No valid questions found in the test');
          return;
        }

        setTest({
          ...testData,
          questions: validQuestions,
          duration: testData.duration_minutes || 60 // Default to 60 minutes if not specified
        });
        setTimeRemaining((testData.duration_minutes || 60) * 60); // Convert minutes to seconds
      } catch (error: any) {
        console.error('Error fetching test:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response:', error.response.data);
          setError(`Error: ${error.response.data.detail || 'Failed to load test'}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          setError('No response from server. Please check if the backend is running.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          setError('Failed to load test. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted && !showInstructions) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted, showInstructions]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!test) return;

    let correctAnswers = 0;
    test.questions.forEach((question) => {
      if (selectedAnswers[question._id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = (correctAnswers / test.questions.length) * test.total_marks;
    setScore(finalScore);
    setIsSubmitted(true);

    try {
      await axios.post('/api/tests/submit', {
        test_id: test._id,
        answers: selectedAnswers,
        score: finalScore,
      });
    } catch (error) {
      console.error('Error submitting test:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Test</h2>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 whitespace-pre-wrap break-words">{error}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/student-dashboard')}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return <div>Loading...</div>;
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Test Instructions</h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <Clock className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Time Duration</h3>
                <p className="text-gray-600">
                  The test duration is {test.duration} minutes. The timer will start once you begin the test.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Test Structure</h3>
                <p className="text-gray-600">
                  The test contains {test.questions.length} questions. Each question has multiple-choice options.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Marking Scheme</h3>
                <p className="text-gray-600">
                  Each correct answer will be awarded marks as per the test's marking scheme.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => setShowInstructions(false)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 text-lg font-medium"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Test Results</h2>
          <div className="text-center mb-8">
            <p className="text-2xl font-semibold text-gray-800">
              Your Score: {score.toFixed(2)}/{test.total_marks}
            </p>
            <p className="text-lg text-gray-600 mt-2">
              {score >= test.total_marks * 0.6 ? 'Congratulations! You passed the test.' : 'Keep practicing to improve your score.'}
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 text-lg font-medium"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Question Navigation Panel */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Questions</h3>
            <div className="flex items-center text-red-600">
              <Clock className="h-5 w-5 mr-2" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {test.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  currentQuestionIndex === index
                    ? 'bg-indigo-600 text-white'
                    : selectedAnswers[test.questions[index]._id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Display Panel */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">
                  Question {currentQuestionIndex + 1} of {test.questions.length}
                </h3>
                <p className="text-gray-700 text-lg">{currentQuestion.text}</p>
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAnswers[currentQuestion._id] === option
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      value={option}
                      checked={selectedAnswers[currentQuestion._id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion._id, option)}
                      className="mr-4 h-5 w-5 text-indigo-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {currentQuestionIndex === test.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(test.questions.length - 1, prev + 1)
                      )
                    }
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JeeTestInterface; 