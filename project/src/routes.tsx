import TeacherAssignmentUpload from './components/TeacherAssignmentUpload';
import TeacherCourseUpload from './components/TeacherCourseUpload';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import TeacherForm from './pages/admin/teacher/teacherForm';
import { Profile } from './pages/Profile';
import StudentAssignmentPage from './pages/student/assignmentPage';
import JeeTestInterface from './pages/student/JeeTestInterface';
import { NewStudentDashboard } from './pages/student/NewStudentDashboard';
import { StudyMaterials } from './pages/StudyMaterials';
import CreateTest from './pages/teacher/CreateTest';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';

export const studentRoutes = [
  { path: '/student/dashboard', element: <NewStudentDashboard /> },
  { path: '/student/assignments', element: <StudentAssignmentPage /> },
  { path: '/student/tests/:testId', element: <JeeTestInterface /> },
];

export const teacherRoutes = [
  { path: '/teacher/dashboard', element: <TeacherDashboard /> },
  { path: '/teacher/assignments', element: <TeacherAssignmentUpload /> },
  { path: '/teacher/course-materials', element: <TeacherCourseUpload /> },
  { path: '/teacher/create-test', element: <CreateTest /> },
];

export const adminRoutes = [
  { path: '/admin/dashboard', element: <AdminDashboard /> },
  { path: '/admin/teacher/:id', element: <TeacherForm /> },
];

export const commonProtectedRoutes = [
  { path: '/study-materials', element: <StudyMaterials /> },
  { path: '/profile', element: <Profile /> },
];
