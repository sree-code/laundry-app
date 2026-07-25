import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatRole, getNextSaturday, skillStars } from '../api';

function TeamPanel({ title, teamClass, players }) {
  const totalSkill = players.reduce((sum, p) => sum + p.skill, 0);
  const roles = players.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="team-card">
      <div className={`team-header ${teamClass}`}>{title}</div>
      <div className="team-stats">
        {players.length} players · Total skill: {totalSkill}
        {Object.keys(roles).length > 0 && (
          <> · {Object.entries(roles).map(([r, c]) => `${formatRole(r)}: ${c}`).join(', ')}</>
        )}
      </div>
      <div className="team-players">
        {players.length === 0 ? (
          <div className="team-player" style={{ color: 'var(--muted)' }}>No players assigned</div>
        ) : (
          players.map((p, i) => (
            <div key={p.id} className="team-player">
              <div className="name">{i + 1}. {p.name}</div>
              <div className="details">
                {formatRole(p.role)} · Skill {p.skill} {skillStars(p.skill)}
                {p.phone && ` · ${p.phone}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function Teams() {
  const [weekend, setWeekend] = useState(null);
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [availableCount, setAvailableCount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  async function loadTeams(weekendId) {
    const available = await api.getAvailability(weekendId);
    setAvailableCount(available.length);

    const teams = await api.getTeams(weekendId);
    setTeam1(teams.team1);
    setTeam2(teams.team2);
    setGenerated(teams.generated);
  }

  useEffect(() => {
    async function load() {
      try {
        const saturday = getNextSaturday();
        const wk = await api.createWeekend(saturday);
        setWeekend(wk);
        await loadTeams(wk.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleGenerate() {
    if (!weekend) return;
    setError('');
    setSuccess('');
    setGenerating(true);

    try {
      const teams = await api.generateTeams(weekend.id);
      setTeam1(teams.team1);
      setTeam2(teams.team2);
      setGenerated(true);
      setSuccess('Teams generated! Balanced by skill level.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p className="page-subtitle">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">Teams</h2>
      <p className="page-subtitle">
        {weekend?.title} — {availableCount} players available
      </p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="actions-bar">
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating || availableCount < 4}
        >
          {generating ? 'Generating...' : generated ? 'Regenerate Teams' : 'Generate Teams'}
        </button>
        <Link to="/weekend" className="btn btn-secondary">Update Availability</Link>
      </div>

      {availableCount < 4 && (
        <div className="error">
          Need at least 4 available players.{' '}
          <Link to="/weekend" style={{ textDecoration: 'underline' }}>Mark who's playing</Link> first.
        </div>
      )}

      {generated ? (
        <div className="teams-container">
          <TeamPanel title="Team A" teamClass="team-a" players={team1} />
          <TeamPanel title="Team B" teamClass="team-b" players={team2} />
        </div>
      ) : (
        <div className="card empty-state">
          <p>No teams generated yet. Mark availability and hit Generate Teams.</p>
          <Link to="/weekend" className="btn btn-primary">Go to Availability</Link>
        </div>
      )}
    </div>
  );
}
