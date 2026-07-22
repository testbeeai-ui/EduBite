import { NextResponse } from "next/server";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  assertPayloadSize,
  normalizeGameState,
} from "@/lib/db/normalize";
import {
  readNormalizedGameState,
  writeNormalizedGameState,
} from "@/lib/db/supabase-progress";
import type { GameState } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await readNormalizedGameState(user.id);
    return NextResponse.json({
      state,
      store: "edubite_game_state",
    });
  } catch (err) {
    console.error("[api/progress/game GET]", err);
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

    const state = (body as { state?: GameState })?.state;
    if (!state || typeof state !== "object") {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }

    const normalized = await writeNormalizedGameState(
      user.id,
      normalizeGameState(state),
    );
    return NextResponse.json({
      ok: true,
      state: normalized,
      store: "edubite_game_state",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Payload too large") {
      return NextResponse.json({ error: message }, { status: 413 });
    }
    console.error("[api/progress/game PUT]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
