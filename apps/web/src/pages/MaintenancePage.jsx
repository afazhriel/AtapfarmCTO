import { CalendarClock, CheckCircle2, CircleDollarSign, Plus, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { formatDate, formatNumber, sortByDateDescending, toDate } from '../lib/helpers';
import { createFarmDocument, logActivity, updateFarmDocument } from '../services/firestore';

const emptyForm = { title: '', assetId: '', scheduledAt: '', technician: '', cost: 0, status: 'scheduled', notes: '' };

export default function MaintenancePage() {
  const { user } = useAuth();
  const { selectedFarmId, role } = useFarm();
  const { data: records } = useFarmCollection('maintenance');
  const { data: assets } = useFarmCollection('assets');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const canWrite = ['owner', 'manager', 'operator'].includes(role);

  const scheduled = records.filter((item) => item.status !== 'completed');
  const completed = records.filter((item) => item.status === 'completed');
  const totalCost = records.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const overdue = scheduled.filter((item) => {
    const date = toDate(item.scheduledAt);
    return date && date < new Date();
  }).length;

  const costData = useMemo(() => {
    const months = {};
    records.forEach((item) => {
      const date = toDate(item.scheduledAt || item.createdAt);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + Number(item.cost || 0);
    });
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([month, cost]) => ({
      month: new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(`${month}-01T12:00:00`)),
      cost
    }));
  }, [records]);

  async function saveRecord(event) {
    event.preventDefault();
    const asset = assets.find((item) => item.id === form.assetId);
    if (!asset) return;
    setSaving(true);
    try {
      await createFarmDocument(selectedFarmId, 'maintenance', {
        ...form,
        assetName: asset.name,
        cost: Number(form.cost),
        scheduledAt: new Date(`${form.scheduledAt}T12:00:00`)
      });
      await logActivity(selectedFarmId, user, 'Scheduled maintenance', form.title, asset.name);
      push('Maintenance scheduled.');
      setModalOpen(false);
      setForm(emptyForm);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function completeRecord(record) {
    try {
      await updateFarmDocument(selectedFarmId, 'maintenance', record.id, { status: 'completed', completedAt: new Date() });
      await updateFarmDocument(selectedFarmId, 'assets', record.assetId, { status: 'healthy', lastServiceAt: new Date() });
      await logActivity(selectedFarmId, user, 'Completed maintenance', record.title, record.assetName);
      push('Maintenance completed and asset status updated.');
    } catch (error) {
      push(error.message, 'error');
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Reliability" title="Maintenance" description="Schedule preventive work, track service cost, and close the loop on fleet asset condition." actions={canWrite && assets.length ? <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Schedule maintenance</button> : null} />

      <section className="stats-grid">
        <StatCard label="Scheduled" value={scheduled.length} helper={`${overdue} overdue`} icon={CalendarClock} tone="amber" />
        <StatCard label="Completed" value={completed.length} helper="Maintenance history" icon={CheckCircle2} tone="teal" />
        <StatCard label="Tracked cost" value={`Rp ${formatNumber(totalCost, 0)}`} helper="All records" icon={CircleDollarSign} tone="blue" />
        <StatCard label="Covered assets" value={new Set(records.map((item) => item.assetId)).size} helper="Unique fleet assets" icon={Wrench} tone="purple" />
      </section>

      <section className="dashboard-grid maintenance-grid">
        <article className="panel chart-panel">
          <div className="panel-header"><div><span className="eyebrow">Cost visibility</span><h2>Maintenance cost by month</h2></div></div>
          <div className="chart-wrap chart-medium">
            {costData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={costData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tickLine={false} axisLine={false} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [`Rp ${formatNumber(value, 0)}`, 'Cost']} /><Bar dataKey="cost" fill="#0f766e" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="No cost data" description="Scheduled maintenance will appear here." />}
          </div>
        </article>
        <article className="panel">
          <div className="panel-header"><div><span className="eyebrow">Next actions</span><h2>Upcoming schedule</h2></div></div>
          <div className="compact-list">
            {sortByDateDescending(scheduled, 'scheduledAt').reverse().slice(0, 6).map((record) => <div className="compact-row" key={record.id}><div className="row-icon"><Wrench size={17} /></div><div className="row-main"><strong>{record.title}</strong><span>{record.assetName} · {formatDate(record.scheduledAt)}</span></div><StatusBadge value={toDate(record.scheduledAt) < new Date() ? 'overdue' : record.status} /></div>)}
            {!scheduled.length ? <div className="inline-success"><CheckCircle2 size={18} /> No pending maintenance.</div> : null}
          </div>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Maintenance register</h2><p>{records.length} records</p></div></div>
        {records.length ? <div className="table-wrap"><table><thead><tr><th>Work order</th><th>Asset</th><th>Schedule</th><th>Technician</th><th>Cost</th><th>Status</th><th /></tr></thead><tbody>{sortByDateDescending(records, 'scheduledAt').map((record) => <tr key={record.id}><td><strong>{record.title}</strong><small>{record.notes || 'No notes'}</small></td><td>{record.assetName}</td><td>{formatDate(record.scheduledAt)}</td><td>{record.technician || 'Unassigned'}</td><td>Rp {formatNumber(record.cost, 0)}</td><td><StatusBadge value={record.status} /></td><td>{canWrite && record.status !== 'completed' ? <button className="button button-secondary small" onClick={() => completeRecord(record)}><CheckCircle2 size={15} /> Complete</button> : null}</td></tr>)}</tbody></table></div> : <EmptyState title="No maintenance records" description="Schedule preventive or corrective maintenance for an asset." />}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule maintenance" description="Create a traceable work order linked to a fleet asset." size="lg">
        <form className="grid-form" onSubmit={saveRecord}>
          <label className="span-2"><span>Work order title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Feeder motor inspection" required /></label>
          <label><span>Asset</span><select value={form.assetId} onChange={(event) => setForm({ ...form, assetId: event.target.value })} required><option value="">Select asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
          <label><span>Scheduled date</span><input type="date" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} required /></label>
          <label><span>Technician</span><input value={form.technician} onChange={(event) => setForm({ ...form, technician: event.target.value })} placeholder="Technician A" /></label>
          <label><span>Estimated cost (IDR)</span><input type="number" min="0" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} /></label>
          <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="scheduled">Scheduled</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select></label>
          <label className="span-2"><span>Notes</span><textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Parts, checklist, and safety notes" /></label>
          <div className="modal-actions span-2"><button className="button button-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Schedule work'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
