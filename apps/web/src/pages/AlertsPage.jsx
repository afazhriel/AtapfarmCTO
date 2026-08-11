import { BellRing, CheckCircle2, Plus, Search, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { formatDate, sortByDateDescending } from '../lib/helpers';
import { createFarmDocument, logActivity, updateFarmDocument } from '../services/firestore';

const emptyAlert = { title: '', severity: 'warning', assetId: '', message: '' };

export default function AlertsPage() {
  const { user } = useAuth();
  const { selectedFarmId, role } = useFarm();
  const { data: alerts } = useFarmCollection('alerts');
  const { data: assets } = useFarmCollection('assets');
  const [statusFilter, setStatusFilter] = useState('open');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyAlert);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const canWrite = ['owner', 'manager', 'operator'].includes(role);

  const filtered = useMemo(() => sortByDateDescending(alerts.filter((alert) => {
    const statusMatch = statusFilter === 'all' || (statusFilter === 'open' ? alert.status !== 'resolved' : alert.status === 'resolved');
    const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
    const textMatch = `${alert.title} ${alert.assetName} ${alert.message}`.toLowerCase().includes(query.toLowerCase());
    return statusMatch && severityMatch && textMatch;
  })), [alerts, statusFilter, severityFilter, query]);

  async function resolveAlert(alert) {
    try {
      await updateFarmDocument(selectedFarmId, 'alerts', alert.id, { status: 'resolved', resolvedAt: new Date() });
      await logActivity(selectedFarmId, user, 'Resolved alert', alert.title, alert.assetName || 'Farm-wide');
      push('Alert resolved.');
    } catch (error) {
      push(error.message, 'error');
    }
  }

  async function createAlert(event) {
    event.preventDefault();
    const asset = assets.find((item) => item.id === form.assetId);
    setSaving(true);
    try {
      await createFarmDocument(selectedFarmId, 'alerts', {
        ...form,
        status: 'open',
        assetName: asset?.name || 'Farm-wide'
      });
      await logActivity(selectedFarmId, user, 'Created manual alert', form.title, asset?.name || 'Farm-wide');
      push('Alert created.');
      setForm(emptyAlert);
      setModalOpen(false);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const openCount = alerts.filter((item) => item.status !== 'resolved').length;
  const criticalCount = alerts.filter((item) => item.status !== 'resolved' && item.severity === 'critical').length;

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Exception management" title="Alerts" description="Turn abnormal readings and operational exceptions into trackable response actions." actions={canWrite ? <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Create alert</button> : null} />

      <section className="alert-summary">
        <article><div className="row-icon severity-critical"><ShieldAlert /></div><div><span>Critical open</span><strong>{criticalCount}</strong></div></article>
        <article><div className="row-icon severity-warning"><BellRing /></div><div><span>All open</span><strong>{openCount}</strong></div></article>
        <article><div className="row-icon severity-info"><CheckCircle2 /></div><div><span>Resolved</span><strong>{alerts.filter((item) => item.status === 'resolved').length}</strong></div></article>
      </section>

      <section className="toolbar panel compact-panel">
        <div className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alerts" /></div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="open">Open alerts</option><option value="resolved">Resolved</option><option value="all">All statuses</option></select>
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}><option value="all">All severities</option><option value="critical">Critical</option><option value="warning">Warning</option><option value="info">Info</option></select>
      </section>

      <section className="alert-list">
        {filtered.map((alert) => (
          <article className={`alert-card alert-${alert.severity}`} key={alert.id}>
            <div className={`alert-card-icon severity-${alert.severity}`}><BellRing /></div>
            <div className="alert-card-main">
              <div className="alert-card-title"><div><h3>{alert.title}</h3><p>{alert.assetName || 'Farm-wide'} · {formatDate(alert.createdAt, true)}</p></div><div><StatusBadge value={alert.severity} /><StatusBadge value={alert.status || 'open'} /></div></div>
              <p className="alert-message">{alert.message}</p>
              {alert.status === 'resolved' ? <small>Resolved {formatDate(alert.resolvedAt, true)}</small> : canWrite ? <button className="button button-secondary small" type="button" onClick={() => resolveAlert(alert)}><CheckCircle2 size={16} /> Mark resolved</button> : null}
            </div>
          </article>
        ))}
        {!filtered.length ? <div className="panel"><EmptyState title="No alerts in this view" description="The fleet is clear or the current filters exclude all records." /></div> : null}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create manual alert" description="Use for field observations that are not generated automatically by sensors.">
        <form className="grid-form" onSubmit={createAlert}>
          <label className="span-2"><span>Alert title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Abnormal feed consumption" required /></label>
          <label><span>Severity</span><select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })}><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select></label>
          <label><span>Linked asset</span><select value={form.assetId} onChange={(event) => setForm({ ...form, assetId: event.target.value })}><option value="">Farm-wide</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
          <label className="span-2"><span>Message</span><textarea rows="4" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Describe the condition and recommended response." required /></label>
          <div className="modal-actions span-2"><button className="button button-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create alert'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
