import { writeFileSync } from "node:fs";
import { PUZZLES, ORIGINAL_PUZZLES } from "@/data/puzzles/catalog";

const outputPath = process.argv[2];
if (!outputPath) {
  throw new Error(
    "Usage: tsx scripts/generate-puzzle-supabase-migration.ts <output.sql>",
  );
}

const launchDate = new Date(Date.UTC(2026, 6, 20));
const firstCompetitiveIndex = ORIGINAL_PUZZLES.length;

function dateForPuzzle(index: number): string {
  const sequenceOffset =
    index >= firstCompetitiveIndex
      ? index - firstCompetitiveIndex
      : PUZZLES.length - firstCompetitiveIndex + index;
  const date = new Date(launchDate);
  date.setUTCDate(date.getUTCDate() + sequenceOffset);
  return date.toISOString().slice(0, 10);
}

const rows = PUZZLES.map((puzzle, index) => ({
  content_key: puzzle.id,
  active_date: dateForPuzzle(index),
  tag: puzzle.topic,
  q: puzzle.prompt,
  opts: puzzle.kind === "mcq" ? puzzle.options : [],
  correct: puzzle.kind === "mcq" ? puzzle.correctOptionIndex : 0,
  sort_order: 0,
  published: true,
  class_level:
    puzzle.grade === "XI" ? "11" : puzzle.grade === "XII" ? "12" : null,
  metadata: {
    number: puzzle.number,
    title: puzzle.title,
    grade: puzzle.grade,
    kind: puzzle.kind === "mcq" ? "mcq" : "open-ended",
    hint: puzzle.hint,
    answer: puzzle.answer,
  },
}));

const json = JSON.stringify(rows).replace(/\$puzzles\$/g, "");
const sql = `-- Unified Supabase catalog for all existing and imported puzzles.
ALTER TABLE public.edubite_content_questions
  DROP CONSTRAINT IF EXISTS edubite_content_questions_domain_check;

ALTER TABLE public.edubite_content_questions
  ADD CONSTRAINT edubite_content_questions_domain_check
  CHECK (domain IN ('dailydose', 'funbrain', 'puzzle'));

ALTER TABLE public.edubite_content_questions
  ADD COLUMN IF NOT EXISTS content_key text,
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_edubite_content_questions_puzzle_key
  ON public.edubite_content_questions (domain, content_key)
  WHERE domain = 'puzzle';

DROP POLICY IF EXISTS edubite_content_questions_select_published
  ON public.edubite_content_questions;
CREATE POLICY edubite_content_questions_select_published
  ON public.edubite_content_questions
  FOR SELECT
  TO anon, authenticated
  USING (
    (domain <> 'puzzle' AND published = true)
    OR public.edubite_is_content_admin()
  );

WITH source AS (
  SELECT *
  FROM jsonb_to_recordset($puzzles$${json}$puzzles$::jsonb) AS row_data(
    content_key text,
    active_date date,
    tag text,
    q text,
    opts jsonb,
    correct integer,
    sort_order integer,
    published boolean,
    class_level text,
    metadata jsonb
  )
)
INSERT INTO public.edubite_content_questions (
  domain,
  content_key,
  active_date,
  tag,
  q,
  opts,
  correct,
  sort_order,
  published,
  class_level,
  metadata,
  updated_at
)
SELECT
  'puzzle',
  content_key,
  active_date,
  tag,
  q,
  opts,
  correct,
  sort_order,
  published,
  class_level,
  metadata,
  now()
FROM source
ON CONFLICT (domain, content_key) WHERE domain = 'puzzle'
DO UPDATE SET
  active_date = EXCLUDED.active_date,
  tag = EXCLUDED.tag,
  q = EXCLUDED.q,
  opts = EXCLUDED.opts,
  correct = EXCLUDED.correct,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  class_level = EXCLUDED.class_level,
  metadata = EXCLUDED.metadata,
  updated_at = now();

COMMENT ON COLUMN public.edubite_content_questions.content_key IS
  'Stable source identifier for unified content; required for puzzle rows.';
COMMENT ON COLUMN public.edubite_content_questions.metadata IS
  'Domain-specific metadata. Puzzle rows contain title, grade, kind, hint, answer, and number.';
`;

writeFileSync(outputPath, sql, "utf8");
console.log(`Generated ${rows.length} puzzle rows in ${outputPath}`);

const chunkPrefix = process.argv[3];
if (chunkPrefix) {
  for (let offset = 0; offset < rows.length; offset += 19) {
    const chunk = JSON.stringify(rows.slice(offset, offset + 19)).replace(
      /\$puzzles\$/g,
      "",
    );
    const chunkSql = `WITH source AS (
  SELECT * FROM jsonb_to_recordset($puzzles$${chunk}$puzzles$::jsonb) AS row_data(
    content_key text, active_date date, tag text, q text, opts jsonb,
    correct integer, sort_order integer, published boolean,
    class_level text, metadata jsonb
  )
)
INSERT INTO public.edubite_content_questions (
  domain, content_key, active_date, tag, q, opts, correct, sort_order,
  published, class_level, metadata, updated_at
)
SELECT 'puzzle', content_key, active_date, tag, q, opts, correct, sort_order,
  published, class_level, metadata, now()
FROM source
ON CONFLICT (domain, content_key) WHERE domain = 'puzzle'
DO UPDATE SET active_date = EXCLUDED.active_date, tag = EXCLUDED.tag,
  q = EXCLUDED.q, opts = EXCLUDED.opts, correct = EXCLUDED.correct,
  sort_order = EXCLUDED.sort_order, published = EXCLUDED.published,
  class_level = EXCLUDED.class_level, metadata = EXCLUDED.metadata,
  updated_at = now();`;
    const chunkNumber = Math.floor(offset / 19) + 1;
    writeFileSync(`${chunkPrefix}-${chunkNumber}.sql`, chunkSql, "utf8");
  }
  console.log("Generated 6 Supabase upload chunks");
}
