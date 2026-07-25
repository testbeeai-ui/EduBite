import { NextResponse } from "next/server";
import { resolveContentDateKey } from "@/lib/clock/resolve-content-date";
import { loadInspiration } from "@/lib/content/inspiration";

export const runtime = "nodejs";

/** Inspiration for a calendar day. Optional `dateKey` follows App Clock. */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateKey = resolveContentDateKey(url.searchParams.get("dateKey"));
    const data = await loadInspiration(dateKey);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[api/content/inspiration]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
