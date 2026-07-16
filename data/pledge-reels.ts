import { daysBetween, todayKey } from "@/lib/utils";
import { PLEDGE_REEL_AM_DAYS } from "@/data/pledge-reels-am";
import { PLEDGE_REEL_PM_DAYS } from "@/data/pledge-reels-pm";

export type PledgeReelSlide = {
  icon: string;
  headline: string;
  emphasisWord: string;
  caption: string;
};

export type PledgeReelDay = {
  day: number;
  theme: string;
  slides: PledgeReelSlide[];
};

/** @deprecated Prefer slot-specific catalogs; kept as PM alias. */
export const PLEDGE_REEL_DAYS: PledgeReelDay[] = PLEDGE_REEL_PM_DAYS;

export function getPledgeCatalog(slot: "am" | "pm" = "pm"): PledgeReelDay[] {
  return slot === "am" ? PLEDGE_REEL_AM_DAYS : PLEDGE_REEL_PM_DAYS;
}

export function getPledgeReelDayNumber(
  joinedDate: string,
  catalog: PledgeReelDay[] = PLEDGE_REEL_DAYS,
): number {
  if (catalog.length === 0) return 1;
  const daysSinceJoin = Math.max(0, daysBetween(joinedDate, todayKey()));
  return (daysSinceJoin % catalog.length) + 1;
}

export function getPledgeReelForDay(
  day: number,
  catalog: PledgeReelDay[] = PLEDGE_REEL_DAYS,
): PledgeReelDay {
  const found = catalog.find((entry) => entry.day === day);
  return found ?? catalog[0]!;
}

export function getPledgeReelForUser(
  joinedDate: string,
  catalogOrSlot: PledgeReelDay[] | "am" | "pm" = PLEDGE_REEL_DAYS,
): PledgeReelDay {
  const catalog = Array.isArray(catalogOrSlot)
    ? catalogOrSlot
    : getPledgeCatalog(catalogOrSlot);
  return getPledgeReelForDay(
    getPledgeReelDayNumber(joinedDate, catalog),
    catalog,
  );
}

/** Highlight emphasisWord in headline (case-insensitive match, preserve headline casing). */
export function renderPledgeHeadline(
  headline: string,
  emphasisWord: string,
): { before: string; emphasis: string; after: string } {
  if (!emphasisWord) {
    return { before: headline, emphasis: "", after: "" };
  }
  const lowerHeadline = headline.toLowerCase();
  const lowerWord = emphasisWord.toLowerCase();
  const idx = lowerHeadline.indexOf(lowerWord);
  if (idx === -1) {
    return { before: headline, emphasis: "", after: "" };
  }
  return {
    before: headline.slice(0, idx),
    emphasis: headline.slice(idx, idx + emphasisWord.length),
    after: headline.slice(idx + emphasisWord.length),
  };
}
