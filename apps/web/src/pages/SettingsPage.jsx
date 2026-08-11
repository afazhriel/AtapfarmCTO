import { CheckCircle2, Database, KeyRound, Save, Server, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { FARM_TYPES, ROLE_LABELS } from '../lib/constants';
import { api } from '../lib/api';

export default function SettingsPage() {
  const { user, updateOwnProfile } = useAuth();
  const { selectedFarm, selectedFarmId, role } = useFarm();
  const [profileName, setProfileName] = useState(user?.displayName || '');
  const [farmForm, setFarmForm] = useState({ name: '', type: 'Mixed Farm', location: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingFarm, setSavingFarm] = useState(false);
  const { push } = useToast();
  const canManage = ['owner', 'manager'].includes(role);

  useEffect(() => {
    if (selectedFarm) setFarmForm({ name: selectedFarm.name || '', type: selectedFarm.type || 'Mixed Farm', location: selectedFarm.location || '' });
  }, [selectedFarm]);

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateOwnProfile(profileName.trim());
      push('Profile updated.');
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveFarm(event) {
    event.preventDefault();
    setSavingFarm(true);
    try {
      await api.patch(`/api/v1/farms/${selectedFarmId}`, farmForm);
      push('Farm settings updated.');
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSavingFarm(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Workspace configuration" title="Settings" description="Manage identity, farm metadata, and deployment diagnostics." />

      <section className="settings-grid">
        <article className="panel settings-card">
          <div className="settings-card-header"><div className="soft-icon"><UserRound /></div><div><h2>User profile</h2><p>Displayed in activity logs and team views.</p></div></div>
          <form className="stack-form" onSubmit={saveProfile}>
            <label><span>Display name</span><input value={profileName} onChange={(event) => setProfileName(event.target.value)} required /></label>
            <label><span>Email</span><input value={user?.email || ''} disabled /></label>
            <label><span>Firebase UID</span><input value={user?.uid || ''} disabled /></label>
            <button className="button button-primary align-start" type="submit" disabled={savingProfile}><Save size={17} /> {savingProfile ? 'Saving…' : 'Save profile'}</button>
          </form>
        </article>

        <article className="panel settings-card">
          <div className="settings-card-header"><div className="soft-icon"><Server /></div><div><h2>Farm workspace</h2><p>Current access: {ROLE_LABELS[role] || role}.</p></div></div>
          <form className="stack-form" onSubmit={saveFarm}>
            <label><span>Farm name</span><input value={farmForm.name} onChange={(event) => setFarmForm({ ...farmForm, name: event.target.value })} disabled={!canManage} required /></label>
            <label><span>Farm type</span><select value={farmForm.type} onChange={(event) => setFarmForm({ ...farmForm, type: event.target.value })} disabled={!canManage}>{FARM_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label><span>Location</span><input value={farmForm.location} onChange={(event) => setFarmForm({ ...farmForm, location: event.target.value })} disabled={!canManage} required /></label>
            {canManage ? <button className="button button-primary align-start" type="submit" disabled={savingFarm}><Save size={17} /> {savingFarm ? 'Saving…' : 'Save farm'}</button> : <small>Only owners and managers can edit farm metadata.</small>}
          </form>
        </article>
      </section>

      <section className="panel diagnostics-card">
        <div className="panel-header"><div><span className="eyebrow">Deployment diagnostics</span><h2>Firebase connection</h2></div><span className="connection-pill"><CheckCircle2 size={15} /> Connected</span></div>
        <div className="diagnostics-grid">
          <div><Database /><span>Project ID</span><strong>{import.meta.env.VITE_FIREBASE_PROJECT_ID}</strong></div>
          <div><Server /><span>Hosting target</span><strong>farmfleet-30b6a.web.app</strong></div>
          <div><KeyRound /><span>Authentication</span><strong>{user?.providerData.map((item) => item.providerId).join(', ') || 'password'}</strong></div>
          <div><Database /><span>Selected farm ID</span><strong>{selectedFarmId}</strong></div>
        </div>
      </section>
    </div>
  );
}
