import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  LogOut,
  MapPin,
  Search,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/app/activity',       label: 'Activities',     mobileLabel: 'Activities', icon: CalendarDays },
  { to: '/app/lost-found',     label: 'Lost & Found',   mobileLabel: 'Lost/Found', icon: Search },
  { to: '/app/service-alerts', label: 'Service Alerts', mobileLabel: 'Alerts',     icon: Wrench },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────── */}
      <aside className="site-sidebar" aria-label="Main navigation">
        {/* Brand */}
        <Link to="/app/activity" className="brand-lockup" aria-label="Locora home">
          <span className="brand-mark">
            <MapPin size={18} strokeWidth={2.5} />
          </span>
          <span>
            <strong>locora</strong>
            <small>your neighbourhood</small>
          </span>
        </Link>

        {/* Nav */}
        <nav>
          <p className="nav-section-label">Explore</p>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-chevron" />
            </NavLink>
          ))}

          <p className="nav-section-label">Your Space</p>
          <NavLink
            to="/app/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CircleUserRound size={18} strokeWidth={2} />
            <span>Profile & Sessions</span>
            <ChevronRight size={14} className="nav-chevron" />
          </NavLink>
        </nav>

        {/* Account footer */}
        {user && (
          <div className="sidebar-footer">
            <Link to="/app/profile" className="account-card">
              <span className="account-avatar">
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="" />
                  : user.name.charAt(0).toUpperCase()
                }
              </span>
              <span className="account-info">
                <strong>{user.name}</strong>
                <small>{user.email}</small>
              </span>
            </Link>
            <button type="button" onClick={handleLogout} className="signout-btn">
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* ── Mobile topbar ──────────────────────────────────────────────── */}
      <header className="mobile-topbar">
        <Link to="/app/activity" className="mobile-brand">
          <span className="mobile-brand-mark">
            <MapPin size={16} strokeWidth={2.4} />
          </span>
          <strong>locora</strong>
        </Link>
        {user && (
          <Link to="/app/profile">
            <span className="account-avatar avatar-sm" style={{ width: 32, height: 32, fontSize: 12 }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </Link>
        )}
      </header>

      {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navLinks.map(({ to, mobileLabel, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <Icon size={22} strokeWidth={1.9} />
            <span>{mobileLabel}</span>
          </NavLink>
        ))}
        <NavLink to="/app/profile" className={({ isActive }) => isActive ? 'active' : ''}>
          <CircleUserRound size={22} strokeWidth={1.9} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
};

export default Sidebar;
