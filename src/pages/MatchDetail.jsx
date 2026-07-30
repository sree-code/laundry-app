import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, formatRole, skillStars } from '../api';
import { dayBadge } from '../api';

export default function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [available, setAvailable] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ team1: [], team2: [], generated: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const [allMatches, status, avail, teamData] = await Promise.all([
        api.getMatches(),
        api.getMyStatus(id),
        api.getAvailability(id),
        api.getTeams(id),
      ]);
      setMatch(allMatches.find((m) => m.id === id));
      setAvailable(status.available);
      setPlayers(avail);
      setTeams(teamData);
      setLoading(false);
    }
    load();
  }, [id]);

  async function toggleAvailability() {
    setSaving(true);
    setMsg('');
    try {
      const res = await api.setAvailability(id, !available);
      setAvailable(res.available);
      const avail = await api.getAvailability(id);
      setPlayers(avail);
      setMsg(res.available ? "You're in! See you on match day." : 'Availability removed.');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="page"><p className="muted">Loading...</p></div>;
  if (!match) return <div className="page"><div className="alert alert-error">Match not found</div></div>;

  const badge = dayBadge(match.day_type);

  return (
    <div className="page">
      <div className="match-hero">
        <span className={`day-badge ${badge.cls}`}>{badge.label}</span>
        <h1>{match.title}</h1>
        <div className="match-hero-meta">
          <span>📍 {match.venue}</span>
          <span>🕐 {match.start_time}</span>
          {match.blocker_name && <span>🔒 Ground booked by <strong>{match.blocker_name}</strong></span>}
        </div>
        {match.notes && <p className="match-notes">{match.notes}</p>}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="panel">
        <h2>Your Availability</h2>
        <button
          className={`avail-toggle ${available ? 'is-in' : ''}`}
          onClick={toggleAvailability}
          disabled={saving}
        >
          <span className="avail-icon">{available ? '✓' : '+'}</span>
          <span>{available ? "I'm Playing" : 'Mark Available'}</span>
        </button>
        <p className="muted small">{players.length} players confirmed so far</p>
      </div>

      {teams.generated && (
        <div className="teams-grid">
          <TeamCard name="Team A" cls="team-a" players={teams.team1} />
          <TeamCard name="Team B" cls="team-b" players={teams.team2} />
        </div>
      )}

      <div className="panel">
        <h2>Confirmed Players ({players.length})</h2>
        <div className="player-grid">
          {players.map((p) => (
            <div key={p.id} className="player-chip">
              <strong>{p.name}</strong>
              <small>{formatRole(p.player_role)} · {skillStars(p.skill)}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamCard({ name, cls, players }) {
  const total = players.reduce((s, p) => s + Number(p.skill), 0);
  return (
    <div className={`team-panel ${cls}`}>
      <div className="team-panel-head">{name}</div>
      <div className="team-panel-stats">{players.length} players · Skill {total}</div>
      {players.map((p, i) => (
        <div key={p.id} className="team-player-row">
          <span className="tp-num">{i + 1}</span>
          <div>
            <strong>{p.name}</strong>
            <small>{formatRole(p.player_role)} · {skillStars(p.skill)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
