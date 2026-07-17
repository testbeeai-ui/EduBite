import { NextResponse } from "next/server";
import { isAdminEmail, normalizeAdminEmail } from "@/lib/admin/allowlist";
import { getRequestUser } from "@/lib/auth/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getRequestUser();
    if (!user) {
      return NextResponse.json(
        { email: null, allowed: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const email = normalizeAdminEmail(user.email);
    const allowed = isAdminEmail(email);
    if (!allowed) {
      return NextResponse.json(
        {
          email,
          allowed: false,
          userId: user.id,
          error: "Forbidden — not on admin allowlist",
        },
        { status: 403 },
      );
    }
    return NextResponse.json({
      email,
      allowed: true,
      userId: user.id,
    });
  } catch (err) {
    console.error("[api/admin/me]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
