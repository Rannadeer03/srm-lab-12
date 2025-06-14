import {
  Award,
  BarChart2,
  Book,
  BookOpen,
  Calendar,
  CheckCircle,
  ClipboardList,
  Download,
  FileText,
  Filter,
  GraduationCap,
  PenTool,
  Plus,
  Search,
  Settings,
  Target,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Test, testService } from '../../services/supabaseApi';
import { useAuthStore } from '../../store/authStore';

const mockTests = [
  {
    id: '1',
    name: 'Mid-term Electric Circuits',
    subject: 'Electric Circuits',
    dateCreated: '2024-03-20',
    status: 'active',
    studentsCompleted: 25,
    totalStudents: 50,
    averageScore: 76,
    duration: 60,
    questions: [
      {
        text: 'Calculate the current in a circuit with voltage 10V and resistance 5Ω',
        options: ['1A', '2A', '3A', '4A'],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: '2',
    name: 'Engineering Mathematics Quiz',
    subject: 'Engineering Mathematics',
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
    name: 'Power Systems Basics',
    subject: 'Power Systems',
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
    test: 'Mid-term Electric Circuits',
    score: 85,
    timestamp: '2024-03-21T10:30:00',
  },
  {
    id: '2',
    student: 'Jane Smith',
    action: 'started',
    test: 'Engineering Mathematics Quiz',
    timestamp: '2024-03-21T10:15:00',
  },
  {
    id: '3',
    student: 'Mike Johnson',
    action: 'completed',
    test: 'Power Systems Basics',
    score: 92,
    timestamp: '2024-03-21T10:00:00',
  },
];

export const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tests, setTests] = useState<Test[]>([]);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [showEditTestModal, setShowEditTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [recentActivities] = useState(recentActivity);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    {
      id: 'tests',
      title: 'Test Management',
      icon: <ClipboardList className="h-8 w-8" />,
      image: '/images/tests.jpg',
      color: 'bg-blue-500',
      description: 'Create and manage tests',
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText className="h-8 w-8" />,
      image: '/images/assignments.jpg',
      color: 'bg-green-500',
      description: 'Manage student assignments',
    },
    {
      id: 'materials',
      title: 'Course Materials',
      icon: <Book className="h-8 w-8" />,
      image: '/images/materials.jpg',
      color: 'bg-purple-500',
      description: 'Upload and manage study materials',
    },
    {
      id: 'schedule',
      title: 'Class Schedule',
      icon: <Calendar className="h-8 w-8" />,
      image: '/images/schedule.jpg',
      color: 'bg-yellow-500',
      description: 'Manage class schedules',
    },
    {
      id: 'grades',
      title: 'Grade Management',
      icon: <PenTool className="h-8 w-8" />,
      image: '/images/grades.jpg',
      color: 'bg-red-500',
      description: 'Manage student grades',
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-8 w-8" />,
      image: '/images/settings.jpg',
      color: 'bg-gray-500',
      description: 'Manage account settings',
    },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (id === 'tests') {
      navigate('/teacher/create-test');
    } else if (id === 'assignments') {
      navigate('/teacher/assignments');
    } else if (id === 'materials') {
      navigate('/teacher/course-materials');
    } else {
      console.log(`Clicked menu item: ${id}`);
    }
  };

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
      setShowNewTestModal(true);
      setTimeout(() => {
        setShowNewTestModal(false);
      }, 3000);
    }
  }, [location.state]);

  useEffect(() => {
    // Fetch subjects when component mounts
    const fetchSubjects = async () => {
      try {
        const subjectsData = await api.getSubjects();
        // We can use subjectsData for future features if needed
        // console.log('Subjects loaded:', subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        const teacherTests = await testService.getTestsByTeacher(user.id);
        setTests(teacherTests);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  console.log(tests);

  const filteredTests = tests.filter((test: any) => {
    const matchesSearch = test?.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || test.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditTest = (testId: string) => {
    const testToEdit = tests.find((test) => test.id === testId);
    if (testToEdit) {
      setSelectedTest(testToEdit);
      setShowEditTestModal(true);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100">
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">
              Test Created Successfully!
            </h2>
            <p>The test has been successfully created.</p>
            <button
              onClick={() => setShowNewTestModal(false)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEditTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Edit Test</h2>
            {/* Add your edit form here */}
            <button
              onClick={() => setShowEditTestModal(false)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GraduationCap className="h-12 w-12" />
                <div>
                  <h1 className="text-3xl font-bold">Teacher Portal</h1>
                  <p className="text-blue-100">
                    Welcome back, Professor {user?.user_metadata.name} 👋
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 p-3 rounded-full">
                  <Target className="h-6 w-6" />
                </div>
                <div className="bg-white/10 p-3 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Total Students
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-100 text-green-600 mb-4">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Active Tests
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {tests.filter((t: any) => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Average Score
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">78%</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${
                activeMenu === item.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-200"
                style={{ backgroundImage: `url(${item.image})` }}
              />

              {/* Content */}
              <div className="relative p-6">
                <div
                  className={`inline-flex items-center justify-center p-3 rounded-lg ${item.color} text-white mb-4`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, Professor {user?.user_metadata.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                You have{' '}
                {tests.filter((t: any) => t.status === 'active').length} active
                tests and {recentActivities.length} recent activities.
              </p>
            </div>
            <Link
              to="/teacher/create-test"
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
            value={tests
              .filter((t: any) => t.status === 'active')
              .length.toString()}
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
            title="Completed Tests"
            value={tests
              .filter((t: any) => t.status === 'completed')
              .length.toString()}
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
              <h2 className="text-lg font-medium text-gray-900">
                Test Management
              </h2>
              <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
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
                {filteredTests.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {test.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(test.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.questions?.length || 0} questions
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {test.duration} minutes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* <TestStatusBadge status={test.status} /> */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTest(test.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        View Results
                      </button>
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
            <h2 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.student}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {activity.action === 'completed' ? (
                        <>
                          Completed{' '}
                          <span className="font-medium">{activity.test}</span>{' '}
                          with a score of{' '}
                          <span className="font-medium">{activity.score}%</span>
                        </>
                      ) : (
                        <>
                          Started{' '}
                          <span className="font-medium">{activity.test}</span>
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

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string;
}> = ({ icon, title, value }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {value}
              </dd>
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
