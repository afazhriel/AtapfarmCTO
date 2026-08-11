import {
  BellRing,
  Boxes,
  CheckCircle2,
  CircleGauge,
  ClipboardList,
  LoaderCircle,
  Plus
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { formatDate, formatNumber, sortByDateDescending, toDate } from '../lib/helpers';
import { seedDemoData } from '../services/demoSeed';

const CHART_COLORS = ['#0f766e', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedFarm, selectedFarmId, role } = useFarm();
  const { data: assets } = useFarmCollection('assets');
  const { data: telemetry } = useFarmCollection('telemetry');
  const { data: tasks } = useFarmCollection('tasks');
  const { data: alerts } = useFarmCollection('alerts');
  const { data: maintenance } = useFarmCollection('maintenance');
  const { data: activities } = useFarmCollection('activities');
  const [seeding, setSeeding] = useState(false);
  const { push } = useToast();

  const canWrite = ['owner', 'manager', 'operator'].includes(role);
  const openAlerts = alerts.filter((item) => item.status !== 'resolved');
  const openTasks = tasks.filter((item) => item.status !== 'done');
  const healthyAssets = assets.filter((item) => item.status === 'healthy').length;
  const healthRate = assets.length ? Math.round((healthyAssets / assets.length) * 100) : 0;
  const maintenanceDue = maintenance.filter((item) => item.status !== 'completed').length;

  const categoryData = useMemo(() => {
    const counts = assets.reduce((accumulator, asset) => {
      accumulator[asset.category || 'other'] = (accumulator[asset.category || 'other'] || 0) + 1;
      return accumulator;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace('-', ' '), value }));
  }, [assets]);

  const trendData = useMemo(() => {
    const rows = {};
    telemetry.forEach((item) => {
      const date = toDate(item.recordedAt || item.createdAt);
      if (!date) return;
      const key = date.toISOString().slice(0, 10);
      if (!rows[key]) rows[key] = { date: key, temperature: [], humidity: [] };
      if (item.metric === 'temperature') rows[key].temperature.push(Number(item.value));
      if (item.metric === 'humidity') rows[key].humidity.push(Number(item.value));
    });
    return Object.values(rows)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((row) => ({
        date: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(`${row.date}T12:00:00`)),
        temperature: row.temperature.length ? Number((row.temperature.reduce((a, b) => a + b, 0) / row.temperature.length).toFixed(1)) : null,
        humidity: row.humidity.length ? Number((row.humidity.reduce((a, b) => a + b, 0) / row.humidity.length).toFixed(1)) : null
      }));
  }, [telemetry]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedDemoData(selectedFarmId, user);
      push('Demo fleet data loaded successfully.');
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader
        eyebrow="Fleet command center"
        title={`Good day, ${user?.displayName?.split(' ')[0] || 'Manager'}`}
        description={`${selectedFarm?.name || 'Farm'} · ${selectedFarm?.location || 'Location not set'}`}
        actions={canWrite && !assets.length ? (
          <button className="button button-primary" type="button" onClick={handleSeed} disabled={seeding}>
            {seeding ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Load demo fleet
          </button>
        ) : <Link className="button button-primary" to="/assets"><Plus size={17} /> Add asset</Link>}
      />

      <section className="stats-grid">
        <StatCard label="Fleet assets" value={formatNumber(assets.length, 0)} helper="Across all categories" icon={Boxes} tone="teal" />
        <StatCard label="Fleet health" value={`${healthRate}%`} helper={`${healthyAssets} assets healthy`} icon={CircleGauge} tone="blue" />
        <StatCard label="Open alerts" value={formatNumber(openAlerts.length, 0)} helper={`${openAlerts.filter((item) => item.severity === 'critical').length} critical`} icon={BellRing} tone="red" />
        <StatCard label="Active tasks" value={formatNumber(openTasks.length, 0)} helper={`${maintenanceDue} maintenance due`} icon={ClipboardList} tone="amber" />
      </section>

      {!assets.length ? (
        <div className="panel">
          <EmptyState
            title="Your fleet workspace is ready"
            description="Load a realistic demo dataset or create the first asset manually. Demo data includes livestock, equipment, vehicles, facilities, telemetry, tasks, alerts, and maintenance."
            action={canWrite ? <button className="button button-primary" type="button" onClick={handleSeed} disabled={seeding}>{seeding ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />} Load demo data</button> : null}
          />
        </div>
      ) : (
        <>
          <section className="dashboard-grid dashboard-grid-wide">
            <article className="panel chart-panel">
              <div className="panel-header">
                <div><span className="eyebrow">Environmental trend</span><h2>Telemetry overview</h2></div>
                <Link to="/monitoring">View monitoring</Link>
              </div>
              <div className="chart-wrap chart-large">
                {trendData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="temperatureFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0f766e" stopOpacity={0.25} /><stop offset="95%" stopColor="#0f766e" stopOpacity={0} /></linearGradient>
                        <linearGradient id="humidityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="temperature" name="Temperature °C" stroke="#0f766e" fill="url(#temperatureFill)" strokeWidth={2.5} connectNulls />
                      <Area type="monotone" dataKey="humidity" name="Humidity %" stroke="#2563eb" fill="url(#humidityFill)" strokeWidth={2.5} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <EmptyState title="No telemetry yet" description="Add readings from the Monitoring page." />}
              </div>
            </article>

            <article className="panel chart-panel">
              <div className="panel-header"><div><span className="eyebrow">Fleet composition</span><h2>Assets by category</h2></div></div>
              <div className="donut-layout">
                <div className="chart-wrap chart-donut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={3}>
                        {categoryData.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="donut-center"><strong>{assets.length}</strong><span>assets</span></div>
                </div>
                <div className="legend-list">
                  {categoryData.map((item, index) => (
                    <div key={item.name}><span className="legend-dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} /><span>{item.name}</span><strong>{item.value}</strong></div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel">
              <div className="panel-header"><div><span className="eyebrow">Priority queue</span><h2>Open alerts</h2></div><Link to="/alerts">View all</Link></div>
              <div className="compact-list">
                {sortByDateDescending(openAlerts).slice(0, 5).map((alert) => (
                  <div className="compact-row" key={alert.id}>
                    <div className={`row-icon severity-${alert.severity}`}><BellRing size={17} /></div>
                    <div className="row-main"><strong>{alert.title}</strong><span>{alert.assetName || 'Farm-wide'} · {formatDate(alert.createdAt, true)}</span></div>
                    <StatusBadge value={alert.severity} />
                  </div>
                ))}
                {!openAlerts.length ? <div className="inline-success"><CheckCircle2 size={18} /> No open alerts.</div> : null}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header"><div><span className="eyebrow">Execution</span><h2>Upcoming work</h2></div><Link to="/tasks">View operations</Link></div>
              <div className="compact-list">
                {openTasks.slice(0, 5).map((task) => (
                  <div className="compact-row" key={task.id}>
                    <div className="row-icon"><ClipboardList size={17} /></div>
                    <div className="row-main"><strong>{task.title}</strong><span>{task.assigneeName || 'Unassigned'} · due {formatDate(task.dueAt)}</span></div>
                    <StatusBadge value={task.priority} />
                  </div>
                ))}
                {!openTasks.length ? <div className="inline-success"><CheckCircle2 size={18} /> All tasks completed.</div> : null}
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel">
              <div className="panel-header"><div><span className="eyebrow">Asset health</span><h2>Assets needing attention</h2></div><Link to="/assets">Fleet registry</Link></div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Asset</th><th>Category</th><th>Health</th><th>Status</th></tr></thead>
                  <tbody>
                    {assets.filter((asset) => asset.status !== 'healthy').slice(0, 6).map((asset) => (
                      <tr key={asset.id}><td><strong>{asset.name}</strong><small>{asset.code}</small></td><td>{asset.category}</td><td>{asset.healthScore || 0}%</td><td><StatusBadge value={asset.status} /></td></tr>
                    ))}
                  </tbody>
                </table>
                {!assets.some((asset) => asset.status !== 'healthy') ? <div className="inline-success padded"><CheckCircle2 size={18} /> All assets are healthy.</div> : null}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header"><div><span className="eyebrow">Audit trail</span><h2>Recent activity</h2></div></div>
              <div className="timeline-list">
                {sortByDateDescending(activities).slice(0, 6).map((activity) => (
                  <div key={activity.id}><span className="timeline-dot" /><div><strong>{activity.action}</strong><p>{activity.entity} · {activity.details}</p><small>{activity.actorName} · {formatDate(activity.createdAt, true)}</small></div></div>
                ))}
                {!activities.length ? <EmptyState title="No activity yet" description="Operational events will appear here." /> : null}
              </div>
            </article>
          </section>
        </>
      )}
    </div>
  );
}
