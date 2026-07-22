import { NextResponse } from "next/server";
import {
  getFunBrainForDate,
  resolveDailyDoseForClass,
} from "@/lib/content/resolve";
import {
  dailyDoseScheduleDateFor,
  funBrainScheduleDateFor,
} from "@/lib/content/schedule";
import { todayKey } from "@/lib/utils";

export const runtime = "nodejs";

/** Published Edubite questions for today (or static fallback). Guests allowed. */
export async function GET() {
  try {
    const dateKey = todayKey();
    const scheduleDate = dailyDoseScheduleDateFor(dateKey);
    const funbrainScheduleDate = funBrainScheduleDateFor(dateKey);
    const [dailydose11, dailydose12, funbrain] = await Promise.all([
      resolveDailyDoseForClass("11", dateKey),
      resolveDailyDoseForClass("12", dateKey),
      getFunBrainForDate(dateKey),
    ]);
    return NextResponse.json(
      {
        dateKey,
        scheduleDate,
        funbrainScheduleDate,
        table: "edubite_content_questions",
        dailydose11: {
          source: dailydose11.source,
          classLevel: "11",
          questions: dailydose11.questions,
        },
        dailydose12: {
          source: dailydose12.source,
          classLevel: "12",
          questions: dailydose12.questions,
        },
        /** @deprecated use dailydose11 / dailydose12 — kept for older clients */
        dailydose: {
          source:
            dailydose11.source === "db" || dailydose12.source === "db"
              ? "db"
              : "static",
          questions: [
            ...dailydose11.questions,
            ...dailydose12.questions,
          ],
        },
        funbrain: {
          source: funbrain.source,
          scheduleDate: funbrain.scheduleDate ?? funbrainScheduleDate,
          questions: funbrain.questions,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=120, stale-while-revalidate=1800, max-age=30",
        },
      },
    );
  } catch (err) {
    console.error("[api/content/today]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
