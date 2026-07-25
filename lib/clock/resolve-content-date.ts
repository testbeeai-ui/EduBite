import { isValidDateKey } from "@/lib/clock/override-store";
import { daysBetween, realTodayKey } from "@/lib/utils";

/** Max days App Clock may differ from real today for content APIs. */
export const CONTENT_DATE_SKEW_DAYS = 120;

/**
 * Resolve a client-supplied App Clock date for content (dose, pledges, inspiration).
 * Falls back to real today when missing/invalid/out of window.
 */
export function resolveContentDateKey(
  requested: string | null | undefined,
): string {
  const real = realTodayKey();
  if (
    typeof requested === "string" &&
    isValidDateKey(requested) &&
    Math.abs(daysBetween(real, requested)) <= CONTENT_DATE_SKEW_DAYS
  ) {
    return requested;
  }
  return real;
}
