import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/server";
import {
  assertPayloadSize,
  normalizeBrainGymProgress,
} from "@/lib/db/normalize";
import {
  applyBrainGymSession,
  readNormalizedBrainGym,
  writeNormalizedBrainGym,
} from "@/lib/db/supabase-progress";
import {
  readNormalizedBrainGym as readSqliteBrainGym,
} from "@/lib/db/sqlite";
import type { BrainGymProgress } from "@/lib/brain-gym/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let progress = await readNormalizedBrainGym(user.id);
    if (!progress) {
      try {
        const legacy = readSqliteBrainGym(user.id);
        if (legacy) {
          progress = await writeNormalizedBrainGym(user.id, legacy);
        }
      } catch {
        // ignore sqlite migrate failures
      }
    }
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

    const reward = (body as {
      reward?: { claimId?: string; rdmDelta?: number };
    })?.reward;

    const result = await applyBrainGymSession(
      user.id,
      normalizeBrainGymProgress(progress),
      reward?.claimId && typeof reward.rdmDelta === "number"
        ? { claimId: reward.claimId, rdmDelta: reward.rdmDelta }
        : null,
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
    console.error("[api/progress/brain-gym PUT]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
