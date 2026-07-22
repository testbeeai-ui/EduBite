import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { INSPIRATION_PHENOMENA } from "@/data/inspiration-phenomena";
import { phenomenonForDate } from "@/lib/inspiration/daily";
import { addDaysToKey } from "@/lib/utils";

const launchDate = "2026-07-20";

assert.equal(INSPIRATION_PHENOMENA.length, 180);
assert.equal(
  INSPIRATION_PHENOMENA.filter((item) => item.volume === 1).length,
  90,
);
assert.equal(
  INSPIRATION_PHENOMENA.filter((item) => item.volume === 2).length,
  90,
);
assert.equal(
  new Set(INSPIRATION_PHENOMENA.map((item) => item.contentKey)).size,
  INSPIRATION_PHENOMENA.length,
);
assert.equal(
  new Set(INSPIRATION_PHENOMENA.map((item) => item.question)).size,
  INSPIRATION_PHENOMENA.length,
);
assert.equal(
  new Set(INSPIRATION_PHENOMENA.map((item) => item.subject)).size,
  3,
);

for (const item of INSPIRATION_PHENOMENA) {
  assert.ok(item.question.length > 0);
  assert.ok(item.explanation.length > 0);
  assert.ok(item.linkedConcepts.length > 0);
  assert.ok(item.followUpQuestion.length > 0);
}

assert.equal(
  phenomenonForDate(launchDate).contentKey,
  "natural-phenomena-v1-01",
);

const firstCycle = Array.from(
  { length: INSPIRATION_PHENOMENA.length },
  (_, day) => phenomenonForDate(addDaysToKey(launchDate, day)),
);
assert.equal(
  new Set(firstCycle.map((item) => item.contentKey)).size,
  INSPIRATION_PHENOMENA.length,
);

const twoCycles = Array.from(
  { length: INSPIRATION_PHENOMENA.length * 2 },
  (_, day) => phenomenonForDate(addDaysToKey(launchDate, day)),
);
for (let index = 1; index < twoCycles.length; index++) {
  assert.notEqual(
    twoCycles[index]!.subject,
    twoCycles[index - 1]!.subject,
    `Adjacent subject repeated at schedule index ${index}`,
  );
}

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719203211_inspiration_phenomena_catalog.sql",
  ),
  "utf8",
);
assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.edubite_inspiration_phenomena/);
for (const item of INSPIRATION_PHENOMENA) {
  assert.match(migration, new RegExp(item.contentKey));
}

console.log("Inspiration phenomena tests passed", {
  total: INSPIRATION_PHENOMENA.length,
  subjects: new Set(INSPIRATION_PHENOMENA.map((item) => item.subject)).size,
  consecutiveSubjectRepeats: 0,
});
