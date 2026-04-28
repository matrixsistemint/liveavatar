import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLiveAvatarUrls } from '../context/LiveAvatarUrlContext';
import '../styles/dashboard.css';

const staticNavLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>,
  },
  {
    to: '/avatar',
    label: 'Avatar',
    icon: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  },
  {
    to: '/analytics',
    label: 'Analytics',
    icon: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" /></svg>,
  },
  {
    to: '/settings',
    label: 'Pengaturan',
    icon: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { urls, loading: urlsLoading } = useLiveAvatarUrls();
  const [liveGroupOpen, setLiveGroupOpen] = useState(true);

  const isLiveActive = location.pathname.startsWith('/live/');

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon-sm">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="url(#sb-grad)" />
              <path d="M11 16L14.5 19.5L21 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="sb-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>LiveAvatar</span>
        </div>

        <nav className="sidebar-nav">
          {/* Static links */}
          {staticNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {/* ── Live Actions Group ── */}
          {!urlsLoading && urls.length > 0 && (
            <div className="nav-group">
              <button
                className={`nav-group-header ${isLiveActive ? 'group-active' : ''}`}
                onClick={() => setLiveGroupOpen(o => !o)}
                id="live-actions-group-toggle"
              >
                <span className="nav-group-icon">
                  {/* video/play icon */}
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="nav-group-label">Live Actions</span>
                <span className="nav-group-count">{urls.length}</span>
                <svg
                  className={`nav-group-chevron ${liveGroupOpen ? 'open' : ''}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {liveGroupOpen && (
                <div className="nav-group-items">
                  {urls.map((url, idx) => {
                    const to = `/live/${idx}`;
                    const isActive = location.pathname === to;
                    const label = (() => {
                      try { return new URL(url).hostname; } catch { return `Live ${idx + 1}`; }
                    })();
                    return (
                      <Link
                        key={idx}
                        to={to}
                        id={`live-action-nav-${idx}`}
                        className={`nav-item nav-sub-item ${isActive ? 'active' : ''}`}
                        title={url}
                      >
                        <span className="live-dot-sm" />
                        <span className="nav-sub-label">{label}</span>
                        {isActive && <span className="live-badge">LIVE</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Admin: User Management */}
          {user?.role === 'admin' && (
            <Link
              to="/admin/users"
              className={`nav-item ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Manajemen User
              <span className="nav-badge">Admin</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</div>
            <div className="user-details">
              <p className="user-name">{user?.name || 'Tamu'}</p>
              <p className="user-role">{user?.role || 'Pengunjung'}</p>
            </div>
          </div>
          {user ? (
            <button id="logout-btn" className="logout-btn" onClick={handleLogout} title="Keluar">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          ) : (
            <Link to="/login" className="logout-btn" title="Login">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 11-2 0V4H5v12h3a1 1 0 112 0v2a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 9H10a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
