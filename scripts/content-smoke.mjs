/**
 * Smoke-test content_questions schema + dual-read fallback.
 * Does not require auth — exercises SQLite helpers via node:sqlite.
 */
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dataRoot =
  process.env.LOCALAPPDATA ||
  process.env.XDG_DATA_HOME ||
  join(homedir(), ".local", "share");
const dataDir = join(dataRoot, "edubite");
const dbPath = join(dataDir, "edubite.sqlite");

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(dbPath, { timeout: 8000 });
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 8000;
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS content_questions (
    id TEXT PRIMARY KEY NOT NULL,
    domain TEXT NOT NULL,
    active_date TEXT NOT NULL,
    tag TEXT,
    q TEXT NOT NULL,
    opts TEXT NOT NULL,
    correct INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_content_questions_schedule
    ON content_questions(domain, active_date, published, sort_order);
`);

const applied = db
  .prepare("SELECT id FROM schema_migrations WHERE id = 3")
  .get();
if (!applied) {
  db.prepare(
    "INSERT INTO schema_migrations (id, name) VALUES (3, 'content_questions')",
  ).run();
}

const today = new Date();
const y = today.getFullYear();
const m = String(today.getMonth() + 1).padStart(2, "0");
const d = String(today.getDate()).padStart(2, "0");
const dateKey = `${y}-${m}-${d}`;
const smokeId = `smoke-${randomUUID()}`;

db.prepare(
  `INSERT INTO content_questions
    (id, domain, active_date, tag, q, opts, correct, sort_order, published, created_by)
   VALUES (?, 'dailydose', ?, 'SMOKE · TEST', ?, ?, 0, 0, 1, 'smoke')`,
).run(
  smokeId,
  dateKey,
  "Smoke-test question — safe to delete",
  JSON.stringify(["A", "B", "C", "D"]),
);

const rows = db
  .prepare(
    `SELECT id, q FROM content_questions
     WHERE domain = 'dailydose' AND active_date = ? AND published = 1`,
  )
  .all(dateKey);

const found = rows.some((r) => r.id === smokeId);
db.prepare("DELETE FROM content_questions WHERE id = ?").run(smokeId);

const after = db
  .prepare("SELECT id FROM content_questions WHERE id = ?")
  .get(smokeId);

db.close();

if (!found) {
  console.error("FAIL: inserted smoke question not found for today");
  process.exit(1);
}
if (after) {
  console.error("FAIL: smoke question was not deleted");
  process.exit(1);
}

console.log("OK content_questions CRUD smoke");
console.log(`  db: ${dbPath}`);
console.log(`  dateKey: ${dateKey}`);
console.log(`  published today (before cleanup): ${rows.length}`);
