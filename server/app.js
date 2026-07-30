import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDb, queryAll, queryOne, run, batch } from './db.js';
import {
  authMiddleware,
  adminOnly,
  seedAdmin,
  signToken,
  registerUser,
  loginUser,
} from './auth.js';
import { balanceTeams } from './teamGenerator.js';
import { formatMatchTitle, isValidMatchDay, ROLES } from './matchUtils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...safe } = u;
  return safe;
}

export function createApp({ serveStatic = false } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use(async (_req, _res, next) => {
    try {
      await initDb();
      await seedAdmin();
      next();
    } catch (err) {
      next(err);
    }
  });

  if (serveStatic) {
    app.use(express.static(join(__dirname, '..', 'dist')));
  }

  // ── Auth ──────────────────────────────────────────────
  app.post('/api/auth/register', async (req, res, next) => {
    try {
      const { username, password, name, phone, player_role, skill } = req.body;
      if (!username?.trim() || !password || !name?.trim()) {
        return res.status(400).json({ error: 'Username, password and name are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const user = await registerUser({
        username: username.trim().toLowerCase(),
        password,
        name: name.trim(),
        phone,
        player_role,
        skill: Number(skill) || 3,
      });
      const token = signToken(user);
      res.status(201).json({ token, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      const user = await loginUser(username.trim().toLowerCase(), password);
      const token = signToken(user);
      res.json({ token, user: publicUser(user) });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', authMiddleware, async (req, res, next) => {
    try {
      const user = await queryOne(
        'SELECT id, username, name, phone, role, player_role, skill, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/auth/profile', authMiddleware, async (req, res, next) => {
    try {
      const { name, phone, player_role, skill } = req.body;
      const existing = await queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!existing) return res.status(404).json({ error: 'User not found' });

      const updates = {
        name: name?.trim() ?? existing.name,
        phone: phone !== undefined ? (phone?.trim() || null) : existing.phone,
        player_role: player_role ?? existing.player_role,
        skill: skill !== undefined ? Number(skill) : existing.skill,
      };
      if (!ROLES.includes(updates.player_role)) {
        return res.status(400).json({ error: 'Invalid player role' });
      }
      await run(
        'UPDATE users SET name = ?, phone = ?, player_role = ?, skill = ? WHERE id = ?',
        [updates.name, updates.phone, updates.player_role, updates.skill, req.user.id]
      );
      res.json(await queryOne(
        'SELECT id, username, name, phone, role, player_role, skill, created_at FROM users WHERE id = ?',
        [req.user.id]
      ));
    } catch (err) {
      next(err);
    }
  });

  // ── Admin: Users ──────────────────────────────────────
  app.get('/api/admin/users', authMiddleware, adminOnly, async (_req, res, next) => {
    try {
      const users = await queryAll(
        `SELECT id, username, name, phone, role, player_role, skill, created_at
         FROM users ORDER BY role DESC, name COLLATE NOCASE`
      );
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // ── Admin: Holidays ───────────────────────────────────
  app.get('/api/holidays', async (_req, res, next) => {
    try {
      res.json(await queryAll('SELECT * FROM holidays ORDER BY date'));
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/holidays', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      const { date, name } = req.body;
      if (!date || !name?.trim()) {
        return res.status(400).json({ error: 'Date and holiday name required' });
      }
      await run('INSERT OR REPLACE INTO holidays (date, name) VALUES (?, ?)', [date, name.trim()]);
      res.status(201).json({ date, name: name.trim() });
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/holidays/:date', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      await run('DELETE FROM holidays WHERE date = ?', [req.params.date]);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // ── Matches ───────────────────────────────────────────
  app.get('/api/matches', authMiddleware, async (_req, res, next) => {
    try {
      const matches = await queryAll(
        `SELECT m.*, u.name as blocker_name, c.name as created_by_name
         FROM matches m
         LEFT JOIN users u ON u.id = m.ground_blocked_by
         LEFT JOIN users c ON c.id = m.created_by
         ORDER BY m.date ASC`
      );
      res.json(matches);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/matches', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      const { date, venue, start_time, ground_blocked_by, notes } = req.body;
      if (!date) return res.status(400).json({ error: 'Match date is required' });

      const holidays = await queryAll('SELECT * FROM holidays');
      const check = isValidMatchDay(date, holidays);
      if (!check.valid) {
        return res.status(400).json({
          error: 'Matches can only be scheduled on Saturday, Sunday, or registered holidays',
        });
      }

      const id = uuidv4();
      const title = formatMatchTitle(date, check.dayType);
      await run(
        `INSERT INTO matches (id, date, title, day_type, venue, start_time, ground_blocked_by, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          date,
          title,
          check.dayType,
          venue || 'Main Ground',
          start_time || '06:00',
          ground_blocked_by || null,
          notes || null,
          req.user.id,
        ]
      );

      const match = await queryOne(
        `SELECT m.*, u.name as blocker_name FROM matches m
         LEFT JOIN users u ON u.id = m.ground_blocked_by WHERE m.id = ?`,
        [id]
      );
      res.status(201).json(match);
    } catch (err) {
      next(err);
    }
  });

  app.patch('/api/admin/matches/:id', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { venue, start_time, ground_blocked_by, notes } = req.body;
      const match = await queryOne('SELECT * FROM matches WHERE id = ?', [id]);
      if (!match) return res.status(404).json({ error: 'Match not found' });

      await run(
        `UPDATE matches SET venue = ?, start_time = ?, ground_blocked_by = ?, notes = ? WHERE id = ?`,
        [
          venue ?? match.venue,
          start_time ?? match.start_time,
          ground_blocked_by !== undefined ? ground_blocked_by : match.ground_blocked_by,
          notes !== undefined ? notes : match.notes,
          id,
        ]
      );

      res.json(await queryOne(
        `SELECT m.*, u.name as blocker_name FROM matches m
         LEFT JOIN users u ON u.id = m.ground_blocked_by WHERE m.id = ?`,
        [id]
      ));
    } catch (err) {
      next(err);
    }
  });

  app.delete('/api/admin/matches/:id', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      await run('DELETE FROM matches WHERE id = ?', [req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // ── Availability ──────────────────────────────────────
  app.get('/api/matches/:id/availability', authMiddleware, async (req, res, next) => {
    try {
      const available = await queryAll(
        `SELECT u.id, u.name, u.phone, u.player_role, u.skill, ma.is_available
         FROM match_availability ma
         JOIN users u ON u.id = ma.user_id
         WHERE ma.match_id = ? AND ma.is_available = 1
         ORDER BY u.name COLLATE NOCASE`,
        [req.params.id]
      );
      res.json(available);
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/matches/:id/availability', authMiddleware, async (req, res, next) => {
    try {
      const { id } = req.params;
      const { available } = req.body;
      const match = await queryOne('SELECT * FROM matches WHERE id = ?', [id]);
      if (!match) return res.status(404).json({ error: 'Match not found' });

      if (available) {
        await run(
          'INSERT OR REPLACE INTO match_availability (match_id, user_id, is_available) VALUES (?, ?, 1)',
          [id, req.user.id]
        );
      } else {
        await run(
          'DELETE FROM match_availability WHERE match_id = ? AND user_id = ?',
          [id, req.user.id]
        );
        await run(
          'DELETE FROM team_assignments WHERE match_id = ? AND user_id = ?',
          [id, req.user.id]
        );
      }

      const count = await queryOne(
        'SELECT COUNT(*) as count FROM match_availability WHERE match_id = ? AND is_available = 1',
        [id]
      );
      res.json({ available: !!available, totalAvailable: count?.count || 0 });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/matches/:id/my-status', authMiddleware, async (req, res, next) => {
    try {
      const row = await queryOne(
        'SELECT is_available FROM match_availability WHERE match_id = ? AND user_id = ?',
        [req.params.id, req.user.id]
      );
      res.json({ available: row?.is_available === 1 });
    } catch (err) {
      next(err);
    }
  });

  // ── Teams ─────────────────────────────────────────────
  app.get('/api/matches/:id/teams', authMiddleware, async (req, res, next) => {
    try {
      const assignments = await queryAll(
        `SELECT u.id, u.name, u.phone, u.player_role, u.skill, ta.team_number
         FROM team_assignments ta
         JOIN users u ON u.id = ta.user_id
         WHERE ta.match_id = ?
         ORDER BY ta.team_number, u.skill DESC, u.name COLLATE NOCASE`,
        [req.params.id]
      );
      res.json({
        team1: assignments.filter((p) => p.team_number === 1),
        team2: assignments.filter((p) => p.team_number === 2),
        generated: assignments.length > 0,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/admin/matches/:id/generate-teams', authMiddleware, adminOnly, async (req, res, next) => {
    try {
      const { id } = req.params;
      const match = await queryOne('SELECT * FROM matches WHERE id = ?', [id]);
      if (!match) return res.status(404).json({ error: 'Match not found' });

      const available = await queryAll(
        `SELECT u.id, u.name, u.phone, u.player_role as role, u.skill
         FROM match_availability ma
         JOIN users u ON u.id = ma.user_id
         WHERE ma.match_id = ? AND ma.is_available = 1`,
        [id]
      );

      let team1, team2;
      try {
        ({ team1, team2 } = balanceTeams(available));
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

      const statements = [
        { sql: 'DELETE FROM team_assignments WHERE match_id = ?', args: [id] },
        ...team1.map((m) => ({
          sql: 'INSERT INTO team_assignments (match_id, user_id, team_number) VALUES (?, ?, 1)',
          args: [id, m.id],
        })),
        ...team2.map((m) => ({
          sql: 'INSERT INTO team_assignments (match_id, user_id, team_number) VALUES (?, ?, 2)',
          args: [id, m.id],
        })),
        { sql: 'UPDATE matches SET teams_generated = 1 WHERE id = ?', args: [id] },
      ];
      await batch(statements);

      res.json({
        team1: team1.map((p) => ({ ...p, team_number: 1 })),
        team2: team2.map((p) => ({ ...p, team_number: 2 })),
        generated: true,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  if (serveStatic) {
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(join(__dirname, '..', 'dist', 'index.html'), (err) => {
        if (err) res.status(404).send('Build the app first: npm run build');
      });
    });
  }

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  });

  return app;
}
