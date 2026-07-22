import { NextResponse } from "next/server";
import { loadInspiration } from "@/lib/content/inspiration";

export const runtime = "nodejs";

/** Same for every user on a given calendar day — safe to CDN-cache briefly. */
export async function GET() {
  try {
    const data = await loadInspiration();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=3600, max-age=60",
      },
    });
  } catch (err) {
    console.error("[api/content/inspiration]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
