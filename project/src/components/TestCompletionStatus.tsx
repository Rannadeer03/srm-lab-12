import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestCompletionStatus {
  test_id: string;
  test_title: string;
  status: 'completed' | 'in_progress' | 'not_started';
  score?: number;
  submitted_at?: string;
}

export const TestCompletionStatus: React.FC = () => {
  const { user } = useAuthStore();
  const [completedTests, setCompletedTests] = useState<TestCompletionStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTestStatus();
    }
  }, [user]);

  const fetchTestStatus = async () => {
    try {
      // Fetch all tests
      const { data: tests, error: testsError } = await supabase
        .from('tests')
        .select('id, title')
        .eq('is_active', true);

      if (testsError) throw testsError;

      // Fetch test results for the current user
      const { data: results, error: resultsError } = await supabase
        .from('test_results')
        .select('test_id, status, score, submitted_at')
        .eq('student_id', user?.id);

      if (resultsError) throw resultsError;

      // Map test status
      const testStatus = tests.map(test => {
        const result = results?.find(r => r.test_id === test.id);
        return {
          test_id: test.id,
          test_title: test.title,
          status: result?.status || 'not_started',
          score: result?.score,
          submitted_at: result?.submitted_at
        };
      });

      setCompletedTests(testStatus);
    } catch (error) {
      console.error('Error fetching test status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Completion Status</h2>
      {completedTests.length === 0 ? (
        <p className="text-gray-500">No tests available.</p>
      ) : (
        <div className="grid gap-4">
          {completedTests.map((test) => (
            <div
              key={test.test_id}
              className="bg-white rounded-lg shadow p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{test.test_title}</h3>
                  <div className="flex items-center mt-1">
                    {test.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Completed</span>
                        {test.score !== undefined && (
                          <span className="ml-2 text-sm text-gray-500">
                            Score: {test.score}%
                          </span>
                        )}
                      </>
                    ) : test.status === 'in_progress' ? (
                      <>
                        <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="text-sm text-yellow-600">In Progress</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Not Started</span>
                      </>
                    )}
                  </div>
                </div>
                {test.submitted_at && (
                  <div className="text-sm text-gray-500">
                    Submitted: {new Date(test.submitted_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 