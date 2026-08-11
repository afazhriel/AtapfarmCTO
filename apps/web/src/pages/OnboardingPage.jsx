import { ArrowRight, Check, LoaderCircle, MapPin, Sprout } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { FARM_TYPES } from '../lib/constants';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { farms, createFarm } = useFarm();
  const [form, setForm] = useState({ name: '', type: 'Mixed Farm', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { push } = useToast();

  if (farms.length) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createFarm(form);
      push('Farm workspace created.');
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-intro">
        <div className="brand-lockup brand-on-dark">
          <div className="brand-mark">FF</div>
          <div><strong>FarmFleet</strong><span>Workspace setup</span></div>
        </div>
        <div>
          <span className="eyebrow light">Welcome, {user?.displayName || 'Farm Manager'}</span>
          <h1>Create your first farm workspace.</h1>
          <p>The same core platform supports cattle, poultry, aquaculture, crop blocks, equipment, vehicles, workers, and facilities.</p>
        </div>
        <div className="onboarding-checks">
          <div><Check /> Unified asset registry</div>
          <div><Check /> Real-time monitoring</div>
          <div><Check /> Tasks, alerts, and maintenance</div>
          <div><Check /> Role-based team access</div>
        </div>
      </section>
      <section className="onboarding-form-wrap">
        <form className="onboarding-card stack-form" onSubmit={handleSubmit}>
          <div className="step-indicator"><span>1</span><div /><span>2</span><div /><span>3</span></div>
          <header>
            <div className="soft-icon"><Sprout /></div>
            <h2>Farm details</h2>
            <p>You can edit this information later in settings.</p>
          </header>
          {error ? <div className="form-error">{error}</div> : null}
          <label><span>Farm name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nusantara Integrated Farm" required /></label>
          <label><span>Primary operation</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{FARM_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label><span>Location</span><div className="input-with-icon"><MapPin size={17} /><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Bogor, West Java" required /></div></label>
          <button className="button button-primary button-block" type="submit" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={18} /> : null} Create workspace <ArrowRight size={18} /></button>
          <small>Only authenticated members can access this workspace.</small>
        </form>
      </section>
    </main>
  );
}
