import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import PrivateRoute from './components/auth/PrivateRoute';

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Lazy loaded pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const Dashboard = lazy(() => import('./pages/student/Dashboard'));
const NewComplaint = lazy(() => import('./pages/student/NewComplaint'));
const ComplaintDetails = lazy(() => import('./pages/student/ComplaintDetails'));
const Settings = lazy(() => import('./pages/student/Settings'));

// Admin pages (New UI)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ComplaintManagement = lazy(() => import('./pages/admin/ComplaintManagement'));
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes with Main Layout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
              </Route>

              {/* Student Routes with Main Layout */}
              <Route path="/student" element={
                <PrivateRoute role="student">
                  <MainLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="complaints/new" element={<NewComplaint />} />
                <Route path="complaints/:id" element={<ComplaintDetails />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Admin Routes with Admin Layout */}
              <Route path="/admin" element={
                <PrivateRoute role="admin">
                  <AdminLayout />
                </PrivateRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="complaints" element={<ComplaintManagement />} />
                
                {/* 
                  These two pages were not redesigned in this phase, 
                  but we still mount them under the new AdminLayout.
                */}
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
