import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, BarChart2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface LocationState {
  testId: string;
}

const mockTests = [
  {
    id: '1',
    title: 'Mid-term Mathematics',
    subject: 'Mathematics',
    dueDate: '2024-03-25',
    duration: 120,
    questions: 50,
    status: 'new',
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    subject: 'Physics',
    dueDate: '2024-03-28',
    duration: 90,
    questions: 40,
    status: 'attempted',
    progress: 60,
  },
  {
    id: '3',
    title: 'Chemistry Basics',
    subject: 'Chemistry',
    dueDate: '2024-03-30',
    duration: 60,
    questions: 30,
    status: 'completed',
    score: 85,
  },
];

const performanceData = {
  totalTests: 12,
  completedTests: 8,
  averageScore: 78,
  weakAreas: ['Calculus', 'Quantum Physics', 'Organic Chemistry'],
};

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = (location.state as LocationState) || { testId: null };

  const handleBack = () => {
    navigate('/student-dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {testId ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Test Details
              </h1>
            </div>
            {/* Add your test-specific content here */}
            <p className="text-gray-600">
              Loading test with ID: {testId}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                All Tests
              </h1>
            </div>
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, John! Ready for your next challenge?
              </h1>
              <p className="mt-2 text-gray-600">
                You have {mockTests.filter(t => t.status === 'new').length} new tests available.
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <StatCard
                icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
                title="Total Tests"
                value={performanceData.totalTests.toString()}
              />
              <StatCard
                icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                title="Completed"
                value={performanceData.completedTests.toString()}
              />
              <StatCard
                icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
                title="Average Score"
                value={`${performanceData.averageScore}%`}
              />
              <StatCard
                icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
                title="Weak Areas"
                value={performanceData.weakAreas.length.toString()}
                subtitle="Need improvement"
              />
            </div>

            {/* Available Tests */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Available Tests</h2>
              </div>
              <ul className="divide-y divide-gray-200">
                {mockTests.map((test) => (
                  <li key={test.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-indigo-600">{test.title}</h3>
                          <TestStatusBadge status={test.status} progress={test.progress} score={test.score} />
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{test.subject}</span>
                          <span>•</span>
                          <span>{test.questions} questions</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {test.duration} minutes
                          </span>
                        </div>
                        {test.status === 'attempted' && (
                          <div className="mt-2">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
                                <div
                                  style={{ width: `${test.progress}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                                />
                              </div>
                              <span className="text-xs text-gray-600 mt-1">{test.progress}% completed</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <button
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                            test.status === 'completed'
                              ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                              : 'text-white bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          {test.status === 'new' && 'Start Test'}
                          {test.status === 'attempted' && 'Resume'}
                          {test.status === 'completed' && 'Review'}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Areas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Areas for Improvement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceData.weakAreas.map((area, index) => (
                  <div
                    key={index}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3"
                  >
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{area}</h3>
                      <p className="mt-1 text-sm text-gray-500">Needs more practice</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
              {subtitle && (
                <dd className="mt-1 text-sm text-gray-500">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestStatusBadge: React.FC<{
  status: string;
  progress?: number;
  score?: number;
}> = ({ status, score }) => {
  switch (status) {
    case 'new':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          New
        </span>
      );
    case 'attempted':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          In Progress
        </span>
      );
    case 'completed':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Completed • Score: {score}%
        </span>
      );
    default:
      return null;
  }
};