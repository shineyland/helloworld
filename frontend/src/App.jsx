import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Admin pages
import AdminDashboard from './pages/admin/DashboardPage';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminClassesPage from './pages/admin/ClassesPage';
import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';

// Teacher pages
import TeacherDashboard from './pages/teacher/DashboardPage';
import TeacherClassesPage from './pages/teacher/ClassesPage';
import TeacherAssignmentsPage from './pages/teacher/AssignmentsPage';
import TeacherAttendancePage from './pages/teacher/AttendancePage';

// Student pages
import StudentDashboard from './pages/student/DashboardPage';
import StudentAssignmentsPage from './pages/student/AssignmentsPage';
import StudentGradesPage from './pages/student/GradesPage';
import StudentSchedulePage from './pages/student/SchedulePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/classes" element={<AdminClassesPage />} />
              <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
            </Route>
          </Route>

          {/* Teacher routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/classes" element={<TeacherClassesPage />} />
              <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
              <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
            </Route>
          </Route>

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
              <Route path="/student/grades" element={<StudentGradesPage />} />
              <Route path="/student/schedule" element={<StudentSchedulePage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
