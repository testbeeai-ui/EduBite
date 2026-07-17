import { FUNBRAIN_DURATION_SEC, RDM_PER_DOSE_CORRECT } from "@/data/config";
import { HABIT_DEFINITIONS } from "@/data/habits";
import { GAMES } from "@/data/brain-gym/registry";
import { pickWithSeed } from "@/lib/brain-gym/utils/shuffle";
import type {
  BrainGymProgress,
  Difficulty,
  GameId,
  GameStats,
} from "@/lib/brain-gym/types";
import {
  createDefaultPuzzleProgress,
  type PuzzleAttempt,
  type PuzzleProgress,
} from "@/lib/puzzles/types";
import { createInitialState } from "@/lib/gamification";
import type {
  DoseState,
  FunBrainState,
  GameState,
  HabitState,
  Notification,
  DayCriteria,
} from "@/lib/types";
import { todayKey } from "@/lib/utils";

function createDefaultBrainGymProgress(): BrainGymProgress {
  const today = todayKey();
  return {
    version: 1,
    soundEnabled: true,
    darkMode: true,
    streak: 0,
    lastPlayDate: null,
    playDates: [],
    totalPlays: 0,
    totalWins: 0,
    games: {},
    badges: [],
    dailyChallenge: {
      date: today,
      gameId: pickWithSeed(
        GAMES.map((g) => g.id),
        Number(today.replace(/-/g, "")),
      ),
      completed: false,
      score: 0,
    },
    recentGameIds: [],
    rdmEarned: 0,
  };
}

export const MAX_PROGRESS_PAYLOAD_BYTES = 512 * 1024;

const GAME_IDS = new Set(GAMES.map((g) => g.id));
const DIFFICULTIES = new Set<Difficulty>(["easy", "medium", "hard"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown, max = 200): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, max);
}

export function assertPayloadSize(raw: string): void {
  if (raw.length > MAX_PROGRESS_PAYLOAD_BYTES) {
    throw new Error("Payload too large");
  }
}

function normalizeHabits(raw: unknown): HabitState[] {
  const list = Array.isArray(raw) ? raw : [];
  return HABIT_DEFINITIONS.map((def) => {
    const existing = list.find(
      (item) => isRecord(item) && item.id === def.id,
    ) as Record<string, unknown> | undefined;
    return {
      ...def,
      done: asBoolean(existing?.done, false),
    };
  });
}

function normalizeDose(raw: unknown): DoseState {
  if (!isRecord(raw)) {
    return {
      index: 0,
      locked: false,
      correct: 0,
      completed: false,
      index11: 0,
      locked11: false,
      correct11: 0,
      completed11: false,
      index12: 0,
      locked12: false,
      correct12: 0,
      completed12: false,
      currentClass: "11",
      answers11: [],
      answers12: [],
    };
  }

  const currentClass = (raw.currentClass === "11" || raw.currentClass === "12") ? raw.currentClass : "11";

  const index11 = Math.max(0, Math.floor(asNumber(raw.index11 ?? raw.index, 0)));
  const locked11 = asBoolean(raw.locked11 ?? raw.locked, false);
  const correct11 = Math.max(0, Math.floor(asNumber(raw.correct11 ?? raw.correct, 0)));
  const completed11 = asBoolean(raw.completed11 ?? raw.completed, false);

  const index12 = Math.max(0, Math.floor(asNumber(raw.index12, 0)));
  const locked12 = asBoolean(raw.locked12, false);
  const correct12 = Math.max(0, Math.floor(asNumber(raw.correct12, 0)));
  const completed12 = asBoolean(raw.completed12, false);

  const isActive11 = currentClass === "11";
  const index = isActive11 ? index11 : index12;
  const locked = isActive11 ? locked11 : locked12;
  const correct = isActive11 ? correct11 : correct12;
  const completed = isActive11 ? completed11 : completed12;

  const answers11 = Array.isArray(raw.answers11) ? raw.answers11.map(Number) : [];
  const answers12 = Array.isArray(raw.answers12) ? raw.answers12.map(Number) : [];

  return {
    index,
    locked,
    correct,
    completed,
    index11,
    locked11,
    correct11,
    completed11,
    index12,
    locked12,
    correct12,
    completed12,
    currentClass,
    answers11,
    answers12,
  };
}

