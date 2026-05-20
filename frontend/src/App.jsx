import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import Spinner from './components/ui/Spinner.jsx';
import { PORTAL_HOME_PATH, PORTAL_ROLE } from './portalConfig.js';

const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard.jsx'));
const SubmitComplaint = lazy(() => import('./pages/student/SubmitComplaint.jsx'));
const ComplaintHistory = lazy(() => import('./pages/student/ComplaintHistory.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const ComplaintManagement = lazy(() => import('./pages/admin/ComplaintManagement.jsx'));
const Analytics = lazy(() => import('./pages/admin/Analytics.jsx'));

export default function App() {
  const isAdminPortal = PORTAL_ROLE === 'admin';

  return (
    <Router>
      <Suspense fallback={<Spinner fullPage />}>
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
      </Suspense>
    </Router>
  );
}
