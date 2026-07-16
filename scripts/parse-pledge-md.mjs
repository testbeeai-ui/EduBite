/**
 * Parse Morning/Evening pledge markdown → extract all day objects.
 * Usage: node scripts/parse-pledge-md.mjs "<path.md>" am|pm
 */
import fs from "node:fs";
import path from "node:path";

const mdPath = process.argv[2];
const slot = process.argv[3] === "am" ? "am" : "pm";
if (!mdPath || !fs.existsSync(mdPath)) {
  console.error("Usage: node scripts/parse-pledge-md.mjs <file.md> am|pm");
  process.exit(1);
}

const raw = fs.readFileSync(mdPath, "utf8");
// Unescape common markdown escapes that break JSON
const unescaped = raw
  .replace(/\\([\[\]\.+\-])/g, "$1")
  .replace(/\\&/g, "&");

function extractDayObjects(text) {
  const days = new Map();
  const dayKey = /"day"\s*:\s*(\d+)/g;
  let match;
  while ((match = dayKey.exec(text)) !== null) {
    const dayNum = Number(match[1]);
    let start = match.index;
    while (start > 0 && text[start] !== "{") start--;
    if (text[start] !== "{") continue;

    let depth = 0;
    let end = -1;
    let inString = false;
    let escape = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (c === "\\") {
          escape = true;
          continue;
        }
        if (c === '"') inString = false;
        continue;
      }
      if (c === '"') {
        inString = true;
        continue;
      }
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;

    let objText = text.slice(start, end + 1);
    objText = objText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    objText = objText.replace(/,\s*([}\]])/g, "$1");
    try {
      const obj = JSON.parse(objText);
      if (
        typeof obj.day === "number" &&
        typeof obj.theme === "string" &&
        Array.isArray(obj.slides) &&
        obj.slides.length === 4
      ) {
        if (!days.has(obj.day)) days.set(obj.day, obj);
      }
    } catch {
      // skip
    }
  }
  return [...days.values()].sort((a, b) => a.day - b.day);
}

const data = extractDayObjects(unescaped);
const maxDay = data.length ? Math.max(...data.map((d) => d.day)) : 0;
const gaps = [];
for (let i = 1; i <= maxDay; i++) {
  if (!data.find((d) => d.day === i)) gaps.push(i);
}

console.log(
  JSON.stringify(
    {
      slot,
      days: data.length,
      maxDay,
      gaps,
      first: data[0]?.theme,
      last: data[data.length - 1]?.theme,
    },
    null,
    2,
  ),
);

function esc(str) {
  return JSON.stringify(str);
}

const outName = slot === "am" ? "pledge-reels-am.ts" : "pledge-reels-pm.ts";
const constName =
  slot === "am" ? "PLEDGE_REEL_AM_DAYS" : "PLEDGE_REEL_PM_DAYS";
const lines = [];
lines.push(`/** ${slot.toUpperCase()} pledge reel — ${data.length} days × 4 slides. */`);
lines.push(`export type PledgeReel${slot === "am" ? "Am" : "Pm"}Slide = {`);
lines.push(`  icon: string;`);
lines.push(`  headline: string;`);
lines.push(`  emphasisWord: string;`);
lines.push(`  caption: string;`);
lines.push(`};`);
lines.push(``);
lines.push(`export type PledgeReel${slot === "am" ? "Am" : "Pm"}Day = {`);
lines.push(`  day: number;`);
lines.push(`  theme: string;`);
lines.push(`  slides: PledgeReel${slot === "am" ? "Am" : "Pm"}Slide[];`);
lines.push(`};`);
lines.push(``);
lines.push(`export const ${constName}: PledgeReel${slot === "am" ? "Am" : "Pm"}Day[] = [`);
for (const d of data) {
  lines.push(`  {`);
  lines.push(`    day: ${d.day},`);
  lines.push(`    theme: ${esc(d.theme)},`);
  lines.push(`    slides: [`);
  for (const s of d.slides) {
    lines.push(`      {`);
    lines.push(`        icon: ${esc(s.icon)},`);
    lines.push(`        headline: ${esc(s.headline)},`);
    lines.push(`        emphasisWord: ${esc(s.emphasisWord)},`);
    lines.push(`        caption: ${esc(s.caption)},`);
    lines.push(`      },`);
  }
  lines.push(`    ],`);
  lines.push(`  },`);
}
lines.push(`];`);
lines.push(``);

const outPath = path.join(process.cwd(), "data", outName);
fs.writeFileSync(outPath, lines.join("\n"), "utf8");
console.log("wrote", outPath);

fs.writeFileSync(
  path.join(process.cwd(), `.tmp-pledge-${slot}.json`),
  JSON.stringify(data, null, 2),
);
