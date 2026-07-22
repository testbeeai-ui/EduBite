/**
 * Seed / refresh edubite_inspiration_role_models from the checked-in catalog.
 * Text only — no images. Table must already exist (run migration first).
 *
 * Usage: node scripts/seed-edubite-role-models.mjs
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
  if (trimmed[0] !== "[") throw new Error(`unsupported export ${name}`);
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

const web = loadEnv(path.join("..", "Web", ".env"));
const local = loadEnv(".env");
const url = local.NEXT_PUBLIC_SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL;
const key = web.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing URL or service role");
  process.exit(1);
}

const ROLE_MODELS = extractExport(
  fs.readFileSync(path.join("data", "inspiration-role-models.ts"), "utf8"),
  "INSPIRATION_ROLE_MODELS",
);

if (ROLE_MODELS.length !== 90) {
  console.error(`Expected 90 role models, got ${ROLE_MODELS.length}`);
  process.exit(1);
}

for (const [index, item] of ROLE_MODELS.entries()) {
  for (const field of [
    "contentKey",
    "index",
    "avatar",
    "name",
    "tag",
    "quote",
    "bio",
    "inspireWhy",
    "pcmConnections",
  ]) {
    if (!item[field] || !String(item[field]).trim()) {
      console.error(`Missing ${field} at #${index + 1} (${item.name ?? "?"})`);
      process.exit(1);
    }
  }
  for (const banned of ["image", "imageCaption", "imageUrl", "photo", "portrait"]) {
    if (banned in item) {
      console.error(`Banned image field "${banned}" on ${item.name}`);
      process.exit(1);
    }
  }
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const { error: probeErr } = await sb
  .from("edubite_inspiration_role_models")
  .select("content_key")
  .limit(1);
if (probeErr) {
  console.error(probeErr.message);
  console.error(
    "Apply migration 20260721003000_inspiration_role_models_catalog.sql first.",
  );
  process.exit(1);
}

const rows = ROLE_MODELS.map((item, index) => ({
  content_key: item.contentKey,
  volume: item.volume,
  number: item.number,
  index_label: item.index,
  avatar: item.avatar,
  name: item.name,
  tag: item.tag,
  quote: item.quote,
  bio: item.bio,
  inspire_why: item.inspireWhy,
  pcm_connections: item.pcmConnections,
  sort_order: index,
  updated_at: new Date().toISOString(),
}));

for (let i = 0; i < rows.length; i += 30) {
  const chunk = rows.slice(i, i + 30);
  const { error } = await sb
    .from("edubite_inspiration_role_models")
    .upsert(chunk, { onConflict: "content_key" });
  if (error) {
    console.error(error);
    process.exit(1);
  }
}

const keep = new Set(ROLE_MODELS.map((item) => item.contentKey));
const { data: existing, error: listErr } = await sb
  .from("edubite_inspiration_role_models")
  .select("content_key");
if (listErr) {
  console.error(listErr);
  process.exit(1);
}
const stale = (existing ?? [])
  .map((row) => row.content_key)
  .filter((key) => !keep.has(key));
if (stale.length > 0) {
  const { error: delErr } = await sb
    .from("edubite_inspiration_role_models")
    .delete()
    .in("content_key", stale);
  if (delErr) {
    console.error(delErr);
    process.exit(1);
  }
}

const { count, error: countErr } = await sb
  .from("edubite_inspiration_role_models")
  .select("content_key", { count: "exact", head: true });
if (countErr) {
  console.error(countErr);
  process.exit(1);
}

const first = ROLE_MODELS[0];
const { error: blockErr } = await sb.from("edubite_inspiration_blocks").upsert(
  [
    {
      id: "role_model",
      payload: {
        index: first.index,
        avatar: first.avatar,
        image: "",
        name: first.name,
        tag: first.tag,
        quote: first.quote,
        bio: first.bio,
        inspireWhy: first.inspireWhy,
        pcmConnections: first.pcmConnections,
      },
    },
  ],
  { onConflict: "id" },
);
if (blockErr) {
  console.error(blockErr);
  process.exit(1);
}

console.log("OK seeded role models", {
  count,
  expected: 90,
  first: first.name,
  last: ROLE_MODELS[ROLE_MODELS.length - 1].name,
  images: 0,
});
