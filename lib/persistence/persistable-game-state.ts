import { FUNBRAIN_DURATION_SEC } from "@/data/config";
import type { GameState } from "@/lib/types";

/** Persist Gyan playtime in 30s buckets so 1s ticks do not spam the network. */
const GYAN_PERSIST_QUANTUM_MS = 30_000;

/**
 * Strip / quantize ephemeral fields before cloud save.
 * FunBrain countdown and fine-grained Gyan timers must not drive API traffic.
 */
export function toPersistableGameState(state: GameState): GameState {
  return {
    ...state,
    gyanTimeMs:
      Math.floor(state.gyanTimeMs / GYAN_PERSIST_QUANTUM_MS) *
      GYAN_PERSIST_QUANTUM_MS,
    funbrain: {
      ...state.funbrain,
      // Mid-run countdown is ephemeral — normalizeFunbrain resets running on load.
      timeLeft: state.funbrain.running
        ? FUNBRAIN_DURATION_SEC
        : state.funbrain.timeLeft,
    },
  };
}
