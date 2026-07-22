/**
 * Seed edubite_inspiration_* from the checked-in content catalogs.
 * Usage: node scripts/seed-edubite-inspiration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}

function extractExport(raw, name) {
  const start = raw.indexOf(`export const ${name}`);
  if (start < 0) throw new Error(`missing ${name}`);
  const eq = raw.indexOf("=", start);
  const trimmed = raw.slice(eq + 1).trim();
  const first = trimmed[0];
  if (first === "[") {
    let depth = 0;
    let end = -1;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "[") depth++;
      else if (trimmed[i] === "]") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    return Function(`return (${trimmed.slice(0, end + 1)})`)();
  }
  if (first === "{") {
    let depth = 0;
    let end = -1;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "{") depth++;
      else if (trimmed[i] === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    return Function(`return (${trimmed.slice(0, end + 1)})`)();
  }
  throw new Error(`unsupported export ${name}`);
}

const web = loadEnv(path.join("..", "Web", ".env"));
const local = loadEnv(".env");
const url = local.NEXT_PUBLIC_SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL;
const key = web.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing URL or service role");
  process.exit(1);
}

const inspirationRaw = fs.readFileSync(
  path.join("data", "inspiration.ts"),
  "utf8",
);
const quotesRaw = fs.readFileSync(
  path.join("data", "inspiration-quotes.ts"),
  "utf8",
);
const phenomenaRaw = fs.readFileSync(
  path.join("data", "inspiration-phenomena.ts"),
  "utf8",
);
const INSPIRATION_QUOTES = extractExport(quotesRaw, "INSPIRATION_QUOTES");
const INSPIRATION_PHENOMENA = extractExport(
  phenomenaRaw,
  "INSPIRATION_PHENOMENA",
);
const ROLE_MODEL = extractExport(inspirationRaw, "ROLE_MODEL");

const sb = createClient(url, key, { auth: { persistSession: false } });

await sb.from("edubite_inspiration_quotes").delete().gte("id", 0);
const { error: qErr } = await sb.from("edubite_inspiration_quotes").insert(
  INSPIRATION_QUOTES.map((item, index) => ({
    content_key: item.contentKey,
    category: item.category,
    quote: item.quote,
    sort_order: index,
  })),
);
if (qErr) {
  console.error(qErr);
  process.exit(1);
}

await sb.from("edubite_inspiration_phenomena").delete().gte("id", 0);
const { error: pErr } = await sb.from("edubite_inspiration_phenomena").insert(
  INSPIRATION_PHENOMENA.map((item, index) => ({
    content_key: item.contentKey,
    volume: item.volume,
    number: item.number,
    subject: item.subject,
    icon: item.icon,
    badge: item.badge,
    question: item.question,
    explanation: item.explanation,
    linked_concepts: item.linkedConcepts,
    follow_up_question: item.followUpQuestion,
    source: item.source,
    sort_order: index,
  })),
);
if (pErr) {
  console.error(pErr);
  process.exit(1);
}

const todayPhenomenon = INSPIRATION_PHENOMENA.find(
  (item) => item.contentKey === "natural-phenomena-v1-01",
);
const didYouKnowFallback = todayPhenomenon
  ? {
      icon: todayPhenomenon.icon,
      badge: todayPhenomenon.badge,
      question: todayPhenomenon.question,
      explanation: todayPhenomenon.explanation,
      linkedConcepts: todayPhenomenon.linkedConcepts,
      followUpQuestion: todayPhenomenon.followUpQuestion,
    }
  : null;

const { error: bErr } = await sb.from("edubite_inspiration_blocks").upsert(
  [
    { id: "role_model", payload: ROLE_MODEL },
    ...(didYouKnowFallback
      ? [{ id: "did_you_know", payload: didYouKnowFallback }]
      : []),
  ],
  { onConflict: "id" },
);
if (bErr) {
  console.error(bErr);
  process.exit(1);
}

console.log("OK seeded inspiration", {
  quotes: INSPIRATION_QUOTES.length,
  phenomena: INSPIRATION_PHENOMENA.length,
  blocks: ["role_model", "did_you_know"],
});
