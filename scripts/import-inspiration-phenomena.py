"""Generate the Natural Phenomena catalog and Supabase migration from DOCX sources."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


EXPECTED_PER_VOLUME = 90
WORD_NAMESPACE = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
}
PART_SUBJECTS = {
    "Part A — Physics in Nature and Technology": "Physics",
    "Part B — Chemistry in Nature and Technology": "Chemistry",
    "Part C — Mathematics in Nature and Invention": "Mathematics",
    "Part A — Fascinating Physics": "Physics",
    "Part B — Fascinating Chemistry and Materials": "Chemistry",
    "Part C — Fascinating Mathematics": "Mathematics",
}
SUBJECT_ICONS = {
    "Physics": "⚡",
    "Chemistry": "🧪",
    "Mathematics": "∑",
}
QUESTION_ICONS = {
    "How is a rainbow formed?": "🌈",
}
QUESTION_RE = re.compile(r"^(\d+)\.\s+(.*)$")


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


def normalize_part_heading(value: str) -> str:
    return (
        value.replace("\u2013", "\u2014")
        .replace("–", "—")
        .replace("−", "—")
        .strip()
    )


def parse_volume(
    paragraphs: list[str],
    *,
    volume: int,
    source_label: str,
) -> list[dict[str, str | int]]:
    items: list[dict[str, str | int]] = []
    subject: str | None = None
    current: dict[str, object] | None = None
    answer_parts: list[str] = []
    mode: str | None = None

    def flush() -> None:
        nonlocal current, answer_parts, mode
        if current is None:
            return
        explanation = "\n\n".join(part for part in answer_parts if part).strip()
        linked = str(current.get("linkedConcepts") or "").strip()
        follow = str(current.get("followUpQuestion") or "").strip()
        question = str(current.get("question") or "").strip()
        if not explanation or not linked or not follow or not question:
            raise ValueError(
                f"Incomplete Q{current.get('number')} in {source_label}: "
                f"question={bool(question)} answer={bool(explanation)} "
                f"linked={bool(linked)} follow={bool(follow)}"
            )
        number = int(current["number"])  # type: ignore[arg-type]
        subject_name = str(current["subject"])
        items.append(
            {
                "contentKey": f"natural-phenomena-v{volume}-{number:02d}",
                "volume": volume,
                "number": number,
                "subject": subject_name,
                "icon": QUESTION_ICONS.get(question, SUBJECT_ICONS[subject_name]),
                "badge": f"QUESTION {number}",
                "question": question,
                "explanation": explanation,
                "linkedConcepts": linked,
                "followUpQuestion": follow,
                "source": source_label,
            }
        )
        current = None
        answer_parts = []
        mode = None

    for raw in filter(None, paragraphs):
        paragraph = raw.strip()
        normalized_part = normalize_part_heading(paragraph)
        if normalized_part in PART_SUBJECTS:
            flush()
            subject = PART_SUBJECTS[normalized_part]
            continue
        if paragraph.startswith("90 Amazing") or paragraph.startswith(
            "90 More Amazing"
        ):
            continue
        if paragraph == "For Class XI and XII Students":
            continue

        question_match = QUESTION_RE.match(paragraph)
        if question_match:
            flush()
            if subject is None:
                raise ValueError(f"Question before part heading: {paragraph}")
            current = {
                "number": int(question_match.group(1)),
                "question": question_match.group(2).strip(),
                "subject": subject,
            }
            answer_parts = []
            mode = "await_answer"
            continue

        if current is None:
            continue

        if paragraph.startswith("Answer:"):
            mode = "answer"
            text = paragraph[len("Answer:") :].strip()
            if text:
                answer_parts.append(text)
            continue

        if paragraph.startswith("Linked concepts:"):
            mode = "linked"
            current["linkedConcepts"] = paragraph[
                len("Linked concepts:") :
            ].strip()
            continue

        if paragraph.startswith("Follow-up question:"):
            mode = "follow"
            current["followUpQuestion"] = paragraph[
                len("Follow-up question:") :
            ].strip()
            continue

        if mode == "answer":
            answer_parts.append(paragraph)
        elif mode == "linked":
            current["linkedConcepts"] = (
                f"{current.get('linkedConcepts', '')} {paragraph}".strip()
            )
        elif mode == "follow":
            current["followUpQuestion"] = (
                f"{current.get('followUpQuestion', '')} {paragraph}".strip()
            )

    flush()

    if len(items) != EXPECTED_PER_VOLUME:
        raise ValueError(
            f"{source_label}: expected {EXPECTED_PER_VOLUME}, got {len(items)}"
        )
    numbers = [int(item["number"]) for item in items]
    if numbers != list(range(1, EXPECTED_PER_VOLUME + 1)):
        raise ValueError(f"{source_label}: unexpected question numbering {numbers}")
    return items


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def render_typescript(items: list[dict[str, str | int]]) -> str:
    payload = json.dumps(items, ensure_ascii=False, indent=2)
    return (
        "export type InspirationPhenomenon = {\n"
        "  contentKey: string;\n"
        "  volume: number;\n"
        "  number: number;\n"
        "  subject: string;\n"
        "  icon: string;\n"
        "  badge: string;\n"
        "  question: string;\n"
        "  explanation: string;\n"
        "  linkedConcepts: string;\n"
        "  followUpQuestion: string;\n"
        "  source: string;\n"
        "};\n\n"
        "export const INSPIRATION_PHENOMENA: readonly InspirationPhenomenon[] = "
        f"{payload};\n"
    )


def render_migration(items: list[dict[str, str | int]]) -> str:
    values = ",\n".join(
        "    ("
        + ", ".join(
            [
                sql_literal(str(item["contentKey"])),
                str(int(item["volume"])),
                str(int(item["number"])),
                sql_literal(str(item["subject"])),
                sql_literal(str(item["icon"])),
                sql_literal(str(item["badge"])),
                sql_literal(str(item["question"])),
                sql_literal(str(item["explanation"])),
                sql_literal(str(item["linkedConcepts"])),
                sql_literal(str(item["followUpQuestion"])),
                sql_literal(str(item["source"])),
                str(index),
            ]
        )
        + ")"
        for index, item in enumerate(items)
    )
    keys = ", ".join(sql_literal(str(item["contentKey"])) for item in items)
    return f"""BEGIN;

