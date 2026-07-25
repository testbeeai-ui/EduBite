import assert from "node:assert/strict";
import {
  buildJourneyWeek,
  computeStreak,
  createInitialState,
  criteriaForDate,
  isFullDay,
  mergeDayCriteriaRecord,
  repairDayCriteriaLogFromSources,
} from "@/lib/gamification";

// Repair from doseDayLog + puzzle attempts
const base = {
  ...createInitialState(),
  joinedDate: "2026-07-24",
  lastActiveDate: "2026-07-01",
  dayCriteriaLog: {
    "2026-07-01": {
      dose: false,
      funbrain: false,
      puzzles: false,
      habits: false,
      pledges: false,
      completedAt: null,
      pledgeAM: false,
      pledgePM: false,
      habitsDone: [],
    },
  },
  doseDayLog: {
    "2026-07-01": {
      pct: 20,
      total: 5,
      correct: 1,
      completed: true,
      classLevel: "11" as const,
    },
  },
};

const repaired = repairDayCriteriaLogFromSources(base, {
  "2026-07-01": { puzzleId: "x" },
});
assert.equal(repaired.dayCriteriaLog["2026-07-01"]?.dose, true);
assert.equal(repaired.dayCriteriaLog["2026-07-01"]?.puzzles, true);

const crit = criteriaForDate(repaired, "2026-07-01", "2026-07-01");
assert.equal(crit.dose, true);
assert.equal(crit.puzzles, true);
assert.equal(isFullDay(crit), false);

const full = mergeDayCriteriaRecord(crit, {
  dose: true,
  funbrain: true,
  puzzles: true,
  habits: true,
  pledges: true,
  pledgeAM: true,
  pledgePM: true,
  habitsDone: ["sleep"],
  completedAt: null,
});
assert.equal(isFullDay(full), true);
assert.ok(full.completedAt);

const qaState = {
  ...repaired,
  dayCriteriaLog: {
    ...repaired.dayCriteriaLog,
    "2026-07-01": full,
  },
};
const week = buildJourneyWeek(qaState, "2026-07-01");
const day1 = week.find((d) => d.dayNumber === 1);
assert.equal(day1?.dateKey, "2026-07-01");
assert.equal(isFullDay(day1!.criteria), true);
assert.equal(computeStreak(qaState, "2026-07-01"), 1);

console.log("verify-streak-persist: all checks passed");
