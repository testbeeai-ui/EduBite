import { DOSE_QUESTION_COUNT } from "@/data/config";
import { addDaysToKey } from "@/lib/utils";

/** First calendar day of the shared 180-day content cycle. */
export const CONTENT_CYCLE_START = "2026-01-01";

/** Days in one full DailyDose / FunBrain rotation. */
export const CONTENT_CYCLE_DAYS = 180;

/** @deprecated Use CONTENT_CYCLE_START */
export const DAILY_DOSE_CYCLE_START = CONTENT_CYCLE_START;

/** @deprecated Use CONTENT_CYCLE_DAYS */
export const DAILY_DOSE_CYCLE_DAYS = CONTENT_CYCLE_DAYS;

/** FunBrain: 1080 MCQs ÷ 6 per day. */
export const FUNBRAIN_QUESTIONS_PER_DAY = 6;

export type DoseClassLevel = "11" | "12";

function scheduleDateInCycle(dateKey: string): string {
  const startMs = new Date(`${CONTENT_CYCLE_START}T12:00:00`).getTime();
  const targetMs = new Date(`${dateKey}T12:00:00`).getTime();
  const dayOffset =
    Math.floor((targetMs - startMs) / 86400000) % CONTENT_CYCLE_DAYS;
  const normalized =
    ((dayOffset % CONTENT_CYCLE_DAYS) + CONTENT_CYCLE_DAYS) %
    CONTENT_CYCLE_DAYS;
  return addDaysToKey(CONTENT_CYCLE_START, normalized);
}

/** Map any calendar date to the DailyDose active_date row set. */
export function dailyDoseScheduleDateFor(dateKey: string): string {
  return scheduleDateInCycle(dateKey);
}

/** Map any calendar date to the FunBrain active_date row set (6 Q/day). */
export function funBrainScheduleDateFor(dateKey: string): string {
  return scheduleDateInCycle(dateKey);
}

export function doseQuestionsPerDay(): number {
  return DOSE_QUESTION_COUNT;
}
