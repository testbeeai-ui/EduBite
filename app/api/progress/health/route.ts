import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/server";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Public content tables — readable with anon key (no session). */
const PUBLIC_TABLES = [
  "edubite_inspiration_quotes",
  "edubite_inspiration_blocks",
  "edubite_pledge_reel_days",
  "edubite_pledge_reel_slides",
] as const;

/** User progress tables — require authenticated session + RLS. */
const PRIVATE_TABLES = [
  "edubite_game_state",
  "edubite_brain_gym_progress",
  "edubite_puzzle_progress",
  "edubite_reward_claims",
] as const;

async function probeTable(
  client: SupabaseClient,
  table: string,
): Promise<string> {
  const { error } = await client.from(table).select("*").limit(1);
  return error ? error.message : "ok";
}

/**
 * Production Supabase connectivity check.
 * - Always probes public content tables (no auth required) → 200.
 * - If signed in, also probes private progress tables.
 * Does NOT return 401 — missing auth is reported as authenticated:false.
 */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
    if (!url || !key) {
      return NextResponse.json(
        {
          ok: false,
          store: "supabase",
          error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
        },
        { status: 503 },
      );
    }

    const anon = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    const publicChecks: Record<string, string> = {};
    for (const table of PUBLIC_TABLES) {
      publicChecks[table] = await probeTable(anon, table);
    }

    const user = await getRequestUser();
    const privateChecks: Record<string, string> = {};
    if (user) {
      const supabase = await createEdubiteSupabaseServer();
      for (const table of PRIVATE_TABLES) {
        privateChecks[table] = await probeTable(supabase, table);
      }
    }

    const publicOk = Object.values(publicChecks).every((v) => v === "ok");
    const privateOk =
      !user || Object.values(privateChecks).every((v) => v === "ok");
    const ok = publicOk && privateOk;

    return NextResponse.json({
      ok,
      store: "supabase",
      project: "edubite_*",
      authenticated: Boolean(user),
      userId: user?.id ?? null,
      public: publicChecks,
      private: user
        ? privateChecks
        : {
            note: "Sign in to probe edubite_game_state / brain_gym / puzzles / rewards",
          },
    });
  } catch (err) {
    console.error("[api/progress/health GET]", err);
    return NextResponse.json(
      {
        ok: false,
        store: "supabase",
        error: err instanceof Error ? err.message : "Server error",
      },
      { status: 500 },
    );
  }
}
