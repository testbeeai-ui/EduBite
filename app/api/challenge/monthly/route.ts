import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  getChallengeMonthMeta,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
} from "@/lib/challenge/monthly";
import {
  listChallengeWinners,
  submitChallengeAtomically,
} from "@/lib/db/monthly-challenge";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import { realTodayKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
    const winnersRaw = await listChallengeWinners(monthKey);

    const { data: own, error: ownError } = await client
      .from("edubite_monthly_challenge_entries")
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

    const result = await submitChallengeAtomically({
      monthKey,
      answer,
      displayName: displayNameFromUser(user),
      dateKey: admin ? dateKey : undefined,
    });

    return NextResponse.json({
      ok: true,
      submittedAt: result.submittedAt,
      state: result.state,
      message:
        "Entry recorded. Edubite will verify correctness and notify winners on WhatsApp and email.",
    });
  } catch (err) {
    console.error("[api/challenge/monthly POST]", err);
    const message = err instanceof Error ? err.message : "Server error";
    if (message.includes("already submitted")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (
      message.includes("verified enrollment") ||
      message.includes("15-day") ||
      message.includes("not open") ||
      message.includes("invalid challenge month")
    ) {
      return NextResponse.json(
        {
          error: message.includes("15-day")
            ? `Need a ${MONTHLY_CHALLENGE_STREAK_REQUIRED}-day full journey streak (complete all 5 daily tasks) to enter the final puzzle`
            : message,
        },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
