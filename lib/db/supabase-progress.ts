import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrainGymMutation,
  BrainGymProgress,
} from "@/lib/brain-gym/types";
import {
  mergeEnrolledMonths,
  getMonthlyChallengeEntryStakeRdm,
} from "@/lib/challenge/monthly";
import {
  listEnrollmentMonthKeysForUser,
  upsertChallengeEnrollment,
} from "@/lib/db/monthly-challenge";
import {
  normalizeBrainGymProgress,
  normalizeGameState,
  normalizePuzzleProgress,
} from "@/lib/db/normalize";
import type { PuzzleAttempt, PuzzleProgress } from "@/lib/puzzles/types";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import type { DayCriteria, GameState } from "@/lib/types";

export const EDUBITE_GAME_STATE_TABLE = "edubite_game_state";
export const EDUBITE_BRAIN_GYM_TABLE = "edubite_brain_gym_progress";
export const EDUBITE_PUZZLE_TABLE = "edubite_puzzle_progress";

function mergeDayCriteria(
  a: DayCriteria | undefined,
  b: DayCriteria | undefined,
): DayCriteria {
  const completedAts = [a?.completedAt, b?.completedAt].filter(
    (v): v is string => typeof v === "string" && v.length > 0,
  );
  const earliest =
    completedAts.length > 0
      ? completedAts.reduce((min, cur) => (cur < min ? cur : min))
      : null;
  const habitsDone = Array.from(
    new Set([...(a?.habitsDone || []), ...(b?.habitsDone || [])]),
  );
  const merged: DayCriteria = {
    dose: Boolean(a?.dose || b?.dose),
    funbrain: Boolean(a?.funbrain || b?.funbrain),
    puzzles: Boolean(a?.puzzles || b?.puzzles),
    habits: Boolean(a?.habits || b?.habits),
    pledges: Boolean(a?.pledges || b?.pledges),
    completedAt: earliest,
    pledgeAM: Boolean(a?.pledgeAM || b?.pledgeAM),
    pledgePM: Boolean(a?.pledgePM || b?.pledgePM),
    habitsDone,
  };
  if (
    merged.dose &&
    merged.funbrain &&
    merged.puzzles &&
    merged.habits &&
    merged.pledges &&
    !merged.completedAt
  ) {
    // Legacy full days without a stamp — keep null; UI still lists the day.
    merged.completedAt = null;
  }
  return merged;
}

/** Union per-date criteria so stale saves cannot wipe completed QA days. */
function mergeDayCriteriaLogs(
  prev: GameState["dayCriteriaLog"] | undefined,
  incoming: GameState["dayCriteriaLog"] | undefined,
): GameState["dayCriteriaLog"] {
  const keys = new Set([
    ...Object.keys(prev ?? {}),
    ...Object.keys(incoming ?? {}),
  ]);
  const out: GameState["dayCriteriaLog"] = {};
  for (const key of keys) {
    out[key] = mergeDayCriteria(prev?.[key], incoming?.[key]);
  }
  return out;
}

function mergeDoseDayLogs(
  prev: GameState["doseDayLog"] | undefined,
  incoming: GameState["doseDayLog"] | undefined,
): GameState["doseDayLog"] {
  const keys = new Set([
    ...Object.keys(prev ?? {}),
    ...Object.keys(incoming ?? {}),
  ]);
  const out: GameState["doseDayLog"] = {};
  for (const key of keys) {
    const a = prev?.[key];
    const b = incoming?.[key];
    if (!a) {
      if (b) out[key] = b;
      continue;
    }
    if (!b) {
      out[key] = a;
      continue;
    }
    out[key] = a.pct >= b.pct ? a : b;
  }
  return out;
}

async function sb(): Promise<SupabaseClient> {
  return createEdubiteSupabaseServer();
}

/** Merge roster enrollments into game state so a paid month stays open. */
async function withRosterEnrollmentSync(
  userId: string,
  state: GameState,
): Promise<GameState> {
  try {
    const rosterMonths = await listEnrollmentMonthKeysForUser(userId);
    if (rosterMonths.length === 0 && state.challengeEnrolledMonths.length === 0) {
      return state;
    }
    const months = mergeEnrolledMonths(
      state.challengeEnrolledMonths,
      state.challengeEnrolledMonthKey,
      rosterMonths,
    );
    if (
      months.length === state.challengeEnrolledMonths.length &&
      months.every((m, i) => m === state.challengeEnrolledMonths[i])
    ) {
      return state;
    }
    return {
      ...state,
      challengeEnrolledMonths: months,
      // Keep legacy single key if still valid; else latest roster month.
      challengeEnrolledMonthKey:
        state.challengeEnrolledMonthKey &&
        months.includes(state.challengeEnrolledMonthKey)
          ? state.challengeEnrolledMonthKey
          : (months[months.length - 1] ?? null),
    };
  } catch (err) {
    console.error("[progress] roster enroll sync", err);
    return state;
  }
}

