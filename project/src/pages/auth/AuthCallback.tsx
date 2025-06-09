import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        await initialize();
        
        // Wait a moment for the profile to be set
        setTimeout(() => {
          const currentProfile = useAuthStore.getState().profile;
          if (currentProfile) {
            const dashboardRoute = 
              currentProfile.role === 'student' ? '/student-dashboard' :
              currentProfile.role === 'teacher' ? '/teacher-dashboard' :
              '/admin-dashboard';
            navigate(dashboardRoute);
          } else {
            navigate('/register');
          }
        }, 1000);
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, initialize]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing sign in...</p>
          </div>
        </div>
      </div>
    </div>
  );
};
