import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { CrisisSupportModal } from './components/common/CrisisSupportModal';
import { FeedbackModal } from './components/common/FeedbackModal';
import { ConsentBannerModal } from './components/common/ConsentBannerModal';
import { StudentDashboard } from './pages/StudentDashboard';
import { CounselorDashboard } from './pages/CounselorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import { CounselorConnect } from './components/student/CounselorConnect';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading MindTrack System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'COUNSELOR') return <Navigate to="/counselor" replace />;
    return <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};

// Root Router Redirector
const RootRedirector: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'COUNSELOR') return <Navigate to="/counselor" replace />;
  return <Navigate to="/student" replace />;
};

function AppContent() {
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar
        onOpenCrisis={() => setIsCrisisModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
      />
      <ConsentBannerModal />
      <CrisisSupportModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<RootRedirector />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard onOpenCrisis={() => setIsCrisisModalOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/surveys"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard onOpenCrisis={() => setIsCrisisModalOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/counselor"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <CounselorConnect />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Counselor Routes */}
          <Route
            path="/counselor/*"
            element={
              <ProtectedRoute allowedRoles={['COUNSELOR']}>
                <CounselorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Subtle safety footer */}
      <footer className="border-t border-slate-200/60 bg-white/60 py-6 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">MindTrack — Student Mental Health & Wellness Monitoring</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Confidential student wellness screening & support platform. Not a clinical medical diagnosis system. If in immediate danger, call 911 or 988.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}
