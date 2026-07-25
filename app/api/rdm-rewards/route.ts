import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { RdmRewardKey } from "@/data/rdm-rewards";
import { RDM_REWARD_DEFAULTS } from "@/data/rdm-rewards";
import {
  listRdmRewards,
  updateRdmRewardAmount,
} from "@/lib/db/rdm-rewards";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const KNOWN_KEYS = new Set(RDM_REWARD_DEFAULTS.map((d) => d.key));

/** Public read of current RDM schedule (guests ok — amounts are not secret). */
export async function GET() {
  try {
    const rewards = await listRdmRewards();
    return NextResponse.json(
      { rewards, table: "edubite_rdm_rewards" },
      {
        headers: {
          "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("[api/rdm-rewards GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** Admin: patch one or many reward amounts. */
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

    const updates: { key: RdmRewardKey; amount: number }[] = [];

    if (
      body &&
      typeof body === "object" &&
      "key" in body &&
      "amount" in body
    ) {
      const key = String((body as { key: unknown }).key) as RdmRewardKey;
      const amount = Number((body as { amount: unknown }).amount);
      updates.push({ key, amount });
    } else if (
      body &&
      typeof body === "object" &&
      Array.isArray((body as { updates?: unknown }).updates)
    ) {
      for (const item of (body as { updates: unknown[] }).updates) {
        if (!item || typeof item !== "object") continue;
        const key = String((item as { key: unknown }).key) as RdmRewardKey;
        const amount = Number((item as { amount: unknown }).amount);
        updates.push({ key, amount });
      }
    } else {
      return NextResponse.json(
        { error: "Expected { key, amount } or { updates: [...] }" },
        { status: 400 },
      );
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    for (const u of updates) {
      if (!KNOWN_KEYS.has(u.key)) {
        return NextResponse.json(
          { error: `Unknown reward key: ${u.key}` },
          { status: 400 },
        );
      }
      if (!Number.isFinite(u.amount) || u.amount < 0 || !Number.isInteger(u.amount)) {
        return NextResponse.json(
          { error: `Invalid amount for ${u.key}` },
          { status: 400 },
        );
      }
    }

    const rewards = [];
    for (const u of updates) {
      rewards.push(await updateRdmRewardAmount(u.key, u.amount, gate.user.id));
    }

    return NextResponse.json({
      rewards,
      table: "edubite_rdm_rewards",
    });
  } catch (err) {
    console.error("[api/rdm-rewards PATCH]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
