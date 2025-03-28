import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Assignment } from '../services/api';
import { FileText, Download, Calendar, BookOpen, Clock, Eye } from 'lucide-react';
import { API_BASE_URL } from '../config';

const StudentAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const data = await api.getStudentAssignments();
      setAssignments(data);
    } catch (err) {
      setError('Failed to fetch assignments. Please try again later.');
      console.error('Fetch error:', err);
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
      const link = document.createElement('a');
      link.href = `${API_BASE_URL}/student/assignments/${assignment._id}/download`;
      link.download = assignment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download assignment. Please try again.');
    }
  };

  const handleViewPdf = (assignment: Assignment) => {
    window.open(`${API_BASE_URL}/student/assignments/${assignment._id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Available Assignments</h2>
          <div className="text-sm text-gray-500">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {assignments.length === 0 ? (
          <p className="text-gray-500">No assignments available yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAssignments).map(([subject, subjectAssignments]) => (
              <div key={subject} className="space-y-4">
                <div className="flex items-center space-x-2 border-b pb-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectAssignments.map((assignment) => (
                    <div
                      key={assignment._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {assignment.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewPdf(assignment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="View PDF"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(assignment)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(assignment.due_date).getTime() < new Date().getTime()
                              ? 'Overdue'
                              : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignmentView; 