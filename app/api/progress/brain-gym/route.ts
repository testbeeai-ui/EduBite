import { NextResponse } from "next/server";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  assertPayloadSize,
  normalizeBrainGymProgress,
} from "@/lib/db/normalize";
import {
  applyBrainGymMutation,
  readNormalizedBrainGym,
} from "@/lib/db/supabase-progress";
import { GAMES } from "@/data/brain-gym/registry";
import type {
  BrainGymMutation,
  BrainGymProgress,
  Difficulty,
  GameId,
} from "@/lib/brain-gym/types";

export const runtime = "nodejs";

const GAME_IDS = new Set<GameId>(GAMES.map((game) => game.id));
const DIFFICULTIES = new Set<Difficulty>(["easy", "medium", "hard"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMutation(raw: unknown): BrainGymMutation | null {
  if (!isRecord(raw) || typeof raw.type !== "string") return null;
  if (raw.type === "initialize") return { type: "initialize" };
  if (raw.type === "sound" && typeof raw.enabled === "boolean") {
    return { type: "sound", enabled: raw.enabled };
  }
  if (
    raw.type === "favorite" &&
    GAME_IDS.has(raw.gameId as GameId) &&
    typeof raw.favorite === "boolean"
  ) {
    return {
      type: "favorite",
      gameId: raw.gameId as GameId,
      favorite: raw.favorite,
    };
  }
  if (
    raw.type !== "session" ||
    typeof raw.sessionId !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(raw.sessionId) ||
    !GAME_IDS.has(raw.gameId as GameId) ||
    !isRecord(raw.result) ||
    !DIFFICULTIES.has(raw.result.difficulty as Difficulty) ||
    typeof raw.result.won !== "boolean" ||
    typeof raw.result.score !== "number" ||
    !Number.isFinite(raw.result.score) ||
    raw.result.score > 1_000_000 ||
    typeof raw.result.timeMs !== "number" ||
    !Number.isFinite(raw.result.timeMs) ||
    raw.result.timeMs < 0 ||
    raw.result.timeMs > 86_400_000 ||
    typeof raw.isDaily !== "boolean" ||
    !isRecord(raw.baseProgress)
  ) {
    return null;
  }
  return {
    type: "session",
    sessionId: raw.sessionId,
    gameId: raw.gameId as GameId,
    result: {
      score: Math.max(0, raw.result.score),
      won: raw.result.won,
      timeMs: raw.result.timeMs,
      difficulty: raw.result.difficulty as Difficulty,
    },
    isDaily: raw.isDaily,
    baseProgress: normalizeBrainGymProgress(raw.baseProgress),
  };
}

export async function GET() {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await readNormalizedBrainGym(user.id);
    return NextResponse.json({
      progress,
      store: "edubite_brain_gym_progress",
    });
  } catch (err) {
    console.error("[api/progress/brain-gym GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = allowProgressWrite(user.id);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many saves", retryAfterSec: limited.retryAfterSec },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    let body: unknown;
    try {
      const text = await request.text();
      assertPayloadSize(text);
      body = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const progress = (body as { progress?: BrainGymProgress })?.progress;
    if (!progress || typeof progress !== "object") {
      return NextResponse.json({ error: "Missing progress" }, { status: 400 });
    }

    const mutation = parseMutation(
      (body as { mutation?: unknown })?.mutation,
    );
    if (!mutation) {
      return NextResponse.json({ error: "Invalid mutation" }, { status: 400 });
    }

    const result = await applyBrainGymMutation(
      user.id,
      normalizeBrainGymProgress(progress),
      mutation,
    );

    return NextResponse.json({
      ok: true,
      progress: result.progress,
      awarded: result.awarded,
      gameState: result.gameState,
      store: "edubite_brain_gym_progress",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Payload too large") {
      return NextResponse.json({ error: message }, { status: 413 });
    }
    if (message.includes("difficulty mastered")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    console.error("[api/progress/brain-gym PUT]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
