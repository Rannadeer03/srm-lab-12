import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  BarChart2, 
  Plus, 
  Search, 
  Filter, 
  Download,
  ClipboardList,
  FileText,
  Calendar,
  Settings,
  GraduationCap,
  Target,
  Award,
  Book,
  PenTool
} from 'lucide-react';
import { api } from '../services/api';
import { testService, Test } from '../services/supabaseApi';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

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

interface TestData {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  is_active: boolean;
}

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
}

export const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tests, setTests] = useState<TestData[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeTests, setActiveTests] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [showEditTestModal, setShowEditTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [recentActivities] = useState(recentActivity);

  const menuItems = [
    {
      id: 'tests',
      title: 'Test Management',
      icon: <ClipboardList className="h-8 w-8" />,
      image: '/images/tests.jpg',
      color: 'bg-blue-500',
      description: 'Create and manage tests'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText className="h-8 w-8" />,
      image: '/images/assignments.jpg',
      color: 'bg-green-500',
      description: 'Manage student assignments'
    },
    {
      id: 'materials',
      title: 'Course Materials',
      icon: <Book className="h-8 w-8" />,
      image: '/images/materials.jpg',
      color: 'bg-purple-500',
      description: 'Upload and manage study materials'
    },
    {
      id: 'schedule',
      title: 'Class Schedule',
      icon: <Calendar className="h-8 w-8" />,
      image: '/images/schedule.jpg',
      color: 'bg-yellow-500',
      description: 'Manage class schedules'
    },
    {
      id: 'grades',
      title: 'Grade Management',
      icon: <PenTool className="h-8 w-8" />,
      image: '/images/grades.jpg',
      color: 'bg-red-500',
      description: 'Manage student grades'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-8 w-8" />,
      image: '/images/settings.jpg',
      color: 'bg-gray-500',
      description: 'Manage account settings'
    }
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    if (id === 'tests') {
      navigate('/teacher/test-management');
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
        console.log('Subjects loaded:', subjectsData);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);

      // Fetch teacher profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setTeacherProfile(profile);

      // Fetch total students
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      if (studentsError) throw studentsError;
      setTotalStudents(studentsCount || 0);

      // Fetch tests
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('teacher_id', user?.id);

      if (testsError) throw testsError;
      setTests(testsData || []);
      setActiveTests(testsData?.filter(t => t.is_active).length || 0);

      // Fetch average score by first getting all test IDs for this teacher
      const testIds = testsData?.map(test => test.id) || [];
      
      if (testIds.length > 0) {
        const { data: results, error: resultsError } = await supabase
          .from('test_results')
          .select('score')
          .in('test_id', testIds);

        if (resultsError) throw resultsError;
        
        if (results && results.length > 0) {
          const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
          const avgScore = totalScore / results.length;
          setAverageScore(Math.round(avgScore));
        }
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? test.is_active : !test.is_active);
    return matchesSearch && matchesStatus;
  });

  const handleEditTest = (testId: string) => {
    const testToEdit = tests.find((test) => test.id === testId);
    if (testToEdit) {
      setSelectedTest(testToEdit);
      setShowEditTestModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Test Created Successfully!</h2>
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
                  <p className="text-blue-100">Welcome back, {teacherProfile?.name || 'Teacher'}! 👋</p>
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
            <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalStudents}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-100 text-green-600 mb-4">
              <ClipboardList className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Active Tests</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{activeTests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
              <BarChart2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Average Score</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{averageScore}%</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
              onClick={() => handleMenuClick(item.id)}
            >
              <div className={`h-32 ${item.color} flex items-center justify-center`}>
                {item.icon}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={<Users className="h-6 w-6 text-indigo-600" />}
            title="Total Students"
            value={totalStudents.toString()}
          />
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-green-600" />}
            title="Active Tests"
            value={activeTests.toString()}
          />
          <StatCard
            icon={<CheckCircle className="h-6 w-6 text-blue-600" />}
            title="Completed Tests"
            value={(totalStudents - activeTests).toString()}
          />
          <StatCard
            icon={<BarChart2 className="h-6 w-6 text-purple-600" />}
            title="Average Score"
            value={averageScore.toString()}
          />
        </div>

        {/* Test Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Recent Tests</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tests..."
                  className="pl-10 pr-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                className="border rounded-lg px-4 py-2"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTests.map((test) => (
                  <tr key={test.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{test.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{test.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(test.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          test.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {test.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditTest(test.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/test-results/${test.id}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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