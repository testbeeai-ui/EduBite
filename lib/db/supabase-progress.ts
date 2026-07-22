import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BrainGymMutation,
  BrainGymProgress,
} from "@/lib/brain-gym/types";
import {
  normalizeBrainGymProgress,
  normalizeGameState,
  normalizePuzzleProgress,
} from "@/lib/db/normalize";
import type { PuzzleAttempt, PuzzleProgress } from "@/lib/puzzles/types";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import type { GameState } from "@/lib/types";

export const EDUBITE_GAME_STATE_TABLE = "edubite_game_state";
export const EDUBITE_BRAIN_GYM_TABLE = "edubite_brain_gym_progress";
export const EDUBITE_PUZZLE_TABLE = "edubite_puzzle_progress";

async function sb(): Promise<SupabaseClient> {
  return createEdubiteSupabaseServer();
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
  return normalizeGameState(data.payload as unknown);
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
  if (existingRow?.payload) {
    try {
      const prev = normalizeGameState(existingRow.payload as unknown);
      normalized = {
        ...incoming,
        rdm: Math.max(incoming.rdm, prev.rdm),
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


