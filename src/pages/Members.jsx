import { useEffect, useState } from 'react';
import { api, formatRole, skillStars } from '../api';

const ROLES = [
  { value: 'all-rounder', label: 'All-rounder' },
  { value: 'batsman', label: 'Batsman' },
  { value: 'bowler', label: 'Bowler' },
  { value: 'wicket-keeper', label: 'Wicket Keeper' },
];

const emptyForm = { name: '', phone: '', role: 'all-rounder', skill: 3 };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadMembers() {
    const data = await api.getMembers();
    setMembers(data);
  }

  useEffect(() => {
    loadMembers().finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await api.updateMember(editingId, form);
        setSuccess('Member updated!');
      } else {
        await api.addMember(form);
        setSuccess('Member added!');
      }
      resetForm();
      await loadMembers();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(member) {
    setEditingId(member.id);
    setForm({
      name: member.name,
      phone: member.phone || '',
      role: member.role,
      skill: member.skill,
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id, name) {
    if (!confirm(`Remove ${name} from the group?`)) return;
    try {
      await api.deleteMember(id);
      if (editingId === id) resetForm();
      await loadMembers();
      setSuccess('Member removed.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p className="page-subtitle">Loading members...</p>;

  return (
    <div>
      <h2 className="page-title">Members</h2>
      <p className="page-subtitle">
        Add everyone in your cricket group. Supports 50+ members.
      </p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="card">
        <h2>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (optional)</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="skill">Skill Level (1–5)</label>
              <select
                id="skill"
                value={form.skill}
                onChange={(e) => setForm({ ...form, skill: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} — {skillStars(n)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="actions-bar">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Add Member'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>All Members ({members.length})</h2>
        {members.length === 0 ? (
          <div className="empty-state">
            <p>No members yet. Add the first player above!</p>
          </div>
        ) : (
          <div className="member-list">
            {members.map((m) => (
              <div key={m.id} className="member-row">
                <div className="member-info">
                  <div className="member-name">{m.name}</div>
                  <div className="member-meta">
                    {formatRole(m.role)} · Skill {m.skill} {skillStars(m.skill)}
                    {m.phone && ` · ${m.phone}`}
                  </div>
                </div>
                <div className="member-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => startEdit(m)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(m.id, m.name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
