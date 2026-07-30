import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, run } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'weekend-cricket-dev-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'cricketadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'WkndCricket@Admin2026';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please login again.' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}

export async function seedAdmin() {
  const existing = await queryOne('SELECT id FROM users WHERE username = ?', [ADMIN_USERNAME]);
  if (existing) return;

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await run(
    `INSERT INTO users (id, username, password_hash, name, role, player_role, skill)
     VALUES (?, ?, ?, ?, 'admin', 'all-rounder', 5)`,
    [uuidv4(), ADMIN_USERNAME, hash, 'Ground Admin']
  );
}

export async function registerUser({ username, password, name, phone, player_role, skill }) {
  const taken = await queryOne('SELECT id FROM users WHERE username = ?', [username]);
  if (taken) throw new Error('Username already taken');

  const hash = await bcrypt.hash(password, 10);
  const id = uuidv4();
  await run(
    `INSERT INTO users (id, username, password_hash, name, phone, role, player_role, skill)
     VALUES (?, ?, ?, ?, ?, 'user', ?, ?)`,
    [id, username, hash, name, phone || null, player_role || 'all-rounder', skill || 3]
  );
  return queryOne(
    'SELECT id, username, name, phone, role, player_role, skill, created_at FROM users WHERE id = ?',
    [id]
  );
}

export async function loginUser(username, password) {
  const user = await queryOne('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) throw new Error('Invalid username or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid username or password');

  const { password_hash, ...safe } = user;
  return safe;
}

export { ADMIN_USERNAME, ADMIN_PASSWORD };
