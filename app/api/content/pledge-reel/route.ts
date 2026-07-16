import { NextResponse } from "next/server";
import {
  getPledgeReelDayNumber,
  getPledgeReelForDay,
} from "@/data/pledge-reels";
import { loadEdubitePledgeReelDays } from "@/lib/db/pledge-reels-supabase";
import { todayKey } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * Morning (am) or night (pm) pledge reel for a joinedDate.
 * Tables: edubite_pledge_reel_days / edubite_pledge_reel_slides
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

    const pack = await loadEdubitePledgeReelDays(slot);
    const dayNumber = getPledgeReelDayNumber(joinedDate, pack.days);
    const reel = getPledgeReelForDay(dayNumber, pack.days);

    return NextResponse.json({
      joinedDate,
      slot,
      source: pack.source,
      tables: {
        days: "edubite_pledge_reel_days",
        slides: "edubite_pledge_reel_slides",
      },
      totalDays: pack.days.length,
      dayNumber,
      reel,
    });
  } catch (err) {
    console.error("[api/content/pledge-reel]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
