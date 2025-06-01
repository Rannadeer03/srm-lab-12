import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { api } from '../services/api';
import type { Assignment } from '../services/api';
import { FileText, Download, Trash2, Calendar, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../config';

export interface TeacherAssignmentListRef {
  fetchAssignments: () => Promise<void>;
}

const TeacherAssignmentList = forwardRef<TeacherAssignmentListRef>((props, ref) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchAssignments = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (err) {
      setError('Failed to fetch assignments. Please try again later.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchAssignments
  }));

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.deleteAssignment(assignmentId);
        setAssignments(assignments.filter(a => a.id !== assignmentId));
      } catch (err) {
        console.error('Delete error:', err);
        setError('Failed to delete assignment. Please try again.');
      }
    }
  };

  // Group assignments by subject
  const groupedAssignments = assignments.reduce((acc, assignment) => {
    const subjectKey = `${assignment.subject?.name || 'Unknown'} (${assignment.subject?.code || 'N/A'})`;
    if (!acc[subjectKey]) {
      acc[subjectKey] = [];
    }
    acc[subjectKey].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Assignments</h2>
      
      {assignments.length === 0 ? (
        <p className="text-gray-500">No assignments uploaded yet.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAssignments).map(([subject, subjectAssignments]) => (
            <div key={subject} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {subject}
              </h3>
              <div className="space-y-4">
                {subjectAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex flex-col p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{assignment.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`${API_BASE_URL}/student/assignments/${assignment.id}/download`, '_blank')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default TeacherAssignmentList; 