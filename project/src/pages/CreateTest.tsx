import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Clock, BookOpen, Target } from 'lucide-react';
import { questionService, testService, Question, Test } from '../services/supabaseApi';
import { subjectService, Subject } from '../services/subjectService';
import { useAuthStore } from '../store/authStore';

const CreateTest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'details' | 'questions' | 'review'>('details');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const [testData, setTestData] = useState({
    title: '',
    subject: '',
    duration: 60,
    description: '',
    is_scheduled: false,
    scheduled_date: '',
    scheduled_time: '',
    allow_late_submissions: false,
    target_easy: 30,
    target_medium: 50,
    target_hard: 20
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectList = await subjectService.getSubjects();
        setSubjects(subjectList);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    if (testData.subject) {
      fetchQuestionsBySubject(testData.subject);
    }
  }, [testData.subject]);

  const fetchQuestionsBySubject = async (subject: string) => {
    try {
      setLoading(true);
      const questions = await questionService.getQuestionsBySubject(subject);
      setAvailableQuestions(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    try {
      if (!user) return;

      setLoading(true);

      // Create test
      const test = await testService.createTest({
        title: testData.title,
        subject: testData.subject,
        duration: testData.duration,
        teacher_id: user.id,
        is_active: true,
        is_scheduled: testData.is_scheduled,
        scheduled_date: testData.scheduled_date || undefined,
        scheduled_time: testData.scheduled_time || undefined,
        allow_late_submissions: testData.allow_late_submissions,
        target_easy: testData.target_easy,
        target_medium: testData.target_medium,
        target_hard: testData.target_hard
      });

      // Add selected questions to test
      if (selectedQuestions.length > 0) {
        await testService.addQuestionsToTest(test.id!, selectedQuestions);
      }

      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Error creating test. Please try again.');
    } finally {
      setLoading(false);
    }
  };
};

export default CreateTest;