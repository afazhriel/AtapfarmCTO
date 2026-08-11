import { Activity, BellRing, Database, Radio, Workflow } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';

export default function FlowPage() {
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Reference architecture" title="System workflow" description="The operational loop implemented by this application, from asset registration to decision support." />
      <section className="flow-stage-grid">
        <article><Radio /><span>01</span><h3>Acquire</h3><p>IoT sensors, RFID, GPS, and manual field inputs produce normalized records.</p></article>
        <article><Database /><span>02</span><h3>Persist</h3><p>Firestore stores farm-isolated assets, telemetry, tasks, alerts, and maintenance history.</p></article>
        <article><Activity /><span>03</span><h3>Analyze</h3><p>Dashboards aggregate health, utilization, environmental trends, work, and cost.</p></article>
        <article><BellRing /><span>04</span><h3>Respond</h3><p>Abnormal readings create alerts, while operators execute tasks and maintenance.</p></article>
        <article><Workflow /><span>05</span><h3>Improve</h3><p>Completed actions update asset condition and produce a traceable decision-support history.</p></article>
      </section>
      <section className="panel flowchart-panel">
        <img src="/farmfleet-flowchart.png" alt="Integrated Fleet Farm Management System flowchart" />
      </section>
    </div>
  );
}
