import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/matches', label: 'Matches' },
    { to: '/admin/teams', label: 'Teams' },
    { to: '/admin/ground', label: 'Ground' },
    { to: '/admin/users', label: 'Players' },
  ];

  const userLinks = [
    { to: '/dashboard', label: 'Home' },
    { to: '/matches', label: 'Matches' },
    { to: '/profile', label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="brand">
            <span className="brand-mark">🏏</span>
            <div>
              <strong>Weekend Cricket</strong>
              <small>{isAdmin ? 'Admin Control' : 'Player Portal'}</small>
            </div>
          </Link>

          {user && (
            <nav className="nav-pills">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={location.pathname === l.to ? 'active' : ''}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          )}

          <div className="topbar-actions">
            {user ? (
              <>
                <span className="user-chip">
                  {user.name}
                  {isAdmin && <em>Admin</em>}
                </span>
                <button className="btn-ghost" onClick={() => { logout(); navigate('/login'); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary-sm">Join</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        Weekend Cricket · Built for 50+ players · Sat · Sun · Holidays only
      </footer>
    </div>
  );
}
