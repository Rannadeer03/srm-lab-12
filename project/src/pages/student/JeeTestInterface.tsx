import { BookOpen, CheckCircle2, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Question,
  Test,
  testResultService,
  testService,
} from '../../services/supabaseApi';
import { useAuthStore } from '../../store/authStore';

const JeeTestInterface: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        if (!testId) return;

        const testData = await testService.getTest(testId);
        if (!testData) {
          throw new Error('Test not found');
        }

        const testQuestions = await testService.getTestQuestions(testId);

        setTest(testData);
        setQuestions(testQuestions);
        setTimeRemaining((testData.duration || 60) * 60);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching test:', error);
        navigate('/student-dashboard');
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId, navigate]);

  useEffect(() => {
    if (timeRemaining > 0 && !showInstructions && test) {
      const timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      setStartTime(new Date());

      return () => clearInterval(timer);
    }
  }, [timeRemaining, showInstructions, test]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!test || !user || !startTime) return;

    try {
      // Calculate score
      let correctAnswers = 0;
      let totalMarks = 0;
      let scoredMarks = 0;

      questions.forEach((question) => {
        const marks = question.marks || 4;
        const negativeMarks = question.negative_marks || 1;
        totalMarks += marks;

        if (selectedAnswers[question.id!] === question.correct_option) {
          correctAnswers++;
          scoredMarks += marks;
        } else if (selectedAnswers[question.id!]) {
          scoredMarks -= negativeMarks;
        }
      });

      const percentage = totalMarks > 0 ? (scoredMarks / totalMarks) * 100 : 0;
      const timeTaken = Math.floor(
        (new Date().getTime() - startTime.getTime()) / 1000
      );

      // Save test result
      await testResultService.createTestResult({
        test_id: test.id!,
        student_id: user.id,
        score: scoredMarks,
        total_marks: totalMarks,
        percentage: Math.max(0, percentage),
        time_taken: timeTaken,
        answers: selectedAnswers,
        submitted_at: new Date().toISOString(),
      });

      // Navigate to results page
      navigate('/test-results', {
        state: {
          score: scoredMarks,
          total: totalMarks,
          percentage: Math.max(0, percentage).toFixed(1),
          testTitle: test.title,
          timeTaken,
        },
      });
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    }
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

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Test not found.</p>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Test Instructions
          </h2>
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <Clock className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Time Duration</h3>
                <p className="text-gray-600">
                  The test duration is {test.duration} minutes. The timer will
                  start once you begin the test.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BookOpen className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Test Structure</h3>
                <p className="text-gray-600">
                  The test contains {questions.length} questions. Each question
                  has multiple-choice options.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle2 className="h-6 w-6 mr-3 mt-1 text-indigo-600" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Marking Scheme</h3>
                <p className="text-gray-600">
                  Each correct answer will be awarded marks as per the test's
                  marking scheme.
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

  const currentQuestion = questions[currentQuestionIndex];

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
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  currentQuestionIndex === index
                    ? 'bg-indigo-600 text-white'
                    : selectedAnswers[questions[index]?.id!]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h2>
                <span className="text-sm text-gray-500">
                  Marks: {questions[currentQuestionIndex]?.marks || 4}
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-lg mb-6">
                  {questions[currentQuestionIndex]?.question_text}
                </h3>
                <div className="space-y-3">
                  {questions[currentQuestionIndex]?.options.map(
                    (option, index) => (
                      <label
                        key={index}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${questions[currentQuestionIndex]?.id}`}
                          value={option}
                          checked={
                            selectedAnswers[
                              questions[currentQuestionIndex]?.id!
                            ] === option
                          }
                          onChange={(e) =>
                            setSelectedAnswers((prev) => ({
                              ...prev,
                              [questions[currentQuestionIndex]?.id!]:
                                e.target.value,
                            }))
                          }
                          className="mr-3"
                        />
                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
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
                        Math.min(questions.length - 1, prev + 1)
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
