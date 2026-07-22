import { DOSE_QUESTION_COUNT } from "@/data/config";
import type { DoseDayRecord, GameState } from "@/lib/types";
import { addDaysToKey, parseDateKey } from "@/lib/utils";

export const MONTHLY_CHALLENGE_TARGET_RDM = 5000;
export const MONTHLY_CHALLENGE_ENTRY_LAST_DAY = 5;
export const MONTHLY_CHALLENGE_STREAK_REQUIRED = 15;
export const MONTHLY_CHALLENGE_PASS_PCT = 80;
export const MONTHLY_CHALLENGE_WINNER_SLOTS = 5;

export type MonthlyEntryState = "locked_rdm" | "locked_window" | "open";

export type ChallengeDayStatus = "done" | "missed" | "upcoming" | "today_pending";

export type ChallengeCalendarDay = {
  day: number;
  dateKey: string;
  status: ChallengeDayStatus;
  pct: number | null;
  isPuzzleDay: boolean;
};

export type ChallengeMonthMeta = {
  monthKey: string;
  monthLabel: string;
  year: number;
  monthIndex: number;
  daysInMonth: number;
  lastDay: number;
  lastDayKey: string;
  nextEntryOpensLabel: string;
  nextEntryOpensKey: string;
  entryWindowLabel: string;
};

export type ChallengeProgress = {
  calendar: ChallengeCalendarDay[];
  /** Consecutive 80%+ days ending at today (or last completed day if today pending). */
  currentStretch: number;
  /** Best consecutive 80%+ run in this month so far. */
  bestStretch: number;
  streakMet: boolean;
  onPuzzleDay: boolean;
  eligibleForPuzzle: boolean;
  puzzleOpen: boolean;
};

export function dayOfMonthFromKey(dateKey: string): number {
  return parseDateKey(dateKey).getDate();
}

export function isInEntryWindow(dateKey: string): boolean {
  const day = dayOfMonthFromKey(dateKey);
  return day >= 1 && day <= MONTHLY_CHALLENGE_ENTRY_LAST_DAY;
}

