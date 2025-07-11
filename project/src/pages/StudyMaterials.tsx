import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Search, ChevronRight, ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  material_type: string;
  path: string;
  filename: string;
  upload_date: string;
}

export const StudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch subjects and materials
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch subjects from Supabase
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');

        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);

        // If a subject is selected, fetch its materials
        if (selectedSubject) {
          const { data: materialsData, error: materialsError } = await supabase
            .from('course_materials')
            .select('*, subjects(name, code)')
            .eq('subject_id', selectedSubject);

          if (materialsError) throw materialsError;

          // Transform the data to match our interface
          const transformedMaterials = (materialsData || []).map(material => ({
            id: material.id,
            title: material.title,
            description: material.description,
            subject_id: material.subject_id,
            subject_name: material.subjects.name,
            subject_code: material.subjects.code,
            material_type: material.material_type,
            path: material.path,
            filename: material.filename,
            upload_date: material.created_at
          }));

          setMaterials(transformedMaterials);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load study materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubject]);

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
      setMaterials([]);
    } else {
      navigate('/student-dashboard');
    }
  };

  const handlePdfAction = async (material: CourseMaterial, action: 'view' | 'download') => {
    try {
      setError(''); // Clear any previous errors
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('course_materials')
        .getPublicUrl(material.path);
      
      if (action === 'view') {
        // For viewing, open in a new tab
        window.open(publicUrl, '_blank');
      } else {
        // For downloading, create a temporary link
        const link = document.createElement('a');
        link.href = publicUrl;
        link.download = material.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error handling file action:', error);
      setError(error instanceof Error ? error.message : 'Failed to process the file. Please try again later.');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentSubject = (): Subject | undefined => 
    subjects.find(s => s.id === selectedSubject);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedSubject ? getCurrentSubject()?.name : 'Study Materials'}
              </h1>
              <p className="text-gray-600">
                {selectedSubject ? 'View and download study materials' : 'Choose a subject to view materials'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Search */}
        {!selectedSubject && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {selectedSubject ? (
          // Materials List
          <div className="space-y-4">
            {materials.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">No study materials available for this subject yet.</p>
              </div>
            ) : (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{material.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                            {material.material_type}
                          </span>
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs">
                            {material.subject_name} ({material.subject_code})
                          </span>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(material.upload_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePdfAction(material, 'view')}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handlePdfAction(material, 'download')}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Subjects Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{subject.name}</h3>
                      <p className="text-sm text-gray-600">Code: {subject.code}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 