import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type { Subject } from '../services/api';
import TeacherAssignmentList from './TeacherAssignmentList';

const TeacherAssignmentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const listRef = useRef<{ fetchAssignments: () => Promise<void> }>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const data = await api.getSubjects();
      // Remove duplicates based on code
      const uniqueSubjects = data.filter((subject: Subject, index: number, self: Subject[]) =>
        index === self.findIndex((s) => s.code === subject.code)
      );
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to fetch subjects. Please try again.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (!dueDate) {
      setError('Please select a due date');
      return;
    }

    try {
      const result = await api.uploadAssignment(
        selectedSubject,
        title,
        description,
        dueDate,
        file
      );
      setMessage('Assignment uploaded successfully!');
      setFile(null);
      setTitle('');
      setDescription('');
      setDueDate('');
      setSelectedSubject('');
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      // Refresh the list
      if (listRef.current) {
        listRef.current.fetchAssignments();
      }
    } catch (err) {
      setError('Failed to upload assignment. Please try again.');
      console.error('Upload error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Upload New Assignment</h2>
          
          <div className="space-y-4">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter assignment title"
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Enter assignment description"
              />
            </div>

            {/* Due Date Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {message && (
              <div className="text-green-500 text-sm">{message}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || !selectedSubject || !title.trim() || !description.trim() || !dueDate}
              className={`px-4 py-2 rounded-md text-white font-medium
                ${file && selectedSubject && title.trim() && description.trim() && dueDate
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Upload Assignment
            </button>
          </div>
        </div>

        {/* List Section */}
        <TeacherAssignmentList ref={listRef} />
      </div>
    </div>
  );
};

export default TeacherAssignmentUpload; 