function normalizeFunbrain(raw: unknown): FunBrainState {
  if (!isRecord(raw)) {
    return {
      running: false,
      timeLeft: FUNBRAIN_DURATION_SEC,
      score: 0,
      combo: 0,
      highScore: 0,
      currentQuestionIndex: 0,
      finished: false,
      completed: false,
    };
  }
  const completed =
    asBoolean(raw.completed, false) || asBoolean(raw.finished, false);
  const score = Math.max(0, Math.floor(asNumber(raw.score, 0)));
  return {
    running: false,
    timeLeft: FUNBRAIN_DURATION_SEC,
    score: completed ? score : 0,
    combo: 0,
    highScore: Math.max(0, Math.floor(asNumber(raw.highScore, 0))),
    currentQuestionIndex: 0,
    finished: completed,
    completed,
  };
}

function normalizeNotifications(raw: unknown): Notification[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item) => ({
      id: asString(item.id, "note"),
      icon: asString(item.icon, "✨"),
      text: asString(item.text, ""),
    }))
    .filter((n) => n.text.length > 0)
    .slice(0, 5);
}

function normalizeHistory(raw: unknown): DayCriteria[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item) => ({
      routine: asBoolean(item.routine, false),
      pledges: asBoolean(item.pledges, false),
      habits: asBoolean(item.habits, false),
      gyan: asBoolean(item.gyan, false),
    }))
    .slice(-27);
}

/**
 * Merge unknown/legacy blobs into a safe GameState.
 * Malformed rows (e.g. `{ score: 1 }`) recover via defaults.
 */
export function normalizeGameState(raw: unknown): GameState {
  const base = createInitialState();
  if (!isRecord(raw)) return base;

  const looksLikeLegacyScoreOnly =
    Object.keys(raw).length <= 2 && "score" in raw && !("rdm" in raw);
  if (looksLikeLegacyScoreOnly) return base;
  const dose = normalizeDose(raw.dose);
  const defaultDoseCredit = dose.completed ? dose.correct * RDM_PER_DOSE_CORRECT : 0;
  let funbrain = normalizeFunbrain(raw.funbrain);
  const funbrainRdmCredited = Math.max(
    0,
    Math.floor(asNumber(raw.funbrainRdmCredited, 0)),
  );
  // Already credited today ⇒ treat as done (legacy blobs had no `completed` flag).
  if (funbrainRdmCredited > 0 && !funbrain.completed) {
    funbrain = {
      ...funbrain,
      completed: true,
      finished: true,
    };
  }

  return {
    rdm: Math.max(0, Math.floor(asNumber(raw.rdm, 0))),
    streak: Math.max(0, Math.floor(asNumber(raw.streak, 0))),
    signedIn: asBoolean(raw.signedIn, true),
    pledgeAM: asBoolean(raw.pledgeAM, false),
    pledgePM: asBoolean(raw.pledgePM, false),
    gyanTimeMs: Math.max(0, Math.floor(asNumber(raw.gyanTimeMs, 0))),
    gyanOpenId:
      typeof raw.gyanOpenId === "string" || raw.gyanOpenId === null
        ? (raw.gyanOpenId as string | null)
        : null,
    habits: normalizeHabits(raw.habits),
    dose,
    funbrain,
    gyanUnlockedIds: asStringArray(raw.gyanUnlockedIds, 50),
    notifications: normalizeNotifications(raw.notifications),
    history: normalizeHistory(raw.history),
    joinedDate: asString(raw.joinedDate, todayKey()),
    lastActiveDate: asString(raw.lastActiveDate, todayKey()),
    doseRdmCredited: Math.max(
      0,
      Math.floor(asNumber(raw.doseRdmCredited, defaultDoseCredit)),
    ),
    funbrainRdmCredited,
  };
}

