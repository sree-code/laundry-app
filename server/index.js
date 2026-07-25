import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';
import { balanceTeams, ROLES } from './teamGenerator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/members', (_req, res) => {
  const members = db
    .prepare('SELECT * FROM members ORDER BY name COLLATE NOCASE')
    .all();
  res.json(members);
});

app.post('/api/members', (req, res) => {
  const { name, phone, role = 'all-rounder', skill = 3 } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const skillNum = Number(skill);
  if (!Number.isInteger(skillNum) || skillNum < 1 || skillNum > 5) {
    return res.status(400).json({ error: 'Skill must be between 1 and 5' });
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO members (id, name, phone, role, skill) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name.trim(), phone?.trim() || null, role, skillNum);

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  res.status(201).json(member);
});

app.patch('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Member not found' });

  const { name, phone, role, skill } = req.body;
  const updates = {
    name: name?.trim() ?? existing.name,
    phone: phone !== undefined ? (phone?.trim() || null) : existing.phone,
    role: role ?? existing.role,
    skill: skill !== undefined ? Number(skill) : existing.skill,
  };

  if (!updates.name) return res.status(400).json({ error: 'Name is required' });
  if (!ROLES.includes(updates.role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (!Number.isInteger(updates.skill) || updates.skill < 1 || updates.skill > 5) {
    return res.status(400).json({ error: 'Skill must be between 1 and 5' });
  }

  db.prepare(
    'UPDATE members SET name = ?, phone = ?, role = ?, skill = ? WHERE id = ?'
  ).run(updates.name, updates.phone, updates.role, updates.skill, id);

  res.json(db.prepare('SELECT * FROM members WHERE id = ?').get(id));
});

app.delete('/api/members/:id', (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);
  if (result.changes === 0) return res.status(404).json({ error: 'Member not found' });
  res.json({ ok: true });
});

app.get('/api/weekends', (_req, res) => {
  const weekends = db
    .prepare('SELECT * FROM weekends ORDER BY date DESC')
    .all();
  res.json(weekends);
});

app.post('/api/weekends', (req, res) => {
  const { date, title } = req.body;
  if (!date) return res.status(400).json({ error: 'Date is required' });

  const existing = db.prepare('SELECT * FROM weekends WHERE date = ?').get(date);
  if (existing) return res.json(existing);

  const id = uuidv4();
  const weekendTitle = title || formatWeekendTitle(date);
  db.prepare('INSERT INTO weekends (id, date, title) VALUES (?, ?, ?)').run(
    id,
    date,
    weekendTitle
  );

  res.status(201).json(db.prepare('SELECT * FROM weekends WHERE id = ?').get(id));
});

app.get('/api/weekends/:id', (req, res) => {
  const weekend = db.prepare('SELECT * FROM weekends WHERE id = ?').get(req.params.id);
  if (!weekend) return res.status(404).json({ error: 'Weekend not found' });
  res.json(weekend);
});

app.get('/api/weekends/:id/availability', (req, res) => {
  const { id } = req.params;
  const weekend = db.prepare('SELECT * FROM weekends WHERE id = ?').get(id);
  if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

  const available = db
    .prepare(
      `SELECT m.* FROM members m
       INNER JOIN availability a ON a.member_id = m.id
       WHERE a.weekend_id = ?
       ORDER BY m.name COLLATE NOCASE`
    )
    .all(id);

  res.json(available);
});

app.post('/api/weekends/:id/availability', (req, res) => {
  const { id } = req.params;
  const { memberId, available } = req.body;

  const weekend = db.prepare('SELECT * FROM weekends WHERE id = ?').get(id);
  if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  if (available) {
    db.prepare(
      'INSERT OR IGNORE INTO availability (weekend_id, member_id) VALUES (?, ?)'
    ).run(id, memberId);
  } else {
    db.prepare(
      'DELETE FROM availability WHERE weekend_id = ? AND member_id = ?'
    ).run(id, memberId);
    db.prepare(
      'DELETE FROM team_assignments WHERE weekend_id = ? AND member_id = ?'
    ).run(id, memberId);
  }

  const availableMembers = db
    .prepare(
      `SELECT m.* FROM members m
       INNER JOIN availability a ON a.member_id = m.id
       WHERE a.weekend_id = ?`
    )
    .all(id);

  res.json(availableMembers);
});

app.get('/api/weekends/:id/teams', (req, res) => {
  const { id } = req.params;
  const weekend = db.prepare('SELECT * FROM weekends WHERE id = ?').get(id);
  if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

  const assignments = db
    .prepare(
      `SELECT m.*, ta.team_number FROM members m
       INNER JOIN team_assignments ta ON ta.member_id = m.id
       WHERE ta.weekend_id = ?
       ORDER BY ta.team_number, m.skill DESC, m.name COLLATE NOCASE`
    )
    .all(id);

  const team1 = assignments.filter((m) => m.team_number === 1);
  const team2 = assignments.filter((m) => m.team_number === 2);

  res.json({ team1, team2, generated: assignments.length > 0 });
});

app.post('/api/weekends/:id/generate-teams', (req, res) => {
  const { id } = req.params;
  const weekend = db.prepare('SELECT * FROM weekends WHERE id = ?').get(id);
  if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

  const available = db
    .prepare(
      `SELECT m.* FROM members m
       INNER JOIN availability a ON a.member_id = m.id
       WHERE a.weekend_id = ?`
    )
    .all(id);

  let team1, team2;
  try {
    ({ team1, team2 } = balanceTeams(available));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const clear = db.prepare('DELETE FROM team_assignments WHERE weekend_id = ?');
  const insert = db.prepare(
    'INSERT INTO team_assignments (weekend_id, member_id, team_number) VALUES (?, ?, ?)'
  );

  const transaction = db.transaction(() => {
    clear.run(id);
    team1.forEach((m) => insert.run(id, m.id, 1));
    team2.forEach((m) => insert.run(id, m.id, 2));
  });
  transaction();

  res.json({
    team1: team1.map((m) => ({ ...m, team_number: 1 })),
    team2: team2.map((m) => ({ ...m, team_number: 2 })),
    generated: true,
  });
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('App not built. Run npm run build first.');
  });
});

function formatWeekendTitle(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Weekend Cricket server running on http://0.0.0.0:${PORT}`);
});
