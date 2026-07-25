import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getNextSaturday } from '../api';

export default function Home() {
  const [stats, setStats] = useState({ members: 0, available: 0, teamsReady: false });
  const [weekendTitle, setWeekendTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const members = await api.getMembers();
        const saturday = getNextSaturday();
        const weekend = await api.createWeekend(saturday);
        setWeekendTitle(weekend.title);

        const available = await api.getAvailability(weekend.id);
        const teams = await api.getTeams(weekend.id);

        setStats({
          members: members.length,
          available: available.length,
          teamsReady: teams.generated,
        });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="page-subtitle">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">Welcome to Weekend Cricket</h2>
      <p className="page-subtitle">
        {weekendTitle ? `Next match: ${weekendTitle}` : 'Manage your weekend cricket group'}
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="number">{stats.members}</div>
          <div className="label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.available}</div>
          <div className="label">Available This Weekend</div>
        </div>
        <div className="stat-card">
          <div className="number">{stats.teamsReady ? '✓' : '—'}</div>
          <div className="label">Teams Generated</div>
        </div>
      </div>

      <div className="card">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h3>Add members</h3>
            <p>Everyone registers with name, role, and skill level (1–5).</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h3>Mark availability</h3>
            <p>Each weekend, players tap to say they're coming.</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h3>Generate teams</h3>
            <p>One tap splits everyone into two balanced teams.</p>
          </div>
        </div>
      </div>

      <div className="actions-bar" style={{ marginTop: '1.5rem' }}>
        <Link to="/members" className="btn btn-primary">Add Members</Link>
        <Link to="/weekend" className="btn btn-secondary">Mark Availability</Link>
        <Link to="/teams" className="btn btn-secondary">View Teams</Link>
      </div>
    </div>
  );
}
