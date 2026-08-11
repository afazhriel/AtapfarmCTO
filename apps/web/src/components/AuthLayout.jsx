import { Activity, BarChart3, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-content">
          <div className="brand-lockup brand-on-dark">
            <div className="brand-mark">FF</div>
            <div><strong>FarmFleet</strong><span>Integrated Farm Operations</span></div>
          </div>
          <div className="auth-hero-copy">
            <span className="eyebrow light">Operate every farm asset from one workspace</span>
            <h1>Real-time visibility for livestock, equipment, facilities, and teams.</h1>
            <p>Turn sensor data and daily farm work into clear actions, accountable workflows, and safer operations.</p>
          </div>
          <div className="auth-benefits">
            <div><Activity /><span><strong>Live monitoring</strong>Telemetry and operational alerts</span></div>
            <div><BarChart3 /><span><strong>Fleet analytics</strong>Health, utilization, and trends</span></div>
            <div><ShieldCheck /><span><strong>Role-based access</strong>Secure multi-farm collaboration</span></div>
          </div>
        </div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="mobile-brand brand-lockup">
            <div className="brand-mark">FF</div>
            <div><strong>FarmFleet</strong><span>Operations OS</span></div>
          </div>
          <header>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </header>
          {children}
        </div>
      </section>
    </main>
  );
}
