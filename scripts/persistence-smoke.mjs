import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dataRoot =
  process.env.LOCALAPPDATA ||
  process.env.XDG_DATA_HOME ||
  join(homedir(), ".local", "share");
const dbPath = join(dataRoot, "edubite", "edubite.sqlite");

if (!existsSync(dbPath)) {
  console.log("SQLite database does not exist yet; start the app and sign in first.");
  process.exit(0);
}

const db = new DatabaseSync(dbPath, { timeout: 8000 });
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 8000;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS game_state (
    user_id TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS brain_gym_progress (
    user_id TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS puzzle_progress (
    user_id TEXT PRIMARY KEY NOT NULL,
    payload TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS reward_claims (
    user_id TEXT NOT NULL,
    claim_id TEXT NOT NULL,
    rdm_awarded INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, claim_id)
  );
  CREATE INDEX IF NOT EXISTS idx_reward_claims_user
    ON reward_claims(user_id);
  INSERT OR IGNORE INTO schema_migrations (id, name)
    VALUES (1, 'initial_progress_tables');
  INSERT OR IGNORE INTO schema_migrations (id, name)
    VALUES (2, 'reward_claims');
`);
const requiredTables = new Set([
  "brain_gym_progress",
  "game_state",
  "puzzle_progress",
  "reward_claims",
  "schema_migrations",
]);

try {
  const integrity = db.prepare("PRAGMA integrity_check").get().integrity_check;
  if (integrity !== "ok") {
    throw new Error(`integrity_check failed: ${integrity}`);
  }

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
    .all()
    .map((row) => row.name);
  for (const table of requiredTables) {
    if (!tables.includes(table)) {
      throw new Error(`missing table: ${table}`);
    }
  }

  for (const table of ["game_state", "brain_gym_progress", "puzzle_progress"]) {
    const rows = db.prepare(`SELECT payload FROM ${table}`).all();
    for (const row of rows) {
      const parsed = JSON.parse(row.payload);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error(`${table} contains a non-object JSON payload`);
      }
    }
    console.log(`${table}: ${rows.length} valid JSON payload(s)`);
  }

  console.log("SQLite persistence smoke test passed.");
} finally {
  db.close();
}
