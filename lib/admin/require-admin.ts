import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin/allowlist";
import { getRequestUser } from "@/lib/auth/server";

export type AdminGateResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/** Auth + email allowlist for every /api/admin/* route. */
export async function requireAdmin(): Promise<AdminGateResult> {
  const user = await getRequestUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!isAdminEmail(user.email)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}
