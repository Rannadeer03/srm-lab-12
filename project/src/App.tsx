import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import SplashScreen from "./components/splashScreen";
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { CreateTest } from "./pages/CreateTest";
import TestInterface from "./pages/TestInterface";
import Home from "./pages/Home";
import { CreateProfile } from './pages/CreateProfile';
import StundentTestResults from "./pages/StundentTestResults";
import TeacherTestResults from "./pages/TeacherTestResults";
import { NewStudentDashboard } from "./pages/NewStudentDashboard";

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
            <Route path="/student-tests" element={<StudentDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/create-test" element={<TeacherDashboard />} />
            <Route path="/test-interface" element={<TestInterface />} />
            <Route path="/teacher-test-results" element={<TeacherTestResults />} />
            <Route path="/student-test-results" element={<StundentTestResults />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
