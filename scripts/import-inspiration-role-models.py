"""Parse 90 inspirational science profiles from 3 DOCX volumes into TS + SQL.

No images are imported — only the fields shown in the Inspiration role-model UI:
index, avatar, name, tag, quote, bio, inspireWhy, pcmConnections.
"""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

EXPECTED_TOTAL = 90
EXPECTED_PER_VOLUME = 30
WORD_NAMESPACE = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
}
WHY_HEADING = "WHY THIS SHOULD INSPIRE CLASS XI–XII PCM STUDENTS"
SKIP_LINES = {
    "ANCIENT INDIA",
    "MODERN INDIA",
    "WORLD SCIENCE",
    "INDIA: ANCIENT & MODERN",
    "INDIA: ANCIENT, MODERN & DIASPORA",
    "INDIA: PHYSICS, MATHEMATICS & APPLIED SCIENCE",
    "KEY FIGURES FROM WORLD SCIENCE",
    "PROFILE",
    "IMAGE SOURCE",
    "BIOGRAPHY REFERENCE",
    "SOURCES & IMAGE CREDITS",
    "CONTENTS",
    "HOW TO USE THIS COLLECTION",
}
CAPTION_MARKERS = (
    "portrait",
    "statue",
    "photograph",
    "artistic",
    "depiction",
    "bas-relief",
    "no authentic",
    "image source",
    "credit",
    "shaheedi",
    "modern statue",
    "historical",
    "no contemporary",
)


def extract_paragraphs(docx_path: Path) -> list[str]:
    with zipfile.ZipFile(docx_path) as archive:
        root = ET.fromstring(archive.read("word/document.xml"))
    return [
        "".join(
            text.text or ""
            for text in paragraph.findall(".//w:t", WORD_NAMESPACE)
        ).strip()
        for paragraph in root.findall(".//w:p", WORD_NAMESPACE)
        if "".join(
            text.text or ""
            for text in paragraph.findall(".//w:t", WORD_NAMESPACE)
        ).strip()
    ]


def is_caption(line: str) -> bool:
    low = line.lower()
    return any(marker in low for marker in CAPTION_MARKERS)


def avatar_for(tag: str) -> str:
    upper = tag.upper()
    if any(k in upper for k in ("AEROSPACE", "MISSILE", "AERONAUT", "SPACE SCIENTIST")):
        return "🚀"
    if any(k in upper for k in ("CHEMIST", "CHEMICAL", "PHARMACEUTICAL", "ORGANIC")):
        return "⚗️"
    if any(
        k in upper
        for k in (
            "SURGEON",
            "MEDICAL",
            "BIOCHEM",
            "BIOPHYS",
            "GENETIC",
            "BIOLOG",
            "CRISPR",
            "BOTAN",
            "AGRICULT",
        )
    ):
        return "🧬"
    if any(k in upper for k in ("COMPUTER", "INFORMATION", "CRYPTOGRAPH")):
        return "💻"
    if any(k in upper for k in ("ENGINEER", "INVENTOR", "INDUSTRIAL")):
        return "🛠️"
    if any(k in upper for k in ("MATHEMATICIAN", "NUMBER", "STATISTIC", "ALGEBRA")):
        return "📐"
    if any(k in upper for k in ("ASTRONOM", "ASTROPHYS", "COSMOLOG", "NASA")):
        return "🌌"
    if any(k in upper for k in ("PHYSICIST", "PHYSICS", "NUCLEAR", "QUANTUM")):
        return "⚛️"
    return "✨"


