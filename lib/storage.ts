import { STORAGE_KEY } from "@/data/config";
import { normalizeGameState } from "@/lib/db/normalize";
import type { SaveResult } from "@/lib/persistence/save-queue";
import type { GameState } from "@/lib/types";

function legacyScopedKey(userId: string): string {
  return `${STORAGE_KEY}:user:${userId}`;
}

/**
 * Read only user-scoped legacy localStorage. Unscoped shared keys are never
 * promoted (prevents cross-account contamination).
 */
function readScopedLegacyLocal(userId: string): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const scoped = localStorage.getItem(legacyScopedKey(userId));
    if (scoped) return normalizeGameState(JSON.parse(scoped) as unknown);
  } catch {
    /* ignore */
  }
  return null;
}

function clearScopedLegacyLocal(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(legacyScopedKey(userId));
}

/** Guests: no persistence. Signed-in: Supabase via /api/progress/game. */
export async function loadGameState(
  userId: string | null,
): Promise<GameState | null> {
  if (!userId) return null;

  try {
    const res = await fetch("/api/progress/game", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) {
      console.warn(`game load failed: ${res.status}`);
      return readScopedLegacyLocal(userId);
    }

    const data = (await res.json()) as { state: GameState | null };
    if (data.state) return normalizeGameState(data.state);

    const legacy = readScopedLegacyLocal(userId);
    if (legacy) {
      const save = await saveGameState(userId, legacy);
      if (save.ok) clearScopedLegacyLocal(userId);
      return legacy;
    }
    return null;
  } catch (err) {
    console.warn(
      "loadGameState failed: check network/server status.",
      err instanceof Error ? err.message : err,
    );
    return readScopedLegacyLocal(userId);
  }
}

export async function saveGameState(
  userId: string | null,
  state: GameState,
): Promise<SaveResult> {
  if (!userId) return { ok: false, error: "Not signed in" };

  try {
    const res = await fetch("/api/progress/game", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: normalizeGameState(state) }),
    });
    if (!res.ok) {
      const error = `game save failed: ${res.status}`;
      console.warn(error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (err) {
    const error =
      err instanceof Error ? err.message : "game save network error";
    console.warn("saveGameState failed:", error);
    return { ok: false, error };
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export const storageAdapter = {
  load: loadGameState,
  save: saveGameState,
  clear: clearGameState,
};
