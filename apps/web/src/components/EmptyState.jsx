import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', description = 'Add your first record to get started.', action }) {
  return (
    <div className="empty-state">
      <Inbox size={32} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
