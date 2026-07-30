import { useEffect, useState } from 'react';
import { api, formatRole, skillStars } from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const players = users.filter((u) => u.role === 'user');
  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div className="page">
      <div className="page-header">
        <h1>All Players</h1>
        <p>{players.length} registered players · Share login link for new members</p>
      </div>

      <div className="panel">
        <h2>Players ({players.length})</h2>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Username</th><th>Phone</th><th>Role</th><th>Skill</th><th>Joined</th></tr>
              </thead>
              <tbody>
                {players.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>@{u.username}</td>
                    <td>{u.phone || '—'}</td>
                    <td>{formatRole(u.player_role)}</td>
                    <td>{skillStars(u.skill)}</td>
                    <td>{u.created_at?.split(' ')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel panel-dim">
        <h2>Admins ({admins.length})</h2>
        <div className="player-grid">
          {admins.map((u) => (
            <div key={u.id} className="player-chip admin-chip">
              <strong>{u.name}</strong>
              <small>@{u.username}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
