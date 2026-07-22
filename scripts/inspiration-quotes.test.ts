import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { INSPIRATION_QUOTES } from "@/data/inspiration-quotes";
import { quoteForDate } from "@/lib/inspiration/daily";
import { addDaysToKey } from "@/lib/utils";

const launchDate = "2026-07-20";

assert.equal(INSPIRATION_QUOTES.length, 185);
assert.equal(
  new Set(INSPIRATION_QUOTES.map((item) => item.contentKey)).size,
  INSPIRATION_QUOTES.length,
);
assert.equal(
  new Set(INSPIRATION_QUOTES.map((item) => item.quote)).size,
  INSPIRATION_QUOTES.length,
);
assert.equal(
  new Set(INSPIRATION_QUOTES.map((item) => item.category)).size,
  9,
);

const firstCycle = Array.from(
  { length: INSPIRATION_QUOTES.length },
  (_, day) => quoteForDate(addDaysToKey(launchDate, day)),
);
assert.equal(
  new Set(firstCycle.map((item) => item.contentKey)).size,
  INSPIRATION_QUOTES.length,
);
assert.deepEqual(
  firstCycle.map((item) => item.contentKey),
  Array.from(
    { length: INSPIRATION_QUOTES.length },
    (_, day) => quoteForDate(addDaysToKey(launchDate, day)).contentKey,
  ),
);

const twoCycles = Array.from(
  { length: INSPIRATION_QUOTES.length * 2 },
  (_, day) => quoteForDate(addDaysToKey(launchDate, day)),
);
for (let index = 1; index < twoCycles.length; index++) {
  assert.notEqual(
    twoCycles[index]!.category,
    twoCycles[index - 1]!.category,
    `Adjacent category repeated at schedule index ${index}`,
  );
}

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20260719200358_inspiration_quotes_catalog.sql",
  ),
  "utf8",
);
assert.match(migration, /ADD COLUMN IF NOT EXISTS content_key text/);
assert.match(migration, /ADD COLUMN IF NOT EXISTS category text/);
for (const item of INSPIRATION_QUOTES) {
  assert.match(migration, new RegExp(item.contentKey));
}

console.log("Inspiration quote tests passed", {
  quotes: INSPIRATION_QUOTES.length,
  categories: new Set(INSPIRATION_QUOTES.map((item) => item.category)).size,
  consecutiveCategoryRepeats: 0,
});
