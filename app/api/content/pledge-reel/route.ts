import { NextResponse } from "next/server";
import { resolveContentDateKey } from "@/lib/clock/resolve-content-date";
import { loadEdubitePledgeReelForJoinedDate } from "@/lib/db/pledge-reels-supabase";

export const runtime = "nodejs";

/**
 * Morning (am) or night (pm) pledge reel for a journey join date.
 * Optional `dateKey` = App Clock “today” so Day N advances with Date traveler.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const asOfDateKey = resolveContentDateKey(url.searchParams.get("dateKey"));
    const joinedParam = url.searchParams.get("joinedDate");
    const joinedDate =
      joinedParam && /^\d{4}-\d{2}-\d{2}$/.test(joinedParam)
        ? joinedParam
        : asOfDateKey;
    const slotParam = url.searchParams.get("slot");
    const slot = slotParam === "am" ? "am" : "pm";

    const pack = await loadEdubitePledgeReelForJoinedDate(
      slot,
      joinedDate,
      asOfDateKey,
    );

    return NextResponse.json(
      {
        joinedDate,
        dateKey: asOfDateKey,
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
          // Per joinedDate+dateKey+slot the day is stable for that simulated day.
          "Cache-Control":
            "private, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    console.error("[api/content/pledge-reel]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
