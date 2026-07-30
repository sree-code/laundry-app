import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (url && authToken) return createClient({ url, authToken });
  const dataDir = join(__dirname, '..', 'data');
  mkdirSync(dataDir, { recursive: true });
  return createClient({ url: `file:${join(dataDir, 'cricket.db')}` });
}

const client = getClient();
let initialized = false;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    player_role TEXT NOT NULL DEFAULT 'all-rounder',
    skill INTEGER NOT NULL DEFAULT 3 CHECK(skill >= 1 AND skill <= 5),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS holidays (
    date TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    day_type TEXT NOT NULL CHECK(day_type IN ('saturday', 'sunday', 'holiday')),
    venue TEXT NOT NULL DEFAULT 'Main Ground',
    start_time TEXT DEFAULT '06:00',
    ground_blocked_by TEXT,
    notes TEXT,
    teams_generated INTEGER NOT NULL DEFAULT 0,
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (ground_blocked_by) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS match_availability (
    match_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (match_id, user_id),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS team_assignments (
    match_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    team_number INTEGER NOT NULL CHECK(team_number IN (1, 2)),
    PRIMARY KEY (match_id, user_id),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
`;

export async function initDb() {
  if (initialized) return;
  await client.executeMultiple(SCHEMA);
  initialized = true;
}

function rowToObject(row) {
  const obj = {};
  for (const [key, value] of Object.entries(row)) obj[key] = value;
  return obj;
}

export async function queryAll(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows.map(rowToObject);
}

export async function queryOne(sql, args = []) {
  const result = await client.execute({ sql, args });
  return result.rows[0] ? rowToObject(result.rows[0]) : null;
}

export async function run(sql, args = []) {
  const result = await client.execute({ sql, args });
  return { changes: result.rowsAffected };
}

export async function batch(statements) {
  await client.batch(statements, 'write');
}

export default client;
