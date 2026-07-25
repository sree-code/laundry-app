const API = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  getMembers: () => request('/members'),
  addMember: (body) => request('/members', { method: 'POST', body: JSON.stringify(body) }),
  updateMember: (id, body) =>
    request(`/members/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

  getWeekends: () => request('/weekends'),
  createWeekend: (date, title) =>
    request('/weekends', { method: 'POST', body: JSON.stringify({ date, title }) }),

  getAvailability: (weekendId) => request(`/weekends/${weekendId}/availability`),
  setAvailability: (weekendId, memberId, available) =>
    request(`/weekends/${weekendId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ memberId, available }),
    }),

  getTeams: (weekendId) => request(`/weekends/${weekendId}/teams`),
  generateTeams: (weekendId) =>
    request(`/weekends/${weekendId}/generate-teams`, { method: 'POST' }),
};

export function getNextSaturday() {
  const today = new Date();
  const day = today.getDay();
  const daysUntilSaturday = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSaturday);
  return saturday.toISOString().split('T')[0];
}

export function formatRole(role) {
  const labels = {
    'wicket-keeper': 'WK',
    batsman: 'Batsman',
    bowler: 'Bowler',
    'all-rounder': 'All-rounder',
  };
  return labels[role] || role;
}

export function skillStars(skill) {
  return '★'.repeat(skill) + '☆'.repeat(5 - skill);
}
