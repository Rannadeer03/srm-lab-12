import React from 'react';
import { useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';

const StundentTestResults: React.FC = () => {
  const location = useLocation();
  const test = location.state?.test || {
    id: '1',
    title: 'Mid-term Mathematics',
    subject: 'Mathematics',
    score: 85,
    totalQuestions: 50,
    correctAnswers: 42,
    incorrectAnswers: 8,
    timeTaken: '1 hour 45 minutes',
    dateCompleted: '2024-03-20',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h1>
          <div className="flex items-center space-x-4">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-800">{test.title}</h2>
          </div>
          <p className="mt-2 text-gray-600">{test.subject}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Correct Answers</p>
                <p className="text-2xl font-bold text-gray-900">{test.correctAnswers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Incorrect Answers</p>
                <p className="text-2xl font-bold text-gray-900">{test.incorrectAnswers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Time Taken</p>
                <p className="text-2xl font-bold text-gray-900">{test.timeTaken}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">{test.score}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Questions</span>
              <span className="text-sm text-gray-900">{test.totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Correct Answers</span>
              <span className="text-sm text-gray-900">{test.correctAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Incorrect Answers</span>
              <span className="text-sm text-gray-900">{test.incorrectAnswers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Accuracy</span>
              <span className="text-sm text-gray-900">
                {((test.correctAnswers / test.totalQuestions) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date Completed</span>
              <span className="text-sm text-gray-900">{test.dateCompleted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StundentTestResults;
