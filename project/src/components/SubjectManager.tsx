import React, { useEffect, useRef } from 'react';
import { api } from '../services/api';

const predefinedSubjects = [
  {
    name: "Engineering Mathematics",
    code: "EM101"
  },
  {
    name: "Electric Circuits",
    code: "EC102"
  },
  {
    name: "Electromagnetic Fields",
    code: "EMF103"
  },
  {
    name: "Signals and Systems",
    code: "SS104"
  },
  {
    name: "Electrical Machines",
    code: "EM105"
  },
  {
    name: "Power Systems",
    code: "PS106"
  },
  {
    name: "Control Systems",
    code: "CS107"
  },
  {
    name: "Electrical and Electronic Measurements",
    code: "EEM108"
  },
  {
    name: "Analog and Digital Electronics",
    code: "ADE109"
  },
  {
    name: "Power Electronics",
    code: "PE110"
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
      // First, clear all existing subjects
      await api.deleteAllSubjects();
      
      // Then add the new predefined subjects
      for (const subject of predefinedSubjects) {
        await api.addSubject(subject);
        console.log(`Added subject: ${subject.name}`);
      }
    } catch (error) {
      console.error('Error initializing subjects:', error);
    }
  };

  return null; // This component doesn't render anything
};

export default SubjectManager; 