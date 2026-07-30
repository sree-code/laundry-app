import { useEffect, useState } from 'react';
import { api, dayBadge } from '../../api';

export default function AdminGround() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMatches(), api.adminUsers()])
      .then(([m, u]) => { setMatches(m); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  async function assignBlocker(matchId, userId) {
    await api.updateMatch(matchId, { ground_blocked_by: userId || null });
    const updated = await api.getMatches();
    setMatches(updated);
  }

  const today = new Date().toISOString().split('T')[0];
  const upcoming = matches.filter((m) => m.date >= today);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ground Booking</h1>
        <p>See and assign who is blocking the ground for each match</p>
      </div>

      {loading ? <p className="muted">Loading...</p> : upcoming.length === 0 ? (
        <div className="panel empty"><p>No upcoming matches. Schedule one first.</p></div>
      ) : (
        <div className="ground-grid">
          {upcoming.map((m) => {
            const b = dayBadge(m.day_type);
            return (
              <div key={m.id} className="ground-card">
                <div className="ground-card-head">
                  <span className={`day-badge ${b.cls}`}>{b.label}</span>
                  <strong>{m.title}</strong>
                </div>
                <p className="match-meta">📍 {m.venue} · 🕐 {m.start_time}</p>

                <div className="ground-blocker">
                  {m.blocker_name ? (
                    <div className="blocker-assigned">
                      <span className="blocker-icon">🔒</span>
                      <div>
                        <strong>{m.blocker_name}</strong>
                        <small>has blocked the ground</small>
                      </div>
                    </div>
                  ) : (
                    <div className="blocker-empty">⚠️ No one assigned yet</div>
                  )}

                  <label className="select-label">
                    Assign / Change
                    <select
                      value={m.ground_blocked_by || ''}
                      onChange={(e) => assignBlocker(m.id, e.target.value)}
                    >
                      <option value="">— None —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} {u.role === 'admin' ? '(Admin)' : ''}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