export async function readNormalizedGameState(
  userId: string,
): Promise<GameState | null> {
  const client = await sb();
  const { data, error } = await client
    .from(EDUBITE_GAME_STATE_TABLE)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload) return null;
  const normalized = normalizeGameState(data.payload as unknown);
  return withRosterEnrollmentSync(userId, normalized);
}

export async function writeNormalizedGameState(
  userId: string,
  state: GameState,
): Promise<GameState> {
  const incoming = normalizeGameState(state);
  const client = await sb();
  const { data: existingRow, error: readError } = await client
    .from(EDUBITE_GAME_STATE_TABLE)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (readError) throw new Error(readError.message);

  let normalized = incoming;
  let prevForEnroll: GameState | null = null;
  if (existingRow?.payload) {
    try {
      const prev = normalizeGameState(existingRow.payload as unknown);
      prevForEnroll = prev;
      const months = mergeEnrolledMonths(
        incoming.challengeEnrolledMonths,
        prev.challengeEnrolledMonths,
        incoming.challengeEnrolledMonthKey,
        prev.challengeEnrolledMonthKey,
      );
      const enrolledKey =
        incoming.challengeEnrolledMonthKey ??
        prev.challengeEnrolledMonthKey ??
        (months.length > 0 ? months[months.length - 1]! : null);
      const prevEnrolled =
        Boolean(enrolledKey) &&
        (prev.challengeEnrolledMonthKey === enrolledKey ||
          prev.challengeEnrolledMonths.includes(enrolledKey!));
      const incomingEnrolled =
        Boolean(enrolledKey) &&
        (incoming.challengeEnrolledMonthKey === enrolledKey ||
          incoming.challengeEnrolledMonths.includes(enrolledKey!));
      const stakeAmt = getMonthlyChallengeEntryStakeRdm();
      const newlyEnrolledMonth = months.some(
        (m) =>
          incoming.challengeEnrolledMonths.includes(m) &&
          !prev.challengeEnrolledMonths.includes(m) &&
          m !== prev.challengeEnrolledMonthKey,
      );

      // Stake must stick. Stale client saves must not Math.max RDM back up
      // and undo the entry fee after enroll.
      let rdm = Math.max(incoming.rdm, prev.rdm);
      if (enrolledKey || newlyEnrolledMonth) {
        if ((incomingEnrolled && !prevEnrolled) || newlyEnrolledMonth) {
          rdm = incoming.rdm;
        } else if (!incomingEnrolled && prevEnrolled) {
          rdm = prev.rdm;
        } else if (incomingEnrolled && prevEnrolled) {
          const creditedDelta =
            Math.max(0, incoming.doseRdmCredited - prev.doseRdmCredited) +
            Math.max(
              0,
              incoming.funbrainRdmCredited - prev.funbrainRdmCredited,
            );
          if (
            incoming.rdm > prev.rdm &&
            incoming.rdm - prev.rdm >= stakeAmt &&
            creditedDelta < stakeAmt
          ) {
            // Stale pre-stake snapshot after a successful deduct.
            rdm = prev.rdm;
          } else if (
            prev.rdm > incoming.rdm &&
            prev.rdm - incoming.rdm >= stakeAmt &&
            creditedDelta < stakeAmt
          ) {
            rdm = incoming.rdm;
          } else {
            rdm = Math.max(incoming.rdm, prev.rdm);
          }
        }
      }

      normalized = {
        ...incoming,
        rdm,
        challengeEnrolledMonthKey: enrolledKey,
        challengeEnrolledMonths: months,
        challengePuzzleSubmittedMonthKey:
          incoming.challengePuzzleSubmittedMonthKey ??
          prev.challengePuzzleSubmittedMonthKey,
        dayCriteriaLog: mergeDayCriteriaLogs(
          prev.dayCriteriaLog,
          incoming.dayCriteriaLog,
        ),
        doseDayLog: mergeDoseDayLogs(prev.doseDayLog, incoming.doseDayLog),
        history:
          incoming.history.length >= prev.history.length
            ? incoming.history
            : prev.history,
        funbrain: {
          ...incoming.funbrain,
          highScore: Math.max(
            incoming.funbrain.highScore,
            prev.funbrain.highScore,
          ),
          // Same calendar day only — don't revive yesterday's completion after day roll.
          completed:
            incoming.lastActiveDate === prev.lastActiveDate
              ? incoming.funbrain.completed || prev.funbrain.completed
              : incoming.funbrain.completed,
          finished:
            incoming.lastActiveDate === prev.lastActiveDate
              ? incoming.funbrain.finished ||
                prev.funbrain.finished ||
                incoming.funbrain.completed ||
                prev.funbrain.completed
              : incoming.funbrain.finished || incoming.funbrain.completed,
          score:
            incoming.lastActiveDate === prev.lastActiveDate
              ? Math.max(incoming.funbrain.score, prev.funbrain.score)
              : incoming.funbrain.score,
        },
        dose: {
          ...incoming.dose,
          completed:
            incoming.lastActiveDate === prev.lastActiveDate
              ? incoming.dose.completed || prev.dose.completed
              : incoming.dose.completed,
          completed11:
            incoming.lastActiveDate === prev.lastActiveDate
              ? incoming.dose.completed11 || prev.dose.completed11
              : incoming.dose.completed11,
          completed12:
            incoming.lastActiveDate === prev.lastActiveDate
              ? incoming.dose.completed12 || prev.dose.completed12
              : incoming.dose.completed12,
        },
        pledgeAM:
          incoming.lastActiveDate === prev.lastActiveDate
            ? incoming.pledgeAM || prev.pledgeAM
            : incoming.pledgeAM,
        pledgePM:
          incoming.lastActiveDate === prev.lastActiveDate
            ? incoming.pledgePM || prev.pledgePM
            : incoming.pledgePM,
        doseRdmCredited: Math.max(
          incoming.doseRdmCredited,
          prev.doseRdmCredited,
        ),
        funbrainRdmCredited:
          incoming.lastActiveDate === prev.lastActiveDate
            ? Math.max(incoming.funbrainRdmCredited, prev.funbrainRdmCredited)
            : incoming.funbrainRdmCredited,
        puzzleCompleted:
          incoming.lastActiveDate === prev.lastActiveDate
            ? incoming.puzzleCompleted || prev.puzzleCompleted
            : incoming.puzzleCompleted,
      };
    } catch {
      normalized = incoming;
    }
  }

  const { error } = await client.from(EDUBITE_GAME_STATE_TABLE).upsert(
    {
      user_id: userId,
      payload: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);

  // Roster sync only when enrollment months actually change — not on every save.
  const enrollKey = normalized.challengeEnrolledMonthKey;
  if (enrollKey) {
    const prevMonths = prevForEnroll?.challengeEnrolledMonths ?? [];
    const monthsGrew = normalized.challengeEnrolledMonths.some(
      (m) => !prevMonths.includes(m),
    );
    const keyChanged =
      !prevForEnroll ||
      prevForEnroll.challengeEnrolledMonthKey !== enrollKey;
    if (!prevForEnroll || monthsGrew || keyChanged) {
      void upsertChallengeEnrollment({
        userId,
        monthKey: enrollKey,
        displayName: "Learner",
        stakeRdm: getMonthlyChallengeEntryStakeRdm(),
        overwrite: false,
      });
    }
  }

  return normalized;
}

export async function readNormalizedBrainGym(
  userId: string,
): Promise<BrainGymProgress | null> {
  const client = await sb();
  const { data, error } = await client
    .from(EDUBITE_BRAIN_GYM_TABLE)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload) return null;
  return normalizeBrainGymProgress(data.payload as unknown);
}

