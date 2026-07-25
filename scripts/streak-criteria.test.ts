import assert from "node:assert/strict";
import { setDateOverride, setQaJourneyJoin } from "@/lib/clock/override-store";
import {
  buildJourneyWeek,
  countFullJourneyDays,
  criteriaCount,
  criteriaForDate,
  isFullDay,
  mergeDayCriteriaRecord,
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
