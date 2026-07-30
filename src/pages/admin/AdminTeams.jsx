import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, formatRole, skillStars } from '../../api';

export default function AdminTeams() {
  const [params] = useSearchParams();
  const [matches, setMatches] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get('match') || '');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ team1: [], team2: [], generated: false });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getMatches().then((m) => {
      setMatches(m.filter((x) => x.date >= new Date().toISOString().split('T')[0]));
      if (!selectedId && m.length) setSelectedId(m[0]?.id || '');
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    Promise.all([
      api.getAvailability(selectedId),
      api.getTeams(selectedId),
    ]).then(([avail, t]) => {
      setPlayers(avail);
      setTeams(t);
    });
  }, [selectedId]);

  async function generate() {
    setLoading(true);
    setError('');
    setMsg('');
    try {
      const result = await api.generateTeams(selectedId);
      setTeams(result);
      setMsg('Teams generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const match = matches.find((m) => m.id === selectedId);

  return (
    <div className="page">
      <div className="page-header admin-header">
        <div>
          <h1>Generate Teams</h1>
          <p>Pick a match and auto-balance two teams by skill</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="panel">
        <label className="select-label">Select Match
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            <option value="">— Choose match —</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>{m.title} ({players.length} available when selected)</option>
            ))}
          </select>
        </label>

        {match && (
          <div className="match-summary">
            <span>📍 {match.venue}</span>
            <span>🕐 {match.start_time}</span>
            <span>👥 {players.length} players available</span>
            {match.blocker_name && <span>🔒 Ground: {match.blocker_name}</span>}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={generate}
          disabled={!selectedId || players.length < 4 || loading}
        >
          {loading ? 'Generating...' : teams.generated ? 'Regenerate Teams' : 'Generate Teams'}
        </button>
        {players.length > 0 && players.length < 4 && (
          <p className="alert alert-error">Need at least 4 available players</p>
        )}
      </div>

      {teams.generated && (
        <div className="teams-grid">
          <TeamPanel name="Team A" cls="team-a" players={teams.team1} />
          <TeamPanel name="Team B" cls="team-b" players={teams.team2} />
        </div>
      )}

      <div className="panel">
        <h2>Available Players ({players.length})</h2>
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

function TeamPanel({ name, cls, players }) {
  const total = players.reduce((s, p) => s + Number(p.skill), 0);
  return (
    <div className={`team-panel ${cls}`}>
      <div className="team-panel-head">{name}</div>
      <div className="team-panel-stats">{players.length} players · Total skill {total}</div>
      {players.map((p, i) => (
        <div key={p.id} className="team-player-row">
          <span className="tp-num">{i + 1}</span>
          <div>
            <strong>{p.name}</strong>
            <small>{formatRole(p.player_role)} · {skillStars(p.skill)} · {p.phone || '—'}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
