import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Footer } from './components/Footer';
import { Header } from './components/Header';
import StudentAssignmentView from './components/StudentAssignmentView';
import TeacherAssignmentUpload from './components/TeacherAssignmentUpload';
import TeacherCourseUpload from './components/TeacherCourseUpload';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthCallback } from './pages/AuthCallback';
import { CreateProfile } from './pages/CreateProfile';
import CreateTest from './pages/CreateTest';
import Home from './pages/Home';
import JeeTestInterface from './pages/JeeTestInterface';
import { Login } from './pages/Login';
import { NewStudentDashboard } from './pages/NewStudentDashboard';
import { Profile } from './pages/Profile';
import { Register } from './pages/Register';
import { StudyMaterials } from './pages/StudyMaterials';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { useAuthStore } from './store/authStore';

// Protected route component
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { profile } = useAuthStore();
  const location = useLocation();

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
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

          {/* Protected Routes */}
          <Route
            path="/create-profile"
            element={
              <RequireAuth>
                <CreateProfile />
              </RequireAuth>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <RequireAuth>
                <NewStudentDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <RequireAuth>
                <TeacherDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/study-materials"
            element={
              <RequireAuth>
                <StudyMaterials />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/assignments"
            element={
              <RequireAuth>
                <TeacherAssignmentUpload />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/course-materials"
            element={
              <RequireAuth>
                <TeacherCourseUpload />
              </RequireAuth>
            }
          />
          <Route
            path="/student/assignments"
            element={
              <RequireAuth>
                <StudentAssignmentView />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher/create-test"
            element={
              <RequireAuth>
                <CreateTest />
              </RequireAuth>
            }
          />
          <Route
            path="/tests/:testId"
            element={
              <RequireAuth>
                <JeeTestInterface />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
