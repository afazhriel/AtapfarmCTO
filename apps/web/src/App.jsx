import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const AssetsPage = lazy(() => import('./pages/AssetsPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FlowPage = lazy(() => import('./pages/FlowPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const MonitoringPage = lazy(() => import('./pages/MonitoringPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

export default function App() {
  const { configured } = useAuth();
  if (!configured) return <FirebaseSetupNotice />;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/system-flow" element={<FlowPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
