import { Bell, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { initials } from '../lib/helpers';
import { useToast } from './ToastProvider';

export default function Header({ onOpenMenu }) {
  const { user, logout } = useAuth();
  const { farms, selectedFarm, selectFarm, role } = useFarm();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    function handleClick(event) {
      if (!menuRef.current?.contains(event.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    await logout();
    push('Signed out successfully.', 'info');
    navigate('/login');
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-only" type="button" onClick={onOpenMenu} aria-label="Open menu">
          <Menu size={21} />
        </button>
        <div className="farm-switcher">
          <span>Active farm</span>
          <div className="select-wrap">
            <select value={selectedFarm?.id || ''} onChange={(event) => selectFarm(event.target.value)}>
              {farms.map((farm) => <option value={farm.id} key={farm.id}>{farm.name}</option>)}
            </select>
            <ChevronDown size={15} />
          </div>
        </div>
      </div>
      <div className="topbar-actions">
        <button className="icon-button notification-button" type="button" onClick={() => navigate('/alerts')} aria-label="Open alerts">
          <Bell size={20} />
          <span />
        </button>
        <div className="profile-menu" ref={menuRef}>
          <button type="button" className="profile-trigger" onClick={() => setProfileOpen((value) => !value)}>
            <div className="avatar">{initials(user?.displayName || user?.email)}</div>
            <div className="profile-copy desktop-only">
              <strong>{user?.displayName || 'FarmFleet User'}</strong>
              <span>{role}</span>
            </div>
            <ChevronDown size={16} className="desktop-only" />
          </button>
          {profileOpen ? (
            <div className="profile-dropdown">
              <button type="button" onClick={() => { navigate('/settings'); setProfileOpen(false); }}>
                <UserRound size={17} /> Profile & settings
              </button>
              <button type="button" onClick={handleLogout}>
                <LogOut size={17} /> Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
