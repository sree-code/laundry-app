import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDb, queryAll, queryOne, run, batch } from './db.js';
import { balanceTeams, ROLES } from './teamGenerator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function createApp({ serveStatic = false } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(async (_req, _res, next) => {
    try {
      await initDb();
      next();
    } catch (err) {
      next(err);
    }
  });

  if (serveStatic) {
    const distPath = join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/members', async (_req, res, next) => {
    try {
      const members = await queryAll(
        'SELECT * FROM members ORDER BY name COLLATE NOCASE'
      );
      res.json(members);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/members', async (req, res, next) => {
    try {
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
      await run(
        'INSERT INTO members (id, name, phone, role, skill) VALUES (?, ?, ?, ?, ?)',
        [id, name.trim(), phone?.trim() || null, role, skillNum]
      );

      const member = await queryOne('SELECT * FROM members WHERE id = ?', [id]);
      res.status(201).json(member);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/members/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const existing = await queryOne('SELECT * FROM members WHERE id = ?', [id]);
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

      await run(
        'UPDATE members SET name = ?, phone = ?, role = ?, skill = ? WHERE id = ?',
        [updates.name, updates.phone, updates.role, updates.skill, id]
      );

      res.json(await queryOne('SELECT * FROM members WHERE id = ?', [id]));
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/members/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await run('DELETE FROM members WHERE id = ?', [id]);
      if (result.changes === 0) return res.status(404).json({ error: 'Member not found' });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/weekends', async (_req, res, next) => {
    try {
      const weekends = await queryAll('SELECT * FROM weekends ORDER BY date DESC');
      res.json(weekends);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/weekends', async (req, res, next) => {
    try {
      const { date, title } = req.body;
      if (!date) return res.status(400).json({ error: 'Date is required' });

      const existing = await queryOne('SELECT * FROM weekends WHERE date = ?', [date]);
      if (existing) return res.json(existing);

      const id = uuidv4();
      const weekendTitle = title || formatWeekendTitle(date);
      await run('INSERT INTO weekends (id, date, title) VALUES (?, ?, ?)', [
        id,
        date,
        weekendTitle,
      ]);

      res.status(201).json(await queryOne('SELECT * FROM weekends WHERE id = ?', [id]));
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/weekends/:id', async (req, res, next) => {
    try {
      const weekend = await queryOne('SELECT * FROM weekends WHERE id = ?', [req.params.id]);
      if (!weekend) return res.status(404).json({ error: 'Weekend not found' });
      res.json(weekend);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/weekends/:id/availability', async (req, res, next) => {
    try {
      const { id } = req.params;
      const weekend = await queryOne('SELECT * FROM weekends WHERE id = ?', [id]);
      if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

      const available = await queryAll(
        `SELECT m.* FROM members m
         INNER JOIN availability a ON a.member_id = m.id
         WHERE a.weekend_id = ?
         ORDER BY m.name COLLATE NOCASE`,
        [id]
      );

      res.json(available);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/weekends/:id/availability', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { memberId, available } = req.body;

      const weekend = await queryOne('SELECT * FROM weekends WHERE id = ?', [id]);
      if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

      const member = await queryOne('SELECT * FROM members WHERE id = ?', [memberId]);
      if (!member) return res.status(404).json({ error: 'Member not found' });

      if (available) {
        await run(
          'INSERT OR IGNORE INTO availability (weekend_id, member_id) VALUES (?, ?)',
          [id, memberId]
        );
      } else {
        await run(
          'DELETE FROM availability WHERE weekend_id = ? AND member_id = ?',
          [id, memberId]
        );
        await run(
          'DELETE FROM team_assignments WHERE weekend_id = ? AND member_id = ?',
          [id, memberId]
        );
      }

      const availableMembers = await queryAll(
        `SELECT m.* FROM members m
         INNER JOIN availability a ON a.member_id = m.id
         WHERE a.weekend_id = ?`,
        [id]
      );

      res.json(availableMembers);
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/weekends/:id/teams', async (req, res, next) => {
    try {
      const { id } = req.params;
      const weekend = await queryOne('SELECT * FROM weekends WHERE id = ?', [id]);
      if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

      const assignments = await queryAll(
        `SELECT m.*, ta.team_number FROM members m
         INNER JOIN team_assignments ta ON ta.member_id = m.id
         WHERE ta.weekend_id = ?
         ORDER BY ta.team_number, m.skill DESC, m.name COLLATE NOCASE`,
        [id]
      );

      const team1 = assignments.filter((m) => m.team_number === 1);
      const team2 = assignments.filter((m) => m.team_number === 2);

      res.json({ team1, team2, generated: assignments.length > 0 });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/weekends/:id/generate-teams', async (req, res, next) => {
    try {
      const { id } = req.params;
      const weekend = await queryOne('SELECT * FROM weekends WHERE id = ?', [id]);
      if (!weekend) return res.status(404).json({ error: 'Weekend not found' });

      const available = await queryAll(
        `SELECT m.* FROM members m
         INNER JOIN availability a ON a.member_id = m.id
         WHERE a.weekend_id = ?`,
        [id]
      );

      let team1, team2;
      try {
        ({ team1, team2 } = balanceTeams(available));
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

      const statements = [
        { sql: 'DELETE FROM team_assignments WHERE weekend_id = ?', args: [id] },
        ...team1.map((m) => ({
          sql: 'INSERT INTO team_assignments (weekend_id, member_id, team_number) VALUES (?, ?, ?)',
          args: [id, m.id, 1],
        })),
        ...team2.map((m) => ({
          sql: 'INSERT INTO team_assignments (weekend_id, member_id, team_number) VALUES (?, ?, ?)',
          args: [id, m.id, 2],
        })),
      ];

      await batch(statements);

      res.json({
        team1: team1.map((m) => ({ ...m, team_number: 1 })),
        team2: team2.map((m) => ({ ...m, team_number: 2 })),
        generated: true,
      });
    } catch (err) {
      next(err);
    }
  });

  if (serveStatic) {
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(join(__dirname, '..', 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('App not built. Run npm run build first.');
      });
    });
  }

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}

function formatWeekendTitle(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
