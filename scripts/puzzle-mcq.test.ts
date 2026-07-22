import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ORIGINAL_PUZZLES,
  PUZZLES,
} from "@/data/puzzles/catalog";
import { COMPETITIVE_PUZZLES } from "@/data/puzzles/competitive-catalog";
import { normalizePuzzleProgress } from "@/lib/db/normalize";
import { puzzleForDate } from "@/lib/puzzles/daily";
import { recordAttempt } from "@/lib/puzzles/storage";
import { createDefaultPuzzleProgress } from "@/lib/puzzles/types";
import { addDaysToKey } from "@/lib/utils";

assert.equal(ORIGINAL_PUZZLES.length, 16);
assert.equal(COMPETITIVE_PUZZLES.length, 98);
assert.equal(PUZZLES.length, 114);
assert.equal(new Set(PUZZLES.map((puzzle) => puzzle.id)).size, PUZZLES.length);
assert.equal(
  COMPETITIVE_PUZZLES.filter((puzzle) => puzzle.kind === "mcq").length,
  78,
);
assert.equal(
  COMPETITIVE_PUZZLES.filter((puzzle) => puzzle.kind !== "mcq").length,
  20,
);
for (const puzzle of COMPETITIVE_PUZZLES) {
  if (puzzle.kind !== "mcq") continue;
  assert.equal(puzzle.options.length, 4);
  assert.ok(puzzle.correctOptionIndex >= 0);
  assert.ok(puzzle.correctOptionIndex < puzzle.options.length);
}

const legacyDate = "2026-07-19";
const legacyOrdinal = Math.floor(
  Date.UTC(2026, 6, 19) / (24 * 60 * 60 * 1000),
);
assert.equal(
  puzzleForDate(legacyDate).id,
  ORIGINAL_PUZZLES[legacyOrdinal % ORIGINAL_PUZZLES.length]!.id,
);
assert.equal(puzzleForDate("2026-07-20").id, "competitive-s1-q1");

const launchDate = "2026-07-20";
const firstCycle = Array.from({ length: PUZZLES.length }, (_, day) =>
  puzzleForDate(addDaysToKey(launchDate, day)),
);
const secondCycle = Array.from({ length: PUZZLES.length }, (_, day) =>
  puzzleForDate(addDaysToKey(launchDate, PUZZLES.length + day)),
);
const catalogIds = new Set(PUZZLES.map((puzzle) => puzzle.id));

assert.equal(new Set(firstCycle.map((puzzle) => puzzle.id)).size, PUZZLES.length);
assert.equal(
  new Set(secondCycle.map((puzzle) => puzzle.id)).size,
  PUZZLES.length,
);
assert.deepEqual(
  new Set(firstCycle.map((puzzle) => puzzle.id)),
  catalogIds,
);
assert.deepEqual(
  new Set(secondCycle.map((puzzle) => puzzle.id)),
  catalogIds,
);
assert.notEqual(
  firstCycle[firstCycle.length - 1]?.id,
  secondCycle[0]?.id,
);
assert.equal(
  puzzleForDate("2026-08-15").id,
  puzzleForDate("2026-08-15").id,
);

const firstTwoCycles = [...firstCycle, ...secondCycle];
for (let index = 1; index < firstTwoCycles.length; index++) {
  assert.notEqual(
    firstTwoCycles[index - 1]?.topic,
    firstTwoCycles[index]?.topic,
    `consecutive puzzle topics repeated at day ${index + 1}`,
  );
}

const normalizedLegacy = normalizePuzzleProgress({
  version: 1,
  attempts: {
    "2026-07-18": {
      puzzleId: "three-switches",
      dateKey: "2026-07-18",
      note: "legacy answer",
      submittedAt: "2026-07-18T10:00:00.000Z",
    },
  },
  streak: 1,
  lastAttemptDate: "2026-07-18",
});
assert.equal(normalizedLegacy.version, 2);
assert.equal(
  normalizedLegacy.attempts["2026-07-18"]?.responseType,
  "open-ended",
);
assert.equal(
  normalizedLegacy.attempts["2026-07-18"]?.selectedOptionIndex,
  null,
);

const initial = createDefaultPuzzleProgress();
const first = recordAttempt(initial, "first", "locked response");
const second = recordAttempt(first, "second", "replacement");
assert.deepEqual(second, first);

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719170000_puzzle_attempt_locking.sql",
  ),
  "utf8",
);
assert.match(migration, /auth\.uid\(\)/);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /existing_attempt IS NOT NULL/);
assert.match(migration, /Asia\/Kolkata/);

console.log("Puzzle MCQ regression tests passed.");
