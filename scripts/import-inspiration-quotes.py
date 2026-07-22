"""Generate the typed quote catalog and Supabase migration from the source DOCX."""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


EXPECTED_QUOTE_COUNT = 185
WORD_NAMESPACE = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
}
CATEGORY_ALIASES = {
    "Discipline and Consistency": "Discipline and Consistency",
    "Learning and Understanding": "Learning and Understanding",
    "Mathematics": "Mathematics",
    "Physics": "Physics",
    "Chemistry": "Chemistry",
    "Exams and Performance": "Exams and Performance",
    "Exam and Performance": "Exams and Performance",
    "Speed, Accuracy and Stamina": "Speed, Accuracy and Stamina",
    "Best Ways to Prepare": "Best Ways to Prepare",
    "Mindset on Exam Day": "Mindset on Exam Day",
}
EDITORIAL_CORRECTIONS = {
    "A strong result in form of a a steak is usually the visible part of an invisible routine.":
        "A strong result in the form of a streak is usually the visible part of an invisible routine.",
    "Progress grows when excuses shrink. So please ensure you turn up …":
        "Progress grows when excuses shrink. Make sure you show up.",
    "Few difficult questions are not permission to lose confidence in the entire paper. Skip and continue than getting stuck":
        "A few difficult questions are not a reason to lose confidence in the entire paper. Skip them and continue rather than getting stuck.",
    "Do not wait for a free day to some something important; create a focused hour.":
        "Do not wait for a free day to do something important; create a focused hour.",
}


def extract_paragraphs(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    return [
        "".join(
            text.text or ""
            for text in paragraph.findall(".//w:t", WORD_NAMESPACE)
        ).strip()
        for paragraph in root.findall(".//w:p", WORD_NAMESPACE)
    ]


def parse_quotes(paragraphs: list[str]) -> list[dict[str, str]]:
    quotes: list[dict[str, str]] = []
    category: str | None = None

    for paragraph in filter(None, paragraphs):
        if paragraph in CATEGORY_ALIASES:
            category = CATEGORY_ALIASES[paragraph]
            continue
        if paragraph.endswith("Motivational Quotes for Class XI and XII PCM Students"):
            continue
        if not paragraph.startswith("“") or not paragraph.endswith("”"):
            raise ValueError(f"Unexpected DOCX paragraph: {paragraph!r}")
        if category is None:
            raise ValueError(f"Quote has no category: {paragraph!r}")

        quote = paragraph.removeprefix("“").removesuffix("”").strip()
        quote = EDITORIAL_CORRECTIONS.get(quote, quote)
        quotes.append(
            {
                "contentKey": f"pcm-motivation-{len(quotes) + 1:03d}",
                "category": category,
                "quote": quote,
            }
        )

    if len(quotes) != EXPECTED_QUOTE_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_QUOTE_COUNT} quotes, parsed {len(quotes)}"
        )
    if len({item["quote"] for item in quotes}) != len(quotes):
        raise ValueError("Duplicate quotes found in source document")
    return quotes


def render_typescript(quotes: list[dict[str, str]]) -> str:
    payload = json.dumps(quotes, ensure_ascii=False, indent=2)
    return (
        "export type InspirationQuote = {\n"
        "  contentKey: string;\n"
        "  category: string;\n"
        "  quote: string;\n"
        "};\n\n"
        "export const INSPIRATION_QUOTES: readonly InspirationQuote[] = "
        f"{payload};\n"
    )


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def render_migration(quotes: list[dict[str, str]]) -> str:
    values = ",\n".join(
        "    ("
        + ", ".join(
            [
                sql_literal(item["contentKey"]),
                sql_literal(item["category"]),
                sql_literal(item["quote"]),
                str(index),
            ]
        )
        + ")"
        for index, item in enumerate(quotes)
    )
    keys = ", ".join(sql_literal(item["contentKey"]) for item in quotes)
    return f"""BEGIN;

ALTER TABLE public.edubite_inspiration_quotes
  ADD COLUMN IF NOT EXISTS content_key text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';

UPDATE public.edubite_inspiration_quotes
SET content_key = 'legacy-' || id::text
WHERE content_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS edubite_inspiration_quotes_content_key_idx
  ON public.edubite_inspiration_quotes (content_key);

CREATE INDEX IF NOT EXISTS edubite_inspiration_quotes_category_idx
  ON public.edubite_inspiration_quotes (category);

WITH catalog(content_key, category, quote, sort_order) AS (
  VALUES
{values}
)
INSERT INTO public.edubite_inspiration_quotes (
  content_key,
  category,
  quote,
  sort_order
)
SELECT content_key, category, quote, sort_order
FROM catalog
ON CONFLICT (content_key) DO UPDATE
SET category = EXCLUDED.category,
    quote = EXCLUDED.quote,
    sort_order = EXCLUDED.sort_order;

DELETE FROM public.edubite_inspiration_quotes
WHERE content_key NOT IN ({keys});

ALTER TABLE public.edubite_inspiration_quotes
  ALTER COLUMN content_key SET NOT NULL;

GRANT SELECT ON public.edubite_inspiration_quotes TO anon, authenticated;

COMMIT;
"""


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: import-inspiration-quotes.py <source.docx> "
            "<output.ts> <migration.sql>"
        )

    source_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    migration_path = Path(sys.argv[3])
    quotes = parse_quotes(extract_paragraphs(source_path))

    output_path.write_text(render_typescript(quotes), encoding="utf-8")
    migration_path.write_text(render_migration(quotes), encoding="utf-8")
    categories = sorted({item["category"] for item in quotes})
    print(
        json.dumps(
            {"quotes": len(quotes), "categories": categories},
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
