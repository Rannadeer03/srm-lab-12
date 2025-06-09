import React, { useState } from 'react';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Question, QuestionType } from '../../types';

const TeacherTestCreation: React.FC = () => {
  const navigate = useNavigate();
  const [testTitle, setTestTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: 1,
    text: '',
    type: 'text',
    options: ['', '', '', ''],
    correctAnswer: -1,
    difficultyLevel: 'medium',
    subject: ''
  });

  const handleSaveQuestion = () => {
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      id: questions.length + 2,
      text: '',
      type: 'text',
      options: ['', '', '', ''],
      correctAnswer: -1,
      difficultyLevel: 'medium',
      subject: ''
    });
  };

  const handleSubmitTest = async () => {
    try {
      const testData = {
        title: testTitle,
        questions: questions.map(q => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          difficulty_level: q.difficultyLevel,
          subject: q.subject
        }))
      };
      await api.createTest(testData);
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  return (
    <div>
      <h1>Create Test for Teachers</h1>
      <input
        type="text"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
        placeholder="Test Title"
      />
      <div>
        {questions.map((q, index) => (
          <div key={index}>
            <p>{q.text}</p>
            <button onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleSaveQuestion}>
        <Plus /> Add Question
      </button>
      <button onClick={handleSubmitTest}>
        <Save /> Save Test
      </button>
    </div>
  );
};

export default TeacherTestCreation;