CREATE TABLE IF NOT EXISTS public.edubite_inspiration_phenomena (
  id serial PRIMARY KEY,
  content_key text NOT NULL,
  volume integer NOT NULL,
  number integer NOT NULL,
  subject text NOT NULL,
  icon text NOT NULL,
  badge text NOT NULL,
  question text NOT NULL,
  explanation text NOT NULL,
  linked_concepts text NOT NULL,
  follow_up_question text NOT NULL,
  source text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS edubite_inspiration_phenomena_content_key_idx
  ON public.edubite_inspiration_phenomena (content_key);

CREATE INDEX IF NOT EXISTS edubite_inspiration_phenomena_subject_idx
  ON public.edubite_inspiration_phenomena (subject);

CREATE INDEX IF NOT EXISTS edubite_inspiration_phenomena_sort_order_idx
  ON public.edubite_inspiration_phenomena (sort_order);

ALTER TABLE public.edubite_inspiration_phenomena ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edubite_inspiration_phenomena_select
  ON public.edubite_inspiration_phenomena;
CREATE POLICY edubite_inspiration_phenomena_select
  ON public.edubite_inspiration_phenomena
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_inspiration_phenomena_admin
  ON public.edubite_inspiration_phenomena;
CREATE POLICY edubite_inspiration_phenomena_admin
  ON public.edubite_inspiration_phenomena
  FOR ALL
  TO authenticated
  USING (edubite_is_content_admin())
  WITH CHECK (edubite_is_content_admin());

WITH catalog(
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
) AS (
  VALUES
{values}
)
INSERT INTO public.edubite_inspiration_phenomena (
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
)
SELECT
  content_key,
  volume,
  number,
  subject,
  icon,
  badge,
  question,
  explanation,
  linked_concepts,
  follow_up_question,
  source,
  sort_order
FROM catalog
ON CONFLICT (content_key) DO UPDATE
SET volume = EXCLUDED.volume,
    number = EXCLUDED.number,
    subject = EXCLUDED.subject,
    icon = EXCLUDED.icon,
    badge = EXCLUDED.badge,
    question = EXCLUDED.question,
    explanation = EXCLUDED.explanation,
    linked_concepts = EXCLUDED.linked_concepts,
    follow_up_question = EXCLUDED.follow_up_question,
    source = EXCLUDED.source,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

DELETE FROM public.edubite_inspiration_phenomena
WHERE content_key NOT IN ({keys});

GRANT SELECT ON public.edubite_inspiration_phenomena TO anon, authenticated;

COMMIT;
"""


def main() -> None:
    if len(sys.argv) != 5:
        raise SystemExit(
            "Usage: import-inspiration-phenomena.py "
            "<v1.docx> <v2.docx> <output.ts> <migration.sql>"
        )

    v1_path = Path(sys.argv[1])
    v2_path = Path(sys.argv[2])
    output_path = Path(sys.argv[3])
    migration_path = Path(sys.argv[4])

    items = [
        *parse_volume(
            extract_paragraphs(v1_path),
            volume=1,
            source_label="Natural Phenomena Edubite v1",
        ),
        *parse_volume(
            extract_paragraphs(v2_path),
            volume=2,
            source_label="Natural Phenomena Edubite v2",
        ),
    ]

    if len({item["contentKey"] for item in items}) != len(items):
        raise ValueError("Duplicate content keys")
    if len({item["question"] for item in items}) != len(items):
        raise ValueError("Duplicate questions across volumes")

    output_path.write_text(render_typescript(items), encoding="utf-8")
    migration_path.write_text(render_migration(items), encoding="utf-8")

    by_subject: dict[str, int] = {}
    for item in items:
        subject = str(item["subject"])
        by_subject[subject] = by_subject.get(subject, 0) + 1

    print(
        json.dumps(
            {
                "total": len(items),
                "v1": sum(1 for item in items if item["volume"] == 1),
                "v2": sum(1 for item in items if item["volume"] == 2),
                "bySubject": by_subject,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
