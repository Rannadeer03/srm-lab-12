import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/api';

interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  time_spent: number;
  submitted_at: string;
}

interface Test {
  id: number;
  title: string;
  subject: string;
  duration: number;
}

const TeacherTestResults: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch test details
        const { data: testData, error: testError } = await supabase
          .from('tests')
          .select('*')
          .eq('id', testId)
          .single();
        if (testError) throw testError;
        setTest(testData);

        // Fetch test results
        const { data: resultsData, error: resultsError } = await supabase
          .from('test_results')
          .select('*')
          .eq('test_id', testId);
        if (resultsError) throw resultsError;
        setResults(resultsData);
      } catch (err) {
        setError('Failed to fetch test results');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!test) return <div>Test not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Results: {test.title}</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                Student ID
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                Score
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                Time Spent
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-600">
                Submitted At
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b border-gray-200">
                  {result.user_id}
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {result.score}%
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {result.time_spent} seconds
                </td>
                <td className="px-6 py-4 border-b border-gray-200">
                  {new Date(result.submitted_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherTestResults;
