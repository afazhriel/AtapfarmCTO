import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { authErrorMessage } from '../lib/authErrors';

export default function RegisterPage() {
  const { user, register, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { push } = useToast();

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setError('Password confirmation does not match.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      push('Account created. Please verify your email.', 'info');
      navigate('/verify-email', { replace: true });
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
      push('Account connected with Google.');
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(authErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start with one farm and expand to every operational fleet.">
      <button className="button button-google" type="button" onClick={handleGoogle} disabled={submitting}>
        <span className="google-mark">G</span> Continue with Google
      </button>
      <div className="form-divider"><span>or use email</span></div>
      <form className="stack-form" onSubmit={handleSubmit}>
        {error ? <div className="form-error">{error}</div> : null}
        <label><span>Full name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Farm manager" required /></label>
        <label><span>Email address</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="manager@farm.com" required /></label>
        <label>
          <span>Password</span>
          <div className="password-input">
            <input type={showPassword ? 'text' : 'password'} minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Minimum 6 characters" required />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </label>
        <label><span>Confirm password</span><input type="password" minLength="6" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} placeholder="Repeat your password" required /></label>
        <label className="checkbox-label"><input type="checkbox" required /> I agree to responsible use and farm data policies.</label>
        <button className="button button-primary button-block" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : null} Create account</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
