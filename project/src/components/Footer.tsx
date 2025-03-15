import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center space-x-2 text-gray-500">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500" />
          <span>by MockTest Pro Team</span>
        </div>
      </div>
    </footer>
  );
};