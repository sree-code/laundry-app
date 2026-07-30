import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { dayBadge } from '../api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatches().then(setMatches).finally(() => setLoading(false));
  }, []);

  const upcoming = matches.filter((m) => m.date >= new Date().toISOString().split('T')[0]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Hey, {user?.name?.split(' ')[0]}! 👋</h1>
          <p>Mark your availability for upcoming weekend matches</p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-num">{upcoming.length}</span>
          <span className="stat-lbl">Upcoming Matches</span>
        </div>
        <div className="stat-tile accent">
          <span className="stat-num">{formatRole(user?.player_role)}</span>
          <span className="stat-lbl">Your Role</span>
        </div>
        <div className="stat-tile">
          <span className="stat-num">{'★'.repeat(user?.skill || 0)}</span>
          <span className="stat-lbl">Skill Level</span>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Upcoming Matches</h2>
          <Link to="/matches" className="btn-secondary-sm">View All</Link>
        </div>

        {loading ? (
          <p className="muted">Loading matches...</p>
        ) : upcoming.length === 0 ? (
          <div className="empty">
            <p>No matches scheduled yet. Admin will add Saturday/Sunday matches.</p>
          </div>
        ) : (
          <div className="match-list">
            {upcoming.slice(0, 3).map((m) => {
              const badge = dayBadge(m.day_type);
              return (
                <Link key={m.id} to={`/matches/${m.id}`} className="match-card">
                  <div className="match-card-top">
                    <span className={`day-badge ${badge.cls}`}>{badge.label}</span>
                    {m.teams_generated ? <span className="tag tag-green">Teams Ready</span> : null}
                  </div>
                  <h3>{m.title}</h3>
                  <p className="match-meta">
                    📍 {m.venue} · 🕐 {m.start_time}
                    {m.blocker_name && <> · 🔒 Ground: <strong>{m.blocker_name}</strong></>}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRole(r) {
  const m = { 'wicket-keeper': 'WK', batsman: 'BAT', bowler: 'BOWL', 'all-rounder': 'AR' };
  return m[r] || r;
}
