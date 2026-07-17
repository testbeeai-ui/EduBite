import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/server";
import {
  assertPayloadSize,
  normalizePuzzleProgress,
} from "@/lib/db/normalize";
import {
  readNormalizedPuzzleProgress,
  writeNormalizedPuzzleProgress,
} from "@/lib/db/supabase-progress";
import type { PuzzleProgress } from "@/lib/puzzles/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await readNormalizedPuzzleProgress(user.id);
    return NextResponse.json({
      progress,
      store: "edubite_puzzle_progress",
    });
  } catch (err) {
    console.error("[api/progress/puzzles GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      const text = await request.text();
      assertPayloadSize(text);
      body = JSON.parse(text) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const progress = (body as { progress?: PuzzleProgress })?.progress;
    if (!progress || typeof progress !== "object") {
      return NextResponse.json({ error: "Missing progress" }, { status: 400 });
    }

    const normalized = await writeNormalizedPuzzleProgress(
      user.id,
      normalizePuzzleProgress(progress),
    );
    return NextResponse.json({
      ok: true,
      progress: normalized,
      store: "edubite_puzzle_progress",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Payload too large") {
      return NextResponse.json({ error: message }, { status: 413 });
    }
    console.error("[api/progress/puzzles PUT]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
