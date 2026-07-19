import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const sourcePath = process.argv[2];
const outputPath = process.argv[3];

if (!sourcePath || !outputPath) {
  throw new Error(
    "Usage: node scripts/import-competitive-puzzles.mjs <parsed.json> <output.ts>",
  );
}

const sectionMetadata = {
  1: {
    title: "Visual & Spatial Reasoning",
    topic: "Spatial Reasoning",
    hint: "Sketch the arrangement and track only the information that changes.",
  },
  2: {
    title: "Logical & Analytical Reasoning",
    topic: "Logical Reasoning",
    hint: "List the constraints first, then eliminate impossible cases.",
  },
  3: {
    title: "Mathematics Olympiad",
    topic: "Mathematics",
    hint: "Look for a useful identity, invariant, or extremal case.",
  },
  4: {
    title: "General Knowledge",
    topic: "General Knowledge",
    hint: "Check each statement independently before combining your choices.",
  },
};

const source = JSON.parse(await readFile(sourcePath, "utf8"));
if (!Array.isArray(source)) throw new Error("Expected a top-level JSON array");

const seenIds = new Set();
const puzzles = source.map((entry, index) => {
  const match = /^Section (\d+) — Q(\d+)$/.exec(entry.sourceNumber);
  if (!match) throw new Error(`Invalid source number: ${entry.sourceNumber}`);
  const section = Number(match[1]);
  const sourceQuestion = Number(match[2]);
  const metadata = sectionMetadata[section];
  if (!metadata) throw new Error(`Unsupported section: ${section}`);

  const id = `competitive-s${section}-q${sourceQuestion}`;
  if (seenIds.has(id)) throw new Error(`Duplicate puzzle id: ${id}`);
  seenIds.add(id);

  const prompt =
    id === "competitive-s1-q27"
      ? entry.prompt.replace(
          "Row 3 = Triangle, ?, Circle.",
          "Row 3 = Triangle, ?, Square.",
        )
      : entry.prompt;
  const explanation = String(entry["explanation/hint"] ?? "").trim();
  const base = {
    id,
    number: index + 17,
    grade: "Competitive",
    title: `${metadata.title} · ${sourceQuestion}`,
    prompt,
    hint: metadata.hint,
    answer:
      entry.kind === "mcq"
        ? explanation
        : `${entry.answer}${explanation ? `\n\n${explanation}` : ""}`,
    topic: metadata.topic,
  };

  if (entry.kind === "open-ended") return base;
  if (
    entry.kind !== "mcq" ||
    !Array.isArray(entry.options) ||
    entry.options.length !== 4 ||
    !Number.isInteger(entry.correctOptionIndex) ||
    entry.correctOptionIndex < 0 ||
    entry.correctOptionIndex > 3
  ) {
    throw new Error(`Invalid MCQ: ${entry.sourceNumber}`);
  }
  return {
    ...base,
    kind: "mcq",
    options: entry.options,
    correctOptionIndex: entry.correctOptionIndex,
  };
});

if (puzzles.length !== 98) {
  throw new Error(`Expected 98 source questions, received ${puzzles.length}`);
}

const file = `import type { PuzzleDef } from "@/lib/puzzles/types";

/**
 * Imported from Competitive_Exam_Practice_Set_100_Harder_Puzzles (2).docx.
 * The source advertises 100 questions but contains 98: Section 2 Q30 and
 * Section 4 Q20 are absent. Section 1 Q27's contradictory row was corrected.
 */
export const COMPETITIVE_PUZZLES = ${JSON.stringify(puzzles, null, 2)} satisfies PuzzleDef[];
`;

await writeFile(path.resolve(outputPath), file, "utf8");
console.log(`Wrote ${puzzles.length} puzzles to ${outputPath}`);
