import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import { PORTAL_HOME_PATH, PORTAL_ROLE } from './portalConfig.js';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import SubmitComplaint from './pages/student/SubmitComplaint.jsx';
import ComplaintHistory from './pages/student/ComplaintHistory.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ComplaintManagement from './pages/admin/ComplaintManagement.jsx';
import Analytics from './pages/admin/Analytics.jsx';

export default function App() {
  const isAdminPortal = PORTAL_ROLE === 'admin';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {isAdminPortal ? (
          <>
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute role="admin">
                  <ComplaintManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute role="admin">
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </>
        ) : (
          <>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit"
              element={
                <ProtectedRoute role="student">
                  <SubmitComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute role="student">
                  <ComplaintHistory />
                </ProtectedRoute>
              }
            />
          </>
        )}
        <Route path="/" element={<Navigate to={PORTAL_HOME_PATH} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
