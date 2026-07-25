import { NextResponse } from "next/server";
import { resolveContentDateKey } from "@/lib/clock/resolve-content-date";
import {
  getFunBrainForDate,
  resolveDailyDoseForClass,
} from "@/lib/content/resolve";
import {
  dailyDoseScheduleDateFor,
  funBrainScheduleDateFor,
} from "@/lib/content/schedule";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Published Edubite questions for a calendar day (or static fallback).
 * Optional `dateKey` follows App Clock / Date traveler (±120 days).
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dateKey = resolveContentDateKey(url.searchParams.get("dateKey"));
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
            "private, max-age=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (err) {
    console.error("[api/content/today]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
