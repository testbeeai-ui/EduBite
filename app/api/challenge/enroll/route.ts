import { NextResponse } from "next/server";
import { allowProgressWrite } from "@/lib/api/rate-limit";
import { getRequestUser } from "@/lib/auth/server";
import {
  getChallengeMonthMeta,
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
  isEnrolledForChallengeMonth,
  isInEntryWindow,
  withChallengeEnrollment,
} from "@/lib/challenge/monthly";
import { isValidDateKey } from "@/lib/clock/override-store";
import {
  claimChallengeEnrollment,
  getChallengeEnrollment,
  recordEnrollmentFromUser,
} from "@/lib/db/monthly-challenge";
import { createInitialState } from "@/lib/gamification";
import {
  readNormalizedGameState,
  writeNormalizedGameState,
} from "@/lib/db/supabase-progress";
import { daysBetween, realTodayKey } from "@/lib/utils";

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
function resolveEnrollDateKey(bodyDateKey: string | undefined): string {
  const real = realTodayKey();
  if (!bodyDateKey || !isValidDateKey(bodyDateKey)) return real;
  if (Math.abs(daysBetween(real, bodyDateKey)) > 120) return real;
  return bodyDateKey;
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

    const dateKey = resolveEnrollDateKey(body.dateKey);
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

    const stake = getMonthlyChallengeEntryStakeRdm();
    const unlock = getMonthlyChallengeTargetRdm();
    const existing = await readNormalizedGameState(user.id);
    const base = existing ?? {
      ...createInitialState(),
      signedIn: true,
    };

    if (
      isEnrolledForChallengeMonth(
        monthKey,
        base.challengeEnrolledMonthKey,
        base.challengeEnrolledMonths,
      )
    ) {
      await recordEnrollmentFromUser(user, monthKey);
      const synced = {
        ...base,
        ...withChallengeEnrollment(base, monthKey),
        signedIn: true,
      };
      return NextResponse.json({
        ok: true,
        alreadyEnrolled: true,
        monthKey,
        stakeRdm: stake,
        rdm: synced.rdm,
        challengeEnrolledMonthKey: monthKey,
        challengeEnrolledMonths: synced.challengeEnrolledMonths,
        state: synced,
        message: "You're already in this month's challenge. Good luck!",
      });
    }

    const roster = await getChallengeEnrollment(user.id, monthKey);
    if (roster) {
      // Roster paid — restore access. Never re-charge if below unlock
      // (typical after stake: ~2k RDM left).
      const nextState = await writeNormalizedGameState(user.id, {
        ...base,
        ...withChallengeEnrollment(base, monthKey),
        signedIn: true,
      });
      return NextResponse.json({
        ok: true,
        alreadyEnrolled: true,
        repaired: true,
        monthKey,
        stakeRdm: stake,
        rdm: nextState.rdm,
        challengeEnrolledMonthKey: monthKey,
        challengeEnrolledMonths: nextState.challengeEnrolledMonths,
        state: nextState,
        message: "Welcome back — your Monthly Challenge entry is restored.",
      });
    }

    if (base.rdm < unlock) {
      return NextResponse.json(
        {
          error: `Need ${unlock} RDM to unlock Monthly Challenge (you have ${base.rdm}).`,
          code: "locked_rdm",
          rdm: base.rdm,
          unlockRdm: unlock,
          stakeRdm: stake,
        },
        { status: 403 },
      );
    }

    if (base.rdm < stake) {
      return NextResponse.json(
        {
          error: `Not enough RDM to enter (you have ${base.rdm}).`,
          code: "insufficient_stake",
          rdm: base.rdm,
          stakeRdm: stake,
        },
        { status: 403 },
      );
    }

    const claim = await claimChallengeEnrollment({
      userId: user.id,
      monthKey,
      displayName: displayNameFromAuthUser(user),
      stakeRdm: stake,
    });

    if (claim === "error") {
      return NextResponse.json(
        { error: "Could not reserve challenge entry. Try again." },
        { status: 500 },
      );
    }

    if (claim === "exists") {
      let latest = (await readNormalizedGameState(user.id)) ?? base;
      for (let i = 0; i < 6; i += 1) {
        if (
          isEnrolledForChallengeMonth(
            monthKey,
            latest.challengeEnrolledMonthKey,
            latest.challengeEnrolledMonths,
          )
        ) {
          return NextResponse.json({
            ok: true,
            alreadyEnrolled: true,
            monthKey,
            stakeRdm: stake,
            rdm: latest.rdm,
            challengeEnrolledMonthKey: monthKey,
            challengeEnrolledMonths: latest.challengeEnrolledMonths,
            state: latest,
            message: "You're already in this month's challenge. Good luck!",
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 40));
        latest = (await readNormalizedGameState(user.id)) ?? latest;
      }

      const nextState = await writeNormalizedGameState(user.id, {
        ...latest,
        ...withChallengeEnrollment(latest, monthKey),
        signedIn: true,
      });
      return NextResponse.json({
        ok: true,
        alreadyEnrolled: true,
        monthKey,
        stakeRdm: stake,
        rdm: nextState.rdm,
        challengeEnrolledMonthKey: monthKey,
        challengeEnrolledMonths: nextState.challengeEnrolledMonths,
        state: nextState,
        message: "Welcome back — your Monthly Challenge entry is restored.",
      });
    }

    const nextRdm = base.rdm - stake;
    const nextState = await writeNormalizedGameState(user.id, {
      ...base,
      rdm: nextRdm,
      ...withChallengeEnrollment(base, monthKey),
      signedIn: true,
    });

    return NextResponse.json({
      ok: true,
      alreadyEnrolled: false,
      monthKey,
      stakeRdm: stake,
      rdm: nextState.rdm,
      challengeEnrolledMonthKey: nextState.challengeEnrolledMonthKey,
      challengeEnrolledMonths: nextState.challengeEnrolledMonths,
      state: nextState,
      message: "Thank you! You're in this month's challenge. Good luck!",
    });
  } catch (err) {
    console.error("[api/challenge/enroll POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
