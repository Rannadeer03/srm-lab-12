import { useState, useEffect, ChangeEvent } from 'react';
import { supabase, testConnection } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/use-toast';
import { CreateTestButton } from '../components/CreateTestButton';

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  teacher_id: string;
  is_active: boolean;
  participants: string[];
  is_scheduled: boolean;
  scheduled_date: string | null;
  scheduled_time: string | null;
  time_limit: number | null;
  allow_late_submissions: boolean;
  access_window_start: string | null;
  access_window_end: string | null;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  target_easy: number;
  target_medium: number;
  target_hard: number;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  time_taken: number | null;
  answers: any | null;
  started_at: string | null;
  submitted_at: string | null;
  created_at: string;
  student_name: string;
}

interface TestResultWithProfile {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  time_taken: number | null;
  answers: any | null;
  started_at: string | null;
  submitted_at: string | null;
  created_at: string;
  profiles: {
    name: string;
  } | null;
}

export default function TestManagement() {
  console.log('TestManagement component rendering');

  const [tests, setTests] = useState<Test[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTest, setNewTest] = useState({
    title: '',
    subject: '',
    duration: 60,
    is_active: true,
    participants: [],
    is_scheduled: false,
    scheduled_date: null,
    scheduled_time: null,
    time_limit: null,
    allow_late_submissions: false,
    access_window_start: null,
    access_window_end: null,
    easy_count: 0,
    medium_count: 0,
    hard_count: 0,
    target_easy: 0.0,
    target_medium: 0.0,
    target_hard: 0.0
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('TestManagement useEffect running');
    const initialize = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Test Supabase connection first
        console.log('Testing Supabase connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
          throw new Error('Failed to connect to Supabase');
        }
        console.log('Supabase connection successful');

        // Load data
        console.log('Starting to load data');
        try {
          await fetchTests();
          console.log('Tests loaded successfully');
        } catch (error) {
          console.error('Error loading tests:', error);
          throw new Error('Failed to load tests');
        }

        try {
          await fetchResults();
          console.log('Results loaded successfully');
        } catch (error) {
          console.error('Error loading results:', error);
          throw new Error('Failed to load test results');
        }

        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Error in initialization:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchTests = async () => {
    console.log('Fetching tests...');
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tests:', error);
        throw error;
      }

      console.log('Tests fetched:', data);
      setTests(data || []);
    } catch (error) {
      console.error('Error in fetchTests:', error);
      throw error;
    }
  };

  const fetchResults = async () => {
    console.log('Fetching results...');
    try {
      // First, check if the test_results table exists and has any data
      const { count, error: countError } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error checking test_results table:', countError);
        throw countError;
      }

      console.log('Number of test results:', count);

      if (count === 0) {
        console.log('No test results found');
        setResults([]);
        return;
      }

      // If we have results, fetch them with the student information
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          id,
          test_id,
          student_id,
          score,
          time_taken,
          answers,
          started_at,
          submitted_at,
          created_at,
          profiles:student_id (
            name
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching results:', error);
        throw error;
      }

      console.log('Results fetched:', data);
      
      // Map the results and handle potential null values
      const mappedResults: TestResult[] = (data as unknown as TestResultWithProfile[])?.map(result => ({
        id: result.id,
        test_id: result.test_id,
        student_id: result.student_id,
        score: Number(result.score) || 0,
        time_taken: result.time_taken,
        answers: result.answers,
        started_at: result.started_at,
        submitted_at: result.submitted_at,
        created_at: result.created_at,
        student_name: result.profiles?.name || 'Unknown Student'
      })) || [];

      console.log('Mapped results:', mappedResults);
      setResults(mappedResults);
    } catch (error) {
      console.error('Error in fetchResults:', error);
      throw error;
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTest(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
  };

  const handleCreateTest = async () => {
    if (!newTest.title.trim() || !newTest.subject.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both title and subject',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('tests')
        .insert([{
          ...newTest,
          teacher_id: user.id
        }]);

      if (error) {
        console.error('Error creating test:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Test created successfully',
      });

      setIsCreatingTest(false);
      setNewTest({
        title: '',
        subject: '',
        duration: 60,
        is_active: true,
        participants: [],
        is_scheduled: false,
        scheduled_date: null,
        scheduled_time: null,
        time_limit: null,
        allow_late_submissions: false,
        access_window_start: null,
        access_window_end: null,
        easy_count: 0,
        medium_count: 0,
        hard_count: 0,
        target_easy: 0.0,
        target_medium: 0.0,
        target_hard: 0.0
      });
      fetchTests();
    } catch (error) {
      console.error('Error in handleCreateTest:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      // First delete all related test results
      const { error: resultsError } = await supabase
        .from('test_results')
        .delete()
        .eq('test_id', testId);

      if (resultsError) {
        console.error('Error deleting test results:', resultsError);
        throw resultsError;
      }

      // Then delete the test
      const { error: testError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (testError) {
        console.error('Error deleting test:', testError);
        throw testError;
      }

      // Refresh the tests list
      await fetchTests();
      
      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });
    } catch (error) {
      console.error('Error in handleDeleteTest:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete test',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Management</h1>
        <CreateTestButton />
      </div>

      {isCreatingTest && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                name="title"
                value={newTest.title}
                onChange={handleInputChange}
                placeholder="Enter test title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <Input
                name="subject"
                value={newTest.subject}
                onChange={handleInputChange}
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <Input
                name="duration"
                type="number"
                value={newTest.duration}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreatingTest(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTest}>Create Test</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tests</h2>
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests created yet.</p>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{test.title}</h3>
                      <p className="text-sm text-gray-500">Subject: {test.subject}</p>
                      <p className="text-sm text-gray-500">Duration: {test.duration} minutes</p>
                      <p className="text-sm text-gray-500">Status: {test.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
                            handleDeleteTest(test.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Student Results</h2>
          {results.length === 0 ? (
            <p className="text-gray-500">No test results yet.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{result.student_name}</h3>
                  <p className="text-sm text-gray-500">Score: {result.score}</p>
                  <p className="text-sm text-gray-500">Time Taken: {result.time_taken} mins</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {result.submitted_at ? new Date(result.submitted_at).toLocaleDateString() : 'Not submitted'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 