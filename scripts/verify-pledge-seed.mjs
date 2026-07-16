import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const slot = process.argv[2] === "am" ? "am" : "pm";
const file =
  slot === "am" ? "data/pledge-reels-am.ts" : "data/pledge-reels-pm.ts";
const exportName =
  slot === "am" ? "PLEDGE_REEL_AM_DAYS" : "PLEDGE_REEL_PM_DAYS";

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

function loadCatalog(filePath, name) {
  const raw = fs.readFileSync(filePath, "utf8");
  const start = raw.indexOf(`export const ${name}`);
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
  return Function(`return (${raw.slice(arrStart, end + 1)})`)();
}

const web = loadEnv(path.join("..", "Web", ".env"));
const local = loadEnv(".env");
const url = local.NEXT_PUBLIC_SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL;
const key = web.SUPABASE_SERVICE_ROLE_KEY || local.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });
const localData = loadCatalog(file, exportName);

const { data: days } = await sb
  .from("edubite_pledge_reel_days")
  .select("day,theme,pledge_slot")
  .eq("pledge_slot", slot)
  .order("day");
const { data: slides } = await sb
  .from("edubite_pledge_reel_slides")
  .select("day,slide_index,icon,headline,emphasis_word,caption")
  .eq("pledge_slot", slot)
  .order("day")
  .order("slide_index");

const byDay = new Map();
for (const d of days ?? []) byDay.set(d.day, { theme: d.theme, slides: [] });
for (const s of slides ?? []) {
  const row = byDay.get(s.day);
  if (!row) continue;
  row.slides[s.slide_index] = {
    icon: s.icon,
    headline: s.headline,
    emphasisWord: s.emphasis_word,
    caption: s.caption,
  };
}

let mismatches = 0;
for (const loc of localData) {
  const remote = byDay.get(loc.day);
  if (!remote || remote.theme !== loc.theme) {
    mismatches++;
    continue;
  }
  for (let i = 0; i < 4; i++) {
    const L = loc.slides[i];
    const R = remote.slides[i];
    if (
      !R ||
      L.icon !== R.icon ||
      L.headline !== R.headline ||
      L.emphasisWord !== R.emphasisWord ||
      L.caption !== R.caption
    ) {
      mismatches++;
    }
  }
}

console.log(
  JSON.stringify(
    {
      slot,
      localDays: localData.length,
      remoteDays: days?.length ?? 0,
      remoteSlides: slides?.length ?? 0,
      mismatches,
      day1: byDay.get(1)?.theme,
      day180: byDay.get(180)?.theme,
    },
    null,
    2,
  ),
);
