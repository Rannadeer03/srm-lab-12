import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import SplashScreen from "./components/splashScreen";
import { Login } from "./pages/Login";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { NewStudentDashboard } from './pages/NewStudentDashboard';
import { StudyMaterials } from './pages/StudyMaterials';
import Home from "./pages/Home";
import { CreateProfile } from './pages/CreateProfile';
import TeacherAssignmentUpload from "./components/TeacherAssignmentUpload";
import TeacherCourseUpload from "./components/TeacherCourseUpload";
import StudentAssignmentView from "./components/StudentAssignmentView";
import CreateTestPage from './pages/CreateTestPage';
import JeeTestInterface from './pages/JeeTestInterface';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import TestManagement from './pages/TestManagement';
import TakeTestPage from './pages/TakeTestPage';

// Simple loading screen component
const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
    <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/student-dashboard" element={<NewStudentDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentUpload />} />
            <Route path="/teacher/course-materials" element={<TeacherCourseUpload />} />
            <Route path="/student/assignments" element={<StudentAssignmentView />} />
            <Route path="/create-test" element={<CreateTestPage />} />
            <Route path="/teacher/test-management" element={<TestManagement />} />
            <Route path="/tests/:testId" element={<JeeTestInterface />} />
            <Route path="/take-test/:testId" element={<TakeTestPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <Analytics />
      </div>
    </BrowserRouter>
  );
};

export default App;