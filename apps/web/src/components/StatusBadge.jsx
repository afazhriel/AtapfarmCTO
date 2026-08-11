import { classNames } from '../lib/helpers';

export default function StatusBadge({ value, label }) {
  const normalized = String(value || 'unknown').toLowerCase().replaceAll(' ', '-');
  return <span className={classNames('status-badge', `status-${normalized}`)}>{label || value || 'Unknown'}</span>;
}
