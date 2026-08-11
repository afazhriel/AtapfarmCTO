import { ArrowLeft, LoaderCircle, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../lib/authErrors';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (submitError) {
      setError(authErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We will send a secure reset link to your email.">
      {sent ? (
        <div className="success-state">
          <MailCheck size={40} />
          <h3>Check your inbox</h3>
          <p>A password reset link was sent to <strong>{email}</strong>.</p>
          <Link className="button button-primary button-block" to="/login">Return to sign in</Link>
        </div>
      ) : (
        <form className="stack-form" onSubmit={handleSubmit}>
          {error ? <div className="form-error">{error}</div> : null}
          <label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="manager@farm.com" required /></label>
          <button className="button button-primary button-block" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : null} Send reset link</button>
          <Link className="back-link" to="/login"><ArrowLeft size={16} /> Back to sign in</Link>
        </form>
      )}
    </AuthLayout>
  );
}
