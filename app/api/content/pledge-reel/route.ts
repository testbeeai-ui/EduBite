import { NextResponse } from "next/server";
import { loadEdubitePledgeReelForJoinedDate } from "@/lib/db/pledge-reels-supabase";
import { todayKey } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Morning (am) or night (pm) pledge reel for a joinedDate.
 * Loads only the single scheduled day (not the full catalog).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const joinedParam = url.searchParams.get("joinedDate");
    const joinedDate =
      joinedParam && /^\d{4}-\d{2}-\d{2}$/.test(joinedParam)
        ? joinedParam
        : todayKey();
    const slotParam = url.searchParams.get("slot");
    const slot = slotParam === "am" ? "am" : "pm";

    const pack = await loadEdubitePledgeReelForJoinedDate(slot, joinedDate);

    return NextResponse.json(
      {
        joinedDate,
        slot,
        source: pack.source,
        tables: {
          days: "edubite_pledge_reel_days",
          slides: "edubite_pledge_reel_slides",
        },
        totalDays: pack.totalDays,
        dayNumber: pack.dayNumber,
        reel: pack.reel,
      },
      {
        headers: {
          // Per joinedDate+slot the day is stable for the calendar day.
          "Cache-Control":
            "private, max-age=120, stale-while-revalidate=600",
        },
      },
    );
  } catch (err) {
    console.error("[api/content/pledge-reel]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
