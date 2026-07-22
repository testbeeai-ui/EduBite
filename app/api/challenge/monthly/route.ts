import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  buildChallengeProgress,
  getChallengeMonthMeta,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
} from "@/lib/challenge/monthly";
import { readNormalizedGameState } from "@/lib/db/supabase-progress";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import { realTodayKey } from "@/lib/utils";

export const runtime = "nodejs";

const TABLE = "edubite_monthly_challenge_entries";

type WinnerRow = {
  display_name: string;
  submitted_at: string;
};

function displayNameFromUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): string {
  const meta = user.user_metadata ?? {};
  const full =
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta.name === "string" && meta.name.trim()) ||
    "";
  if (full) return full.slice(0, 80);
  const email = user.email?.trim();
  if (email) {
    const local = email.split("@")[0] ?? "Learner";
    return local.slice(0, 40);
  }
  return "Learner";
}

function formatWinnerTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }) + " IST";
  } catch {
    return iso;
  }
}

export async function GET(request: Request) {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monthKeyParam = searchParams.get("monthKey");
    const dateKey = realTodayKey();
    const meta = getChallengeMonthMeta(dateKey);
    const monthKey =
      monthKeyParam && /^\d{4}-\d{2}$/.test(monthKeyParam)
        ? monthKeyParam
        : meta.monthKey;

    const client = await createEdubiteSupabaseServer();

    const { data: winnersRaw, error: winnersError } = await client
      .from(TABLE)
      .select("display_name, submitted_at")
      .eq("month_key", monthKey)
      .eq("is_winner", true)
      .order("submitted_at", { ascending: true })
      .limit(MONTHLY_CHALLENGE_WINNER_SLOTS);

    if (winnersError) {
      console.error("[api/challenge/monthly GET winners]", winnersError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { data: own, error: ownError } = await client
      .from(TABLE)
      .select("submitted_at")
      .eq("month_key", monthKey)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownError) {
      console.error("[api/challenge/monthly GET own]", ownError);
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const winnerSlots: Array<{ name: string; time: string } | null> = (
      (winnersRaw ?? []) as WinnerRow[]
    ).map((row) => ({
      name: row.display_name,
      time: formatWinnerTime(row.submitted_at),
    }));

    while (winnerSlots.length < MONTHLY_CHALLENGE_WINNER_SLOTS) {
      winnerSlots.push(null);
    }

    return NextResponse.json({
      monthKey,
      winners: winnerSlots.slice(0, MONTHLY_CHALLENGE_WINNER_SLOTS),
      submitted: Boolean(own?.submitted_at),
      submittedAt: own?.submitted_at ?? null,
    });
  } catch (err) {
    console.error("[api/challenge/monthly GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    let body: { answer?: string; monthKey?: string; dateKey?: string } = {};
    try {
      body = (await request.json()) as {
        answer?: string;
        monthKey?: string;
        dateKey?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const answer = typeof body.answer === "string" ? body.answer.trim() : "";
    if (answer.length < 1 || answer.length > 2000) {
      return NextResponse.json(
        { error: "Answer must be 1–2000 characters" },
        { status: 400 },
      );
    }

    // Admins may pass a simulated dateKey (App Clock) for QA; everyone else uses real today.
    const admin = isAdminEmail(user.email);
    const dateKey =
      admin &&
      typeof body.dateKey === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.dateKey)
        ? body.dateKey
        : realTodayKey();
    const meta = getChallengeMonthMeta(dateKey);
    const monthKey =
      body.monthKey && /^\d{4}-\d{2}$/.test(body.monthKey)
        ? body.monthKey
        : meta.monthKey;

    if (monthKey !== meta.monthKey) {
      return NextResponse.json(
        { error: "Can only submit for the current month" },
        { status: 400 },
      );
    }

    if (dateKey !== meta.lastDayKey) {
      return NextResponse.json(
        { error: `Puzzle opens on ${meta.lastDayKey}` },
        { status: 403 },
      );
    }

    const gameState = await readNormalizedGameState(user.id);
    if (!gameState) {
      return NextResponse.json({ error: "No progress found" }, { status: 400 });
    }

    if (gameState.challengeEnrolledMonthKey !== monthKey) {
      return NextResponse.json(
        { error: "You must enroll in this month's challenge first" },
        { status: 403 },
      );
    }

    const progress = buildChallengeProgress(gameState.doseDayLog, dateKey);
    if (!progress.eligibleForPuzzle) {
      return NextResponse.json(
        {
          error: `Need a ${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day Daily Dose streak at 80%+ to enter the final puzzle`,
        },
        { status: 403 },
      );
    }

    const client = await createEdubiteSupabaseServer();
    const displayName = displayNameFromUser(user);

    const { data, error } = await client
      .from(TABLE)
      .insert({
        user_id: user.id,
        month_key: monthKey,
        answer,
        display_name: displayName,
      })
      .select("submitted_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "You already submitted an entry this month" },
          { status: 409 },
        );
      }
      // Table may not exist yet in local/dev — surface a clear message
      console.error("[api/challenge/monthly POST]", error);
      return NextResponse.json(
        { error: error.message || "Server error" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      submittedAt: data.submitted_at,
      message:
        "Entry recorded. Edubite will verify correctness and notify winners on WhatsApp and email.",
    });
  } catch (err) {
    console.error("[api/challenge/monthly POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
