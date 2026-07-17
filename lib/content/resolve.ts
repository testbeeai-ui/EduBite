import {
  DAILY_DOSE_QUESTIONS_11,
  DAILY_DOSE_QUESTIONS_12,
  FUNBRAIN_POOL,
} from "@/data/questions";
import {
  getPublishedQuestionsForDate,
  contentRowsToQuestions,
} from "@/lib/db/content-questions";
import type { ContentDomain, DoseClassLevel } from "@/lib/content/types";
import {
  dailyDoseScheduleDateFor,
  funBrainScheduleDateFor,
  stripFunBrainBankLabel,
} from "@/lib/content/schedule";
import type { Question } from "@/lib/types";

export type ContentSource = "db" | "static";

export type ResolvedQuestions = {
  questions: Question[];
  source: ContentSource;
  domain: ContentDomain;
  dateKey: string;
  scheduleDate?: string;
  classLevel?: DoseClassLevel;
};

function staticForDailyDose(classLevel: DoseClassLevel): Question[] {
  return classLevel === "12"
    ? DAILY_DOSE_QUESTIONS_12
    : DAILY_DOSE_QUESTIONS_11;
}

function staticForFunBrain(): Question[] {
  return FUNBRAIN_POOL.map((q) => ({
    ...q,
    tag: "",
    q: stripFunBrainBankLabel(q.q),
  }));
}

export async function resolveDailyDoseForClass(
  classLevel: DoseClassLevel,
  dateKey: string,
): Promise<ResolvedQuestions> {
  const scheduleDate = dailyDoseScheduleDateFor(dateKey);
  const rows = await getPublishedQuestionsForDate("dailydose", scheduleDate, {
    classLevel,
  });
  if (rows.length > 0) {
    return {
      domain: "dailydose",
      dateKey,
      scheduleDate,
      classLevel,
      source: "db",
      questions: contentRowsToQuestions(rows),
    };
  }
  return {
    domain: "dailydose",
    dateKey,
    scheduleDate,
    classLevel,
    source: "static",
    questions: staticForDailyDose(classLevel),
  };
}

export async function resolveQuestionsForDate(
  domain: ContentDomain,
  dateKey: string,
): Promise<ResolvedQuestions> {
  if (domain === "dailydose") {
    return resolveDailyDoseForClass("11", dateKey);
  }

  const scheduleDate = funBrainScheduleDateFor(dateKey);
  const rows = await getPublishedQuestionsForDate("funbrain", scheduleDate);
  if (rows.length > 0) {
    return {
      domain,
      dateKey,
      scheduleDate,
      source: "db",
      questions: contentRowsToQuestions(rows),
    };
  }
  return {
    domain,
    dateKey,
    scheduleDate,
    source: "static",
    questions: staticForFunBrain(),
  };
}

export async function getDailyDoseForDate(
  dateKey: string,
): Promise<ResolvedQuestions> {
  return resolveDailyDoseForClass("11", dateKey);
}

export async function getFunBrainForDate(
  dateKey: string,
): Promise<ResolvedQuestions> {
  return resolveQuestionsForDate("funbrain", dateKey);
}
