import { Database, ExternalLink, KeyRound, ServerCog } from 'lucide-react';

export default function FirebaseSetupNotice() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="brand-lockup centered">
          <div className="brand-mark">FF</div>
          <div>
            <strong>FarmFleet</strong>
            <span>Firebase configuration required</span>
          </div>
        </div>
        <h1>Hubungkan aplikasi ke Firebase</h1>
        <p>
          Salin <code>.env.example</code> menjadi <code>.env</code>, lalu isi konfigurasi Web App dari project
          <strong> farmfleet-30b6a</strong>.
        </p>
        <div className="setup-steps">
          <div><KeyRound /><span>Aktifkan Authentication: Email/Password dan Google.</span></div>
          <div><Database /><span>Buat Cloud Firestore database pada production mode.</span></div>
          <div><ServerCog /><span>Deploy rules, indexes, dan Hosting dari folder proyek.</span></div>
        </div>
        <a className="button button-primary" href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
          Buka Firebase Console <ExternalLink size={16} />
        </a>
        <small>Detail lengkap tersedia pada DEPLOYMENT.md di dalam ZIP.</small>
      </section>
    </main>
  );
}
