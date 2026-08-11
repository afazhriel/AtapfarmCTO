import { MailWarning } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user || user.emailVerified || user.providerData.some((provider) => provider.providerId === 'google.com')) return null;
  return (
    <div className="verification-banner">
      <MailWarning size={17} />
      <span>Verify your email to keep account recovery and security flows complete.</span>
      <button type="button" onClick={() => navigate('/verify-email')}>Verify now</button>
    </div>
  );
}
