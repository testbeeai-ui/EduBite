import {
  buildChallengeProgress,
  getChallengeMonthMeta,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
} from "@/lib/challenge/monthly";
import { normalizeGameState } from "@/lib/db/normalize";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import { DOSE_DURATION_SEC, FUNBRAIN_BASE_POINTS, FUNBRAIN_DURATION_SEC } from "@/data/config";
import { HABIT_DEFINITIONS } from "@/data/habits";
import { FUNBRAIN_QUESTIONS_PER_DAY } from "@/lib/content/schedule";
import type { GameState } from "@/lib/types";
import { realTodayKey } from "@/lib/utils";

/** Admin display estimate — FunBrain timer is not persisted per past day yet. */
function funbrainTimeSpentSec(args: {
  isToday: boolean;
  funbrainDone: boolean;
  funbrain: GameState["funbrain"] | undefined;
}): number {
  if (!args.funbrainDone) return 0;
  const fb = args.funbrain;
  if (args.isToday && fb) {
    if (fb.running) {
      return Math.max(0, FUNBRAIN_DURATION_SEC - fb.timeLeft);
    }
    // After completion the countdown resets to full duration in saved state.
    if (fb.completed || fb.finished) {
      return FUNBRAIN_DURATION_SEC;
    }
    return Math.max(0, FUNBRAIN_DURATION_SEC - fb.timeLeft);
  }
  return FUNBRAIN_DURATION_SEC;
}

export const ENROLLMENTS_TABLE = "edubite_monthly_challenge_enrollments";
export const ENTRIES_TABLE = "edubite_monthly_challenge_entries";

export type ChallengeActivityDay = {
  day: number;
  dateKey: string;
  completedAt: string | null;
  isPuzzleDay: boolean;
};

export type ParticipantDayDetail = {
  day: number;
  dateKey: string;
  status: "done" | "today_pending" | "missed" | "upcoming";
  completedAt: string | null;
  isPuzzleDay: boolean;
  dose: {
    completed: boolean;
    correct: number;
    wrong: number;
    total: number;
    pct: number;
    classLevel: "11" | "12";
    timeSpentSec: number;
  };
  funbrain: {
    completed: boolean;
    correct: number;
    wrong: number;
    total: number;
    score: number;
    highScore: number;
    combo: number;
    timeSpentSec: number;
  };
  habitsDone: number;
  totalHabits: number;
  habitsList: string[];
  pledgeAM: boolean;
  pledgePM: boolean;
  puzzleCompleted: boolean;
  dayTimeSpentSec: number;
};

export type ChallengeParticipantRow = {
  userId: string;
  displayName: string;
  enrolledAt: string | null;
  stakeRdm: number;
  bestStretch: number;
  currentStretch: number;
  streakRequired: number;
  streakMet: boolean;
  eligibleForPuzzle: boolean;
  daysCompleted: number;
  /** Full journey days with finish timestamps (day-by-day timer log). */
  activityDays: ChallengeActivityDay[];
  /** Detailed day-by-day activity breakdown for modal inspection. */
  dayDetails: ParticipantDayDetail[];
  totalTimeSpentSec: number;
  totalRdm: number;
  joinedDate: string | null;
  lastActivityAt: string | null;
  /** Personal “today” under App Clock / as-of date. */
  todayDateKey: string;
  todayCriteriaDone: number;
  todayFull: boolean;
  submitted: boolean;
  submittedAt: string | null;
  answer: string | null;
  verifiedCorrect: boolean;
  isWinner: boolean;
  entryId: string | null;
};

export type ChallengeAdminSummary = {
  monthKey: string;
  asOfDate: string;
  enrolled: number;
  streakMet: number;
  submitted: number;
  verifiedCorrect: number;
  winners: number;
  winnerSlots: number;
  streakRequired: number;
};

type EnrollmentRow = {
  user_id: string;
  month_key: string;
  stake_rdm: number;
  display_name: string;
  enrolled_at: string;
};

type EntryRow = {
  id: string;
  user_id: string;
  month_key: string;
  answer: string;
  display_name: string;
  submitted_at: string;
  verified_correct: boolean;
  is_winner: boolean;
};

type ChallengeEnrollmentResult = {
  alreadyEnrolled: boolean;
  monthKey: string;
  stakeRdm: number;
  state: GameState;
};

type ChallengeSubmissionResult = {
  submittedAt: string;
  state: GameState;
};

