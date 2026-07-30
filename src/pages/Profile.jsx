import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { skillStars } from '../api';

const ROLES = [
  { value: 'all-rounder', label: 'All-rounder' },
  { value: 'batsman', label: 'Batsman' },
  { value: 'bowler', label: 'Bowler' },
  { value: 'wicket-keeper', label: 'Wicket Keeper' },
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    player_role: user?.player_role || 'all-rounder',
    skill: user?.skill || 3,
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const updated = await api.updateProfile({ ...form, skill: Number(form.skill) });
      setUser(updated);
      setMsg('Profile updated!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>@{user?.username}</p>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="panel panel-narrow">
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label>Playing Role
            <select value={form.player_role} onChange={(e) => setForm({ ...form, player_role: e.target.value })}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>
          <label>Skill Level
            <select value={form.skill} onChange={(e) => setForm({ ...form, skill: e.target.value })}>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} {skillStars(n)}</option>)}
            </select>
          </label>
          <button type="submit" className="btn-primary btn-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
