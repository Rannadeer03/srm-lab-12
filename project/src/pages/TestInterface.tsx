import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../types';

const TestInterface: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  const [answers, setAnswers] = useState<number[]>(Array(test?.questions?.length || 0).fill(-1));
  const [showSummary, setShowSummary] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
    if (submitted) return; // Prevent changes after submission
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
    if (submitted) return; // Prevent multiple submissions
    
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
                Subject: {test.subject} • Duration: {test.duration} minutes
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
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 rounded-full h-2 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Warning if not all questions are answered */}
          {!submitted && answers.includes(-1) && (
            <div className="mt-4 flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-4 rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Please answer all questions before submitting</span>
            </div>
          )}
        </div>

        {/* Test Summary (shown after submission) */}
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
        <div className="space-y-6">
          {test.questions.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                submitted
                  ? getQuestionStatus(questionIndex) === 'correct'
                    ? 'border-l-4 border-green-500'
                    : 'border-l-4 border-red-500'
                  : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Question {questionIndex + 1}
                </h2>
                {submitted && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getQuestionStatus(questionIndex) === 'correct'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {getQuestionStatus(questionIndex) === 'correct' ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-gray-700">{question.text}</p>
              <div className="mt-4 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`flex items-center p-4 rounded-lg cursor-pointer ${
                      submitted
                        ? question.correctAnswer === optionIndex
                          ? 'bg-green-50 border-green-200'
                          : answers[questionIndex] === optionIndex
                          ? 'bg-red-50 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    } border`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={optionIndex}
                      checked={answers[questionIndex] === optionIndex}
                      onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                      disabled={submitted}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{option}</span>
                    {submitted && question.correctAnswer === optionIndex && (
                      <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                    )}
                    {submitted && answers[questionIndex] === optionIndex && question.correctAnswer !== optionIndex && (
                      <AlertTriangle className="ml-auto h-5 w-5 text-red-500" />
                    )}
                  </label>
                ))}
              </div>
              {submitted && (
                <div className="mt-4 text-sm">
                  <p className="font-medium text-gray-900">Explanation:</p>
                  <p className="mt-1 text-gray-700">
                    The correct answer is option {question.correctAnswer + 1}.
                    {question.explanation && <span className="ml-2">{question.explanation}</span>}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Submit/Finish Button */}
        <div className="mt-8 flex justify-end">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                answers.includes(-1)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={answers.includes(-1)}
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              Submit Test
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-6 w-6 mr-2" />
              Finish Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestInterface;