import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import CreateTest from './pages/CreateTest';
import JeeTestInterface from './pages/JeeTestInterface';

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-profile" element={<CreateProfile />} />
            <Route path="/student-dashboard" element={<NewStudentDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentUpload />} />
            <Route path="/teacher/course-materials" element={<TeacherCourseUpload />} />
            <Route path="/student/assignments" element={<StudentAssignmentView />} />
            <Route path="/teacher/create-test" element={<CreateTest />} />
            <Route path="/tests/:testId" element={<JeeTestInterface />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
