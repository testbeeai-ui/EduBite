import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/server";
import {
  assertPayloadSize,
} from "@/lib/db/normalize";
import {
  lockPuzzleAttempt,
  readNormalizedPuzzleProgress,
} from "@/lib/db/supabase-progress";
import { puzzleForDate } from "@/lib/puzzles/daily";
import type { PuzzleAttempt } from "@/lib/puzzles/types";

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

    const attempt = (body as {
      attempt?: Omit<PuzzleAttempt, "submittedAt">;
    })?.attempt;
    if (!attempt || typeof attempt !== "object") {
      return NextResponse.json({ error: "Missing attempt" }, { status: 400 });
    }
    if (
      typeof attempt.puzzleId !== "string" ||
      typeof attempt.dateKey !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(attempt.dateKey) ||
      typeof attempt.note !== "string"
    ) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
    }
    const puzzle = puzzleForDate(attempt.dateKey);
    const validBase =
      puzzle !== undefined &&
      attempt.puzzleId === puzzle.id &&
      (attempt.responseType === "open-ended" ||
        attempt.responseType === "mcq");
    const validResponse =
      puzzle.kind === "mcq"
        ? attempt.responseType === "mcq" &&
          Number.isInteger(attempt.selectedOptionIndex) &&
          attempt.selectedOptionIndex !== null &&
          attempt.selectedOptionIndex >= 0 &&
          attempt.selectedOptionIndex < puzzle.options.length
        : attempt.responseType === "open-ended" &&
          attempt.selectedOptionIndex === null &&
          typeof attempt.note === "string" &&
          attempt.note.trim().length > 0;
    if (!validBase || !validResponse) {
      return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
    }
    const result = await lockPuzzleAttempt(user.id, {
      puzzleId: puzzle.id,
      dateKey: attempt.dateKey,
      responseType: attempt.responseType,
      note: attempt.responseType === "open-ended" ? attempt.note : "",
      selectedOptionIndex:
        attempt.responseType === "mcq" ? attempt.selectedOptionIndex : null,
    });
    return NextResponse.json({
      ok: true,
      progress: result.progress,
      inserted: result.inserted,
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
