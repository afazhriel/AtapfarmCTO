import { Download, FileBarChart, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import StatCard from '../components/StatCard';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { downloadCsv, formatDate, formatNumber } from '../lib/helpers';

const COLORS = ['#0f766e', '#d97706', '#dc2626', '#2563eb'];

export default function ReportsPage() {
  const { selectedFarm } = useFarm();
  const { data: assets } = useFarmCollection('assets');
  const { data: tasks } = useFarmCollection('tasks');
  const { data: alerts } = useFarmCollection('alerts');
  const { data: maintenance } = useFarmCollection('maintenance');

  const assetPerformance = useMemo(() => assets.map((asset) => ({
    name: asset.name.length > 18 ? `${asset.name.slice(0, 18)}…` : asset.name,
    health: Number(asset.healthScore || 0),
    utilization: Number(asset.utilization || 0)
  })).sort((a, b) => b.health - a.health).slice(0, 10), [assets]);

  const alertData = useMemo(() => ['critical', 'warning', 'info'].map((severity) => ({ severity, value: alerts.filter((item) => item.severity === severity).length })).filter((item) => item.value), [alerts]);
  const completionRate = tasks.length ? Math.round((tasks.filter((item) => item.status === 'done').length / tasks.length) * 100) : 0;
  const averageHealth = assets.length ? Math.round(assets.reduce((sum, item) => sum + Number(item.healthScore || 0), 0) / assets.length) : 0;
  const maintenanceCost = maintenance.reduce((sum, item) => sum + Number(item.cost || 0), 0);

  function exportAssets() {
    downloadCsv(`farmfleet-assets-${new Date().toISOString().slice(0, 10)}.csv`, assets.map((asset) => ({
      code: asset.code,
      name: asset.name,
      category: asset.category,
      subtype: asset.subtype,
      location: asset.location,
      quantity: asset.quantity,
      healthScore: asset.healthScore,
      utilization: asset.utilization,
      status: asset.status,
      nextService: formatDate(asset.nextServiceAt)
    })));
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Decision support" title="Reports & analytics" description={`Operational summary for ${selectedFarm?.name || 'the selected farm'}.`} actions={<button className="button button-primary" onClick={exportAssets} disabled={!assets.length}><Download size={17} /> Export fleet CSV</button>} />

      <section className="stats-grid">
        <StatCard label="Average fleet health" value={`${averageHealth}%`} helper="Across registered assets" icon={TrendingUp} tone="teal" />
        <StatCard label="Task completion" value={`${completionRate}%`} helper={`${tasks.filter((item) => item.status === 'done').length} of ${tasks.length} tasks`} icon={FileBarChart} tone="blue" />
        <StatCard label="Alert resolution" value={`${alerts.length ? Math.round((alerts.filter((item) => item.status === 'resolved').length / alerts.length) * 100) : 0}%`} helper={`${alerts.filter((item) => item.status !== 'resolved').length} open`} icon={FileBarChart} tone="amber" />
        <StatCard label="Maintenance cost" value={`Rp ${formatNumber(maintenanceCost, 0)}`} helper={`${maintenance.length} work orders`} icon={FileBarChart} tone="purple" />
      </section>

      <section className="dashboard-grid dashboard-grid-wide">
        <article className="panel chart-panel">
          <div className="panel-header"><div><span className="eyebrow">Comparative performance</span><h2>Health vs utilization</h2></div></div>
          <div className="chart-wrap chart-large">
            {assetPerformance.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={assetPerformance} margin={{ top: 8, right: 10, left: -10, bottom: 36 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-28} textAnchor="end" interval={0} tickLine={false} axisLine={false} /><YAxis domain={[0, 100]} tickLine={false} axisLine={false} /><Tooltip /><Bar dataKey="health" name="Health %" fill="#0f766e" radius={[5, 5, 0, 0]} /><Bar dataKey="utilization" name="Utilization %" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer> : <EmptyState title="No assets to report" description="Add fleet assets to generate performance analytics." />}
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header"><div><span className="eyebrow">Risk profile</span><h2>Alerts by severity</h2></div></div>
          <div className="donut-layout vertical-donut">
            <div className="chart-wrap chart-donut"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={alertData} dataKey="value" nameKey="severity" innerRadius={58} outerRadius={82} paddingAngle={4}>{alertData.map((item, index) => <Cell key={item.severity} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-center"><strong>{alerts.length}</strong><span>alerts</span></div></div>
            <div className="legend-list">{alertData.map((item, index) => <div key={item.severity}><span className="legend-dot" style={{ background: COLORS[index % COLORS.length] }} /><span className="capitalize">{item.severity}</span><strong>{item.value}</strong></div>)}</div>
          </div>
        </article>
      </section>

      <section className="panel report-insights">
        <div className="panel-header"><div><span className="eyebrow">Operational interpretation</span><h2>Decision support summary</h2></div></div>
        <div className="insight-grid">
          <article><span>01</span><h3>Fleet health</h3><p>{averageHealth >= 85 ? 'Fleet condition is generally healthy. Continue preventive maintenance and inspect outliers.' : 'Average health is below the recommended operational target. Prioritize critical and attention assets.'}</p></article>
          <article><span>02</span><h3>Execution discipline</h3><p>{completionRate >= 75 ? 'Task execution is on track. Review overdue work to protect consistency.' : 'Task completion is low. Rebalance workload, clarify assignees, and verify due dates.'}</p></article>
          <article><span>03</span><h3>Risk response</h3><p>{alerts.some((item) => item.severity === 'critical' && item.status !== 'resolved') ? 'Critical alerts remain open. Immediate field verification and documented resolution are recommended.' : 'No unresolved critical alert is currently recorded.'}</p></article>
        </div>
      </section>
    </div>
  );
}
