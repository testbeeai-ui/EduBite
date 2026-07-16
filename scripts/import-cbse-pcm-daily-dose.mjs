/**
 * Import CBSE Class 11 & 12 PCM DailyDose banks into edubite_content_questions.
 * Separate class_level tracks — never touches Edublast play_questions / mock_questions.
 *
 * Usage:
 *   node scripts/import-cbse-pcm-daily-dose.mjs
 *   node scripts/import-cbse-pcm-daily-dose.mjs --class 11
 *   node scripts/import-cbse-pcm-daily-dose.mjs --dry-run
 *
 * Defaults:
 *   Class 11 → C:\Users\rentk\Downloads\CBSE_Class11_PCM_900_MCQs.txt
 *   Class 12 → C:\Users\rentk\Downloads\CBSE_Class12_PCM_900_MCQs.txt
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY from Web/.env (same TestBee project).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const DOSE_PER_DAY = 5;
const CYCLE_START = "2026-01-01";
const CYCLE_DAYS = 180;

const DEFAULT_PATHS = {
  11: "C:\\Users\\rentk\\Downloads\\CBSE_Class11_PCM_900_MCQs.txt",
  12: "C:\\Users\\rentk\\Downloads\\CBSE_Class12_PCM_900_MCQs.txt",
};

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

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const classIdx = argv.indexOf("--class");
  const onlyClass =
    classIdx >= 0 && (argv[classIdx + 1] === "11" || argv[classIdx + 1] === "12")
      ? argv[classIdx + 1]
      : null;
  return { dryRun, onlyClass };
}

function validateQuestion(q, index, classLevel) {
  if (!q || typeof q.q !== "string" || !q.q.trim()) {
    throw new Error(`Class ${classLevel} question ${index}: missing q`);
  }
  if (!Array.isArray(q.opts) || q.opts.length !== 4) {
    throw new Error(`Class ${classLevel} question ${index}: opts must be length 4`);
  }
  if (
    typeof q.correct !== "number" ||
    !Number.isInteger(q.correct) ||
    q.correct < 0 ||
    q.correct > 3
  ) {
    throw new Error(`Class ${classLevel} question ${index}: invalid correct index`);
  }
}

function buildRows(questions, classLevel) {
  if (questions.length !== 900) {
    throw new Error(
      `Class ${classLevel}: expected 900 questions, got ${questions.length}`,
    );
  }
  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    validateQuestion(questions[i], i, classLevel);
    const dayIndex = Math.floor(i / DOSE_PER_DAY);
    if (dayIndex >= CYCLE_DAYS) {
      throw new Error(`Class ${classLevel}: question ${i} exceeds ${CYCLE_DAYS}-day cycle`);
    }
    rows.push({
      domain: "dailydose",
      class_level: classLevel,
      active_date: addDays(CYCLE_START, dayIndex),
      tag: String(questions[i].tag ?? "").trim() || null,
      q: questions[i].q.trim(),
      opts: questions[i].opts.map((o) => String(o).trim()),
      correct: questions[i].correct,
      sort_order: i % DOSE_PER_DAY,
      published: true,
    });
  }
  return rows;
}

const { dryRun, onlyClass } = parseArgs(process.argv);
const webEnv = loadEnvFile(path.join(process.cwd(), "..", "Web", ".env"));
const localEnv = loadEnvFile(path.join(process.cwd(), ".env"));
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  localEnv.NEXT_PUBLIC_SUPABASE_URL ||
  webEnv.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || webEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!url || !serviceKey)) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const classes = onlyClass ? [onlyClass] : ["11", "12"];
const allRows = [];

for (const classLevel of classes) {
  const filePath =
    process.env[`CBSE_CLASS${classLevel}_MCQ_FILE`] ||
    DEFAULT_PATHS[classLevel];
  if (!fs.existsSync(filePath)) {
    console.error(`Missing file for Class ${classLevel}: ${filePath}`);
    process.exit(1);
  }
  const questions = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const rows = buildRows(questions, classLevel);
  allRows.push(...rows);
  console.log(`Class ${classLevel}: parsed ${rows.length} rows from ${filePath}`);
}

if (dryRun) {
  const byClass = Object.fromEntries(
    classes.map((c) => [
      c,
      allRows.filter((r) => r.class_level === c).length,
    ]),
  );
  console.log("DRY RUN OK", {
    total: allRows.length,
    byClass,
    firstDate: CYCLE_START,
    lastDate: addDays(CYCLE_START, CYCLE_DAYS - 1),
    perDay: DOSE_PER_DAY,
  });
  process.exit(0);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`Importing ${allRows.length} rows → ${url}`);

for (const classLevel of classes) {
  const { error: delErr, count } = await supabase
    .from("edubite_content_questions")
    .delete({ count: "exact" })
    .eq("domain", "dailydose")
    .eq("class_level", classLevel);
  if (delErr) {
    console.error(`Delete Class ${classLevel} failed`, delErr);
    process.exit(1);
  }
  console.log(`Cleared Class ${classLevel} dailydose rows: ${count ?? 0}`);
}

const CHUNK = 100;
for (let i = 0; i < allRows.length; i += CHUNK) {
  const chunk = allRows.slice(i, i + CHUNK);
  const { error } = await supabase.from("edubite_content_questions").insert(chunk);
  if (error) {
    console.error("Insert failed at", i, error);
    process.exit(1);
  }
  console.log(`inserted ${i + 1}–${i + chunk.length}/${allRows.length}`);
}

for (const classLevel of classes) {
  const { count, error } = await supabase
    .from("edubite_content_questions")
    .select("*", { count: "exact", head: true })
    .eq("domain", "dailydose")
    .eq("class_level", classLevel);
  if (error) {
    console.error("Verify failed", error);
    process.exit(1);
  }
  if (count !== 900) {
    console.error(`Class ${classLevel}: expected 900 rows, got ${count}`);
    process.exit(1);
  }
}

console.log("OK imported CBSE PCM DailyDose", {
  classes,
  total: allRows.length,
  table: "edubite_content_questions",
});
