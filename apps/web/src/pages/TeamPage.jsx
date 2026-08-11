import { Plus, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { ROLE_LABELS } from '../lib/constants';
import { formatDate, initials } from '../lib/helpers';
import { addTeamMember, removeTeamMember, updateTeamMemberRole } from '../services/firestore';

const emptyMember = { userId: '', displayName: '', email: '', role: 'operator' };

export default function TeamPage() {
  const { selectedFarmId, role } = useFarm();
  const { data: members } = useFarmCollection('members');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyMember);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const canManage = ['owner', 'manager'].includes(role);

  async function addMember(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await addTeamMember(selectedFarmId, {
        ...form,
        userId: form.userId.trim(),
        email: form.email.trim(),
        joinedAt: new Date()
      });
      push('Team member added.');
      setForm(emptyMember);
      setModalOpen(false);
    } catch (error) {
      push(`${error.message} Ensure the user has registered and the UID is exact.`, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(member, nextRole) {
    try {
      await updateTeamMemberRole(selectedFarmId, member.userId || member.id, nextRole);
      push('Member role updated.');
    } catch (error) {
      push(error.message, 'error');
    }
  }

  async function removeMember(member) {
    if (!window.confirm(`Remove ${member.displayName || member.email} from this farm?`)) return;
    try {
      await removeTeamMember(selectedFarmId, member.userId || member.id);
      push('Member removed.', 'info');
    } catch (error) {
      push(error.message, 'error');
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Access control" title="Farm team" description="Membership and roles are isolated per farm workspace." actions={canManage ? <button className="button button-primary" onClick={() => setModalOpen(true)}><UserPlus size={17} /> Add member</button> : null} />

      <section className="role-explainer">
        <article><ShieldCheck /><div><strong>Owner</strong><span>Full control, including farm deletion and team administration.</span></div></article>
        <article><ShieldCheck /><div><strong>Manager</strong><span>Manage fleet data, operations, alerts, maintenance, and team roles.</span></div></article>
        <article><ShieldCheck /><div><strong>Operator</strong><span>Create and update operational records but cannot administer members.</span></div></article>
        <article><ShieldCheck /><div><strong>Viewer</strong><span>Read-only access to dashboards and records.</span></div></article>
      </section>

      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Members</h2><p>{members.length} people with access</p></div></div>
        {members.length ? <div className="table-wrap"><table><thead><tr><th>Member</th><th>Email</th><th>Joined</th><th>Role</th><th /></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td><div className="member-cell"><div className="avatar small-avatar">{initials(member.displayName || member.email)}</div><strong>{member.displayName || 'FarmFleet user'}</strong></div></td><td>{member.email}</td><td>{formatDate(member.joinedAt)}</td><td>{canManage && member.role !== 'owner' ? <select value={member.role} onChange={(event) => changeRole(member, event.target.value)}><option value="manager">Manager</option><option value="operator">Operator</option><option value="viewer">Viewer</option></select> : <StatusBadge value={member.role} label={ROLE_LABELS[member.role]} />}</td><td>{canManage && member.role !== 'owner' ? <button className="icon-button danger-text" onClick={() => removeMember(member)}><Trash2 size={17} /></button> : null}</td></tr>)}</tbody></table></div> : <EmptyState title="No members found" description="The owner membership should be created during onboarding." />}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add existing FarmFleet user" description="For client-only security, the person must register first. Copy their Firebase Authentication UID from the Firebase Console, then add it here.">
        <form className="grid-form" onSubmit={addMember}>
          <label className="span-2"><span>Firebase user UID</span><input value={form.userId} onChange={(event) => setForm({ ...form, userId: event.target.value })} placeholder="Exact Authentication UID" required /></label>
          <label><span>Display name</span><input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="Operator A" required /></label>
          <label><span>Email</span><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="operator@farm.com" required /></label>
          <label className="span-2"><span>Role</span><select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="manager">Manager</option><option value="operator">Operator</option><option value="viewer">Viewer</option></select></label>
          <div className="modal-actions span-2"><button className="button button-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add member'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
