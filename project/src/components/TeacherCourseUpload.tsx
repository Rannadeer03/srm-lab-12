import { Download, Eye, FileText } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { CourseMaterial, Subject } from '../services/api';
import { api } from '../services/api';

const TeacherCourseUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);

  // Initialize subjects and materials
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Fetch subjects
        const dbSubjects = await api.getSubjects();
        if (dbSubjects && dbSubjects.length > 0) {
          setSubjects(dbSubjects);

          // Fetch materials for each subject
          const allMaterials: CourseMaterial[] = [];
          for (const subject of dbSubjects) {
            const subjectMaterials = await api.getCourseMaterialsBySubject(
              subject._id
            );
            allMaterials.push(...subjectMaterials);
          }
          setMaterials(allMaterials);
          setMessage('Data loaded successfully');
        } else {
          setError('No subjects available. Please refresh the page.');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'video/mp4',
        'video/webm',
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError(
          'Only PDF, Word, PowerPoint, and video files (MP4, WebM) are allowed'
        );
        e.target.value = '';
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size should not exceed 100MB');
        e.target.value = '';
        return;
      }

      setFile(selectedFile);
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

    if (!materialType) {
      setError('Please select material type');
      return;
    }

    try {
      setError('');
      setMessage('Uploading course material...');

      const response = await api.uploadCourseMaterial(
        selectedSubject,
        title,
        description,
        materialType,
        file
      );

      console.log('Upload successful:', response);
      setMessage('Course material uploaded successfully!');

      // Add the new material to the list
      setMaterials((prevMaterials) => [...prevMaterials, response]);

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setMaterialType('');
      setSelectedSubject('');

      // Reset file input
      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload course material. Please try again.'
      );
      setMessage('');
    }
  };

  const handleViewMaterial = (material: CourseMaterial) => {
    window.open(`${api.baseUrl}/materials/${material.path}`, '_blank');
  };

  const handleDownload = (material: CourseMaterial) => {
    const link = document.createElement('a');
    link.href = `${api.baseUrl}/materials/${material.path}`;
    link.download = material.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upload Form */}
      <div className="p-6 bg-white rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Upload Course Material</h2>

        <div className="space-y-4">
          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Subject
            </label>
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select material type</option>
              <option value="lecture">Lecture Notes</option>
              <option value="presentation">Presentation</option>
              <option value="tutorial">Tutorial</option>
              <option value="video">Video Lecture</option>
              <option value="reference">Reference Material</option>
            </select>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter material title"
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
              placeholder="Enter material description"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          {message && <div className="text-green-500 text-sm">{message}</div>}

          <button
            onClick={handleUpload}
            disabled={
              !file ||
              !selectedSubject ||
              !title.trim() ||
              !description.trim() ||
              !materialType
            }
            className={`px-4 py-2 rounded-md text-white font-medium
              ${
                file &&
                selectedSubject &&
                title.trim() &&
                description.trim() &&
                materialType
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
          >
            Upload Material
          </button>
        </div>
      </div>

      {/* Uploaded Materials List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Uploaded Materials</h2>

        {materials.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No materials uploaded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => {
              const subject = subjects.find(
                (s) => s.id === material.subject_id
              );
              return (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {material.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {material.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {subject?.name} ({subject?.code})
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                          {material.materialType}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewMaterial(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseUpload;
