import type { SupabaseClient } from "@supabase/supabase-js";
import type { BrainGymProgress } from "@/lib/brain-gym/types";
import {
  normalizeBrainGymProgress,
  normalizeGameState,
  normalizePuzzleProgress,
} from "@/lib/db/normalize";
import type { PuzzleProgress } from "@/lib/puzzles/types";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import type { GameState } from "@/lib/types";

export const EDUBITE_GAME_STATE_TABLE = "edubite_game_state";
export const EDUBITE_BRAIN_GYM_TABLE = "edubite_brain_gym_progress";
export const EDUBITE_PUZZLE_TABLE = "edubite_puzzle_progress";

type BrainGymRewardClaim = {
  claimId: string;
  rdmDelta: number;
};

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
  const existing = await readNormalizedGameStateRaw(userId);
  let normalized = incoming;
  if (existing) {
    try {
      const prev = normalizeGameState(existing);
      normalized = {
        ...incoming,
        rdm: Math.max(incoming.rdm, prev.rdm),
        funbrain: {
          ...incoming.funbrain,
          highScore: Math.max(
            incoming.funbrain.highScore,
            prev.funbrain.highScore,
          ),
        },
        doseRdmCredited: Math.max(
          incoming.doseRdmCredited,
          prev.doseRdmCredited,
        ),
        funbrainRdmCredited: Math.max(
          incoming.funbrainRdmCredited,
          prev.funbrainRdmCredited,
        ),
      };
    } catch {
      normalized = incoming;
    }
  }

  const client = await sb();
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

async function readNormalizedGameStateRaw(
  userId: string,
): Promise<unknown | null> {
  const client = await sb();
  const { data, error } = await client
    .from(EDUBITE_GAME_STATE_TABLE)
    .select("payload")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.payload ?? null;
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

export async function writeNormalizedPuzzleProgress(
  userId: string,
  progress: PuzzleProgress,
): Promise<PuzzleProgress> {
  const normalized = normalizePuzzleProgress(progress);
  const client = await sb();
  const { error } = await client.from(EDUBITE_PUZZLE_TABLE).upsert(
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

export async function applyBrainGymSession(
  _userId: string,
  progress: BrainGymProgress,
  reward?: BrainGymRewardClaim | null,
): Promise<{
  progress: BrainGymProgress;
  gameState: GameState | null;
  awarded: number;
}> {
  const normalizedProgress = normalizeBrainGymProgress(progress);
  const client = await sb();
  const { data, error } = await client.rpc("edubite_apply_brain_gym_session", {
    p_progress: normalizedProgress,
    p_claim_id: reward?.claimId ?? null,
    p_rdm_delta: reward?.rdmDelta ?? 0,
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

/** One-time lift from local SQLite if Supabase row missing. */
export async function migrateGameStateFromSqliteIfNeeded(
  userId: string,
  sqliteReader: () => GameState | null,
): Promise<GameState | null> {
  const existing = await readNormalizedGameState(userId);
  if (existing) return existing;
  try {
    const legacy = sqliteReader();
    if (!legacy) return null;
    return writeNormalizedGameState(userId, legacy);
  } catch {
    return null;
  }
}
