import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, BarChart2, AlertTriangle, ArrowLeft } from 'lucide-react';

interface LocationState {
  testId: string;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  questions: number;
  status: 'new' | 'attempted' | 'completed';
  progress?: number;
  score?: number;
}

const mockTests: Test[] = [
  {
    id: '1',
    title: 'Mid-term Mathematics',
    subject: 'Mathematics',
    duration: 120,
    questions: 50,
    status: 'new',
  },
  {
    id: '2',
    title: 'Physics Fundamentals',
    subject: 'Physics',
    duration: 90,
    questions: 40,
    status: 'attempted',
    progress: 60,
  },
  {
    id: '3',
    title: 'Chemistry Basics',
    subject: 'Chemistry',
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
  const isTestsView = location.search === '?view=tests';

  const handleBack = () => {
    if (isTestsView) {
      navigate('/student-dashboard');
    } else {
      navigate(-1);
    }
  };

  const handleStartTest = (test: Test) => {
    // Create test data in the format expected by TestInterface
    const testData = {
      id: test.id,
      title: test.title,
      subject: test.subject,
      duration: test.duration,
      questions: [
        {
          id: 1,
          text: "What is 2 + 2?",
          type: "text",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          difficultyLevel: "easy"
        },
        {
          id: 2,
          text: "What is the capital of France?",
          type: "text",
          options: ["London", "Berlin", "Paris", "Madrid"],
          correctAnswer: 2,
          difficultyLevel: "easy"
        }
      ]
    };

    navigate('/test-interface', { 
      state: { 
        test: testData
      } 
    });
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
                {isTestsView ? 'Available Tests' : 'All Tests'}
              </h1>
            </div>

            {!isTestsView && (
              <>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              </>
            )}

            {/* Available Tests */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {isTestsView ? 'All Available Tests' : 'Available Tests'}
                </h2>
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
                          onClick={() => handleStartTest(test)}
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
          </>
        )}
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

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
}> = ({ icon, title, value, subtitle }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        {icon}
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};