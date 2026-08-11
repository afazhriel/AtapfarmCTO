import {
  Activity,
  BellRing,
  Boxes,
  ClipboardList,
  Gauge,
  GitBranch,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Dashboard', icon: Gauge, end: true },
  { to: '/assets', label: 'Fleet Assets', icon: Boxes },
  { to: '/monitoring', label: 'Monitoring', icon: Activity },
  { to: '/tasks', label: 'Operations', icon: ClipboardList },
  { to: '/alerts', label: 'Alerts', icon: BellRing },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: ShieldCheck },
  { to: '/team', label: 'Team', icon: Users },
  { to: '/system-flow', label: 'System Flow', icon: GitBranch },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-lockup">
            <div className="brand-mark">FF</div>
            <div>
              <strong>FarmFleet</strong>
              <span>Operations OS</span>
            </div>
          </div>
          <button className="icon-button mobile-only" type="button" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">Workspace</span>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="system-health"><span className="live-dot" /> Firebase live sync</div>
          <small>Universal fleet management for modern farms.</small>
        </div>
      </aside>
      {open ? <button className="sidebar-overlay" type="button" onClick={onClose} aria-label="Close menu" /> : null}
    </>
  );
}
