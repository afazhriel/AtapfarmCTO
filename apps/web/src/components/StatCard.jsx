export default function StatCard({ label, value, helper, icon: Icon, tone = 'teal' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}>{Icon ? <Icon size={21} /> : null}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper ? <span>{helper}</span> : null}
      </div>
    </article>
  );
}
