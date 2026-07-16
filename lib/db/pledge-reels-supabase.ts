import { PLEDGE_REEL_AM_DAYS } from "@/data/pledge-reels-am";
import { PLEDGE_REEL_PM_DAYS } from "@/data/pledge-reels-pm";
import type { PledgeReelDay } from "@/data/pledge-reels";
import { createEdubiteSupabaseServer } from "@/lib/supabase/server";

export const EDUBITE_PLEDGE_DAYS_TABLE = "edubite_pledge_reel_days";
export const EDUBITE_PLEDGE_SLIDES_TABLE = "edubite_pledge_reel_slides";

type DayRow = {
  day: number;
  theme: string;
  pledge_slot: string;
};

type SlideRow = {
  day: number;
  slide_index: number;
  icon: string;
  headline: string;
  emphasis_word: string;
  caption: string;
  pledge_slot: string;
};

function staticForSlot(slot: "am" | "pm"): PledgeReelDay[] {
  return slot === "am" ? PLEDGE_REEL_AM_DAYS : PLEDGE_REEL_PM_DAYS;
}

/**
 * Load AM/PM pledge reel from Supabase `edubite_pledge_reel_*`.
 * Falls back to in-repo catalog if empty / error.
 */
export async function loadEdubitePledgeReelDays(
  slot: "am" | "pm" = "pm",
): Promise<{ days: PledgeReelDay[]; source: "supabase" | "static" }> {
  const fallback = staticForSlot(slot);
  try {
    const supabase = await createEdubiteSupabaseServer();
    const { data: dayRows, error: dayError } = await supabase
      .from(EDUBITE_PLEDGE_DAYS_TABLE)
      .select("day, theme, pledge_slot")
      .eq("pledge_slot", slot)
      .order("day", { ascending: true });
    if (dayError) throw dayError;
    if (!dayRows?.length) {
      return { days: fallback, source: "static" };
    }

    const { data: slideRows, error: slideError } = await supabase
      .from(EDUBITE_PLEDGE_SLIDES_TABLE)
      .select(
        "day, slide_index, icon, headline, emphasis_word, caption, pledge_slot",
      )
      .eq("pledge_slot", slot)
      .order("day", { ascending: true })
      .order("slide_index", { ascending: true });
    if (slideError) throw slideError;

    const byDay = new Map<number, PledgeReelDay>();
    for (const d of dayRows as DayRow[]) {
      byDay.set(d.day, { day: d.day, theme: d.theme, slides: [] });
    }
    for (const s of (slideRows as SlideRow[] | null) ?? []) {
      const entry = byDay.get(s.day);
      if (!entry) continue;
      entry.slides[s.slide_index] = {
        icon: s.icon,
        headline: s.headline,
        emphasisWord: s.emphasis_word,
        caption: s.caption,
      };
    }

    const days = [...byDay.values()]
      .map((d) => ({
        ...d,
        slides: d.slides.filter(Boolean),
      }))
      .filter((d) => d.slides.length === 4);

    if (days.length === 0) {
      return { days: fallback, source: "static" };
    }
    return { days, source: "supabase" };
  } catch (err) {
    console.warn("[loadEdubitePledgeReelDays]", err);
    return { days: fallback, source: "static" };
  }
}
