import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const { farms, loading: farmLoading } = useFarm();
  const location = useLocation();

  if (loading || (user && farmLoading)) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!farms.length && !['/onboarding', '/verify-email'].includes(location.pathname)) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
