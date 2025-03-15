import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../types';

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: Question[];
}

const TestInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test as Test;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(test?.questions?.length || 0).fill(-1));
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test?.duration * 60 || 0);

  React.useEffect(() => {
    if (!test) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  if (!test || !test.questions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No test data available</h1>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    return test.questions.reduce((acc: number, question: Question, index: number) => {
      if (question.correctAnswer === answers[index]) {
        return acc + 1;
      }
      return acc;
    }, 0);
  };

  const handleSubmit = () => {
    if (submitted) return;
    
    const finalScore = calculateScore();
    setScore(finalScore);
    setSubmitted(true);
    setShowSummary(true);
  };

  const handleFinish = () => {
    navigate('/student-dashboard', { 
      state: { 
        score,
        total: test.questions.length,
        testId: test.id,
        testName: test.title
      } 
    });
  };

  const getQuestionStatus = (questionIndex: number) => {
    if (!submitted) return 'unanswered';
    if (answers[questionIndex] === test.questions[questionIndex].correctAnswer) {
      return 'correct';
    }
    return 'incorrect';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const answeredQuestions = answers.filter(answer => answer !== -1).length;
  const progressPercentage = (answeredQuestions / test.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Test Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
              <p className="mt-2 text-gray-600">
                Subject: {test.subject} • Time Remaining: {formatTime(timeLeft)}
              </p>
            </div>
            {!submitted ? (
              <button
                onClick={handleSubmit}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  answers.includes(-1)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                disabled={answers.includes(-1)}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Submit Test
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Finish Review
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{answeredQuestions} of {test.questions.length} questions answered</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Test Summary (when submitted) */}
        {submitted && showSummary && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Test Summary</h2>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="text-gray-400 hover:text-gray-500"
              >
                {showSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800">Correct Answers</p>
                <p className="mt-2 text-3xl font-bold text-green-900">
                  {test.questions.filter((_, i) => getQuestionStatus(i) === 'correct').length}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800">Incorrect Answers</p>
                <p className="mt-2 text-3xl font-bold text-red-900">
                  {test.questions.filter((_, i) => getQuestionStatus(i) === 'incorrect').length}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">Final Score</p>
                <p className="mt-2 text-3xl font-bold text-blue-900">
                  {Math.round((score / test.questions.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-8">
          {test.questions.map((question, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                submitted
                  ? getQuestionStatus(index) === 'correct'
                    ? 'ring-2 ring-green-500'
                    : getQuestionStatus(index) === 'incorrect'
                    ? 'ring-2 ring-red-500'
                    : ''
                  : ''
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Question {index + 1}: {question.text}
              </h3>
              <div className="space-y-2">
                {question.options.map((option: string, optionIndex: number) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerChange(index, optionIndex)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg border ${
                      answers[index] === optionIndex
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      submitted
                        ? optionIndex === question.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : answers[index] === optionIndex
                          ? 'bg-red-50 border-red-500'
                          : ''
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border ${
                            answers[index] === optionIndex
                              ? 'border-indigo-500 bg-indigo-500'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm ${
                          answers[index] === optionIndex ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          {option}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {submitted && (
                <div className="mt-4">
                  {getQuestionStatus(index) === 'correct' ? (
                    <div className="flex items-center text-green-700">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Correct answer!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-700">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>
                        Incorrect. The correct answer was: {question.options[question.correctAnswer]}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestInterface;