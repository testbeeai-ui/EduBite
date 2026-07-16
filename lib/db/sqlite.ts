import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  normalizeBrainGymProgress,
  normalizeGameState,
  normalizePuzzleProgress,
} from "@/lib/db/normalize";
import type { BrainGymProgress } from "@/lib/brain-gym/types";
import type { PuzzleProgress } from "@/lib/puzzles/types";
import type { GameState } from "@/lib/types";

/**
 * Load node:sqlite via createRequire so webpack does not try to bundle it
 * (bundling can leave broken chunk refs like ./331.js in API routes).
 */
const require = createRequire(__filename);
const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (
    path: string,
    options?: { timeout?: number },
  ) => {
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: unknown[]): unknown;
      get(...params: unknown[]): unknown;
      all(...params: unknown[]): unknown[];
    };
    close(): void;
  };
};

type DatabaseSyncInstance = InstanceType<typeof DatabaseSync>;

const globalForDb = globalThis as unknown as {
  __edubiteSqlite?: DatabaseSyncInstance;
  __edubiteRepairBackedUp?: boolean;
};

/** Outside the repo so Next's file watcher never sees SQLite WAL writes. */
function resolveDataDir(): string {
  const root =
    process.env.LOCALAPPDATA ||
    process.env.XDG_DATA_HOME ||
    path.join(os.homedir(), ".local", "share");
  return path.join(root, "edubite");
}

export const DATA_DIR = resolveDataDir();
export const DB_PATH = path.join(DATA_DIR, "edubite.sqlite");
const LEGACY_DB_PATH = path.join(process.cwd(), "data", "edubite.sqlite");

type Migration = {
  id: number;
  name: string;
  sql: string;
};

const MIGRATIONS: Migration[] = [
  {
    id: 1,
    name: "initial_progress_tables",
    sql: `
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
    `,
  },
  {
    id: 2,
    name: "reward_claims",
    sql: `
      CREATE TABLE IF NOT EXISTS reward_claims (
        user_id TEXT NOT NULL,
        claim_id TEXT NOT NULL,
        rdm_awarded INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, claim_id)
      );
      CREATE INDEX IF NOT EXISTS idx_reward_claims_user
        ON reward_claims(user_id);
    `,
  },
  {
    id: 3,
    name: "content_questions",
    sql: `
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
    `,
  },
];

function applyPragmas(db: DatabaseSyncInstance): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 8000;
    PRAGMA foreign_keys = ON;
    PRAGMA synchronous = NORMAL;
  `);
}

function runMigrations(db: DatabaseSyncInstance): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set(
    (
      db
        .prepare("SELECT id FROM schema_migrations")
        .all() as { id: number }[]
    ).map((row) => row.id),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;
    db.exec("BEGIN");
    try {
      db.exec(migration.sql);
      db.prepare(
        "INSERT INTO schema_migrations (id, name) VALUES (?, ?)",
      ).run(migration.id, migration.name);
      db.exec("COMMIT");
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // ignore
      }
      throw err;
    }
  }
}

function migrateLegacyDb(): void {
  if (!fs.existsSync(LEGACY_DB_PATH) || fs.existsSync(DB_PATH)) return;
  try {
    fs.copyFileSync(LEGACY_DB_PATH, DB_PATH);
    for (const suffix of ["-wal", "-shm"]) {
      const legacy = `${LEGACY_DB_PATH}${suffix}`;
      if (fs.existsSync(legacy)) {
        fs.copyFileSync(legacy, `${DB_PATH}${suffix}`);
      }
    }
  } catch {
    // Keep going with a fresh DB if migrate fails
  }
}

/** One-time file copy before opening — caller should invoke when repairing. */
export function backupDatabase(): string | null {
  if (!fs.existsSync(DB_PATH)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const dest = path.join(DATA_DIR, `edubite.backup.${stamp}.sqlite`);
  fs.copyFileSync(DB_PATH, dest);
  return dest;
}

function backupBeforeRepair(): void {
  if (globalForDb.__edubiteRepairBackedUp) return;
  try {
    backupDatabase();
  } catch {
    // Repair should still proceed if the backup cannot be created.
  }
  globalForDb.__edubiteRepairBackedUp = true;
}

function openDb(): DatabaseSyncInstance {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  migrateLegacyDb();
  const db = new DatabaseSync(DB_PATH);
  applyPragmas(db);
  runMigrations(db);
  return db;
}

/** Survives Next HMR (module re-eval) via globalThis. */
export function getDb(): DatabaseSyncInstance {
  if (globalForDb.__edubiteSqlite) return globalForDb.__edubiteSqlite;
  const db = openDb();
  globalForDb.__edubiteSqlite = db;
  return db;
}

export function withDbRetry<T>(fn: (db: DatabaseSyncInstance) => T): T {
  try {
    return fn(getDb());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      /busy|locked|closed|database/i.test(message) ||
      message.includes("SQLITE")
    ) {
      try {
        globalForDb.__edubiteSqlite?.close();
      } catch {
        // ignore
      }
      globalForDb.__edubiteSqlite = undefined;
      return fn(getDb());
    }
    throw err;
  }
}

export function withTransaction<T>(
  fn: (db: DatabaseSyncInstance) => T,
): T {
  return withDbRetry((db) => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn(db);
      db.exec("COMMIT");
      return result;
    } catch (err) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // ignore
      }
      throw err;
    }
  });
}

export function checkDbHealth(): {
  ok: boolean;
  path: string;
  integrity: string;
  tables: string[];
} {
  return withDbRetry((db) => {
    const integrity =
      (db.prepare("PRAGMA integrity_check").get() as { integrity_check: string })
        ?.integrity_check ?? "unknown";
    const tables = (
      db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
        )
        .all() as { name: string }[]
    ).map((row) => row.name);
    return {
      ok: integrity === "ok",
      path: DB_PATH,
      integrity,
      tables,
    };
  });
}

function upsertPayload(
  db: DatabaseSyncInstance,
  table: "game_state" | "brain_gym_progress" | "puzzle_progress",
  userId: string,
  payload: string,
): void {
  db.prepare(
    `INSERT INTO ${table} (user_id, payload, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET
       payload = excluded.payload,
       updated_at = datetime('now')`,
  ).run(userId, payload);
}

function getPayload(
  db: DatabaseSyncInstance,
  table: "game_state" | "brain_gym_progress" | "puzzle_progress",
  userId: string,
): string | null {
  const row = db
    .prepare(`SELECT payload FROM ${table} WHERE user_id = ?`)
    .get(userId) as { payload: string } | undefined;
  return row?.payload ?? null;
}

export function getGameStatePayload(userId: string): string | null {
  return withDbRetry((db) => getPayload(db, "game_state", userId));
}

export function upsertGameStatePayload(userId: string, payload: string): void {
  withDbRetry((db) => upsertPayload(db, "game_state", userId, payload));
}

export function getBrainGymPayload(userId: string): string | null {
  return withDbRetry((db) => getPayload(db, "brain_gym_progress", userId));
}

export function upsertBrainGymPayload(userId: string, payload: string): void {
  withDbRetry((db) => upsertPayload(db, "brain_gym_progress", userId, payload));
}

export function getPuzzlePayload(userId: string): string | null {
  return withDbRetry((db) => getPayload(db, "puzzle_progress", userId));
}

export function upsertPuzzlePayload(userId: string, payload: string): void {
  withDbRetry((db) => upsertPayload(db, "puzzle_progress", userId, payload));
}

export function readNormalizedGameState(userId: string): GameState | null {
  const raw = getGameStatePayload(userId);
  if (!raw) return null;
  try {
    const normalized = normalizeGameState(JSON.parse(raw) as unknown);
    // Repair malformed/legacy rows on read
    if (JSON.stringify(normalized) !== raw) backupBeforeRepair();
    upsertGameStatePayload(userId, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function writeNormalizedGameState(
  userId: string,
  state: GameState,
): GameState {
  const incoming = normalizeGameState(state);
  const existingRaw = getGameStatePayload(userId);
  let normalized = incoming;
  if (existingRaw) {
    try {
      const existing = normalizeGameState(JSON.parse(existingRaw) as unknown);
      // Never let a stale client blob claw back RDM awarded by Brain Gym claims.
      normalized = {
        ...incoming,
        rdm: Math.max(incoming.rdm, existing.rdm),
        funbrain: {
          ...incoming.funbrain,
          highScore: Math.max(
            incoming.funbrain.highScore,
            existing.funbrain.highScore,
          ),
        },
        doseRdmCredited: Math.max(
          incoming.doseRdmCredited,
          existing.doseRdmCredited,
        ),
        funbrainRdmCredited: Math.max(
          incoming.funbrainRdmCredited,
          existing.funbrainRdmCredited,
        ),
      };
    } catch {
      normalized = incoming;
    }
  }
  upsertGameStatePayload(userId, JSON.stringify(normalized));
  return normalized;
}

export function readNormalizedBrainGym(
  userId: string,
): BrainGymProgress | null {
  const raw = getBrainGymPayload(userId);
  if (!raw) return null;
  try {
    const normalized = normalizeBrainGymProgress(JSON.parse(raw) as unknown);
    if (JSON.stringify(normalized) !== raw) backupBeforeRepair();
    upsertBrainGymPayload(userId, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function writeNormalizedBrainGym(
  userId: string,
  progress: BrainGymProgress,
): BrainGymProgress {
  const normalized = normalizeBrainGymProgress(progress);
  upsertBrainGymPayload(userId, JSON.stringify(normalized));
  return normalized;
}

export function readNormalizedPuzzleProgress(
  userId: string,
): PuzzleProgress | null {
  const raw = getPuzzlePayload(userId);
  if (!raw) return null;
  try {
    const normalized = normalizePuzzleProgress(JSON.parse(raw) as unknown);
    if (JSON.stringify(normalized) !== raw) backupBeforeRepair();
    upsertPuzzlePayload(userId, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

export function writeNormalizedPuzzleProgress(
  userId: string,
  progress: PuzzleProgress,
): PuzzleProgress {
  const normalized = normalizePuzzleProgress(progress);
  upsertPuzzlePayload(userId, JSON.stringify(normalized));
  return normalized;
}

export type BrainGymRewardClaim = {
  claimId: string;
  rdmDelta: number;
};

function normalizeGamePayload(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    return normalizeGameState(JSON.parse(raw) as unknown);
  } catch {
    return normalizeGameState({ signedIn: true });
  }
}

/**
 * Atomically persist Brain Gym progress and optionally apply an idempotent
 * RDM award to game_state. Retries with the same claimId do not double-award.
 */
export function applyBrainGymSession(
  userId: string,
  progress: BrainGymProgress,
  reward?: BrainGymRewardClaim | null,
): { progress: BrainGymProgress; gameState: GameState | null; awarded: number } {
  return withTransaction((db) => {
    const normalizedProgress = normalizeBrainGymProgress(progress);
    upsertPayload(
      db,
      "brain_gym_progress",
      userId,
      JSON.stringify(normalizedProgress),
    );

    if (
      !reward ||
      typeof reward.claimId !== "string" ||
      !reward.claimId ||
      !Number.isFinite(reward.rdmDelta) ||
      reward.rdmDelta <= 0
    ) {
      const rawGame = getPayload(db, "game_state", userId);
      const gameState = normalizeGamePayload(rawGame);
      return { progress: normalizedProgress, gameState, awarded: 0 };
    }

    const existing = db
      .prepare(
        "SELECT rdm_awarded FROM reward_claims WHERE user_id = ? AND claim_id = ?",
      )
      .get(userId, reward.claimId) as { rdm_awarded: number } | undefined;

    const rawGame = getPayload(db, "game_state", userId);
    let gameState = normalizeGamePayload(rawGame) ?? normalizeGameState({ signedIn: true });

    if (existing) {
      return {
        progress: normalizedProgress,
        gameState,
        awarded: existing.rdm_awarded,
      };
    }

    const awarded = Math.round(reward.rdmDelta);
    gameState = {
      ...gameState,
      rdm: gameState.rdm + awarded,
      signedIn: true,
    };
    upsertPayload(db, "game_state", userId, JSON.stringify(gameState));
    db.prepare(
      `INSERT INTO reward_claims (user_id, claim_id, rdm_awarded)
       VALUES (?, ?, ?)`,
    ).run(userId, reward.claimId, awarded);

    return { progress: normalizedProgress, gameState, awarded };
  });
}
