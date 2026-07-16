/**
 * Import FunBrain bank into edubite_content_questions (domain = funbrain).
 * Independent of Edublast play_questions / DailyDose PCM tracks.
 *
 * Usage:
 *   node scripts/import-funbrain.mjs
 *   node scripts/import-funbrain.mjs --dry-run
 *
 * Default file: Edubite/1080FunBrain_questions.txt
 * Schedule: 6 questions/day × 180 days from 2026-01-01
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY from Web/.env (same TestBee project).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PER_DAY = 6;
const CYCLE_START = "2026-01-01";
const CYCLE_DAYS = 180;
const EXPECTED_TOTAL = PER_DAY * CYCLE_DAYS; // 1080

const DEFAULT_FILE = path.join(
  process.cwd(),
  "1080FunBrain_questions.txt",
);

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
    throw new Error(`FunBrain question ${index}: missing q`);
  }
  if (!Array.isArray(q.opts) || q.opts.length !== 4) {
    throw new Error(`FunBrain question ${index}: opts must be length 4`);
  }
  if (q.opts.some((o) => typeof o !== "string" || !String(o).trim())) {
    throw new Error(`FunBrain question ${index}: empty option`);
  }
  if (
    typeof q.correct !== "number" ||
    !Number.isInteger(q.correct) ||
    q.correct < 0 ||
    q.correct > 3
  ) {
    throw new Error(`FunBrain question ${index}: invalid correct index`);
  }
}

function buildRows(questions) {
  if (questions.length !== EXPECTED_TOTAL) {
    throw new Error(
      `Expected ${EXPECTED_TOTAL} questions, got ${questions.length}`,
    );
  }
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    validateQuestion(questions[i], i);
    const dayIndex = Math.floor(i / PER_DAY);
    if (dayIndex >= CYCLE_DAYS) {
      throw new Error(`Question ${i} exceeds ${CYCLE_DAYS}-day cycle`);
    }
    rows.push({
      domain: "funbrain",
      class_level: null,
      active_date: addDays(CYCLE_START, dayIndex),
      tag: null,
      q: questions[i].q.trim(),
      opts: questions[i].opts.map((o) => String(o).trim()),
      correct: questions[i].correct,
      sort_order: i % PER_DAY,
      published: true,
    });
  }
  return rows;
}

const dryRun = process.argv.includes("--dry-run");
const filePath =
  process.env.FUNBRAIN_MCQ_FILE ||
  (process.argv.includes("--file")
    ? process.argv[process.argv.indexOf("--file") + 1]
    : DEFAULT_FILE);

if (!fs.existsSync(filePath)) {
  console.error(`Missing FunBrain file: ${filePath}`);
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
const rows = buildRows(questions);
console.log(`Parsed ${rows.length} FunBrain rows from ${filePath}`);

if (dryRun) {
  console.log("DRY RUN OK", {
    total: rows.length,
    perDay: PER_DAY,
    days: CYCLE_DAYS,
    firstDate: CYCLE_START,
    lastDate: addDays(CYCLE_START, CYCLE_DAYS - 1),
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
if (count !== EXPECTED_TOTAL) {
  console.error(`Expected ${EXPECTED_TOTAL} funbrain rows, got ${count}`);
  process.exit(1);
}

const { data: dayCheck, error: dayErr } = await supabase
  .from("edubite_content_questions")
  .select("active_date")
  .eq("domain", "funbrain")
  .eq("active_date", "2026-01-17");
if (dayErr) {
  console.error("Day check failed", dayErr);
  process.exit(1);
}

console.log("OK imported FunBrain", {
  total: count,
  table: "edubite_content_questions",
  domain: "funbrain",
  sampleDay2026_01_17: dayCheck?.length ?? 0,
});