def parse_volume(docx_path: Path, volume: int) -> list[dict[str, object]]:
    paragraphs = extract_paragraphs(docx_path)
    why_indexes = [i for i, line in enumerate(paragraphs) if line == WHY_HEADING]
    if len(why_indexes) != EXPECTED_PER_VOLUME:
        raise ValueError(
            f"{docx_path.name}: expected {EXPECTED_PER_VOLUME} profiles, "
            f"found {len(why_indexes)} WHY headings"
        )

    profiles: list[dict[str, object]] = []
    for why_index in why_indexes:
        inspire_why = paragraphs[why_index + 1] if why_index + 1 < len(paragraphs) else ""
        pcm_line = paragraphs[why_index + 2] if why_index + 2 < len(paragraphs) else ""
        if not pcm_line.startswith("PCM CONNECTIONS"):
            raise ValueError(
                f"{docx_path.name}: missing PCM CONNECTIONS after WHY at {why_index}"
            )

        cursor = why_index - 1
        bio_parts: list[str] = []
        while cursor >= 0 and len(bio_parts) < 3:
            line = paragraphs[cursor]
            if line == WHY_HEADING or line.startswith("PCM CONNECTIONS"):
                break
            bio_parts.append(line)
            cursor -= 1
        bio_parts.reverse()
        if len(bio_parts) != 3:
            raise ValueError(
                f"{docx_path.name}: expected 3 bio paragraphs before WHY at {why_index}, "
                f"got {len(bio_parts)}"
            )

        quote = paragraphs[cursor] if cursor >= 0 else ""
        cursor -= 1
        tag = paragraphs[cursor] if cursor >= 0 else ""
        cursor -= 1
        name = paragraphs[cursor] if cursor >= 0 else ""
        cursor -= 1

        local_index: str | None = None
        while cursor >= 0:
            line = paragraphs[cursor]
            if re.fullmatch(r"\d{1,2}", line):
                local_index = line.zfill(2)
                break
            if line in SKIP_LINES or is_caption(line):
                cursor -= 1
                continue
            break

        number = len(profiles) + 1
        if local_index is None:
            local_index = f"{number:02d}"
        if int(local_index) != number:
            # Prefer sequential volume order if doc numbering drifts.
            local_index = f"{number:02d}"

        pcm = re.sub(r"^PCM CONNECTIONS\s*", "", pcm_line).strip()
        for field_name, value in (
            ("name", name),
            ("tag", tag),
            ("quote", quote),
            ("inspireWhy", inspire_why),
            ("pcmConnections", pcm),
        ):
            if not value or not str(value).strip():
                raise ValueError(
                    f"{docx_path.name}: empty {field_name} for profile #{number}"
                )

        profiles.append(
            {
                "contentKey": f"role-model-v{volume}-{number:02d}",
                "volume": volume,
                "number": number,
                "index": local_index,
                "avatar": avatar_for(tag),
                "name": name.strip(),
                "tag": tag.strip(),
                "quote": quote.strip(),
                "bio": "\n\n".join(part.strip() for part in bio_parts),
                "inspireWhy": inspire_why.strip(),
                "pcmConnections": pcm,
            }
        )

    names = [str(item["name"]) for item in profiles]
    if len(set(names)) != len(names):
        raise ValueError(f"{docx_path.name}: duplicate names in volume")
    return profiles


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def render_typescript(profiles: list[dict[str, object]]) -> str:
    payload = json.dumps(profiles, ensure_ascii=False, indent=2)
    return (
        "export type InspirationRoleModel = {\n"
        "  contentKey: string;\n"
        "  volume: number;\n"
        "  number: number;\n"
        "  index: string;\n"
        "  avatar: string;\n"
        "  name: string;\n"
        "  tag: string;\n"
        "  quote: string;\n"
        "  bio: string;\n"
        "  inspireWhy: string;\n"
        "  pcmConnections: string;\n"
        "};\n\n"
        "export const INSPIRATION_ROLE_MODELS: readonly InspirationRoleModel[] = "
        f"{payload};\n"
    )


