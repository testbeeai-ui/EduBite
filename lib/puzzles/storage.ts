import {
  createDefaultPuzzleProgress,
  type PuzzleProgress,
} from "@/lib/puzzles/types";
import { normalizePuzzleProgress } from "@/lib/db/normalize";
import type { SaveResult } from "@/lib/persistence/save-queue";
import { addDaysToKey, todayKey } from "@/lib/utils";

export async function loadPuzzleProgress(
  userId: string | null,
): Promise<PuzzleProgress> {
  if (!userId) return createDefaultPuzzleProgress();

  try {
    const res = await fetch("/api/progress/puzzles", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return createDefaultPuzzleProgress();
    const data = (await res.json()) as { progress?: PuzzleProgress | null };
    return data.progress
      ? normalizePuzzleProgress(data.progress)
      : createDefaultPuzzleProgress();
  } catch {
    return createDefaultPuzzleProgress();
  }
}

export async function savePuzzleProgress(
  userId: string,
  progress: PuzzleProgress,
): Promise<SaveResult> {
  try {
    const res = await fetch("/api/progress/puzzles", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        progress: normalizePuzzleProgress(progress),
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `puzzle save failed: ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "puzzle save failed",
    };
  }
}

export function recordAttempt(
  progress: PuzzleProgress,
  puzzleId: string,
  note: string,
): PuzzleProgress {
  const date = todayKey();
  const yesterday = addDaysToKey(date, -1);
  const continuing =
    progress.lastAttemptDate === date ||
    progress.lastAttemptDate === yesterday;
  const streak =
    progress.lastAttemptDate === date
      ? progress.streak
      : continuing
        ? progress.streak + 1
        : 1;

  return {
    ...progress,
    streak,
    lastAttemptDate: date,
    attempts: {
      ...progress.attempts,
      [date]: {
        puzzleId,
        dateKey: date,
        note: note.trim(),
        submittedAt: new Date().toISOString(),
      },
    },
  };
}
