import assert from "node:assert/strict";
import { setDateOverride, setQaJourneyJoin } from "@/lib/clock/override-store";
import {
  buildJourneyWeek,
  countFullJourneyDays,
  criteriaCount,
  criteriaForDate,
  isFullDay,
  mergeDayCriteriaRecord,
  repairDayCriteriaLogFromHistory,
  repairDayCriteriaLogFromSources,
} from "@/lib/gamification";
import { createInitialState } from "@/lib/gamification";
import type { GameState } from "@/lib/types";

function resetClock() {
  setDateOverride(null);
  setQaJourneyJoin(null);
}

/** Snapshot shaped like the test user in Supabase (Jul 2026 QA). */
function dbLikeState(): GameState {
  const base = createInitialState();
  return {
    ...base,
    joinedDate: "2026-07-24",
    lastActiveDate: "2026-07-01",
    puzzleCompleted: true,
    doseDayLog: {
      "2026-07-01": {
        pct: 20,
        total: 5,
        correct: 1,
        completed: true,
        classLevel: "11",
      },
    },
    dayCriteriaLog: {
      "2026-07-01": {
        dose: true,
        funbrain: false,
        puzzles: true,
        habits: false,
        pledges: false,
        pledgeAM: false,
        pledgePM: false,
        habitsDone: [],
        completedAt: null,
      },
    },
  };
}

// --- repairDayCriteriaLogFromSources ---
{
  resetClock();
  const raw = createInitialState();
  raw.doseDayLog = {
    "2026-07-01": {
      pct: 100,
      total: 5,
      correct: 5,
      completed: true,
      classLevel: "11",
    },
  };
  raw.dayCriteriaLog = {
    "2026-07-01": {
      dose: false,
      funbrain: false,
      puzzles: false,
      habits: false,
      pledges: false,
      pledgeAM: false,
      pledgePM: false,
      habitsDone: [],
      completedAt: null,
    },
  };
  const repaired = repairDayCriteriaLogFromSources(raw, {
    "2026-07-01": { puzzleId: "x" },
  });
  assert.equal(repaired.dayCriteriaLog["2026-07-01"]?.dose, true);
  assert.equal(repaired.dayCriteriaLog["2026-07-01"]?.puzzles, true);
  assert.equal(repaired.dayCriteriaLog["2026-07-01"]?.funbrain, false);
}

// --- criteriaForDate uses doseDayLog for past days ---
{
  resetClock();
  setDateOverride("2026-07-02");
  const state = dbLikeState();
  const jul1 = criteriaForDate(state, "2026-07-01", "2026-07-02");
  assert.equal(jul1.dose, true, "past day dose from dayCriteriaLog");
  assert.equal(jul1.puzzles, true);
  assert.equal(isFullDay(jul1), false, "2/5 is not a full day");
}

// --- App Clock Jul 1: Day 1 shows dose + puzzle dots (not zero) ---
{
  resetClock();
  setDateOverride("2026-07-01");
  setQaJourneyJoin("2026-07-01");
  const state = dbLikeState();
  const week = buildJourneyWeek(state, "2026-07-01");
  const day1 = week.find((d) => d.dayNumber === 1);
  assert.ok(day1, "Day 1 exists");
  assert.equal(day1!.status, "today");
  assert.equal(criteriaCount(day1!.criteria), 2, "dose + puzzle dots");
  assert.equal(countFullJourneyDays(week), 0, "no full day yet → streak 0");
}

// --- Full day only when all 5 criteria true ---
{
  resetClock();
  setDateOverride("2026-07-01");
  setQaJourneyJoin("2026-07-01");
  const state = dbLikeState();
  state.dose.completed = true;
  state.funbrain.completed = true;
  state.puzzleCompleted = true;
  state.pledgeAM = true;
  state.pledgePM = true;
  state.habits = state.habits.map((h) => ({ ...h, done: true }));
  state.lastActiveDate = "2026-07-01";
  const week = buildJourneyWeek(state, "2026-07-01");
  const day1 = week.find((d) => d.dayNumber === 1)!;
  assert.equal(isFullDay(day1.criteria), true);
  assert.equal(countFullJourneyDays(week), 1);
}