def render_migration(profiles: list[dict[str, object]]) -> str:
    rows: list[str] = []
    for order, item in enumerate(profiles):
        rows.append(
            "  ("
            + ", ".join(
                [
                    sql_literal(str(item["contentKey"])),
                    str(item["volume"]),
                    str(item["number"]),
                    sql_literal(str(item["index"])),
                    sql_literal(str(item["avatar"])),
                    sql_literal(str(item["name"])),
                    sql_literal(str(item["tag"])),
                    sql_literal(str(item["quote"])),
                    sql_literal(str(item["bio"])),
                    sql_literal(str(item["inspireWhy"])),
                    sql_literal(str(item["pcmConnections"])),
                    str(order),
                ]
            )
            + ")"
        )

    values = ",\n".join(rows)
    return f"""-- Inspiration role-model catalog (90 profiles, text only — no images)
CREATE TABLE IF NOT EXISTS public.edubite_inspiration_role_models (
  id bigserial PRIMARY KEY,
  content_key text NOT NULL,
  volume integer NOT NULL,
  number integer NOT NULL,
  index_label text NOT NULL,
  avatar text NOT NULL,
  name text NOT NULL,
  tag text NOT NULL,
  quote text NOT NULL,
  bio text NOT NULL,
  inspire_why text NOT NULL,
  pcm_connections text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS edubite_inspiration_role_models_content_key_idx
  ON public.edubite_inspiration_role_models (content_key);

CREATE INDEX IF NOT EXISTS edubite_inspiration_role_models_sort_order_idx
  ON public.edubite_inspiration_role_models (sort_order);

ALTER TABLE public.edubite_inspiration_role_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS edubite_inspiration_role_models_select
  ON public.edubite_inspiration_role_models;
CREATE POLICY edubite_inspiration_role_models_select
  ON public.edubite_inspiration_role_models
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS edubite_inspiration_role_models_admin
  ON public.edubite_inspiration_role_models;
CREATE POLICY edubite_inspiration_role_models_admin
  ON public.edubite_inspiration_role_models
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO public.edubite_inspiration_role_models (
  content_key,
  volume,
  number,
  index_label,
  avatar,
  name,
  tag,
  quote,
  bio,
  inspire_why,
  pcm_connections,
  sort_order
)
VALUES
{values}
ON CONFLICT (content_key) DO UPDATE SET
  volume = EXCLUDED.volume,
  number = EXCLUDED.number,
  index_label = EXCLUDED.index_label,
  avatar = EXCLUDED.avatar,
  name = EXCLUDED.name,
  tag = EXCLUDED.tag,
  quote = EXCLUDED.quote,
  bio = EXCLUDED.bio,
  inspire_why = EXCLUDED.inspire_why,
  pcm_connections = EXCLUDED.pcm_connections,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

DELETE FROM public.edubite_inspiration_role_models
WHERE content_key NOT IN ({", ".join(sql_literal(str(item["contentKey"])) for item in profiles)});

GRANT SELECT ON public.edubite_inspiration_role_models TO anon, authenticated;
"""


def main() -> int:
    if len(sys.argv) != 5:
        print(
            "Usage: import-inspiration-role-models.py "
            "<vol1.docx> <vol2.docx> <vol3.docx> <repo-root>",
            file=sys.stderr,
        )
        return 1

    vol1, vol2, vol3, root = map(Path, sys.argv[1:5])
    profiles = [
        *parse_volume(vol1, 1),
        *parse_volume(vol2, 2),
        *parse_volume(vol3, 3),
    ]
    if len(profiles) != EXPECTED_TOTAL:
        raise ValueError(f"Expected {EXPECTED_TOTAL} profiles, got {len(profiles)}")

    # Global display index 01..90 across volumes.
    for order, item in enumerate(profiles, start=1):
        item["index"] = f"{order:02d}"

    names = [str(item["name"]) for item in profiles]
    if len(set(names)) != len(names):
        raise ValueError("Duplicate names across volumes")

    for item in profiles:
        for key in (
            "contentKey",
            "index",
            "avatar",
            "name",
            "tag",
            "quote",
            "bio",
            "inspireWhy",
            "pcmConnections",
        ):
            if not str(item[key]).strip():
                raise ValueError(f"Missing {key} on {item['name']}")

    data_path = root / "data" / "inspiration-role-models.ts"
    migration_path = (
        root
        / "supabase"
        / "migrations"
        / "20260721003000_inspiration_role_models_catalog.sql"
    )
    data_path.write_text(render_typescript(profiles), encoding="utf-8")
    migration_path.write_text(render_migration(profiles), encoding="utf-8")

    print(
        json.dumps(
            {
                "profiles": len(profiles),
                "volumes": {
                    "1": sum(1 for item in profiles if item["volume"] == 1),
                    "2": sum(1 for item in profiles if item["volume"] == 2),
                    "3": sum(1 for item in profiles if item["volume"] == 3),
                },
                "first": profiles[0]["name"],
                "last": profiles[-1]["name"],
                "data": str(data_path),
                "migration": str(migration_path),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
