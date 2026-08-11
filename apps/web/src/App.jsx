import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import FirebaseSetupNotice from './components/FirebaseSetupNotice';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import AlertsPage from './pages/AlertsPage';
import AssetsPage from './pages/AssetsPage';
import DashboardPage from './pages/DashboardPage';
import FlowPage from './pages/FlowPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import LoginPage from './pages/LoginPage';
import MaintenancePage from './pages/MaintenancePage';
import MonitoringPage from './pages/MonitoringPage';
import OnboardingPage from './pages/OnboardingPage';
import RegisterPage from './pages/RegisterPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/TasksPage';
import TeamPage from './pages/TeamPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

export default function App() {
  const { configured } = useAuth();
  if (!configured) return <FirebaseSetupNotice />;

  return (
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
  );
}