function normalizeGameStats(raw: unknown): GameStats {
  if (!isRecord(raw)) {
    return {
      plays: 0,
      wins: 0,
      bestScore: 0,
      recentScores: [],
      favorite: false,
    };
  }
  const recent = Array.isArray(raw.recentScores) ? raw.recentScores : [];
  return {
    plays: Math.max(0, Math.floor(asNumber(raw.plays, 0))),
    wins: Math.max(0, Math.floor(asNumber(raw.wins, 0))),
    bestScore: Math.max(0, Math.floor(asNumber(raw.bestScore, 0))),
    bestTimeMs:
      typeof raw.bestTimeMs === "number" && Number.isFinite(raw.bestTimeMs)
        ? Math.max(0, raw.bestTimeMs)
        : undefined,
    lastPlayed:
      typeof raw.lastPlayed === "string" ? raw.lastPlayed : undefined,
    favorite: asBoolean(raw.favorite, false),
    recentScores: recent
      .filter(isRecord)
      .map((entry) => ({
        score: Math.max(0, Math.floor(asNumber(entry.score, 0))),
        bestTimeMs:
          typeof entry.bestTimeMs === "number" &&
          Number.isFinite(entry.bestTimeMs)
            ? Math.max(0, entry.bestTimeMs)
            : undefined,
        difficulty: DIFFICULTIES.has(entry.difficulty as Difficulty)
          ? (entry.difficulty as Difficulty)
          : ("easy" as Difficulty),
        at: asString(entry.at, new Date().toISOString()),
        won: asBoolean(entry.won, false),
      }))
      .slice(0, 10),
  };
}

function asGameId(value: unknown): GameId | null {
  return typeof value === "string" && GAME_IDS.has(value as GameId)
    ? (value as GameId)
    : null;
}

export function normalizeBrainGymProgress(raw: unknown): BrainGymProgress {
  const base = createDefaultBrainGymProgress();
  if (!isRecord(raw)) return base;

  const gamesRaw = isRecord(raw.games) ? raw.games : {};
  const games: Partial<Record<GameId, GameStats>> = {};
  for (const [key, value] of Object.entries(gamesRaw)) {
    const id = asGameId(key);
    if (id) games[id] = normalizeGameStats(value);
  }

  let dailyChallenge = base.dailyChallenge;
  if (isRecord(raw.dailyChallenge)) {
    const gameId = asGameId(raw.dailyChallenge.gameId);
    if (gameId) {
      dailyChallenge = {
        date: asString(raw.dailyChallenge.date, todayKey()),
        gameId,
        completed: asBoolean(raw.dailyChallenge.completed, false),
        score: Math.max(0, Math.floor(asNumber(raw.dailyChallenge.score, 0))),
      };
    }
  }

  const recentGameIds = asStringArray(raw.recentGameIds, 8)
    .map(asGameId)
    .filter((id): id is GameId => id !== null);

  return {
    version: 1,
    soundEnabled: asBoolean(raw.soundEnabled, true),
    darkMode: asBoolean(raw.darkMode, true),
    streak: Math.max(0, Math.floor(asNumber(raw.streak, 0))),
    lastPlayDate:
      typeof raw.lastPlayDate === "string" || raw.lastPlayDate === null
        ? (raw.lastPlayDate as string | null)
        : null,
    playDates: asStringArray(raw.playDates, 60),
    totalPlays: Math.max(0, Math.floor(asNumber(raw.totalPlays, 0))),
    totalWins: Math.max(0, Math.floor(asNumber(raw.totalWins, 0))),
    games,
    badges: asStringArray(raw.badges, 50),
    dailyChallenge,
    recentGameIds,
    rdmEarned: Math.max(0, Math.floor(asNumber(raw.rdmEarned, 0))),
  };
}

export function normalizePuzzleProgress(raw: unknown): PuzzleProgress {
  const base = createDefaultPuzzleProgress();
  if (!isRecord(raw)) return base;

  const attemptsRaw = isRecord(raw.attempts) ? raw.attempts : {};
  const attempts: Record<string, PuzzleAttempt> = {};
  for (const [dateKey, value] of Object.entries(attemptsRaw)) {
    if (!isRecord(value)) continue;
    attempts[dateKey] = {
      puzzleId: asString(value.puzzleId, ""),
      dateKey: asString(value.dateKey, dateKey),
      note: asString(value.note, "").slice(0, 8000),
      submittedAt: asString(value.submittedAt, new Date().toISOString()),
    };
  }

  return {
    version: 1,
    attempts,
    streak: Math.max(0, Math.floor(asNumber(raw.streak, 0))),
    lastAttemptDate:
      typeof raw.lastAttemptDate === "string" || raw.lastAttemptDate === null
        ? (raw.lastAttemptDate as string | null)
        : null,
  };
}

export function parseJsonObject(raw: string): unknown {
  assertPayloadSize(raw);
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed) && !Array.isArray(parsed) && parsed !== null) {
    throw new Error("Invalid JSON payload");
  }
  return parsed;
}
