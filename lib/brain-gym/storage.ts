import { GAMES } from "@/data/brain-gym/registry";
import type {
  BrainGymProgress,
  Difficulty,
  GameId,
  GameSessionResult,
  GameStats,
} from "@/lib/brain-gym/types";
import { normalizeBrainGymProgress } from "@/lib/db/normalize";
import { pickWithSeed } from "@/lib/brain-gym/utils/shuffle";
import { todayKey, addDaysToKey } from "@/lib/utils";

export const BRAIN_GYM_KEY = "edubite.braingym.v1";

function scopedKey(userId: string): string {
  return `${BRAIN_GYM_KEY}:user:${userId}`;
}

function emptyStats(): GameStats {
  return {
    plays: 0,
    wins: 0,
    bestScore: 0,
    recentScores: [],
    favorite: false,
  };
}

export function createDefaultProgress(): BrainGymProgress {
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

function ensureDaily(p: BrainGymProgress): BrainGymProgress {
  const today = todayKey();
  if (p.dailyChallenge?.date === today) return p;
  return {
    ...p,
    dailyChallenge: {
      date: today,
      gameId: pickWithSeed(
        GAMES.map((g) => g.id),
        Number(today.replace(/-/g, "")),
      ),
      completed: false,
      score: 0,
    },
  };
}

/** Scoped keys only — never promote unscoped shared keys across accounts. */
function readScopedLegacyLocal(userId: string): BrainGymProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const scoped = localStorage.getItem(scopedKey(userId));
    if (scoped) {
      return normalizeBrainGymProgress(JSON.parse(scoped) as unknown);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function clearScopedLegacyLocal(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(scopedKey(userId));
}

function normalizeProgress(parsed: BrainGymProgress): BrainGymProgress {
  const merged = ensureDaily(normalizeBrainGymProgress(parsed));
  const validIds = new Set(GAMES.map((g) => g.id));
  if (merged.dailyChallenge && !validIds.has(merged.dailyChallenge.gameId)) {
    return ensureDaily(createDefaultProgress());
  }
  return merged;
}

export type BrainGymReward = {
  claimId: string;
  rdmDelta: number;
};

/**
 * Guests: ephemeral defaults.
 * Signed-in: Supabase via /api/progress/brain-gym (with one-time SQLite migrate).
 */
export async function loadBrainGym(
  userId: string | null,
): Promise<BrainGymProgress> {
  if (!userId) return createDefaultProgress();

  try {
    const res = await fetch("/api/progress/brain-gym", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) return createDefaultProgress();
    if (!res.ok) {
      console.warn(`brain-gym load failed: ${res.status}`);
      const legacy = readScopedLegacyLocal(userId);
      return legacy ? normalizeProgress(legacy) : createDefaultProgress();
    }

    const data = (await res.json()) as { progress: BrainGymProgress | null };
    if (data.progress) return normalizeProgress(data.progress);

    const legacy = readScopedLegacyLocal(userId);
    if (legacy) {
      const normalized = normalizeProgress(legacy);
      const save = await saveBrainGym(userId, normalized);
      if (save.ok) clearScopedLegacyLocal(userId);
      return normalized;
    }
    return createDefaultProgress();
  } catch (err) {
    console.warn(
      "loadBrainGym failed: check network/server status.",
      err instanceof Error ? err.message : err,
    );
    const legacy = readScopedLegacyLocal(userId);
    return legacy ? normalizeProgress(legacy) : createDefaultProgress();
  }
}

export type BrainGymSaveResult =
  | { ok: true; awarded: number; gameRdm: number | null }
  | { ok: false; error: string };

export async function saveBrainGym(
  userId: string | null,
  progress: BrainGymProgress,
  reward?: BrainGymReward | null,
): Promise<BrainGymSaveResult> {
  if (!userId) return { ok: false, error: "Not signed in" };

  try {
    const res = await fetch("/api/progress/brain-gym", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress: normalizeProgress(progress),
        reward: reward ?? undefined,
      }),
    });
    if (!res.ok) {
      const error = `brain-gym save failed: ${res.status}`;
      console.warn(error);
      return { ok: false, error };
    }
    const data = (await res.json()) as {
      awarded?: number;
      gameState?: { rdm?: number } | null;
    };
    return {
      ok: true,
      awarded: typeof data.awarded === "number" ? data.awarded : 0,
      gameRdm:
        typeof data.gameState?.rdm === "number" ? data.gameState.rdm : null,
    };
  } catch (err) {
    const error =
      err instanceof Error ? err.message : "brain-gym save network error";
    console.warn("saveBrainGym failed:", error);
    return { ok: false, error };
  }
}

