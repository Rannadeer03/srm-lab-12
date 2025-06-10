import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
import { TestCompletionStatus } from '../components/TestCompletionStatus';
import { useAuthStore } from '../store/authStore';

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  teacher_id: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export const NewStudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestsModal, setShowTestsModal] = useState(false);
  const [completedTestIds, setCompletedTestIds] = useState<string[]>([]);

  useEffect(() => {
    // Check if we should show tests modal from navigation
    if (location.state?.showTests) {
      setShowTestsModal(true);
      // Clear the state to prevent showing modal on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      fetchAvailableTests();
      fetchCompletedTests();
    }
  }, [user]);

  const fetchCompletedTests = async () => {
    try {
      const { data: results, error } = await supabase
        .from('test_results')
        .select('test_id')
        .eq('student_id', user?.id)
        .eq('status', 'completed');

      if (error) throw error;

      const completedIds = results?.map(result => result.test_id) || [];
      setCompletedTestIds(completedIds);
    } catch (error) {
      console.error('Error fetching completed tests:', error);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const { data: tests, error } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out completed tests
      const filteredTests = tests?.filter(test => !completedTestIds.includes(test.id)) || [];
      setAvailableTests(filteredTests);
    } catch (error) {
      console.error('Error fetching available tests:', error);
    }
  };

  // Update fetchAvailableTests when completedTestIds changes
  useEffect(() => {
    if (user) {
      fetchAvailableTests();
    }
  }, [completedTestIds]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;

        setSubjects(subjectsData || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (subjectCode: string) => {
    const subject = subjects.find(s => s.code === subjectCode);
    return subject ? subject.name : 'Unknown Subject';
  };

  const handleStartTest = (testId: string) => {
    navigate(`/take-test/${testId}`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
        
        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Tests Menu Item */}
          <div 
            onClick={() => handleMenuClick('tests')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Available Tests</h2>
                <p className="text-sm text-gray-500">{availableTests.length} tests available</p>
              </div>
            </div>
          </div>

          {/* Study Materials Menu Item */}
          <div 
            onClick={() => handleMenuClick('study-materials')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Book className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Study Materials</h2>
                <p className="text-sm text-gray-500">Access your learning resources</p>
              </div>
            </div>
          </div>

          {/* Assignments Menu Item */}
          <div 
            onClick={() => handleMenuClick('assignments')}
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
                <p className="text-sm text-gray-500">View and submit assignments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Completion Status Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <TestCompletionStatus />
        </div>

        {/* Tests Modal */}
        {showTestsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Available Tests</h2>
                  <button
                    onClick={() => setShowTestsModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {availableTests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tests available at the moment.</p>
                ) : (
                  <div className="space-y-4">
                    {availableTests.map((test) => (
                      <div
                        key={test.id}
                        className="border rounded-lg p-4 hover:border-indigo-500 cursor-pointer"
                        onClick={() => handleStartTest(test.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                            <p className="text-sm text-gray-500">{getSubjectName(test.subject)}</p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {test.duration} minutes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};