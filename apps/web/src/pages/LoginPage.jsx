import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../lib/authErrors';

export default function LoginPage() {
  const { user, login, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { push } = useToast();

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(form.email.trim(), form.password, form.remember);
      push('Welcome back to FarmFleet.');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (submitError) {
      setError(authErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setSubmitting(true);
    setError('');
    try {
      await signInWithGoogle();
      push('Signed in with Google.');
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(authErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue managing your farm fleet.">
      <button className="button button-google" type="button" onClick={handleGoogle} disabled={submitting}>
        <span className="google-mark">G</span> Continue with Google
      </button>
      <div className="form-divider"><span>or use email</span></div>
      <form className="stack-form" onSubmit={handleSubmit}>
        {error ? <div className="form-error">{error}</div> : null}
        <label>
          <span>Email address</span>
          <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="operator@farm.com" required />
        </label>
        <label>
          <span>Password</span>
          <div className="password-input">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <div className="form-row between">
          <label className="checkbox-label"><input type="checkbox" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} /> Remember me</label>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <button className="button button-primary button-block" type="submit" disabled={submitting}>
          {submitting ? <LoaderCircle className="spin" size={18} /> : null} Sign in
        </button>
      </form>
      <p className="auth-switch">New to FarmFleet? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
