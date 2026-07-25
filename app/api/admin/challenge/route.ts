import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getChallengeMonthMeta } from "@/lib/challenge/monthly";
import {
  backfillEnrollmentsFromGameState,
  declareWinnersForMonth,
  listChallengeAdminBoard,
  patchChallengeEntry,
} from "@/lib/db/monthly-challenge";
import { realTodayKey } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function resolveMonthKey(raw: string | null): string {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) return raw;
  return getChallengeMonthMeta(realTodayKey()).monthKey;
}

/** Admin: participants + streak stats + submissions for a month. */
export async function GET(request: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const { searchParams } = new URL(request.url);
    const monthKey = resolveMonthKey(searchParams.get("monthKey"));
    const asOfDate = searchParams.get("dateKey");
    const backfill = searchParams.get("backfill") === "1";

    if (backfill) {
      await backfillEnrollmentsFromGameState(monthKey);
    }

    const board = await listChallengeAdminBoard(
      monthKey,
      asOfDate && /^\d{4}-\d{2}-\d{2}$/.test(asOfDate) ? asOfDate : undefined,
    );
    return NextResponse.json({
      ...board,
      tables: {
        enrollments: "edubite_monthly_challenge_enrollments",
        entries: "edubite_monthly_challenge_entries",
      },
    });
  } catch (err) {
    console.error("[api/admin/challenge GET]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Admin actions:
 * - { action: "verify", entryId, verifiedCorrect }
 * - { action: "winner", entryId, isWinner }
 * - { action: "declare_winners", monthKey } — first 5 verified by submit time
 * - { action: "backfill", monthKey }
 */
export async function PATCH(request: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body !== "object" || !("action" in body)) {
      return NextResponse.json(
        { error: "Expected { action, ... }" },
        { status: 400 },
      );
    }

    const action = String((body as { action: unknown }).action);

    if (action === "backfill") {
      const rawMonth =
        typeof (body as { monthKey?: unknown }).monthKey === "string"
          ? String((body as { monthKey?: unknown }).monthKey)
          : null;
      const monthKey = resolveMonthKey(rawMonth);
      const written = await backfillEnrollmentsFromGameState(monthKey);
      const board = await listChallengeAdminBoard(monthKey);
      return NextResponse.json({ ok: true, written, ...board });
    }

    if (action === "declare_winners") {
      const rawMonth =
        typeof (body as { monthKey?: unknown }).monthKey === "string"
          ? String((body as { monthKey?: unknown }).monthKey)
          : null;
      const monthKey = resolveMonthKey(rawMonth);
      const result = await declareWinnersForMonth(monthKey, gate.user.id);
      const board = await listChallengeAdminBoard(monthKey);
      return NextResponse.json({ ok: true, ...result, ...board });
    }

    if (action === "verify" || action === "winner") {
      const entryId = String((body as { entryId?: unknown }).entryId ?? "");
      if (!entryId) {
        return NextResponse.json({ error: "entryId required" }, { status: 400 });
      }

      if (action === "verify") {
        const verifiedCorrect = Boolean(
          (body as { verifiedCorrect?: unknown }).verifiedCorrect,
        );
        const entry = await patchChallengeEntry({
          entryId,
          adminUserId: gate.user.id,
          verifiedCorrect,
        });
        const board = await listChallengeAdminBoard(entry.month_key);
        return NextResponse.json({ ok: true, entry, ...board });
      }

      const isWinner = Boolean((body as { isWinner?: unknown }).isWinner);
      const entry = await patchChallengeEntry({
        entryId,
        adminUserId: gate.user.id,
        isWinner,
      });
      const board = await listChallengeAdminBoard(entry.month_key);
      return NextResponse.json({ ok: true, entry, ...board });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err) {
    console.error("[api/admin/challenge PATCH]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
