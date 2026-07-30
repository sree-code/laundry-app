const API = '/api';

function getToken() {
  return localStorage.getItem('wc_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('wc_token', token);
  else localStorage.removeItem('wc_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
  headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (body) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) =>
    request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  getMatches: () => request('/matches'),
  getHolidays: () => request('/holidays'),
  getAvailability: (matchId) => request(`/matches/${matchId}/availability`),
  getMyStatus: (matchId) => request(`/matches/${matchId}/my-status`),
  setAvailability: (matchId, available) =>
    request(`/matches/${matchId}/availability`, {
      method: 'POST',
      body: JSON.stringify({ available }),
    }),
  getTeams: (matchId) => request(`/matches/${matchId}/teams`),

  adminUsers: () => request('/admin/users'),
  createMatch: (body) =>
    request('/admin/matches', { method: 'POST', body: JSON.stringify(body) }),
  updateMatch: (id, body) =>
    request(`/admin/matches/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMatch: (id) => request(`/admin/matches/${id}`, { method: 'DELETE' }),
  generateTeams: (matchId) =>
    request(`/admin/matches/${matchId}/generate-teams`, { method: 'POST' }),
  addHoliday: (date, name) =>
    request('/admin/holidays', { method: 'POST', body: JSON.stringify({ date, name }) }),
  deleteHoliday: (date) => request(`/admin/holidays/${date}`, { method: 'DELETE' }),
};

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
  const n = Number(skill) || 0;
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export function dayBadge(type) {
  const map = {
    saturday: { label: 'Saturday', cls: 'badge-sat' },
    sunday: { label: 'Sunday', cls: 'badge-sun' },
    holiday: { label: 'Holiday', cls: 'badge-hol' },
  };
  return map[type] || { label: type, cls: 'badge-default' };
}