export async function writeNormalizedBrainGym(
  userId: string,
  progress: BrainGymProgress,
): Promise<BrainGymProgress> {
  const normalized = normalizeBrainGymProgress(progress);
  const client = await sb();
  const { error } = await client.from(EDUBITE_BRAIN_GYM_TABLE).upsert(
    {
      user_id: userId,
      payload: normalized,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw new Error(error.message);
  return normalized;
}

export async function readNormalizedPuzzleProgress(
  userId: string,
): Promise<PuzzleProgress | null> {
  const client = await sb();
  const { data, error } = await client
    .from(EDUBITE_PUZZLE_TABLE)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.payload) return null;
  return normalizePuzzleProgress(data.payload as unknown);
}

export async function lockPuzzleAttempt(
  _userId: string,
  attempt: Omit<PuzzleAttempt, "submittedAt">,
): Promise<{ progress: PuzzleProgress; inserted: boolean }> {
  const client = await sb();
  const { data, error } = await client.rpc("edubite_lock_puzzle_attempt", {
    p_attempt: attempt,
  });
  if (error) throw new Error(error.message);
  const result = data as { progress?: unknown; inserted?: boolean };
  return {
    progress: normalizePuzzleProgress(result.progress),
    inserted: result.inserted === true,
  };
}

export async function applyBrainGymMutation(
  _userId: string,
  progress: BrainGymProgress,
  mutation: BrainGymMutation,
): Promise<{
  progress: BrainGymProgress;
  gameState: GameState | null;
  awarded: number;
}> {
  const normalizedProgress = normalizeBrainGymProgress(progress);
  const client = await sb();
  const { data, error } = await client.rpc("edubite_apply_brain_gym_mutation", {
    p_progress: normalizedProgress,
    p_mutation: mutation,
  });
  if (error) throw new Error(error.message);

  const result = data as {
    progress?: unknown;
    awarded?: number;
    gameState?: unknown;
  };

  return {
    progress: normalizeBrainGymProgress(
      result.progress ?? normalizedProgress,
    ),
    awarded: Number(result.awarded ?? 0),
    gameState: result.gameState
      ? normalizeGameState(result.gameState)
      : null,
  };
}