function computeStreak(playDates: string[], lastPlay: string | null): number {
  if (!lastPlay || playDates.length === 0) return 0;
  const sorted = [...new Set(playDates)].sort().reverse();
  const today = todayKey();
  const yesterday = addDaysToKey(today, -1);
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let expect = sorted[0] === today ? today : yesterday;
  for (const d of sorted) {
    if (d === expect) {
      streak++;
      expect = addDaysToKey(expect, -1);
    } else if (d > expect) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function applySessionResult(
  progress: BrainGymProgress,
  gameId: GameId,
  result: GameSessionResult,
  isDaily: boolean,
): { progress: BrainGymProgress; newBadges: string[]; rdmGain: number } {
  const today = todayKey();
  const prev = progress.games[gameId] ?? emptyStats();
  const entry = {
    score: result.score,
    bestTimeMs: result.timeMs,
    difficulty: result.difficulty,
    at: new Date().toISOString(),
    won: result.won,
  };

  const bestScore = Math.max(prev.bestScore, result.score);
  const bestTimeMs =
    result.won && result.timeMs > 0
      ? prev.bestTimeMs
        ? Math.min(prev.bestTimeMs, result.timeMs)
        : result.timeMs
      : prev.bestTimeMs;

  const playDates = [...new Set([...progress.playDates, today])].slice(-60);
  const lastPlayDate = today;
  const streak = computeStreak(playDates, lastPlayDate);

  let dailyChallenge = progress.dailyChallenge;
  if (isDaily && dailyChallenge?.date === today) {
    dailyChallenge = {
      ...dailyChallenge,
      completed: dailyChallenge.completed || result.won || result.score > 0,
      score: Math.max(dailyChallenge.score, result.score),
    };
  }

  const next: BrainGymProgress = {
    ...progress,
    totalPlays: progress.totalPlays + 1,
    totalWins: progress.totalWins + (result.won ? 1 : 0),
    playDates,
    lastPlayDate,
    streak,
    dailyChallenge,
    recentGameIds: [
      gameId,
      ...progress.recentGameIds.filter((id) => id !== gameId),
    ].slice(0, 8),
    games: {
      ...progress.games,
      [gameId]: {
        ...prev,
        plays: prev.plays + 1,
        wins: prev.wins + (result.won ? 1 : 0),
        bestScore,
        bestTimeMs,
        lastPlayed: today,
        recentScores: [entry, ...prev.recentScores].slice(0, 10),
      },
    },
  };

  // RDM: base + win bonus + daily bonus
  let rdmGain = Math.max(5, Math.floor(result.score / 20));
  if (result.won) rdmGain += 15;
  if (isDaily && result.won) rdmGain += 25;
  rdmGain = Math.min(120, rdmGain);
  next.rdmEarned = progress.rdmEarned + rdmGain;

  const newBadges = evaluateBadges(next);
  next.badges = [...new Set([...progress.badges, ...newBadges])];

  return { progress: next, newBadges: newBadges.filter((b) => !progress.badges.includes(b)), rdmGain };
}

function evaluateBadges(p: BrainGymProgress): string[] {
  const earned: string[] = [];
  if (p.totalPlays >= 1) earned.push("first-play");
  const playedIds = Object.keys(p.games) as GameId[];
  if (playedIds.length >= 5) earned.push("five-games");

  const cats = new Set(
    playedIds.map((id) => GAMES.find((g) => g.id === id)?.category).filter(Boolean),
  );
  if (cats.size >= 4) earned.push("all-categories");
  if (p.streak >= 3) earned.push("streak-3");
  if (p.streak >= 7) earned.push("streak-7");
  if (p.dailyChallenge?.completed) earned.push("daily-done");
  if (p.totalWins >= 10) earned.push("ten-wins");

  const memoryWins = GAMES.filter((g) => g.category === "memory").reduce(
    (n, g) => n + (p.games[g.id]?.wins ?? 0),
    0,
  );
  if (memoryWins >= 5) earned.push("memory-master");

  const speedHigh = GAMES.filter((g) => g.category === "speed").some(
    (g) => (p.games[g.id]?.bestScore ?? 0) >= 500,
  );
  if (speedHigh) earned.push("speed-demon");

  if (
    (p.games.sudoku?.wins ?? 0) > 0 &&
    (p.games.minesweeper?.wins ?? 0) > 0 &&
    (p.games["game-2048"]?.wins ?? 0) > 0
  ) {
    earned.push("puzzle-pro");
  }

  return earned;
}

export function toggleFavorite(
  progress: BrainGymProgress,
  gameId: GameId,
): BrainGymProgress {
  const prev = progress.games[gameId] ?? emptyStats();
  return {
    ...progress,
    games: {
      ...progress.games,
      [gameId]: { ...prev, favorite: !prev.favorite },
    },
  };
}

export function setSound(
  progress: BrainGymProgress,
  soundEnabled: boolean,
): BrainGymProgress {
  return { ...progress, soundEnabled };
}

export function difficultyMultiplier(d: Difficulty): number {
  return d === "easy" ? 1 : d === "medium" ? 1.4 : 1.8;
}
