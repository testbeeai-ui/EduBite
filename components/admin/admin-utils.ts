import type {
  ContentDomain,
  ContentQuestionRow,
  DoseClassLevel,
} from "@/lib/content/types";
import { addDaysToKey, todayKey } from "@/lib/utils";

export type DateBucket = "past" | "today" | "tomorrow" | "upcoming";

export function bucketForDate(activeDate: string, today = todayKey()): DateBucket {
  const tomorrow = addDaysToKey(today, 1);
  if (activeDate < today) return "past";
  if (activeDate === today) return "today";
  if (activeDate === tomorrow) return "tomorrow";
  return "upcoming";
}

export function groupByBucket(
  rows: ContentQuestionRow[],
  today = todayKey(),
): Record<DateBucket, ContentQuestionRow[]> {
  const groups: Record<DateBucket, ContentQuestionRow[]> = {
    past: [],
    today: [],
    tomorrow: [],
    upcoming: [],
  };
  for (const row of rows) {
    groups[bucketForDate(row.activeDate, today)].push(row);
  }
  return groups;
}

export type QuestionFormState = {
  id?: string;
  domain: ContentDomain;
  classLevel: DoseClassLevel;
  activeDate: string;
  tag: string;
  q: string;
  opts: [string, string, string, string];
  correct: number;
  sortOrder: number;
  published: boolean;
};

export function emptyQuestionForm(
  domain: ContentDomain,
  activeDate = todayKey(),
): QuestionFormState {
  return {
    domain,
    classLevel: "11",
    activeDate,
    tag: domain === "dailydose" ? "PHYSICS · TOPIC" : "",
    q: "",
    opts: ["", "", "", ""],
    correct: 0,
    sortOrder: 0,
    published: true,
  };
}

export function formFromRow(row: ContentQuestionRow): QuestionFormState {
  const opts = [...row.opts, "", "", "", ""].slice(0, 4) as [
    string,
    string,
    string,
    string,
  ];
  return {
    id: row.id,
    domain: row.domain,
    classLevel: row.classLevel ?? "11",
    activeDate: row.activeDate,
    tag: row.tag ?? "",
    q: row.q,
    opts,
    correct: row.correct,
    sortOrder: row.sortOrder,
    published: row.published,
  };
}
