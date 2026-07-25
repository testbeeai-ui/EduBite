/**
 * Import Class XI/XII FunBrain 100-question bank into edubite_content_questions.
 *
 * Source: data/funbrain-100.json
 *   - Days 1–17: 6 questions each (102 unique prompts; day 17 pads to 6)
 *   - Total unique: 102
 *
 * Schedule: tiles the 17-day pack across the 180-day cycle (2026-01-01 …)
 * so every calendar day resolves to DB content (no static fallback).
 *
 * Usage:
 *   node scripts/import-funbrain-100.mjs
 *   node scripts/import-funbrain-100.mjs --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PER_DAY = 6;
const PACK_DAYS = 17;
const CYCLE_START = "2026-01-01";
const CYCLE_DAYS = 180;
const EXPECTED_UNIQUE = 102;

const DATA_FILE = path.join(process.cwd(), "data", "funbrain-100.json");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[k] = v;
  }
  return out;
}

function addDays(dateKey, offset) {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function validateQuestion(q, index) {
  if (!q || typeof q.q !== "string" || !q.q.trim()) {
    throw new Error(`Question ${index}: missing q`);
  }
  if (!Array.isArray(q.opts) || q.opts.length !== 4) {
    throw new Error(`Question ${index}: opts must be length 4`);
  }
  if (q.opts.some((o) => typeof o !== "string" || !String(o).trim())) {
    throw new Error(`Question ${index}: empty option`);
  }
  if (
    typeof q.correct !== "number" ||
    !Number.isInteger(q.correct) ||
    q.correct < 0 ||
    q.correct > 3
  ) {
    throw new Error(`Question ${index}: invalid correct index`);
  }
  if (typeof q.day !== "number" || q.day < 1 || q.day > PACK_DAYS) {
    throw new Error(`Question ${index}: day must be 1–${PACK_DAYS}`);
  }
  if (typeof q.sort !== "number" || q.sort < 0 || q.sort > 5) {
    throw new Error(`Question ${index}: sort must be 0–5`);
  }
}

/** Group unique bank by day number (1–17). */
function buildDayPack(questions) {
  if (questions.length !== EXPECTED_UNIQUE) {
    throw new Error(
      `Expected ${EXPECTED_UNIQUE} unique questions, got ${questions.length}`,
    );
  }

  /** @type {Map<number, typeof questions>} */
  const byDay = new Map();
  questions.forEach((q, i) => {
    validateQuestion(q, i);
    const list = byDay.get(q.day) ?? [];
    list.push(q);
    byDay.set(q.day, list);
  });

  for (let day = 1; day <= PACK_DAYS; day++) {
    const list = byDay.get(day) ?? [];
    if (list.length !== PER_DAY) {
      throw new Error(`Day ${day}: expected ${PER_DAY} questions, got ${list.length}`);
    }
  }

  for (const [day, list] of byDay) {
    list.sort((a, b) => a.sort - b.sort);
    byDay.set(day, list);
  }
  return byDay;
}

/**
 * Tile the 17-day pack across the 180-day content cycle (6 questions every day).
 */
function buildRows(byDay) {
  const rows = [];
  for (let cycleIndex = 0; cycleIndex < CYCLE_DAYS; cycleIndex++) {
    const packDay = (cycleIndex % PACK_DAYS) + 1;
    const questions = byDay.get(packDay) ?? [];
    const activeDate = addDays(CYCLE_START, cycleIndex);
    for (const q of questions) {
      rows.push({
        domain: "funbrain",
        class_level: null,
        active_date: activeDate,
        tag: q.tag ? String(q.tag).trim() : null,
        q: String(q.q).trim(),
        opts: q.opts.map((o) => String(o).trim()),
        correct: q.correct,
        sort_order: q.sort,
        published: true,
        metadata: {
          bank: "funbrain-100",
          packDay,
          cycleIndex,
          finalSprint: packDay === 17,
        },
      });
    }
  }
  return rows;
}

const dryRun = process.argv.includes("--dry-run");

if (!fs.existsSync(DATA_FILE)) {
  console.error(`Missing FunBrain file: ${DATA_FILE}`);
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const byDay = buildDayPack(questions);
const rows = buildRows(byDay);

const expectedRows = CYCLE_DAYS * PER_DAY;

console.log(`Parsed ${questions.length} unique FunBrain questions`);
console.log(`Scheduled ${rows.length} rows across ${CYCLE_DAYS}-day cycle`);

if (rows.length !== expectedRows) {
  console.error(`Row count mismatch: got ${rows.length}, expected ${expectedRows}`);
  process.exit(1);
}

if (dryRun) {
  console.log("DRY RUN OK", {
    unique: questions.length,
    rows: rows.length,
    packDays: PACK_DAYS,
    cycleDays: CYCLE_DAYS,
    firstDate: CYCLE_START,
    lastDate: addDays(CYCLE_START, CYCLE_DAYS - 1),
    sampleDay1: rows.filter((r) => r.active_date === "2026-01-01").length,
    sampleFinal: rows.filter((r) => r.active_date === "2026-01-17").length,
  });
  process.exit(0);
}

const webEnv = loadEnvFile(path.join(process.cwd(), "..", "Web", ".env"));
const localEnv = loadEnvFile(path.join(process.cwd(), ".env"));
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  localEnv.NEXT_PUBLIC_SUPABASE_URL ||
  webEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || webEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`Importing ${rows.length} FunBrain rows → ${url}`);

const { error: delErr, count: deleted } = await supabase
  .from("edubite_content_questions")
  .delete({ count: "exact" })
  .eq("domain", "funbrain");
if (delErr) {
  console.error("Delete funbrain failed", delErr);
  process.exit(1);
}
console.log(`Cleared previous funbrain rows: ${deleted ?? 0}`);

const CHUNK = 100;
for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK);
  const { error } = await supabase.from("edubite_content_questions").insert(chunk);
  if (error) {
    console.error("Insert failed at", i, error);
    process.exit(1);
  }
  console.log(`inserted ${i + 1}–${i + chunk.length}/${rows.length}`);
}

const { count, error: verifyErr } = await supabase
  .from("edubite_content_questions")
  .select("*", { count: "exact", head: true })
  .eq("domain", "funbrain");
if (verifyErr) {
  console.error("Verify failed", verifyErr);
  process.exit(1);
}
if (count !== rows.length) {
  console.error(`Expected ${rows.length} funbrain rows, got ${count}`);
  process.exit(1);
}

const { data: day1, error: d1Err } = await supabase
  .from("edubite_content_questions")
  .select("sort_order, tag, q")
  .eq("domain", "funbrain")
  .eq("active_date", "2026-01-01")
  .order("sort_order", { ascending: true });
if (d1Err) {
  console.error("Day 1 check failed", d1Err);
  process.exit(1);
}

const { data: finalDay, error: fErr } = await supabase
  .from("edubite_content_questions")
  .select("sort_order, tag, q")
  .eq("domain", "funbrain")
  .eq("active_date", "2026-01-17")
  .order("sort_order", { ascending: true });
if (fErr) {
  console.error("Final Sprint check failed", fErr);
  process.exit(1);
}

console.log("OK imported FunBrain 100-question bank", {
  total: count,
  table: "edubite_content_questions",
  domain: "funbrain",
  day1Count: day1?.length ?? 0,
  day1First: day1?.[0]?.q?.slice(0, 60),
  finalSprintCount: finalDay?.length ?? 0,
  finalSprintFirst: finalDay?.[0]?.q?.slice(0, 60),
});
