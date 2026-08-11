import { CalendarDays, CheckCircle2, ChevronRight, Plus, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import SectionHeader from '../components/SectionHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useFarmCollection } from '../hooks/useFarmCollection';
import { TASK_STATUSES } from '../lib/constants';
import { formatDate, sortByDateDescending } from '../lib/helpers';
import { createFarmDocument, logActivity, updateFarmDocument } from '../services/firestore';

const emptyTask = {
  title: '',
  type: 'inspection',
  status: 'todo',
  priority: 'medium',
  assetId: '',
  assigneeName: '',
  dueAt: '',
  notes: ''
};

export default function TasksPage() {
  const { user } = useAuth();
  const { selectedFarmId, role } = useFarm();
  const { data: tasks } = useFarmCollection('tasks');
  const { data: assets } = useFarmCollection('assets');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [saving, setSaving] = useState(false);
  const { push } = useToast();
  const canWrite = ['owner', 'manager', 'operator'].includes(role);

  const columns = useMemo(() => TASK_STATUSES.map((status) => ({
    ...status,
    items: sortByDateDescending(tasks.filter((task) => task.status === status.value), 'dueAt').reverse()
  })), [tasks]);

  async function saveTask(event) {
    event.preventDefault();
    const asset = assets.find((item) => item.id === form.assetId);
    setSaving(true);
    try {
      await createFarmDocument(selectedFarmId, 'tasks', {
        ...form,
        assetName: asset?.name || 'Farm-wide',
        dueAt: form.dueAt ? new Date(`${form.dueAt}T12:00:00`) : new Date()
      });
      await logActivity(selectedFarmId, user, 'Created operational task', form.title, form.assigneeName || 'Unassigned');
      push('Task created.');
      setModalOpen(false);
      setForm(emptyTask);
    } catch (error) {
      push(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function moveTask(task, nextStatus) {
    try {
      await updateFarmDocument(selectedFarmId, 'tasks', task.id, {
        status: nextStatus,
        ...(nextStatus === 'done' ? { completedAt: new Date() } : {})
      });
      await logActivity(selectedFarmId, user, 'Updated task status', task.title, nextStatus);
      push(`Task moved to ${TASK_STATUSES.find((item) => item.value === nextStatus)?.label}.`);
    } catch (error) {
      push(error.message, 'error');
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Operational workflow" title="Tasks & operations" description="Plan, assign, execute, and verify feeding, health, cleaning, inspection, maintenance, and harvest work." actions={canWrite ? <button className="button button-primary" onClick={() => setModalOpen(true)}><Plus size={17} /> Create task</button> : null} />

      <section className="kanban-board">
        {columns.map((column, columnIndex) => (
          <article className="kanban-column" key={column.value}>
            <header><div><span className={`kanban-dot kanban-${column.value}`} /><h2>{column.label}</h2></div><strong>{column.items.length}</strong></header>
            <div className="kanban-cards">
              {column.items.map((task) => (
                <div className="task-card" key={task.id}>
                  <div className="task-card-top"><StatusBadge value={task.priority} /><span className="task-type">{task.type}</span></div>
                  <h3>{task.title}</h3>
                  <p>{task.assetName || 'Farm-wide'}</p>
                  <div className="task-meta"><span><UserRound size={14} /> {task.assigneeName || 'Unassigned'}</span><span><CalendarDays size={14} /> {formatDate(task.dueAt)}</span></div>
                  {task.notes ? <small>{task.notes}</small> : null}
                  {canWrite ? (
                    <div className="task-actions">
                      {columnIndex > 0 ? <button type="button" className="button button-ghost small" onClick={() => moveTask(task, columns[columnIndex - 1].value)}>Back</button> : <span />}
                      {columnIndex < columns.length - 1 ? <button type="button" className="button button-secondary small" onClick={() => moveTask(task, columns[columnIndex + 1].value)}>{columnIndex === columns.length - 2 ? <CheckCircle2 size={15} /> : null}{columns[columnIndex + 1].label}<ChevronRight size={15} /></button> : null}
                    </div>
                  ) : null}
                </div>
              ))}
              {!column.items.length ? <EmptyState title={`No ${column.label.toLowerCase()} tasks`} description="Tasks in this stage will appear here." /> : null}
            </div>
          </article>
        ))}
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create operational task" description="Assign work to a person and optionally link it to a fleet asset." size="lg">
        <form className="grid-form" onSubmit={saveTask}>
          <label className="span-2"><span>Task title</span><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Inspect poultry ventilation" required /></label>
          <label><span>Task type</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="feeding">Feeding</option><option value="inspection">Inspection</option><option value="health">Health</option><option value="cleaning">Cleaning</option><option value="maintenance">Maintenance</option><option value="harvest">Harvest</option><option value="logistics">Logistics</option></select></label>
          <label><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label><span>Linked asset</span><select value={form.assetId} onChange={(event) => setForm({ ...form, assetId: event.target.value })}><option value="">Farm-wide</option>{assets.map((asset) => <option value={asset.id} key={asset.id}>{asset.name}</option>)}</select></label>
          <label><span>Assignee</span><input value={form.assigneeName} onChange={(event) => setForm({ ...form, assigneeName: event.target.value })} placeholder="Operator A" /></label>
          <label><span>Due date</span><input type="date" value={form.dueAt} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} required /></label>
          <label><span>Initial status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{TASK_STATUSES.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label className="span-2"><span>Instructions</span><textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Inspection checklist or operating instruction" /></label>
          <div className="modal-actions span-2"><button className="button button-secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</button><button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create task'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
