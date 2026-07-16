import { PUZZLES } from "@/data/puzzles/catalog";
import type { PuzzleDef } from "@/lib/puzzles/types";
import { addDaysToKey, todayKey } from "@/lib/utils";

/** Deterministic daily pick so every user shares the same puzzle of the day. */
export function puzzleForDate(dateKey: string): PuzzleDef {
  const [y, m, d] = dateKey.split("-").map(Number);
  const ordinal = Math.floor(
    Date.UTC(y, m - 1, d) / (24 * 60 * 60 * 1000),
  );
  const index = ((ordinal % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index]!;
}

export function todayPuzzle(): PuzzleDef {
  return puzzleForDate(todayKey());
}

export function yesterdayKey(from = todayKey()): string {
  return addDaysToKey(from, -1);
}

export function yesterdayPuzzle(from = todayKey()): PuzzleDef {
  return puzzleForDate(yesterdayKey(from));
}

/** Answer for a date is revealed starting the next calendar day. */
export function isAnswerUnlocked(puzzleDateKey: string, now = todayKey()): boolean {
  return puzzleDateKey < now;
}

export function msUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return Math.max(0, tomorrow.getTime() - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
