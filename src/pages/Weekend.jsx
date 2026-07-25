import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatRole, getNextSaturday, skillStars } from '../api';

export default function Weekend() {
  const [weekend, setWeekend] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableIds, setAvailableIds] = useState(new Set());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const saturday = getNextSaturday();
        const wk = await api.createWeekend(saturday);
        setWeekend(wk);

        const allMembers = await api.getMembers();
        setMembers(allMembers);

        const available = await api.getAvailability(wk.id);
        setAvailableIds(new Set(available.map((m) => m.id)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function toggleAvailability(memberId) {
    if (!weekend) return;
    const isAvailable = availableIds.has(memberId);
    setSaving(memberId);

    try {
      const updated = await api.setAvailability(weekend.id, memberId, !isAvailable);
      setAvailableIds(new Set(updated.map((m) => m.id)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(null);
    }
  }

  if (loading) return <p className="page-subtitle">Loading...</p>;

  return (
    <div>
      <h2 className="page-title">This Weekend</h2>
      <p className="page-subtitle">
        {weekend?.title} — tap your name if you're playing this weekend.
      </p>

      {error && <div className="error">{error}</div>}

      {members.length === 0 ? (
        <div className="card empty-state">
          <p>No members yet. Add players first.</p>
          <Link to="/members" className="btn btn-primary">Add Members</Link>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>
              Who's playing? ({availableIds.size} of {members.length} available)
            </h2>
            <div className="availability-grid">
              {members.map((m) => {
                const isAvailable = availableIds.has(m.id);
                return (
                  <div
                    key={m.id}
                    className={`availability-card ${isAvailable ? 'available' : ''}`}
                    onClick={() => !saving && toggleAvailability(m.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && toggleAvailability(m.id)}
                  >
                    <div>
                      <div className="member-name">{m.name}</div>
                      <div className="member-meta">
                        {formatRole(m.role)} · {skillStars(m.skill)}
                      </div>
                    </div>
                    <div className="check">{isAvailable ? '✓' : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {availableIds.size >= 4 && (
            <div className="actions-bar">
              <Link to="/teams" className="btn btn-primary">
                Generate Teams ({availableIds.size} players ready)
              </Link>
            </div>
          )}

          {availableIds.size > 0 && availableIds.size < 4 && (
            <div className="error">
              Need at least 4 available players to generate two teams.
            </div>
          )}
        </>
      )}
    </div>
  );
}
