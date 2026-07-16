/**
 * Seed edubite_pledge_reel_* for AM or PM from in-repo catalog.
 * Usage: node scripts/seed-edubite-pledges.mjs am|pm
 * Needs SUPABASE_SERVICE_ROLE_KEY from Web/.env (same TestBee project).
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const slot = process.argv[2] === "am" ? "am" : "pm";

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

function loadCatalog(filePath, exportName) {
  const raw = fs.readFileSync(filePath, "utf8");
  const start = raw.indexOf(`export const ${exportName}`);
  if (start < 0) throw new Error(`Missing ${exportName} in ${filePath}`);
  const eq = raw.indexOf("=", start);
  const arrStart = raw.indexOf("[", eq);
  let depth = 0;
  let end = -1;
  for (let i = arrStart; i < raw.length; i++) {
    if (raw[i] === "[") depth++;
    else if (raw[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return Function(`"use strict"; return (${raw.slice(arrStart, end + 1)});`)();
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
  console.error("Missing URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const file =
  slot === "am"
    ? path.join(process.cwd(), "data", "pledge-reels-am.ts")
    : path.join(process.cwd(), "data", "pledge-reels-pm.ts");
const exportName =
  slot === "am" ? "PLEDGE_REEL_AM_DAYS" : "PLEDGE_REEL_PM_DAYS";
const data = loadCatalog(file, exportName);

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log(`Seeding ${data.length} ${slot.toUpperCase()} days → ${url}`);

const dayRows = data.map((d) => ({
  day: d.day,
  theme: d.theme,
  pledge_slot: slot,
}));

const { error: dayErr } = await supabase
  .from("edubite_pledge_reel_days")
  .upsert(dayRows, { onConflict: "pledge_slot,day" });
if (dayErr) {
  console.error("days upsert failed", dayErr);
  process.exit(1);
}

const slideRows = [];
for (const d of data) {
  d.slides.forEach((s, idx) => {
    slideRows.push({
      pledge_slot: slot,
      day: d.day,
      slide_index: idx,
      icon: s.icon,
      headline: s.headline,
      emphasis_word: s.emphasisWord,
      caption: s.caption,
    });
  });
}

const CHUNK = 100;
for (let i = 0; i < slideRows.length; i += CHUNK) {
  const chunk = slideRows.slice(i, i + CHUNK);
  const { error } = await supabase
    .from("edubite_pledge_reel_slides")
    .upsert(chunk, { onConflict: "pledge_slot,day,slide_index" });
  if (error) {
    console.error("slides upsert failed at", i, error);
    process.exit(1);
  }
  console.log(`slides ${i + 1}–${i + chunk.length}/${slideRows.length}`);
}

const { count: dayCount } = await supabase
  .from("edubite_pledge_reel_days")
  .select("*", { count: "exact", head: true })
  .eq("pledge_slot", slot);
const { count: slideCount } = await supabase
  .from("edubite_pledge_reel_slides")
  .select("*", { count: "exact", head: true })
  .eq("pledge_slot", slot);

console.log("OK seeded", { slot, dayCount, slideCount });
