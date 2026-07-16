import { NextResponse } from "next/server";
import { PLEDGE_AM, PLEDGE_PM } from "@/data/pledges";
import {
  getPledgeReelDayNumber,
  getPledgeReelForDay,
} from "@/data/pledge-reels";
import { requireAdmin } from "@/lib/admin/require-admin";
import {
  getFunBrainForDate,
  resolveDailyDoseForClass,
} from "@/lib/content/resolve";
import { dailyDoseScheduleDateFor, funBrainScheduleDateFor } from "@/lib/content/schedule";
import { listContentQuestions } from "@/lib/db/content-questions";
import { loadEdubitePledgeReelDays } from "@/lib/db/pledge-reels-supabase";
import {
  isAnswerUnlocked,
  puzzleForDate,
  yesterdayKey,
} from "@/lib/puzzles/daily";
import { addDaysToKey, todayKey } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;

    const url = new URL(request.url);
    const dateParam = url.searchParams.get("date");
    const dateKey =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : todayKey();
    const joinedDateParam = url.searchParams.get("joinedDate");
    const joinedDate =
      joinedDateParam && /^\d{4}-\d{2}-\d{2}$/.test(joinedDateParam)
        ? joinedDateParam
        : dateKey;

    const today = todayKey();
    const tomorrow = addDaysToKey(today, 1);

    const scheduleDate = dailyDoseScheduleDateFor(dateKey);
    const funbrainScheduleDate = funBrainScheduleDateFor(dateKey);

    const [
      dose11Resolved,
      dose12Resolved,
      funbrainResolved,
      dose11Db,
      dose12Db,
      funbrainDb,
      pmPack,
      amPack,
    ] = await Promise.all([
      resolveDailyDoseForClass("11", dateKey),
      resolveDailyDoseForClass("12", dateKey),
      getFunBrainForDate(dateKey),
      listContentQuestions({
        domain: "dailydose",
        classLevel: "11",
        from: scheduleDate,
        to: scheduleDate,
      }),
      listContentQuestions({
        domain: "dailydose",
        classLevel: "12",
        from: scheduleDate,
        to: scheduleDate,
      }),
      listContentQuestions({
        domain: "funbrain",
        from: funbrainScheduleDate,
        to: funbrainScheduleDate,
      }),
      loadEdubitePledgeReelDays("pm"),
      loadEdubitePledgeReelDays("am"),
    ]);

    const catalog = pmPack.days;
    const puzzle = puzzleForDate(dateKey);
    const yKey = yesterdayKey(dateKey);
    const yesterdayPuzzle = puzzleForDate(yKey);

    const reelDayNumber = getPledgeReelDayNumber(joinedDate, catalog);
    const daysSinceJoin = Math.max(
      0,
      Math.round(
        (new Date(dateKey + "T12:00:00").getTime() -
          new Date(joinedDate + "T12:00:00").getTime()) /
          86400000,
      ),
    );
    const previewDay =
      catalog.length > 0
        ? (daysSinceJoin % catalog.length) + 1
        : 1;
    const reel = getPledgeReelForDay(previewDay, catalog);

    const upcomingPuzzles = Array.from({ length: 7 }, (_, i) => {
      const key = addDaysToKey(dateKey, i);
      const p = puzzleForDate(key);
      return {
        dateKey: key,
        id: p.id,
        number: p.number,
        title: p.title,
        grade: p.grade,
        topic: p.topic,
      };
    });

    return NextResponse.json({
      dateKey,
      today,
      tomorrow,
      bucket:
        dateKey < today
          ? "past"
          : dateKey === today
            ? "today"
            : dateKey === tomorrow
              ? "tomorrow"
              : "upcoming",
      tables: {
        questions: "edubite_content_questions",
        pledgeDays: "edubite_pledge_reel_days",
        pledgeSlides: "edubite_pledge_reel_slides",
      },
      dailydose: {
        scheduleDate,
        class11: {
          source: dose11Resolved.source,
          questions: dose11Resolved.questions,
          dbRows: dose11Db,
        },
        class12: {
          source: dose12Resolved.source,
          questions: dose12Resolved.questions,
          dbRows: dose12Db,
        },
      },
      funbrain: {
        scheduleDate: funbrainScheduleDate,
        source: funbrainResolved.source,
        questions: funbrainResolved.questions,
        dbRows: funbrainDb,
      },
      puzzles: {
        today: {
          dateKey,
          puzzle: {
            id: puzzle.id,
            number: puzzle.number,
            grade: puzzle.grade,
            title: puzzle.title,
            prompt: puzzle.prompt,
            hint: puzzle.hint,
            answer: puzzle.answer,
            topic: puzzle.topic,
          },
          answerUnlocked: isAnswerUnlocked(dateKey, today),
        },
        yesterday: {
          dateKey: yKey,
          puzzle: {
            id: yesterdayPuzzle.id,
            number: yesterdayPuzzle.number,
            title: yesterdayPuzzle.title,
            answer: yesterdayPuzzle.answer,
          },
          answerUnlocked: isAnswerUnlocked(yKey, today),
        },
        upcoming: upcomingPuzzles,
      },
      pledges: {
        am: PLEDGE_AM,
        pm: PLEDGE_PM,
        joinedDate,
        previewDay,
        liveDayIfJoinedToday: reelDayNumber,
        reel,
        totalReelDays: catalog.length,
        source: pmPack.source,
        morning: {
          source: amPack.source,
          totalReelDays: amPack.days.length,
          reel: getPledgeReelForDay(previewDay, amPack.days),
        },
      },
    });
  } catch (err) {
    console.error("[api/admin/schedule]", err);
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
