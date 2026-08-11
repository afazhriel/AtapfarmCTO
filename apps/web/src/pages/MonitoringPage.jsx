import { Activity, Gauge, Plus, Radio, ThermometerSun, Wifi } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { METRICS } from '../lib/constants';
import { formatDate, sortByDateDescending, toDate } from '../lib/helpers';
import { createFarmDocument, logActivity } from '../services/firestore';

function deriveReadingStatus(metric, value) {
  const number = Number(value);
  const ranges = {
    temperature: [15, 32],
    humidity: [35, 85],
    'feed-level': [30, 100],
    'water-level': [25, 100],
    'heart-rate': [45, 110],
    'fuel-level': [20, 100],
    ph: [6.5, 8.5],
    'dissolved-oxygen': [4, 15]
  };
  const range = ranges[metric];
  if (!range) return 'normal';
  if (number < range[0] || number > range[1]) return 'warning';
  return 'normal';
}

export default function MonitoringPage() {
  const { user } = useAuth();
  const { selectedFarmId, role } = useFarm();
  const { data: assets } = useFarmCollection('assets');
  const { data: telemetry, loading } = useFarmCollection('telemetry');
  const [metric, setMetric] = useState('temperature');
  const [assetFilter, setAssetFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ assetId: '', metric: 'temperature', value: '', unit: '°C', source: 'manual' });
  const { push } = useToast();
  const canWrite = ['owner', 'manager', 'operator'].includes(role);

  const metricOptions = useMemo(() => {
    const available = new Set(telemetry.map((item) => item.metric));
    return METRICS.filter((item) => available.has(item.value) || item.value === metric);
  }, [telemetry, metric]);

  const filteredReadings = useMemo(() => sortByDateDescending(telemetry.filter((item) => item.metric === metric && (assetFilter === 'all' || item.assetId === assetFilter)), 'recordedAt'), [telemetry, metric, assetFilter]);

  const chartData = useMemo(() => [...filteredReadings].reverse().slice(-40).map((item) => ({
    time: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(toDate(item.recordedAt || item.createdAt) || new Date()),
    value: Number(item.value),
    asset: item.assetName || 'Asset'
  })), [filteredReadings]);

  const latestByMetric = useMemo(() => {
    const map = new Map();
    sortByDateDescending(telemetry, 'recordedAt').forEach((reading) => {
      if (!map.has(reading.metric)) map.set(reading.metric, reading);
    });
    return [...map.values()].slice(0, 6);
  }, [telemetry]);

  function openReading() {
    const selectedMetric = METRICS.find((item) => item.value === metric) || METRICS[0];
    setForm({ assetId: assets[0]?.id || '', metric: selectedMetric.value, value: '', unit: selectedMetric.unit, source: 'manual' });
    setModalOpen(true);
  }

  function changeMetric(value) {
    const config = METRICS.find((item) => item.value === value);
    setForm((current) => ({ ...current, metric: value, unit: config?.unit || current.unit }));
  }

  async function saveReading(event) {
    event.preventDefault();
    const asset = assets.find((item) => item.id === form.assetId);
    if (!asset) return;
    setSaving(true);
    const readingStatus = deriveReadingStatus(form.metric, form.value);
    try {
      await createFarmDocument(selectedFarmId, 'telemetry', {
        assetId: asset.id,
        assetName: asset.name,
        metric: form.metric,
        value: Number(form.value),
        unit: form.unit,
        source: form.source,
        status: readingStatus,
        recordedAt: new Date()
      });
      if (readingStatus === 'warning') {
        await createFarmDocument(selectedFarmId, 'alerts', {
          title: `${METRICS.find((item) => item.value === form.metric)?.label || form.metric} outside target range`,
          severity: 'warning',
          status: 'open',
          assetId: asset.id,
          assetName: asset.name,
          message: `Latest reading: ${form.value} ${form.unit}. Review the asset and operational threshold.`
        });
      }
      await logActivity(selectedFarmId, user, 'Recorded telemetry', asset.name, `${form.metric}: ${form.value} ${form.unit}`);
      push(readingStatus === 'warning' ? 'Reading saved and warning alert created.' : 'Telemetry reading saved.');
      setModalOpen(false);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Real-time sensing" title="Monitoring" description="Visualize environmental, livestock, equipment, and aquaculture telemetry in one operational view." actions={canWrite && assets.length ? <button className="button button-primary" onClick={openReading}><Plus size={17} /> Add reading</button> : null} />

      <section className="sensor-summary-grid">
        {latestByMetric.map((reading, index) => (
          <article className="sensor-card" key={reading.metric}>
            <div className={`sensor-icon sensor-icon-${index % 4}`}>{reading.metric === 'temperature' ? <ThermometerSun /> : reading.metric === 'runtime' ? <Gauge /> : <Activity />}</div>
            <div><span>{METRICS.find((item) => item.value === reading.metric)?.label || reading.metric}</span><strong>{reading.value} <small>{reading.unit}</small></strong><p>{reading.assetName} · {formatDate(reading.recordedAt, true)}</p></div>
            <StatusBadge value={reading.status || 'normal'} />
          </article>
        ))}
        {!latestByMetric.length ? <article className="sensor-card placeholder-card"><Radio /><div><strong>No live readings</strong><p>Add a manual reading or connect an IoT ingestion service.</p></div></article> : null}
      </section>

      <section className="panel chart-panel">
        <div className="panel-header responsive-header">
          <div><span className="eyebrow">Time series</span><h2>Telemetry trend</h2></div>
          <div className="inline-filters">
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>{metricOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            <select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)}><option value="all">All assets</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>
          </div>
        </div>
        <div className="chart-wrap chart-xl">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 16, left: -14, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip labelFormatter={(label) => label} formatter={(value, name, props) => [`${value} ${filteredReadings[0]?.unit || ''}`, props.payload.asset]} />
                <Line type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <EmptyState title="No matching telemetry" description="Select another metric or add a reading." />}
        </div>
      </section>

      <section className="panel table-panel">
        <div className="panel-header"><div><span className="eyebrow">Data stream</span><h2>Latest readings</h2></div><div className="live-indicator"><Wifi size={15} /><span>Firestore live</span></div></div>
        {loading ? <div className="skeleton-table" /> : filteredReadings.length ? (
          <div className="table-wrap"><table><thead><tr><th>Time</th><th>Asset</th><th>Metric</th><th>Value</th><th>Source</th><th>Status</th></tr></thead><tbody>{filteredReadings.slice(0, 30).map((reading) => <tr key={reading.id}><td>{formatDate(reading.recordedAt || reading.createdAt, true)}</td><td><strong>{reading.assetName || 'Unknown asset'}</strong></td><td className="capitalize">{reading.metric?.replaceAll('-', ' ')}</td><td><strong>{reading.value} {reading.unit}</strong></td><td>{reading.source || 'sensor'}</td><td><StatusBadge value={reading.status || 'normal'} /></td></tr>)}</tbody></table></div>
        ) : <EmptyState title="No telemetry records" description="Create a reading to validate the database connection and monitoring flow." />}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add telemetry reading" description="Manual entry follows the same schema used by IoT sensor ingestion.">
        <form className="grid-form" onSubmit={saveReading}>
          <label className="span-2"><span>Asset</span><select value={form.assetId} onChange={(event) => setForm({ ...form, assetId: event.target.value })} required><option value="">Select asset</option>{assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.name}</option>)}</select></label>
          <label><span>Metric</span><select value={form.metric} onChange={(event) => changeMetric(event.target.value)}>{METRICS.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label><span>Unit</span><input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} required /></label>
          <label><span>Value</span><input type="number" step="any" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} required /></label>
          <label><span>Source</span><select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })}><option value="manual">Manual</option><option value="iot-sensor">IoT sensor</option><option value="rfid-reader">RFID reader</option><option value="edge-gateway">Edge gateway</option></select></label>
          <div className="modal-actions span-2"><button className="button button-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save reading'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
