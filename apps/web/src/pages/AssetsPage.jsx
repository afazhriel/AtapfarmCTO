import { Edit3, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { ASSET_CATEGORIES, ASSET_STATUSES } from '../lib/constants';
import { formatDate, formatNumber } from '../lib/helpers';
import { createFarmDocument, deleteFarmDocument, logActivity, updateFarmDocument } from '../services/firestore';

const emptyForm = {
  name: '',
  code: '',
  category: 'livestock',
  subtype: '',
  status: 'healthy',
  location: '',
  quantity: 1,
  tag: '',
  healthScore: 90,
  utilization: 70,
  lastServiceAt: '',
  nextServiceAt: '',
  notes: ''
};

export default function AssetsPage() {
  const { user } = useAuth();
  const { selectedFarmId, role } = useFarm();
  const { data: assets, loading } = useFarmCollection('assets');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [menuId, setMenuId] = useState('');
  const { push } = useToast();
  const canWrite = ['owner', 'manager', 'operator'].includes(role);

  const filtered = useMemo(() => assets.filter((asset) => {
    const haystack = `${asset.name} ${asset.code} ${asset.subtype} ${asset.location}`.toLowerCase();
    return haystack.includes(query.toLowerCase())
      && (category === 'all' || asset.category === category)
      && (status === 'all' || asset.status === status);
  }), [assets, query, category, status]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(asset) {
    setEditing(asset);
    setForm({
      ...emptyForm,
      ...asset,
      lastServiceAt: asset.lastServiceAt?.toDate?.().toISOString().slice(0, 10) || '',
      nextServiceAt: asset.nextServiceAt?.toDate?.().toISOString().slice(0, 10) || ''
    });
    setMenuId('');
    setModalOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      healthScore: Number(form.healthScore),
      utilization: Number(form.utilization),
      lastServiceAt: form.lastServiceAt ? new Date(`${form.lastServiceAt}T12:00:00`) : null,
      nextServiceAt: form.nextServiceAt ? new Date(`${form.nextServiceAt}T12:00:00`) : null
    };
    try {
      if (editing) {
        await updateFarmDocument(selectedFarmId, 'assets', editing.id, payload);
        await logActivity(selectedFarmId, user, 'Updated fleet asset', form.name, `Status: ${form.status}`);
        push('Asset updated.');
      } else {
        await createFarmDocument(selectedFarmId, 'assets', payload);
        await logActivity(selectedFarmId, user, 'Created fleet asset', form.name, `${form.category} registered.`);
        push('Asset created.');
      }
      setModalOpen(false);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function removeAsset(asset) {
    setMenuId('');
    if (!window.confirm(`Delete ${asset.name}? Historical telemetry references will remain.`)) return;
    try {
      await deleteFarmDocument(selectedFarmId, 'assets', asset.id);
      await logActivity(selectedFarmId, user, 'Deleted fleet asset', asset.name, asset.code || '');
      push('Asset deleted.', 'info');
    } catch (error) {
      push(error.message, 'error');
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Unified registry" title="Fleet assets" description="Manage livestock groups, machinery, vehicles, facilities, aquaculture, and crop blocks from one model." actions={canWrite ? <button className="button button-primary" onClick={openCreate}><Plus size={17} /> Add asset</button> : null} />

      <section className="toolbar panel compact-panel">
        <div className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search asset, code, subtype, or location" /></div>
        <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{ASSET_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{ASSET_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
      </section>

      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Asset registry</h2><p>{filtered.length} of {assets.length} assets</p></div></div>
        {loading ? <div className="skeleton-table" /> : filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Asset</th><th>Category</th><th>Location</th><th>Quantity</th><th>Health</th><th>Utilization</th><th>Status</th><th /></tr></thead>
              <tbody>
                {filtered.map((asset) => (
                  <tr key={asset.id}>
                    <td><strong>{asset.name}</strong><small>{asset.code || 'No code'} · {asset.subtype || 'General'}</small></td>
                    <td className="capitalize">{asset.category?.replace('-', ' ')}</td>
                    <td>{asset.location || '—'}</td>
                    <td>{formatNumber(asset.quantity, 0)}</td>
                    <td><div className="metric-cell"><span>{asset.healthScore || 0}%</span><div><i style={{ width: `${Math.min(asset.healthScore || 0, 100)}%` }} /></div></div></td>
                    <td>{asset.utilization || 0}%</td>
                    <td><StatusBadge value={asset.status} /></td>
                    <td className="actions-cell">
                      {canWrite ? <div className="row-menu"><button className="icon-button" onClick={() => setMenuId(menuId === asset.id ? '' : asset.id)}><MoreHorizontal size={18} /></button>{menuId === asset.id ? <div className="row-menu-popover"><button onClick={() => openEdit(asset)}><Edit3 size={16} /> Edit</button><button className="danger-text" onClick={() => removeAsset(asset)}><Trash2 size={16} /> Delete</button></div> : null}</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No assets found" description={assets.length ? 'Change filters or search terms.' : 'Create the first fleet asset for this farm.'} action={canWrite && !assets.length ? <button className="button button-primary" onClick={openCreate}><Plus size={17} /> Add asset</button> : null} />}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit fleet asset' : 'Register fleet asset'} description="The generic asset model supports any farm operation." size="lg">
        <form className="grid-form" onSubmit={handleSave}>
          <label className="span-2"><span>Asset name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Cattle Group A" required /></label>
          <label><span>Asset code</span><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="LIV-001" required /></label>
          <label><span>RFID / GPS tag</span><input value={form.tag} onChange={(event) => setForm({ ...form, tag: event.target.value })} placeholder="RFID-0001" /></label>
          <label><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{ASSET_CATEGORIES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label><span>Subtype / species</span><input value={form.subtype} onChange={(event) => setForm({ ...form, subtype: event.target.value })} placeholder="Cattle, Tractor, Pond…" required /></label>
          <label><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{ASSET_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Barn A" /></label>
          <label><span>Quantity / capacity</span><input type="number" min="0" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
          <label><span>Health score (%)</span><input type="number" min="0" max="100" value={form.healthScore} onChange={(event) => setForm({ ...form, healthScore: event.target.value })} /></label>
          <label><span>Utilization (%)</span><input type="number" min="0" max="100" value={form.utilization} onChange={(event) => setForm({ ...form, utilization: event.target.value })} /></label>
          <label><span>Last service</span><input type="date" value={form.lastServiceAt} onChange={(event) => setForm({ ...form, lastServiceAt: event.target.value })} /></label>
          <label><span>Next service</span><input type="date" value={form.nextServiceAt} onChange={(event) => setForm({ ...form, nextServiceAt: event.target.value })} /></label>
          <label className="span-2"><span>Notes</span><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows="3" placeholder="Operational notes" /></label>
          <div className="modal-actions span-2"><button type="button" className="button button-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create asset'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
