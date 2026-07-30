import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dayBadge } from '../../api';

export default function AdminDashboard() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMatches(), api.adminUsers()])
      .then(([m, u]) => { setMatches(m); setUsers(u.filter((x) => x.role === 'user')); })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = matches.filter((m) => m.date >= today);
  const withTeams = matches.filter((m) => m.teams_generated);
  const blocked = upcoming.filter((m) => m.blocker_name);

  return (
    <div className="page">
      <div className="page-header admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Schedule matches · Manage ground · Generate teams</p>
        </div>
        <Link to="/admin/matches" className="btn-primary">+ Schedule Match</Link>
      </div>

      <div className="stat-row">
        <div className="stat-tile"><span className="stat-num">{users.length}</span><span className="stat-lbl">Players</span></div>
        <div className="stat-tile accent"><span className="stat-num">{upcoming.length}</span><span className="stat-lbl">Upcoming</span></div>
        <div className="stat-tile"><span className="stat-num">{withTeams.length}</span><span className="stat-lbl">Teams Made</span></div>
        <div className="stat-tile warn"><span className="stat-num">{blocked.length}</span><span className="stat-lbl">Ground Booked</span></div>
      </div>

      <div className="admin-grid">
        <div className="panel">
          <div className="panel-head"><h2>Upcoming Matches</h2><Link to="/admin/matches">Manage</Link></div>
          {loading ? <p className="muted">Loading...</p> : upcoming.length === 0 ? (
            <div className="empty"><p>No matches yet. Schedule one for Saturday or Sunday.</p></div>
          ) : (
            <div className="match-list compact">
              {upcoming.slice(0, 5).map((m) => {
                const b = dayBadge(m.day_type);
                return (
                  <div key={m.id} className="admin-match-row">
                    <span className={`day-badge ${b.cls}`}>{b.label}</span>
                    <div>
                      <strong>{m.title}</strong>
                      <small>{m.venue} · {m.start_time}</small>
                    </div>
                    <div className="row-actions">
                      {m.blocker_name && <span className="tag">🔒 {m.blocker_name}</span>}
                      {m.teams_generated
                        ? <Link to={`/admin/teams?match=${m.id}`} className="tag tag-green">Teams ✓</Link>
                        : <Link to={`/admin/teams?match=${m.id}`} className="tag tag-amber">Make Teams</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-head"><h2>Quick Actions</h2></div>
          <div className="quick-actions">
            <Link to="/admin/matches" className="qa-card"><span>📅</span><strong>Schedule Match</strong><small>Sat · Sun · Holidays</small></Link>
            <Link to="/admin/teams" className="qa-card"><span>⚔️</span><strong>Generate Teams</strong><small>Balance by skill</small></Link>
            <Link to="/admin/ground" className="qa-card"><span>🏟️</span><strong>Ground Booking</strong><small>Who blocked ground</small></Link>
            <Link to="/admin/users" className="qa-card"><span>👥</span><strong>All Players</strong><small>{users.length} registered</small></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
