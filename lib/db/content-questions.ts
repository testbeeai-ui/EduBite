import { createEdubiteSupabaseServer } from "@/lib/supabase/server";
import type { Question } from "@/lib/types";
import type {
  ContentDomain,
  ContentQuestionInput,
  ContentQuestionRow,
  DoseClassLevel,
} from "@/lib/content/types";

export type {
  ContentDomain,
  ContentQuestionInput,
  ContentQuestionRow,
} from "@/lib/content/types";

/** Supabase table — Edubite only; never confuse with Edublast `play_questions`. */
export const EDUBITE_CONTENT_QUESTIONS_TABLE = "edubite_content_questions";

type DbRow = {
  id: string;
  domain: string;
  class_level: string | null;
  active_date: string;
  tag: string | null;
  q: string;
  opts: unknown;
  correct: number;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

function parseOpts(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((o) => String(o));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.map((o) => String(o));
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: DbRow): ContentQuestionRow {
  const classLevel =
    row.class_level === "11" || row.class_level === "12"
      ? row.class_level
      : null;
  return {
    id: row.id,
    domain: row.domain as ContentDomain,
    classLevel,
    activeDate: String(row.active_date).slice(0, 10),
    tag: row.tag,
    q: row.q,
    opts: parseOpts(row.opts),
    correct: row.correct,
    sortOrder: row.sort_order,
    published: !!row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by ?? "",
  };
}

export function validateQuestionInput(
  input: Partial<ContentQuestionInput>,
): string | null {
  if (input.domain !== "dailydose" && input.domain !== "funbrain") {
    return "domain must be dailydose or funbrain";
  }
  if (input.domain === "dailydose") {
    if (input.classLevel !== "11" && input.classLevel !== "12") {
      return "classLevel must be 11 or 12 for dailydose";
    }
  } else if (input.classLevel != null) {
    return "classLevel is only for dailydose";
  }
  if (
    typeof input.activeDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(input.activeDate)
  ) {
    return "activeDate must be YYYY-MM-DD";
  }
  if (typeof input.q !== "string" || !input.q.trim()) {
    return "q is required";
  }
  if (!Array.isArray(input.opts) || input.opts.length !== 4) {
    return "opts must be an array of exactly 4 strings";
  }
  if (input.opts.some((o) => typeof o !== "string" || !o.trim())) {
    return "each option must be a non-empty string";
  }
  if (
    typeof input.correct !== "number" ||
    !Number.isInteger(input.correct) ||
    input.correct < 0 ||
    input.correct > 3
  ) {
    return "correct must be an integer 0–3";
  }
  return null;
}

export async function listContentQuestions(filters: {
  domain?: ContentDomain;
  classLevel?: DoseClassLevel;
  from?: string;
  to?: string;
  publishedOnly?: boolean;
}): Promise<ContentQuestionRow[]> {
  const supabase = await createEdubiteSupabaseServer();
  let query = supabase
    .from(EDUBITE_CONTENT_QUESTIONS_TABLE)
    .select("*")
    .order("active_date", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (filters.domain) query = query.eq("domain", filters.domain);
  if (filters.classLevel) query = query.eq("class_level", filters.classLevel);
  if (filters.from) query = query.gte("active_date", filters.from);
  if (filters.to) query = query.lte("active_date", filters.to);
  if (filters.publishedOnly) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as DbRow[] | null)?.map(mapRow) ?? [];
}

export async function getPublishedQuestionsForDate(
  domain: ContentDomain,
  dateKey: string,
  options?: { classLevel?: DoseClassLevel },
): Promise<ContentQuestionRow[]> {
  return listContentQuestions({
    domain,
    classLevel: options?.classLevel,
    from: dateKey,
    to: dateKey,
    publishedOnly: true,
  });
}

export function contentRowsToQuestions(
  rows: ContentQuestionRow[],
): Question[] {
  return rows.map((row) => ({
    tag: row.tag ?? "",
    q: row.q,
    opts: row.opts,
    correct: row.correct,
  }));
}

export async function getContentQuestionById(
  id: string,
): Promise<ContentQuestionRow | null> {
  const supabase = await createEdubiteSupabaseServer();
  const { data, error } = await supabase
    .from(EDUBITE_CONTENT_QUESTIONS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as DbRow) : null;
}

export async function createContentQuestion(
  input: ContentQuestionInput,
  createdBy: string,
): Promise<ContentQuestionRow> {
  const supabase = await createEdubiteSupabaseServer();
  const tag =
    input.domain === "dailydose" ? input.tag?.trim() || null : null;
  const { data, error } = await supabase
    .from(EDUBITE_CONTENT_QUESTIONS_TABLE)
    .insert({
      domain: input.domain,
      class_level: input.domain === "dailydose" ? input.classLevel : null,
      active_date: input.activeDate,
      tag,
      q: input.q.trim(),
      opts: input.opts.map((o) => o.trim()),
      correct: input.correct,
      sort_order: input.sortOrder ?? 0,
      published: input.published !== false,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as DbRow);
}

export async function updateContentQuestion(
  id: string,
  patch: Partial<ContentQuestionInput>,
): Promise<ContentQuestionRow | null> {
  const existing = await getContentQuestionById(id);
  if (!existing) return null;

  const domain = patch.domain ?? existing.domain;
  const payload: Record<string, unknown> = {
    domain,
    class_level:
      domain === "dailydose"
        ? patch.classLevel ?? existing.classLevel
        : null,
    active_date: patch.activeDate ?? existing.activeDate,
    q: patch.q !== undefined ? patch.q.trim() : existing.q,
    opts: patch.opts ?? existing.opts,
    correct: patch.correct ?? existing.correct,
    sort_order: patch.sortOrder ?? existing.sortOrder,
    published: patch.published ?? existing.published,
    updated_at: new Date().toISOString(),
    tag:
      domain === "dailydose"
        ? patch.tag !== undefined
          ? patch.tag?.trim() || null
          : existing.tag
        : null,
  };

  const supabase = await createEdubiteSupabaseServer();
  const { data, error } = await supabase
    .from(EDUBITE_CONTENT_QUESTIONS_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapRow(data as DbRow) : null;
}

export async function deleteContentQuestion(id: string): Promise<boolean> {
  const supabase = await createEdubiteSupabaseServer();
  const { error, count } = await supabase
    .from(EDUBITE_CONTENT_QUESTIONS_TABLE)
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}
