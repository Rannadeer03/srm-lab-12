import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AuthCallback } from './pages/auth/AuthCallback';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import Home from './pages/Home';
import {
  adminRoutes,
  commonProtectedRoutes,
  studentRoutes,
  teacherRoutes,
} from './routes';
import { useAuthStore } from './store/authStore';

// Protected route component
const RoleBasedRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: JSX.Element;
}) => {
  const { profile } = useAuthStore();
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!allowedRoles.includes(profile.role))
    return <Navigate to={'/home'} replace />;
  return children;
};

// Simple loading screen component
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { initialize } = useAuthStore();

  useEffect(() => {
    const loadSession = async () => {
      try {
        await initialize();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {commonProtectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleBasedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  {element}
                </RoleBasedRoute>
              }
            />
          ))}

          {studentRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleBasedRoute allowedRoles={['student', 'admin']}>
                  {element}
                </RoleBasedRoute>
              }
            />
          ))}

          {teacherRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleBasedRoute allowedRoles={['teacher', 'admin']}>
                  {element}
                </RoleBasedRoute>
              }
            />
          ))}

          {adminRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  {element}
                </RoleBasedRoute>
              }
            />
          ))}

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
