import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Download, 
  Eye, 
  Search, 
  Filter,
  ArrowLeft,
  ChevronRight,
  FileText,
  Clock,
  User
} from 'lucide-react';

// Define types for our data structure
interface PDF {
  id: string;
  title: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  pdfUrl: string;
}

interface Unit {
  id: string;
  title: string;
  pdfs: PDF[];
}

interface Subject {
  id: string;
  title: string;
  icon: string;
  units: Unit[];
}

// Mock data for subjects and their units
const subjects: Subject[] = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    icon: '📐',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Calculus',
        pdfs: [
          {
            id: 'pdf1',
            title: 'Introduction to Calculus',
            uploadedBy: 'Dr. Smith',
            uploadDate: '2024-03-20',
            size: '2.5 MB',
            pdfUrl: '/pdfs/math-unit1-intro.pdf'
          },
          {
            id: 'pdf2',
            title: 'Limits and Continuity',
            uploadedBy: 'Dr. Smith',
            uploadDate: '2024-03-21',
            size: '1.8 MB',
            pdfUrl: '/pdfs/math-unit1-limits.pdf'
          },
          {
            id: 'pdf3',
            title: 'Derivatives Practice',
            uploadedBy: 'Dr. Johnson',
            uploadDate: '2024-03-22',
            size: '3.2 MB',
            pdfUrl: '/pdfs/math-unit1-derivatives.pdf'
          }
        ]
      },
      {
        id: 'unit2',
        title: 'Unit 2: Algebra',
        pdfs: [
          {
            id: 'pdf4',
            title: 'Basic Algebra Concepts',
            uploadedBy: 'Dr. Smith',
            uploadDate: '2024-03-23',
            size: '2.1 MB',
            pdfUrl: '/pdfs/math-unit2-basic.pdf'
          }
        ]
      },
      {
        id: 'unit3',
        title: 'Unit 3: Geometry',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Statistics',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Trigonometry',
        pdfs: []
      }
    ]
  },
  {
    id: 'physics',
    title: 'Physics',
    icon: '⚡',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Mechanics',
        pdfs: [
          {
            id: 'pdf5',
            title: 'Newton\'s Laws',
            uploadedBy: 'Dr. Brown',
            uploadDate: '2024-03-24',
            size: '2.8 MB',
            pdfUrl: '/pdfs/physics-unit1-newton.pdf'
          }
        ]
      },
      {
        id: 'unit2',
        title: 'Unit 2: Thermodynamics',
        pdfs: []
      },
      {
        id: 'unit3',
        title: 'Unit 3: Electromagnetism',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Optics',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Modern Physics',
        pdfs: []
      }
    ]
  },
  {
    id: 'chemistry',
    title: 'Chemistry',
    icon: '🧪',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Atomic Structure',
        pdfs: []
      },
      {
        id: 'unit2',
        title: 'Unit 2: Chemical Bonding',
        pdfs: []
      },
      {
        id: 'unit3',
        title: 'Unit 3: Thermodynamics',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Organic Chemistry',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Physical Chemistry',
        pdfs: []
      }
    ]
  },
  {
    id: 'biology',
    title: 'Biology',
    icon: '🧬',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Cell Biology',
        pdfs: []
      },
      {
        id: 'unit2',
        title: 'Unit 2: Genetics',
        pdfs: []
      },
      {
        id: 'unit3',
        title: 'Unit 3: Evolution',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Ecology',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Human Physiology',
        pdfs: []
      }
    ]
  },
  {
    id: 'computer-science',
    title: 'Computer Science',
    icon: '💻',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Programming Basics',
        pdfs: []
      },
      {
        id: 'unit2',
        title: 'Unit 2: Data Structures',
        pdfs: []
      },
      {
        id: 'unit3',
        title: 'Unit 3: Algorithms',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Database Systems',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Operating Systems',
        pdfs: []
      }
    ]
  },
  {
    id: 'english',
    title: 'English',
    icon: '📚',
    units: [
      {
        id: 'unit1',
        title: 'Unit 1: Literature',
        pdfs: []
      },
      {
        id: 'unit2',
        title: 'Unit 2: Grammar',
        pdfs: []
      },
      {
        id: 'unit3',
        title: 'Unit 3: Writing Skills',
        pdfs: []
      },
      {
        id: 'unit4',
        title: 'Unit 4: Communication',
        pdfs: []
      },
      {
        id: 'unit5',
        title: 'Unit 5: Advanced Writing',
        pdfs: []
      }
    ]
  }
];

export const StudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    if (selectedUnit) {
      setSelectedUnit(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    } else {
      navigate('/student-dashboard');
    }
  };

  const handlePdfAction = (pdfUrl: string, action: 'view' | 'download') => {
    if (action === 'view') {
      window.open(pdfUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfUrl.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentSubject = (): Subject | undefined => subjects.find(s => s.id === selectedSubject);
  const getCurrentUnit = (): Unit | undefined => getCurrentSubject()?.units.find(u => u.id === selectedUnit);

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
                {selectedUnit 
                  ? getCurrentUnit()?.title
                  : selectedSubject 
                    ? getCurrentSubject()?.title 
                    : 'Study Materials'}
              </h1>
              <p className="text-gray-600">
                {selectedUnit 
                  ? 'View and download study materials'
                  : selectedSubject 
                    ? 'Select a unit to view materials'
                    : 'Choose a subject to view materials'}
              </p>
            </div>
          </div>
        </div>

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
        {selectedUnit ? (
          // PDFs List
          <div className="space-y-4">
            {getCurrentUnit()?.pdfs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">No study materials available for this unit yet.</p>
              </div>
            ) : (
              getCurrentUnit()?.pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pdf.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {pdf.uploadedBy}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {pdf.uploadDate}
                          </div>
                          <span>{pdf.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePdfAction(pdf.pdfUrl, 'view')}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handlePdfAction(pdf.pdfUrl, 'download')}
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
        ) : selectedSubject ? (
          // Units Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getCurrentSubject()?.units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit.id)}
                className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                      <p className="text-sm text-gray-600">{unit.pdfs.length} Materials Available</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
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
                    <span className="text-3xl">{subject.icon}</span>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{subject.title}</h3>
                      <p className="text-sm text-gray-600">{subject.units.length} Units Available</p>
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