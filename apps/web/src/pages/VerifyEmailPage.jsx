import { CheckCircle2, LoaderCircle, MailCheck, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmailPage() {
  const { user, resendVerification, refreshUser, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  if (!user) return <Navigate to="/login" replace />;
  if (user.emailVerified) return <Navigate to="/" replace />;

  async function resend() {
    setBusy(true);
    try {
      await resendVerification();
      push('Verification email sent.', 'info');
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setBusy(true);
    try {
      const verified = await refreshUser();
      if (verified) navigate('/');
      else push('Email is not verified yet.', 'info');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="verification-page">
      <section className="verification-card">
        <div className="mail-illustration"><MailCheck size={42} /></div>
        <span className="eyebrow">Secure account setup</span>
        <h1>Verify your email</h1>
        <p>We sent a verification link to <strong>{user.email}</strong>. Open it, then return here to continue.</p>
        <div className="verification-actions">
          <button className="button button-primary" type="button" onClick={check} disabled={busy}>{busy ? <LoaderCircle className="spin" size={18} /> : <CheckCircle2 size={18} />} I have verified</button>
          <button className="button button-secondary" type="button" onClick={resend} disabled={busy}><RefreshCw size={17} /> Resend email</button>
        </div>
        <button className="text-button" type="button" onClick={logout}>Use another account</button>
      </section>
    </main>
  );
}
