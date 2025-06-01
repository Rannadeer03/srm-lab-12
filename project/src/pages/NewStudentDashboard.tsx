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
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTestsModal, setShowTestsModal] = useState(false);

  useEffect(() => {
    // Check if we should show tests modal from navigation
    if (location.state?.showTests) {
      setShowTestsModal(true);
      // Clear the state to prevent showing modal on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tests from Supabase
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('*');

        if (testsError) throw testsError;

        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;

        setAvailableTests(testsData || []);
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
    navigate(`/test/${testId}`);
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
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

        {/* Tests Modal */}
        {showTestsModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
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