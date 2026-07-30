import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dayBadge } from '../api';

export default function UserMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMatches().then(setMatches).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = matches.filter((m) => m.date >= today);
  const past = matches.filter((m) => m.date < today);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Match Schedule</h1>
        <p>Saturday · Sunday · Holidays only</p>
      </div>

      {loading ? <p className="muted">Loading...</p> : (
        <>
          <section className="panel">
            <h2>Upcoming ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <div className="empty"><p>No upcoming matches</p></div>
            ) : (
              <div className="match-list">
                {upcoming.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section className="panel panel-dim">
              <h2>Past Matches</h2>
              <div className="match-list">
                {past.map((m) => <MatchRow key={m.id} match={m} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MatchRow({ match: m }) {
  const badge = dayBadge(m.day_type);
  return (
    <Link to={`/matches/${m.id}`} className="match-card">
      <div className="match-card-top">
        <span className={`day-badge ${badge.cls}`}>{badge.label}</span>
        <span className="match-date">{m.date}</span>
      </div>
      <h3>{m.title}</h3>
      <p className="match-meta">
        📍 {m.venue} · 🕐 {m.start_time}
        {m.blocker_name && <> · 🔒 <strong>{m.blocker_name}</strong> booked ground</>}
      </p>
      {m.notes && <p className="match-notes">{m.notes}</p>}
    </Link>
  );
}