export async function enrollChallengeAtomically(args: {
  monthKey: string;
  displayName: string;
  dateKey?: string;
}): Promise<ChallengeEnrollmentResult> {
  const client = await createEdubiteSupabaseServer();
  const { data, error } = await client.rpc("edubite_enroll_monthly_challenge", {
    p_month_key: args.monthKey,
    p_display_name: args.displayName,
    p_date_key: args.dateKey ?? null,
  });
  if (error) throw new Error(error.message);
  const result = data as ChallengeEnrollmentResult;
  return {
    ...result,
    state: normalizeGameState(result.state),
  };
}

export async function submitChallengeAtomically(args: {
  monthKey: string;
  answer: string;
  displayName: string;
  dateKey?: string;
}): Promise<ChallengeSubmissionResult> {
  const client = await createEdubiteSupabaseServer();
  const { data, error } = await client.rpc("edubite_submit_monthly_challenge", {
    p_month_key: args.monthKey,
    p_answer: args.answer,
    p_display_name: args.displayName,
    p_date_key: args.dateKey ?? null,
  });
  if (error) throw new Error(error.message);
  const result = data as ChallengeSubmissionResult;
  return {
    submittedAt: result.submittedAt,
    state: normalizeGameState(result.state),
  };
}

export async function listChallengeWinners(
  monthKey: string,
): Promise<Array<{ display_name: string; submitted_at: string }>> {
  const client = await createEdubiteSupabaseServer();
  const { data, error } = await client.rpc(
    "edubite_monthly_challenge_winners",
    { p_month_key: monthKey },
  );
  if (error) throw new Error(error.message);
  return (data ?? []) as Array<{
    display_name: string;
    submitted_at: string;
  }>;
}

/** Lookup enrollment roster row for a user/month (if any). */
export async function getChallengeEnrollment(
  userId: string,
  monthKey: string,
): Promise<EnrollmentRow | null> {
  if (!userId || !/^\d{4}-\d{2}$/.test(monthKey)) return null;
  const client = await createEdubiteSupabaseServer();
  const { data, error } = await client
    .from(ENROLLMENTS_TABLE)
    .select("user_id, month_key, stake_rdm, display_name, enrolled_at")
    .eq("user_id", userId)
    .eq("month_key", monthKey)
    .maybeSingle();
  if (error) {
    console.error("[challenge] get enrollment", error);
    return null;
  }
  return (data as EnrollmentRow | null) ?? null;
}

