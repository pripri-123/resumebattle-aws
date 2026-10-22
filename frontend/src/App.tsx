import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { ResumeArenaPage } from './pages/ResumeArenaPage';
import { CareerDnaPage } from './pages/CareerDnaPage';
import { CareerQuestPage } from './pages/CareerQuestPage';
import { ApplicationSimulatorPage } from './pages/ApplicationSimulatorPage';
import { ProjectProofPage } from './pages/ProjectProofPage';
import { VersionLabPage } from './pages/VersionLabPage';
import { BattleLeaguePage } from './pages/BattleLeaguePage';
import { CareerInsightsPage } from './pages/CareerInsightsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Dashboard Shell */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="resume-arena" element={<ResumeArenaPage />} />
              <Route path="career-dna" element={<CareerDnaPage />} />
              <Route path="career-quest" element={<CareerQuestPage />} />
              <Route path="simulator" element={<ApplicationSimulatorPage />} />
              <Route path="project-proof" element={<ProjectProofPage />} />
              <Route path="version-lab" element={<VersionLabPage />} />
              <Route path="battle-league" element={<BattleLeaguePage />} />
              <Route path="insights" element={<CareerInsightsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
