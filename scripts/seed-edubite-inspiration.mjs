/**
 * Seed edubite_inspiration_* from data/inspiration.ts
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

const raw = fs.readFileSync(path.join("data", "inspiration.ts"), "utf8");
const QUOTES = extractExport(raw, "QUOTES");
const ROLE_MODEL = extractExport(raw, "ROLE_MODEL");
const DID_YOU_KNOW = extractExport(raw, "DID_YOU_KNOW");

const sb = createClient(url, key, { auth: { persistSession: false } });

await sb.from("edubite_inspiration_quotes").delete().gte("id", 0);
const { error: qErr } = await sb.from("edubite_inspiration_quotes").insert(
  QUOTES.map((quote, i) => ({ quote, sort_order: i })),
);
if (qErr) {
  console.error(qErr);
  process.exit(1);
}

const { error: bErr } = await sb.from("edubite_inspiration_blocks").upsert(
  [
    { id: "role_model", payload: ROLE_MODEL },
    { id: "did_you_know", payload: DID_YOU_KNOW },
  ],
  { onConflict: "id" },
);
if (bErr) {
  console.error(bErr);
  process.exit(1);
}

console.log("OK seeded inspiration", {
  quotes: QUOTES.length,
  blocks: ["role_model", "did_you_know"],
});
