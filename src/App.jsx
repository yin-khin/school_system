import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/students/Students';
import StudentDetail from './pages/StudentDetail';
import Teachers from './pages/teachers/Teachers';
import Classes from './pages/classes/Classes';
import Subjects from './pages/subjects/Subjects';
import Attendance from './pages/attendance/Attendance';
import Exams from './pages/exams/Exams';
import Marks from './pages/exams/Marks';
import Fees from './pages/fees/Fees';
import Payments from './pages/fees/Payments';
import Library from './pages/library/Library';
import Announcements from './pages/announcements/Announcements';
import Users from './pages/Users';
import Parents from './pages/Parents';
import Staff from './pages/Staff';
import AcademicYears from './pages/AcademicYears';
import Timetables from './pages/Timetables';
import Assignments from './pages/Assignments';
import Reports from './pages/Reports';
import Backup from './pages/Backup';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />
        <Route path="marks" element={<Marks />} />
        <Route path="fees" element={<Fees />} />
        <Route path="payments" element={<Payments />} />
        <Route path="library" element={<Library />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="users" element={<Users />} />
        <Route path="parents" element={<Parents />} />
        <Route path="staff" element={<Staff />} />
        <Route path="academic-years" element={<AcademicYears />} />
        <Route path="timetables" element={<Timetables />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="backup" element={<Backup />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;