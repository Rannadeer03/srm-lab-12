import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';

export const CreateTestButton: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateTest = () => {
    navigate('/create-test');
  };

  return (
    <Button
      onClick={handleCreateTest}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <Plus className="h-5 w-5 mr-2" />
      Create New Test
    </Button>
  );
}; 