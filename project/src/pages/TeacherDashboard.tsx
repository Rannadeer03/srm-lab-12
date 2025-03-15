import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, BarChart2, Plus, Search, Filter, Download } from 'lucide-react';

const mockTests = [
  {
    id: '1',
    name: 'Mid-term Mathematics',
    subject: 'Mathematics',
    dateCreated: '2024-03-20',
    status: 'active',
    studentsCompleted: 25,
    totalStudents: 50,
    averageScore: 76,
    duration: 60,
    questions: [
      {
        text: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: '2',
    name: 'Physics Fundamentals',
    subject: 'Physics',
    dateCreated: '2024-03-18',
    status: 'completed',
    studentsCompleted: 45,
    totalStudents: 45,
    averageScore: 82,
    duration: 90,
    questions: [],
  },
  {
    id: '3',
    name: 'Chemistry Basics',
    subject: 'Chemistry',
    dateCreated: '2024-03-15',
    status: 'draft',
    studentsCompleted: 0,
    totalStudents: 40,
    averageScore: 0,
    duration: 45,
    questions: [],
  },
];

const recentActivity = [
  {
    id: '1',
    student: 'John Doe',
    action: 'completed',
    test: 'Mid-term Mathematics',
    score: 85,
    timestamp: '2024-03-21T10:30:00',
  },
  {
    id: '2',
    student: 'Jane Smith',
    action: 'started',
    test: 'Physics Fundamentals',
    timestamp: '2024-03-21T10:15:00',
  },
  {
    id: '3',
    student: 'Mike Johnson',
    action: 'completed',
    test: 'Physics Fundamentals',
    score: 92,
    timestamp: '2024-03-21T10:00:00',
  },
];

export const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState(mockTests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (location.state?.test) {
      if (location.state?.isEditing) {
        // Update existing test
        setTests((prevTests) =>
          prevTests.map((test) =>
            test.id === location.state.test.id ? location.state.test : test
          )
        );
      } else {
        // Add new test
        setTests((prevTests) => [location.state.test, ...prevTests]);
      }
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, [location.state]);

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || test.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleEditTest = (testId: string) => {
    const testToEdit = tests.find((test) => test.id === testId);
    if (testToEdit) {
      navigate('/create-test', { state: { test: testToEdit, isEditing: true } });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center shadow-lg">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Test {location.state?.isEditing ? 'updated' : 'created'} successfully!</span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, Professor Smith!</h1>
              <p className="mt-2 text-gray-600">
                You have {tests.filter((t) => t.status === 'active').length} active tests and{' '}
                {recentActivity.length} recent activities.
              </p>
            </div>
            <Link
              to="/create-test"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Test
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-indigo-600" />}
            title="Total Students"
            value="156"
          />
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-green-600" />}
            title="Active Tests"
            value={tests.filter((t) => t.status === 'active').length.toString()}
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
            title="Completed Tests"
            value={tests.filter((t) => t.status === 'completed').length.toString()}
          />
          <StatCard
            icon={<BarChart2 className="h-6 w-6 text-purple-600" />}
            title="Average Score"
            value="78%"
          />
        </div>

        {/* Test Management */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900">Test Management</h2>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-5 w-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.name}</div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(test.dateCreated).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.questions?.length || 0} questions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.duration} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <TestStatusBadge status={test.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTest(test.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">View Results</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.action === 'completed' ? (
                        <>
                          Completed <span className="font-medium">{activity.test}</span> with a score
                          of <span className="font-medium">{activity.score}%</span>
                        </>
                      ) : (
                        <>
                          Started <span className="font-medium">{activity.test}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string }> = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};