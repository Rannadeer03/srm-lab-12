import React, { useEffect, useRef } from 'react';
import { api } from '../services/api';

const predefinedSubjects = [
  {
    name: "Mathematics",
    code: "MATH101"
  },
  {
    name: "Physics",
    code: "PHY101"
  },
  {
    name: "Chemistry",
    code: "CHEM101"
  }
];

const SubjectManager: React.FC = () => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initializeSubjects();
      initialized.current = true;
    }
  }, []);

  const initializeSubjects = async () => {
    try {
      const existingSubjects = await api.getSubjects();
      
      // Only add subjects that don't already exist
      for (const subject of predefinedSubjects) {
        const exists = existingSubjects.some(
          (existing: any) => existing.code === subject.code
        );
        
        if (!exists) {
          await api.addSubject(subject);
          console.log(`Added subject: ${subject.name}`);
        }
      }
    } catch (error) {
      console.error('Error initializing subjects:', error);
    }
  };

  return null; // This component doesn't render anything
};

export default SubjectManager; 