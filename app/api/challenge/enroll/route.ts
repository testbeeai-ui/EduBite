import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  getChallengeMonthMeta,
  isInEntryWindow,
} from "@/lib/challenge/monthly";
import { isValidDateKey } from "@/lib/clock/override-store";
import { enrollChallengeAtomically } from "@/lib/db/monthly-challenge";
import { realTodayKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function displayNameFromAuthUser(user: {
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
  if (email) return (email.split("@")[0] ?? "Learner").slice(0, 40);
  return "Learner";
}

/**
 * Resolve the effective "today" for entry-window checks.
 * Clients may send AppClock override dateKey so admin QA matches the UI.
 */
function resolveEnrollDateKey(
  bodyDateKey: string | undefined,
  admin: boolean,
): string {
  if (admin && bodyDateKey && isValidDateKey(bodyDateKey)) {
    return bodyDateKey;
  }
  return realTodayKey();
}

/**
 * Server-authoritative Monthly Challenge enroll:
 * 1) require unlock balance (target RDM, default 5,000)
 * 2) claim enrollment row (race-safe)
 * 3) deduct entry stake (default 3,000) exactly once
 * 4) mark challengeEnrolledMonthKey so UI stays open after the balance drops
 */
export async function POST(request: Request) {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = allowProgressWrite(user.id);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests", retryAfterSec: limited.retryAfterSec },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    let body: { monthKey?: string; dateKey?: string } = {};
    try {
      body = (await request.json()) as { monthKey?: string; dateKey?: string };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const admin = isAdminEmail(user.email);
    const dateKey = resolveEnrollDateKey(body.dateKey, admin);
    const meta = getChallengeMonthMeta(dateKey);
    const monthKey =
      body.monthKey && /^\d{4}-\d{2}$/.test(body.monthKey)
        ? body.monthKey
        : meta.monthKey;

    if (monthKey !== meta.monthKey) {
      return NextResponse.json(
        {
          error: `Month mismatch — UI month ${monthKey} vs date ${dateKey} (${meta.monthKey}). Clear or re-apply the admin date override.`,
          code: "month_mismatch",
          monthKey,
          dateKey,
          expectedMonthKey: meta.monthKey,
        },
        { status: 400 },
      );
    }

    if (!isInEntryWindow(dateKey)) {
      return NextResponse.json(
        {
          error: `Entry window is days 1–5 only (today is ${dateKey}).`,
          code: "locked_window",
          dateKey,
        },
        { status: 403 },
      );
    }

    const result = await enrollChallengeAtomically({
      monthKey,
      displayName: displayNameFromAuthUser(user),
      dateKey: admin ? dateKey : undefined,
    });
    const state = result.state;

    return NextResponse.json({
      ok: true,
      alreadyEnrolled: result.alreadyEnrolled,
      monthKey: result.monthKey,
      stakeRdm: result.stakeRdm,
      rdm: state.rdm,
      challengeEnrolledMonthKey: state.challengeEnrolledMonthKey,
      challengeEnrolledMonths: state.challengeEnrolledMonths,
      state,
      message: result.alreadyEnrolled
        ? "You're already in this month's challenge. Good luck!"
        : "Thank you! You're in this month's challenge. Good luck!",
    });
  } catch (err) {
    console.error("[api/challenge/enroll POST]", err);
    const message = err instanceof Error ? err.message : "Server error";
    if (
      message.includes("insufficient RDM") ||
      message.includes("entry window") ||
      message.includes("invalid challenge month")
    ) {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
