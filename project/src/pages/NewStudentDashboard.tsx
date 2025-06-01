import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, 
  FileText, 
  ClipboardList, 
  BarChart2, 
  Calendar,
  Settings,
  GraduationCap,
  Target,
  Award,
  Clock,
  Book,
  X
} from 'lucide-react';

interface Test {
  _id: string;
  title: string;
  description: string;
  subject_id: string;
  teacher_id: string;
  duration_minutes: number;
  status: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

export const NewStudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestsModal, setShowTestsModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
        const [testsResponse, subjectsResponse] = await Promise.all([
          axios.get<Test[]>('http://localhost:8000/tests'),
          axios.get<Subject[]>('http://localhost:8000/teacher/subjects')
        ]);

        console.log('Tests Response:', testsResponse.data);
        console.log('Subjects Response:', subjectsResponse.data);

        // Ensure we have valid test IDs
        const validTests = testsResponse.data.filter(test => test._id);
        setAvailableTests(validTests);
        setSubjects(subjectsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.code === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const handleMenuClick = (id: string) => {
    if (id === 'tests') {
      setShowTestsModal(true);
    } else if (id === 'study-materials') {
      navigate('/study-materials');
    } else if (id === 'assignments') {
      navigate('/student/assignments');
    } else {
      console.log(`Clicked menu item: ${id}`);
    }
  };

  const handleStartTest = (test: Test) => {
    if (!test._id) {
      console.error('Invalid test: No ID provided');
      return;
    }

    // Log the test being started
    console.log('Attempting to start test:', test);

    setShowTestsModal(false);
    navigate(`/tests/${test._id}`);
  };

  const menuItems = [
    {
      id: 'tests',
      title: 'Tests',
      icon: <ClipboardList className="h-8 w-8" />,
      image: '/images/tests.jpg',
      color: 'bg-blue-500',
      description: 'View and take your tests'
    },
    {
      id: 'assignments',
      title: 'Assignments',
      icon: <FileText className="h-8 w-8" />,
      image: '/images/assignments.jpg',
      color: 'bg-green-500',
      description: 'View and submit assignments'
    },
    {
      id: 'study-materials',
      title: 'Study Materials',
      icon: <BookOpen className="h-8 w-8" />,
      image: '/images/study.jpg',
      color: 'bg-purple-500',
      description: 'Access study materials and resources'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="h-8 w-8" />,
      image: '/images/schedule.jpg',
      color: 'bg-yellow-500',
      description: 'View your class schedule'
    },
    {
      id: 'progress',
      title: 'Progress',
      icon: <BarChart2 className="h-8 w-8" />,
      image: '/images/progress.jpg',
      color: 'bg-red-500',
      description: 'Track your academic progress'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-8 w-8" />,
      image: '/images/settings.jpg',
      color: 'bg-gray-500',
      description: 'Manage your account settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Decorative Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Student Portal</h1>
                <p className="text-indigo-100">Welcome back, John! 👋</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Active Courses</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{subjects.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-100 text-green-600 mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Available Tests</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{availableTests.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-purple-100 text-purple-600 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Achievement Points</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">850</p>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-200"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />

                  {/* Content */}
                  <div className="relative p-6">
                    <div className={`inline-flex items-center justify-center p-3 rounded-lg ${item.color} text-white mb-4`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Tests Modal */}
            {showTestsModal && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Available Tests</h2>
                    <button
                      onClick={() => setShowTestsModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {availableTests.map((test) => (
                        <div key={test._id} className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Book className="h-5 w-5 text-indigo-500" />
                              <span className="text-sm font-medium text-gray-500">
                                {getSubjectName(test.subject_id)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-gray-400" />
                              <span className="text-sm text-gray-500">{test.duration_minutes} min</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{test.title}</h3>
                          <p className="text-gray-600 mb-4">{test.description}</p>
                          <button
                            onClick={() => {
                              console.log('Test button clicked:', test);
                              handleStartTest(test);
                            }}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                          >
                            Start Test
                          </button>
                        </div>
                      ))}
                      {availableTests.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">No Tests Available</h3>
                          <p className="text-gray-500">Check back later for new tests</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Decorative Section */}
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full">
                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                    <p className="text-sm text-gray-600">Contact your academic advisor or support team</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                  Get Support
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};