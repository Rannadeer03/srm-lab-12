import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, BarChart2, AlertTriangle, ArrowLeft, Filter } from 'lucide-react';
import { api, Subject, Test } from '../services/api';

interface LocationState {
  testId: string;
}

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId } = (location.state as LocationState) || { testId: null };
  const isTestsView = location.search === '?view=tests';
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subjectsData, testsData] = await Promise.all([
          api.getSubjects(),
          api.getStudentTests()
        ]);
        setSubjects(subjectsData);
        setTests(testsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBack = () => {
    if (isTestsView) {
      navigate('/student-dashboard');
    } else {
      navigate(-1);
    }
  };

  const handleStartTest = (test: Test) => {
    navigate('/test-interface', { 
      state: { 
        test
      } 
    });
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

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
                    Welcome back! Ready for your next challenge?
                  </h1>
                  <p className="mt-2 text-gray-600">
                    You have {tests.length} tests available.
                  </p>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  <StatCard
                    icon={<BookOpen className="h-6 w-6 text-indigo-600" />}
                    title="Total Tests"
                    value={tests.length.toString()}
                  />
                  <StatCard
                    icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                    title="Available"
                    value={tests.length.toString()}
                  />
                  <StatCard
                    icon={<BarChart2 className="h-6 w-6 text-blue-600" />}
                    title="Average Duration"
                    value={`${Math.round(tests.reduce((acc, test) => acc + test.duration, 0) / tests.length)} min`}
                  />
                  <StatCard
                    icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />}
                    title="Questions"
                    value={tests.reduce((acc, test) => acc + test.questions.length, 0).toString()}
                    subtitle="Total questions"
                  />
                </div>
              </>
            )}

            {/* Available Tests */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-lg font-medium text-gray-900">
                    {isTestsView ? 'All Available Tests' : 'Available Tests'}
                  </h2>
                  <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search tests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="relative">
                      <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="all">All Subjects</option>
                        {subjects.map((subject) => (
                          <option key={subject._id} value={subject.name}>
                            {subject.name} ({subject.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <li key={test.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-indigo-600">{test.title}</h3>
                          <TestStatusBadge status="new" />
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>{test.subject}</span>
                          <span>•</span>
                          <span>{test.questions.length} questions</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {test.duration} minutes
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleStartTest(test)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Start Test
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
}> = ({ status }) => {
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
          Completed
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
}> = ({ icon, title, value, subtitle }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 truncate">
            {title}
          </dt>
          <dd className="flex items-baseline">
            <div className="text-2xl font-semibold text-gray-900">
              {value}
            </div>
          </dd>
          {subtitle && (
            <dd className="text-sm text-gray-500">
              {subtitle}
            </dd>
          )}
        </dl>
      </div>
    </div>
  </div>
);