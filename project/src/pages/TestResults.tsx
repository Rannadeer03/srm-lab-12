
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Award, ArrowLeft } from 'lucide-react';

const TestResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, total, percentage, testTitle, timeTaken } = location.state || {};

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 80) return 'Excellent performance!';
    if (percentage >= 60) return 'Good performance!';
    if (percentage >= 40) return 'Average performance';
    return 'Needs improvement';
  };

  if (!score && score !== 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">No test results found</h2>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Completed!</h1>
            <h2 className="text-xl text-gray-600">{testTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Score</h3>
              <p className="text-2xl font-bold text-blue-600">{score}/{total}</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg text-center">
              <div className="text-purple-600 mb-2">
                <svg className="h-8 w-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Percentage</h3>
              <p className={`text-2xl font-bold ${getPerformanceColor(parseFloat(percentage))}`}>
                {percentage}%
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Time Taken</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {timeTaken ? formatTime(timeTaken) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="text-center mb-8">
            <p className={`text-xl font-semibold ${getPerformanceColor(parseFloat(percentage))}`}>
              {getPerformanceMessage(parseFloat(percentage))}
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/student-dashboard')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/available-tests')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
            >
              Take Another Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
