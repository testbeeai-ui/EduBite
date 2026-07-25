import { DOSE_QUESTION_COUNT } from "@/data/config";
import type { DoseDayRecord, GameState } from "@/lib/types";
import { criteriaForDate, isFullDay } from "@/lib/gamification";
import { getLiveRdmAmount } from "@/lib/rdm/live-amounts";
import { addDaysToKey, parseDateKey } from "@/lib/utils";

/** Fallback constant — prefer getMonthlyChallengeTargetRdm() at runtime. */
export const MONTHLY_CHALLENGE_TARGET_RDM = 5000;
/** Fallback — prefer getMonthlyChallengeEntryStakeRdm() at runtime. */
export const MONTHLY_CHALLENGE_ENTRY_STAKE_RDM = 3000;
export const MONTHLY_CHALLENGE_ENTRY_LAST_DAY = 5;
export const MONTHLY_CHALLENGE_STREAK_REQUIRED = 15;
export const MONTHLY_CHALLENGE_PASS_PCT = 80;
export const MONTHLY_CHALLENGE_WINNER_SLOTS = 5;

export function getMonthlyChallengeTargetRdm(): number {
  const live = getLiveRdmAmount("challenge.target_rdm");
  return live > 0 ? live : MONTHLY_CHALLENGE_TARGET_RDM;
}

/** RDM deducted on enroll — live from edubite_rdm_rewards. */
export function getMonthlyChallengeEntryStakeRdm(): number {
  const live = getLiveRdmAmount("challenge.entry_stake");
  return live >= 0 ? live : MONTHLY_CHALLENGE_ENTRY_STAKE_RDM;
}

export type MonthlyEntryState = "locked_rdm" | "locked_window" | "open";

export type ChallengeDayStatus = "done" | "missed" | "upcoming" | "today_pending";

export type ChallengeCalendarDay = {
  day: number;
  dateKey: string;
  status: ChallengeDayStatus;
  pct: number | null;
  isPuzzleDay: boolean;
  /** When the full day was first completed (server/client ISO). */
  completedAt: string | null;
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
  /** Consecutive full days (all 5 journey criteria) ending at today. */
  currentStretch: number;
  /** Best consecutive full-day run in this month so far. */
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
 * - Enrolled for THIS monthKey → open for the rest of that month
 *   (stake already paid; balance may be below unlock — do NOT re-lock)
 * - Last month's enroll does not carry over — next month needs a fresh unlock + stake
 * - Else need unlock RDM, and days 1–5 entry window
 */
export function isEnrolledForChallengeMonth(
  monthKey: string,
  enrolledMonthKey?: string | null,
  enrolledMonths?: string[] | null,
): boolean {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
  if (enrolledMonthKey === monthKey) return true;
  return Array.isArray(enrolledMonths) && enrolledMonths.includes(monthKey);
}

export function getEntryState(args: {
  rdm: number;
  dateKey: string;
  enrolledMonthKey?: string | null;
  enrolledMonths?: string[] | null;
}): MonthlyEntryState {
  const meta = getChallengeMonthMeta(args.dateKey);
  // Paid entry stake + enrolled for the current month — stays open all month.
  if (
    isEnrolledForChallengeMonth(
      meta.monthKey,
      args.enrolledMonthKey,
      args.enrolledMonths,
    )
  ) {
    return "open";
  }
  if (args.rdm < getMonthlyChallengeTargetRdm()) return "locked_rdm";
  if (isInEntryWindow(args.dateKey)) return "open";
  return "locked_window";
}

/** Merge a newly paid month into game-state enrollment fields. */
export function withChallengeEnrollment(
  state: Pick<
    GameState,
    "challengeEnrolledMonthKey" | "challengeEnrolledMonths"
  >,
  monthKey: string,
): {
  challengeEnrolledMonthKey: string;
  challengeEnrolledMonths: string[];
} {
  const months = mergeEnrolledMonths(
    state.challengeEnrolledMonths,
    state.challengeEnrolledMonthKey,
    monthKey,
  );
  return {
    challengeEnrolledMonthKey: monthKey,
    challengeEnrolledMonths: months,
  };
}

export function mergeEnrolledMonths(
  ...parts: Array<string[] | string | null | undefined>
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    const list = Array.isArray(part)
      ? part
      : typeof part === "string"
        ? [part]
        : [];
    for (const key of list) {
      if (!/^\d{4}-\d{2}$/.test(key) || seen.has(key)) continue;
      seen.add(key);
      out.push(key);
    }
  }
  return out.sort();
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
  state: GameState,
  dateKey: string,
): ChallengeProgress {
  const meta = getChallengeMonthMeta(dateKey);
  const todayDay = dayOfMonthFromKey(dateKey);
  const calendar: ChallengeCalendarDay[] = [];

  for (let day = 1; day <= meta.daysInMonth; day++) {
    const key = monthDayKey(meta.monthKey, day);
    const isPuzzleDay = day === meta.lastDay;
    const criteria = criteriaForDate(state, key, dateKey);
    const full = isFullDay(criteria);
    const criteriaDone = [
      criteria.dose,
      criteria.funbrain,
      criteria.puzzles,
      criteria.habits,
      criteria.pledges,
    ].filter(Boolean).length;

    if (day > todayDay) {
      // Keep logged full days visible even if App Clock is earlier (QA jumps).
      if (full) {
        calendar.push({
          day,
          dateKey: key,
          status: "done",
          pct: Math.round((criteriaDone / 5) * 100),
          isPuzzleDay,
          completedAt: criteria.completedAt ?? null,
        });
      } else {
        calendar.push({
          day,
          dateKey: key,
          status: "upcoming",
          pct: null,
          isPuzzleDay,
          completedAt: null,
        });
      }
      continue;
    }

    // Full journey day = all 5 dots (Dose, FunBrain, Puzzle, Habits, Pledges).
    if (full) {
      calendar.push({
        day,
        dateKey: key,
        status: "done",
        pct: Math.round((criteriaDone / 5) * 100),
        isPuzzleDay,
        completedAt: criteria.completedAt ?? null,
      });
      continue;
    }

    if (day === todayDay) {
      calendar.push({
        day,
        dateKey: key,
        status: "today_pending",
        pct: Math.round((criteriaDone / 5) * 100),
        isPuzzleDay,
        completedAt: null,
      });
      continue;
    }

    // Past day without a full journey day = missed (breaks streak).
    calendar.push({
      day,
      dateKey: key,
      status: "missed",
      pct: criteriaDone > 0 ? Math.round((criteriaDone / 5) * 100) : null,
      isPuzzleDay,
      completedAt: null,
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
    if (cell.status === "done") {
      run++;
      bestStretch = Math.max(bestStretch, run);
    } else if (cell.status === "upcoming") {
      // Unplayed gap — breaks consecutive run across the month.
      run = 0;
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