/** All month keys this user has on the enrollment roster. */
export async function listEnrollmentMonthKeysForUser(
  userId: string,
): Promise<string[]> {
  if (!userId) return [];
  const client = await createEdubiteSupabaseServer();
  const { data, error } = await client
    .from(ENROLLMENTS_TABLE)
    .select("month_key")
    .eq("user_id", userId);
  if (error) {
    console.error("[challenge] list enrollment months", error);
    return [];
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const row of data ?? []) {
    const key = (row as { month_key?: string }).month_key;
    if (typeof key !== "string" || !/^\d{4}-\d{2}$/.test(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(key);
  }
  return out.sort();
}

function asOfDateForMonth(monthKey: string, preferredAsOf?: string): string {
  const meta = getChallengeMonthMeta(`${monthKey}-01`);
  const today = realTodayKey();
  const candidate =
    preferredAsOf && /^\d{4}-\d{2}-\d{2}$/.test(preferredAsOf)
      ? preferredAsOf
      : today.startsWith(monthKey)
        ? today
        : meta.lastDayKey;
  // Clamp into the selected month so progress calendar stays coherent.
  if (candidate < `${monthKey}-01`) return `${monthKey}-01`;
  if (candidate > meta.lastDayKey) return meta.lastDayKey;
  return candidate;
}

export async function listChallengeAdminBoard(
  monthKey: string,
  asOfDateKey?: string,
): Promise<{
  summary: ChallengeAdminSummary;
  participants: ChallengeParticipantRow[];
}> {
  const client = await createEdubiteSupabaseServer();
  const asOfDate = asOfDateForMonth(monthKey, asOfDateKey);

  const [{ data: enrollments, error: enrollError }, { data: entries, error: entryError }] =
    await Promise.all([
      client
        .from(ENROLLMENTS_TABLE)
        .select("user_id, month_key, stake_rdm, display_name, enrolled_at")
        .eq("month_key", monthKey)
        .order("enrolled_at", { ascending: true }),
      client
        .from(ENTRIES_TABLE)
        .select(
          "id, user_id, month_key, answer, display_name, submitted_at, verified_correct, is_winner",
        )
        .eq("month_key", monthKey)
        .order("submitted_at", { ascending: true }),
    ]);

  if (enrollError) throw new Error(enrollError.message);
  if (entryError) throw new Error(entryError.message);

  const enrollRows = (enrollments ?? []) as EnrollmentRow[];
  const entryRows = (entries ?? []) as EntryRow[];

  const userIds = new Set<string>();
  for (const e of enrollRows) userIds.add(e.user_id);
  for (const e of entryRows) userIds.add(e.user_id);

  // Also pick up anyone enrolled only in game_state (pre-table or missed API)
  const { data: gsEnrolled } = await client
    .from("edubite_game_state")
    .select("user_id, payload")
    .filter("payload->>challengeEnrolledMonthKey", "eq", monthKey);

  const gameByUser = new Map<string, GameState>();
  for (const row of gsEnrolled ?? []) {
    userIds.add(row.user_id as string);
    try {
      gameByUser.set(
        row.user_id as string,
        normalizeGameState(row.payload as unknown),
      );
    } catch {
      /* ignore bad payload */
    }
  }

  // Load game state for enrolled users missing from the filter (entry-only)
  const missing = [...userIds].filter((id) => !gameByUser.has(id));
  if (missing.length > 0) {
    const { data: extra } = await client
      .from("edubite_game_state")
      .select("user_id, payload")
      .in("user_id", missing);
    for (const row of extra ?? []) {
      try {
        gameByUser.set(
          row.user_id as string,
          normalizeGameState(row.payload as unknown),
        );
      } catch {
        /* ignore */
      }
    }
  }

  const enrollByUser = new Map(enrollRows.map((e) => [e.user_id, e]));
  const entryByUser = new Map(entryRows.map((e) => [e.user_id, e]));

  const participants: ChallengeParticipantRow[] = [];

  for (const userId of userIds) {
    const enroll = enrollByUser.get(userId);
    const entry = entryByUser.get(userId);
    const state = gameByUser.get(userId);
    const progress = state
      ? buildChallengeProgress(state, asOfDate)
      : {
          bestStretch: 0,
          currentStretch: 0,
          streakMet: false,
          eligibleForPuzzle: false,
          calendar: [] as ReturnType<typeof buildChallengeProgress>["calendar"],
        };
    const displayName =
      entry?.display_name ||
      enroll?.display_name ||
      "Learner";

    const dayDetails: ParticipantDayDetail[] = progress.calendar.map((d) => {
      const doseLog = state?.doseDayLog?.[d.dateKey];
      const isToday = d.dateKey === asOfDate || d.dateKey === state?.lastActiveDate;
      const isDone = d.status === "done";
      
      const doseCompleted = Boolean(doseLog?.completed || (isToday && state?.dose.completed) || isDone);
      const doseCorrect = doseLog?.correct ?? (isToday ? (state?.dose.correct ?? 0) : (isDone ? 5 : 0));
      const doseTotal = doseLog?.total ?? 5;
      const doseWrong = Math.max(0, doseTotal - doseCorrect);
      const dosePct = doseLog?.pct ?? (doseTotal > 0 ? Math.round((100 * doseCorrect) / doseTotal) : 0);
      const doseClass = doseLog?.classLevel ?? (state?.dose.currentClass ?? "11");
      const doseTime =
        doseLog?.timeSpentSec ?? (doseCompleted ? DOSE_DURATION_SEC : 0);

      const criteriaLog = state?.dayCriteriaLog?.[d.dateKey];

      const fbCompleted = Boolean(
        isToday
          ? state?.funbrain.completed
          : criteriaLog?.funbrain || isDone,
      );
      const fbScore = isToday ? (state?.funbrain.score ?? 0) : (fbCompleted ? 100 : 0);
      const fbHighScore = isToday ? (state?.funbrain.highScore ?? 0) : (fbCompleted ? 100 : 0);
      const fbCombo = isToday ? (state?.funbrain.combo ?? 0) : (fbCompleted ? 3 : 0);
      const fbTotal = FUNBRAIN_QUESTIONS_PER_DAY;
      const fbCorrect = fbCompleted
        ? Math.min(
            fbTotal,
            Math.max(1, Math.round(fbScore / Math.max(1, FUNBRAIN_BASE_POINTS))),
          )
        : 0;
      const fbWrong = fbCompleted ? Math.max(0, fbTotal - fbCorrect) : 0;
      const fbTime = funbrainTimeSpentSec({
        isToday,
        funbrainDone: fbCompleted,
        funbrain: state?.funbrain,
      });

      const pledgeAM = isToday
        ? Boolean(state?.pledgeAM || criteriaLog?.pledgeAM || criteriaLog?.pledges)
        : Boolean(criteriaLog?.pledgeAM ?? (criteriaLog?.pledges || isDone));

      const pledgePM = isToday
        ? Boolean(state?.pledgePM || criteriaLog?.pledgePM || criteriaLog?.pledges)
        : Boolean(criteriaLog?.pledgePM ?? (criteriaLog?.pledges || isDone));

      const habitIdsDone = isToday
        ? Array.from(
            new Set([
              ...(state?.habits?.filter((h) => h.done).map((h) => h.id) || []),
              ...(criteriaLog?.habitsDone || []),
            ]),
          )
        : criteriaLog?.habitsDone ||
          (criteriaLog?.habits || isDone
            ? (state?.habits || HABIT_DEFINITIONS).map((h) => h.id)
            : []);

      const habitsList = (state?.habits || HABIT_DEFINITIONS)
        .filter((h) => habitIdsDone.includes(h.id) || habitIdsDone.includes(h.name))
        .map((h) => h.name);

      const habitsDone = habitsList.length;
      const totalHabits = state?.habits.length || HABIT_DEFINITIONS.length;

      const puzzleCompleted = Boolean(
        isToday
          ? state?.puzzleCompleted || criteriaLog?.puzzles
          : criteriaLog?.puzzles || isDone,
      );

      const dayTimeSpentSec = doseTime + fbTime + (habitsDone > 0 ? 60 : 0) + (pledgeAM || pledgePM ? 30 : 0);

      return {
        day: d.day,
        dateKey: d.dateKey,
        status: d.status,
        completedAt: d.completedAt,
        isPuzzleDay: d.isPuzzleDay,
        dose: {
          completed: doseCompleted,
          correct: doseCorrect,
          wrong: doseWrong,
          total: doseTotal,
          pct: dosePct,
          classLevel: doseClass,
          timeSpentSec: doseTime,
        },
        funbrain: {
          completed: fbCompleted,
          correct: fbCorrect,
          wrong: fbWrong,
          total: fbTotal,
          score: fbScore,
          highScore: fbHighScore,
          combo: fbCombo,
          timeSpentSec: fbTime,
        },
        habitsDone,
        totalHabits,
        habitsList,
        pledgeAM,
        pledgePM,
        puzzleCompleted,
        dayTimeSpentSec,
      };
    });

    const totalTimeSpentSec = dayDetails.reduce((sum, d) => sum + d.dayTimeSpentSec, 0);

    const activityDays = progress.calendar
      .filter((d) => d.status === "done")
      .map((d) => ({
        day: d.day,
        dateKey: d.dateKey,
        completedAt: d.completedAt,
        isPuzzleDay: d.isPuzzleDay,
      }));
    const lastActivityAt =
      activityDays
        .map((d) => d.completedAt)
        .filter((v): v is string => Boolean(v))
        .sort()
        .at(-1) ?? null;
    const todayCell = progress.calendar.find((d) => d.dateKey === asOfDate);
    const todayCriteriaDone =
      todayCell?.pct != null ? Math.round((todayCell.pct / 100) * 5) : 0;

    participants.push({
      userId,
      displayName,
      enrolledAt: enroll?.enrolled_at ?? null,
      stakeRdm: enroll?.stake_rdm ?? 0,
      bestStretch: progress.bestStretch,
      currentStretch: progress.currentStretch,
      streakRequired: MONTHLY_CHALLENGE_STREAK_REQUIRED,
      streakMet: progress.streakMet,
      eligibleForPuzzle: progress.eligibleForPuzzle,
      daysCompleted: activityDays.length,
      activityDays,
      dayDetails,
      totalTimeSpentSec,
      totalRdm: state?.rdm ?? 0,
      joinedDate: state?.joinedDate ?? null,
      lastActivityAt,
      todayDateKey: asOfDate,
      todayCriteriaDone,
      todayFull: todayCell?.status === "done",
      submitted: Boolean(entry),
      submittedAt: entry?.submitted_at ?? null,
      answer: entry?.answer ?? null,
      verifiedCorrect: entry?.verified_correct ?? false,
      isWinner: entry?.is_winner ?? false,
      entryId: entry?.id ?? null,
    });
  }

  participants.sort((a, b) => {
    if (a.isWinner !== b.isWinner) return a.isWinner ? -1 : 1;
    if (a.submitted !== b.submitted) return a.submitted ? -1 : 1;
    if (a.streakMet !== b.streakMet) return a.streakMet ? -1 : 1;
    if (b.bestStretch !== a.bestStretch) return b.bestStretch - a.bestStretch;
    const at = a.submittedAt ?? a.enrolledAt ?? "";
    const bt = b.submittedAt ?? b.enrolledAt ?? "";
    return at.localeCompare(bt);
  });

  const summary: ChallengeAdminSummary = {
    monthKey,
    asOfDate,
    enrolled: participants.filter((p) => p.enrolledAt || gameByUser.has(p.userId)).length,
    streakMet: participants.filter((p) => p.streakMet).length,
    submitted: participants.filter((p) => p.submitted).length,
    verifiedCorrect: participants.filter((p) => p.verifiedCorrect).length,
    winners: participants.filter((p) => p.isWinner).length,
    winnerSlots: MONTHLY_CHALLENGE_WINNER_SLOTS,
    streakRequired: MONTHLY_CHALLENGE_STREAK_REQUIRED,
  };

  // Prefer count of enroll table + game_state enrolled
  summary.enrolled = Math.max(
    enrollRows.length,
    participants.filter(
      (p) =>
        p.enrolledAt ||
        gameByUser.get(p.userId)?.challengeEnrolledMonths?.includes(monthKey) ||
          gameByUser.get(p.userId)?.challengeEnrolledMonthKey === monthKey,
    ).length,
  );

  return { summary, participants };
}

export async function patchChallengeEntry(args: {
  entryId: string;
  adminUserId: string;
  verifiedCorrect?: boolean;
  isWinner?: boolean;
}): Promise<EntryRow> {
  const client = await createEdubiteSupabaseServer();
  const patch: Record<string, unknown> = {};

  if (typeof args.verifiedCorrect === "boolean") {
    patch.verified_correct = args.verifiedCorrect;
    patch.verified_at = args.verifiedCorrect ? new Date().toISOString() : null;
    patch.verified_by = args.verifiedCorrect ? args.adminUserId : null;
    if (!args.verifiedCorrect) {
      patch.is_winner = false;
      patch.winner_announced_at = null;
    }
  }
  if (typeof args.isWinner === "boolean") {
    patch.is_winner = args.isWinner;
    patch.winner_announced_at = args.isWinner
      ? new Date().toISOString()
      : null;
    if (args.isWinner) {
      patch.verified_correct = true;
      patch.verified_at = new Date().toISOString();
      patch.verified_by = args.adminUserId;
    }
  }

  if (Object.keys(patch).length === 0) {
    throw new Error("No fields to update");
  }

  // Cap winners at MONTHLY_CHALLENGE_WINNER_SLOTS
  if (patch.is_winner === true) {
    const { data: existing } = await client
      .from(ENTRIES_TABLE)
      .select("id, month_key")
      .eq("id", args.entryId)
      .maybeSingle();
    if (!existing) throw new Error("Entry not found");

    const { count } = await client
      .from(ENTRIES_TABLE)
      .select("id", { count: "exact", head: true })
      .eq("month_key", existing.month_key)
      .eq("is_winner", true)
      .neq("id", args.entryId);

    if ((count ?? 0) >= MONTHLY_CHALLENGE_WINNER_SLOTS) {
      throw new Error(
        `Already have ${MONTHLY_CHALLENGE_WINNER_SLOTS} winners for this month`,
      );
    }
  }

  const { data, error } = await client
    .from(ENTRIES_TABLE)
    .update(patch)
    .eq("id", args.entryId)
    .select(
      "id, user_id, month_key, answer, display_name, submitted_at, verified_correct, is_winner",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update entry");
  }
  return data as EntryRow;
}

/** Mark first N verified_correct (by submitted_at) as winners; clear others. */
export async function declareWinnersForMonth(
  monthKey: string,
  adminUserId: string,
): Promise<{ winners: number }> {
  const client = await createEdubiteSupabaseServer();
  const { data: verified, error } = await client
    .from(ENTRIES_TABLE)
    .select("id")
    .eq("month_key", monthKey)
    .eq("verified_correct", true)
    .order("submitted_at", { ascending: true })
    .limit(MONTHLY_CHALLENGE_WINNER_SLOTS);

  if (error) throw new Error(error.message);

  const winnerIds = new Set((verified ?? []).map((r) => r.id as string));
  const now = new Date().toISOString();

  // Clear all winners for month first
  const { error: clearError } = await client
    .from(ENTRIES_TABLE)
    .update({ is_winner: false, winner_announced_at: null })
    .eq("month_key", monthKey)
    .eq("is_winner", true);
  if (clearError) throw new Error(clearError.message);

  if (winnerIds.size === 0) return { winners: 0 };

  const { error: setError } = await client
    .from(ENTRIES_TABLE)
    .update({
      is_winner: true,
      winner_announced_at: now,
      verified_by: adminUserId,
    })
    .in("id", [...winnerIds]);
  if (setError) throw new Error(setError.message);

  return { winners: winnerIds.size };
}
