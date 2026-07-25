import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'cricket.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
`);

export default db;