// --- Skipped days must not inherit the previous active day's completions ---
{
  resetClock();
  const full = {
    dose: true,
    funbrain: true,
    puzzles: true,
    habits: true,
    pledges: true,
    pledgeAM: true,
    pledgePM: true,
    habitsDone: ["sleep"],
    completedAt: "2026-08-08T12:00:00.000Z",
  };
  const state: GameState = {
    ...createInitialState(),
    joinedDate: "2026-08-03",
    lastActiveDate: "2026-08-10",
    // Active days Mon–Sat only; Sunday never visited → no dayCriteriaLog key.
    dayCriteriaLog: {
      "2026-08-03": full,
      "2026-08-04": full,
      "2026-08-05": full,
      "2026-08-06": full,
      "2026-08-07": full,
      "2026-08-08": full,
    },
    // Legacy positional history still has Saturday's snapshot at the end —
    // the old bug would map "1 day before Monday" onto this entry for Sunday.
    history: [full, full, full, full, full, full],
  };

  const sunday = criteriaForDate(state, "2026-08-09", "2026-08-10");
  assert.equal(sunday.dose, false, "skipped Sunday must not borrow Saturday dose");
  assert.equal(isFullDay(sunday), false, "skipped Sunday is not a full day");
  assert.equal(criteriaCount(sunday), 0, "skipped Sunday has zero criteria");

  const saturday = criteriaForDate(state, "2026-08-08", "2026-08-10");
  assert.equal(isFullDay(saturday), true, "real Saturday log still counts");

  const week = buildJourneyWeek(state, "2026-08-10");
  const sunCard = week.find((d) => d.dateKey === "2026-08-09");
  assert.ok(sunCard, "Sunday appears in This week");
  assert.equal(isFullDay(sunCard!.criteria), false);
  assert.equal(
    countFullJourneyDays(week.filter((d) => d.status !== "upcoming")),
    5,
    "week full-days = Tue–Sat only (not phantom Sunday)",
  );
}

// --- Gap-free legacy history still maps; backfill writes dayCriteriaLog ---
{
  resetClock();
  const full = {
    dose: true,
    funbrain: true,
    puzzles: true,
    habits: true,
    pledges: true,
    pledgeAM: true,
    pledgePM: true,
    habitsDone: ["sleep"],
    completedAt: "2026-08-09T12:00:00.000Z",
  };
  // Join Aug 7, today Aug 10 → 3 calendar days before today; 3 history entries.
  const legacy: GameState = {
    ...createInitialState(),
    joinedDate: "2026-08-07",
    lastActiveDate: "2026-08-10",
    dayCriteriaLog: {},
    history: [full, full, full],
  };

  const aug9 = criteriaForDate(legacy, "2026-08-09", "2026-08-10");
  assert.equal(isFullDay(aug9), true, "gap-free legacy history still counts");

  const repaired = repairDayCriteriaLogFromHistory(legacy, "2026-08-10");
  assert.equal(isFullDay(repaired.dayCriteriaLog["2026-08-09"]!), true);
  assert.equal(isFullDay(repaired.dayCriteriaLog["2026-08-08"]!), true);
  assert.equal(isFullDay(repaired.dayCriteriaLog["2026-08-07"]!), true);

  // Skip gap: history shorter than calendar span → no backfill / no phantom day.
  const withGap: GameState = {
    ...legacy,
    joinedDate: "2026-08-03",
    history: [full, full, full, full, full, full], // 6 active, 7 calendar days
  };
  assert.equal(
    isFullDay(criteriaForDate(withGap, "2026-08-09", "2026-08-10")),
    false,
    "gapped legacy history must not invent Sunday",
  );
  const noBackfill = repairDayCriteriaLogFromHistory(withGap, "2026-08-10");
  assert.equal(noBackfill.dayCriteriaLog["2026-08-09"], undefined);
}

// --- mergeDayCriteriaRecord never drops completed pillars ---
{
  const merged = mergeDayCriteriaRecord(
    {
      dose: true,
      funbrain: true,
      puzzles: true,
      habits: false,
      pledges: false,
      pledgeAM: false,
      pledgePM: false,
      habitsDone: [],
      completedAt: null,
    },
    {
      dose: false,
      funbrain: false,
      puzzles: false,
      habits: false,
      pledges: false,
      pledgeAM: false,
      pledgePM: false,
      habitsDone: [],
      completedAt: null,
    },
  );
  assert.equal(merged.dose, true);
  assert.equal(merged.funbrain, true);
  assert.equal(merged.puzzles, true);
}

console.log("streak-criteria.test.ts: all assertions passed");
