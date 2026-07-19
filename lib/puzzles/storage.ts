import {
  createDefaultPuzzleProgress,
  type PuzzleAttempt,
  type PuzzleProgress,
} from "@/lib/puzzles/types";
import { normalizePuzzleProgress } from "@/lib/db/normalize";
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

export type SavePuzzleAttemptResult =
  | { ok: true; progress: PuzzleProgress; inserted: boolean }
  | { ok: false; error: string };

export async function savePuzzleAttempt(
  userId: string,
  attempt: Omit<PuzzleAttempt, "submittedAt">,
): Promise<SavePuzzleAttemptResult> {
  try {
    const res = await fetch("/api/progress/puzzles", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attempt,
      }),
    });
    if (!res.ok) {
      return { ok: false, error: `puzzle save failed: ${res.status}` };
    }
    const data = (await res.json()) as {
      progress?: unknown;
      inserted?: boolean;
    };
    return {
      ok: true,
      progress: normalizePuzzleProgress(data.progress),
      inserted: data.inserted === true,
    };
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
  selectedOptionIndex: number | null = null,
): PuzzleProgress {
  const date = todayKey();
  if (progress.attempts[date]) return progress;
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
        responseType:
          selectedOptionIndex === null ? "open-ended" : "mcq",
        note: note.trim(),
        selectedOptionIndex,
        submittedAt: new Date().toISOString(),
      },
    },
  };
}
