import { useEffect, useState } from 'react';
import { api, dayBadge } from '../../api';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [form, setForm] = useState({
    date: '', venue: 'Main Ground', start_time: '06:00', ground_blocked_by: '', notes: '',
  });
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const [m, u, h] = await Promise.all([api.getMatches(), api.adminUsers(), api.getHolidays()]);
    setMatches(m);
    setUsers(u);
    setHolidays(h);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function scheduleMatch(e) {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      await api.createMatch({
        ...form,
        ground_blocked_by: form.ground_blocked_by || null,
      });
      setMsg('Match scheduled!');
      setForm({ date: '', venue: 'Main Ground', start_time: '06:00', ground_blocked_by: '', notes: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addHoliday(e) {
    e.preventDefault();
    try {
      await api.addHoliday(holidayForm.date, holidayForm.name);
      setHolidayForm({ date: '', name: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeMatch(id) {
    if (!confirm('Delete this match?')) return;
    await api.deleteMatch(id);
    load();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Schedule Matches</h1>
        <p>Only Saturday, Sunday & registered holidays</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="admin-grid">
        <div className="panel">
          <h2>New Match</h2>
          <form onSubmit={scheduleMatch} className="auth-form">
            <label>Date *<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></label>
            <label>Venue<input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></label>
            <label>Start Time<input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></label>
            <label>Ground Blocked By
              <select value={form.ground_blocked_by} onChange={(e) => setForm({ ...form, ground_blocked_by: e.target.value })}>
                <option value="">— Not assigned —</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </label>
            <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional match notes" /></label>
            <button type="submit" className="btn-primary btn-full">Schedule Match</button>
          </form>
        </div>

        <div className="panel">
          <h2>Add Holiday</h2>
          <p className="muted small">Register a holiday to allow matches on weekdays</p>
          <form onSubmit={addHoliday} className="auth-form">
            <label>Date<input type="date" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} required /></label>
            <label>Holiday Name<input value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} placeholder="e.g. Independence Day" required /></label>
            <button type="submit" className="btn-secondary btn-full">Add Holiday</button>
          </form>
          {holidays.length > 0 && (
            <div className="holiday-list">
              {holidays.map((h) => (
                <div key={h.date} className="holiday-row">
                  <span>{h.date}</span><strong>{h.name}</strong>
                  <button className="btn-danger-sm" onClick={() => api.deleteHoliday(h.date).then(load)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>All Matches ({matches.length})</h2>
        {loading ? <p className="muted">Loading...</p> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Day</th><th>Venue</th><th>Time</th><th>Ground Blocker</th><th>Teams</th><th></th></tr>
              </thead>
              <tbody>
                {matches.map((m) => {
                  const b = dayBadge(m.day_type);
                  return (
                    <tr key={m.id}>
                      <td>{m.date}</td>
                      <td><span className={`day-badge ${b.cls}`}>{b.label}</span></td>
                      <td>{m.venue}</td>
                      <td>{m.start_time}</td>
                      <td>{m.blocker_name || '—'}</td>
                      <td>{m.teams_generated ? '✓' : '—'}</td>
                      <td><button className="btn-danger-sm" onClick={() => removeMatch(m.id)}>Delete</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
