import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Download, Calendar, Clock, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { useToast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  due_date: string;
  file_path: string;
  filename: string;
  created_at: string;
}

const StudentAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, subjects(name, code)');

      if (assignmentsError) throw assignmentsError;

      // Transform the data to match our interface
      const transformedAssignments = (assignmentsData || []).map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject_id: assignment.subject_id,
        subject_name: assignment.subjects.name,
        subject_code: assignment.subjects.code,
        due_date: assignment.due_date,
        file_path: assignment.file_path,
        filename: assignment.filename,
        created_at: assignment.created_at
      }));

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch assignments. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Group assignments by subject
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const subjectKey = `${assignment.subject_name} (${assignment.subject_code})`;
    if (!acc[subjectKey]) {
      acc[subjectKey] = [];
    }
    acc[subjectKey].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const handleDownload = async (assignment: Assignment) => {
    try {
      const { data: { publicUrl } } = supabase.storage
        .from('assignments')
        .getPublicUrl(assignment.file_path);

      const link = document.createElement('a');
      link.href = publicUrl;
      link.download = assignment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Assignment downloaded successfully'
      });
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download assignment. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to download assignment. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleViewPdf = (assignment: Assignment) => {
    const { data: { publicUrl } } = supabase.storage
      .from('assignments')
      .getPublicUrl(assignment.file_path);
    
    window.open(publicUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/student-dashboard')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <span className="text-2xl font-bold text-gray-900 ml-2">Assignments</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {Object.entries(groupedAssignments).map(([subjectName, subjectAssignments]) => (
          <div key={subjectName} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{subjectName}</h2>
            <div className="space-y-4">
              {subjectAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <CardTitle>{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{assignment.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Posted: {format(new Date(assignment.created_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPdf(assignment)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(assignment)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedAssignments).length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No assignments available at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentView; 