export function getChallengeMonthMeta(dateKey: string): ChallengeMonthMeta {
  const d = parseDateKey(dateKey);
  const year = d.getFullYear();
  const monthIndex = d.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const lastDay = daysInMonth;
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLabel = d.toLocaleDateString("en-US", { month: "long" });

  let nextYear = year;
  let nextMonthIndex = monthIndex + 1;
  if (nextMonthIndex > 11) {
    nextMonthIndex = 0;
    nextYear += 1;
  }
  const nextEntryOpensKey = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}-01`;
  const nextEntryDate = parseDateKey(nextEntryOpensKey);
  const nextMonthLabel = nextEntryDate.toLocaleDateString("en-US", {
    month: "long",
  });
  const nextEntryOpensLabel = `1–${MONTHLY_CHALLENGE_ENTRY_LAST_DAY} ${nextMonthLabel}`;
  const lastDayKey = `${monthKey}-${String(lastDay).padStart(2, "0")}`;

  return {
    monthKey,
    monthLabel,
    year,
    monthIndex,
    daysInMonth,
    lastDay,
    lastDayKey,
    nextEntryOpensLabel,
    nextEntryOpensKey,
    entryWindowLabel: `1–${MONTHLY_CHALLENGE_ENTRY_LAST_DAY} ${monthLabel}`,
  };
}

/**
 * Access to the challenge page for the current month:
 * - Need 5,000 RDM
 * - Enter only on days 1–5, OR already enrolled this month (valid all month)
 */
export function getEntryState(args: {
  rdm: number;
  dateKey: string;
  enrolledMonthKey?: string | null;
}): MonthlyEntryState {
  if (args.rdm < MONTHLY_CHALLENGE_TARGET_RDM) return "locked_rdm";
  const meta = getChallengeMonthMeta(args.dateKey);
  if (args.enrolledMonthKey === meta.monthKey) return "open";
  if (isInEntryWindow(args.dateKey)) return "open";
  return "locked_window";
}

export function doseMeetsChallengeThreshold(
  correct: number,
  total: number,
): boolean {
  if (total <= 0) return false;
  const pct = Math.round((100 * correct) / total);
  return pct >= MONTHLY_CHALLENGE_PASS_PCT;
}

export function makeDoseDayRecord(args: {
  correct: number;
  total: number;
  classLevel: "11" | "12";
  completed: boolean;
}): DoseDayRecord {
  const total = Math.max(1, args.total);
  const correct = Math.max(0, Math.min(args.correct, total));
  return {
    correct,
    total,
    pct: Math.round((100 * correct) / total),
    completed: args.completed,
    classLevel: args.classLevel,
  };
}

export function recordDoseDayInState(
  state: GameState,
  dateKey: string,
  questionCount: number = DOSE_QUESTION_COUNT,
): GameState {
  if (!state.dose.completed) return state;
  const record = makeDoseDayRecord({
    correct: state.dose.correct,
    total: questionCount,
    classLevel: state.dose.currentClass,
    completed: true,
  });
  return {
    ...state,
    doseDayLog: {
      ...state.doseDayLog,
      [dateKey]: record,
    },
  };
}

export function buildChallengeProgress(
  doseDayLog: Record<string, DoseDayRecord>,
  dateKey: string,
): ChallengeProgress {
  const meta = getChallengeMonthMeta(dateKey);
  const todayDay = dayOfMonthFromKey(dateKey);
  const calendar: ChallengeCalendarDay[] = [];

  for (let day = 1; day <= meta.daysInMonth; day++) {
    const key = monthDayKey(meta.monthKey, day);
    const isPuzzleDay = day === meta.lastDay;
    const record = doseDayLog[key];

    if (day > todayDay) {
      calendar.push({
        day,
        dateKey: key,
        status: "upcoming",
        pct: null,
        isPuzzleDay,
      });
      continue;
    }

    if (record?.completed && record.pct >= MONTHLY_CHALLENGE_PASS_PCT) {
      calendar.push({
        day,
        dateKey: key,
        status: "done",
        pct: record.pct,
        isPuzzleDay,
      });
      continue;
    }

    if (day === todayDay && !record?.completed) {
      calendar.push({
        day,
        dateKey: key,
        status: "today_pending",
        pct: record?.pct ?? null,
        isPuzzleDay,
      });
      continue;
    }

    // Past day without 80%+ completion = missed (breaks streak)
    calendar.push({
      day,
      dateKey: key,
      status: "missed",
      pct: record?.completed ? record.pct : null,
      isPuzzleDay,
    });
  }

  const scored = calendar.filter((d) => d.day <= todayDay);
  let currentStretch = 0;
  for (let i = scored.length - 1; i >= 0; i--) {
    const cell = scored[i]!;
    if (cell.status === "today_pending") continue;
    if (cell.status === "done") currentStretch++;
    else break;
  }

  let bestStretch = 0;
  let run = 0;
  for (const cell of calendar) {
    if (cell.day > todayDay) break;
    if (cell.status === "done") {
      run++;
      bestStretch = Math.max(bestStretch, run);
    } else if (cell.status !== "today_pending") {
      run = 0;
    }
  }

  const streakMet = bestStretch >= MONTHLY_CHALLENGE_STREAK_REQUIRED;
  const onPuzzleDay = todayDay === meta.lastDay;
  const eligibleForPuzzle = streakMet;
  const puzzleOpen = onPuzzleDay && eligibleForPuzzle;

  return {
    calendar,
    currentStretch,
    bestStretch,
    streakMet,
    onPuzzleDay,
    eligibleForPuzzle,
    puzzleOpen,
  };
}

export function firstWeekdayOfMonth(dateKey: string): number {
  const d = parseDateKey(dateKey);
  return new Date(d.getFullYear(), d.getMonth(), 1).getDay();
}

export function monthDayKey(monthKey: string, day: number): string {
  return `${monthKey}-${String(day).padStart(2, "0")}`;
}

export function formatChallengeLongDate(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function nextCalendarDay(dateKey: string): string {
  return addDaysToKey(dateKey, 1);
}

/** Placeholder puzzle copy until content is loaded from DB later. */
export function challengePuzzlePrompt(meta: ChallengeMonthMeta): string {
  return `Final puzzle for ${meta.monthLabel} ${meta.year} — submit one clear answer. The first ${MONTHLY_CHALLENGE_WINNER_SLOTS} correct entries (by system timestamp) win. Edubite will notify winners on your registered WhatsApp and email.`;
}
