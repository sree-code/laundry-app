import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    return createClient({ url, authToken });
  }

  const dataDir = join(__dirname, '..', 'data');
  mkdirSync(dataDir, { recursive: true });
  return createClient({ url: `file:${join(dataDir, 'cricket.db')}` });
}

const client = getClient();
let initialized = false;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'all-rounder',
    skill INTEGER NOT NULL DEFAULT 3 CHECK(skill >= 1 AND skill <= 5),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS weekends (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    title TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS availability (
    weekend_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    PRIMARY KEY (weekend_id, member_id),
    FOREIGN KEY (weekend_id) REFERENCES weekends(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS team_assignments (
    weekend_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    team_number INTEGER NOT NULL CHECK(team_number IN (1, 2)),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (weekend_id, member_id),
    FOREIGN KEY (weekend_id) REFERENCES weekends(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
  CREATE INDEX IF NOT EXISTS idx_weekends_date ON weekends(date);
`;

export async function initDb() {
  if (initialized) return;
  await client.executeMultiple(SCHEMA);
  initialized = true;
}

function rowToObject(row) {
  const obj = {};
  for (const [key, value] of Object.entries(row)) {
    obj[key] = value;
  }
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
