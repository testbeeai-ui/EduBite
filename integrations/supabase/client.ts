"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local (same values as Web/).",
  );
}

/**
 * Cookie-backed session via @supabase/ssr — same pattern as Edublast Web.
 * Same Supabase project = same auth.users / profiles as Edublast.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  auth: {
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
});
