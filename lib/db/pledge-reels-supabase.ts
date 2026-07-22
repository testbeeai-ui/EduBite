import { PLEDGE_REEL_AM_DAYS } from "@/data/pledge-reels-am";
import { PLEDGE_REEL_PM_DAYS } from "@/data/pledge-reels-pm";
import type { PledgeReelDay } from "@/data/pledge-reels";
import {
  getPledgeReelDayNumber,
  getPledgeReelForDay,
} from "@/data/pledge-reels";
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

type PackCache = {
  loadedAt: number;
  days: PledgeReelDay[];
  source: "supabase" | "static";
};

const PACK_TTL_MS = 60 * 60 * 1000;
const packCache = new Map<"am" | "pm", PackCache>();
const packInflight = new Map<"am" | "pm", Promise<PackCache>>();

function staticForSlot(slot: "am" | "pm"): PledgeReelDay[] {
  return slot === "am" ? PLEDGE_REEL_AM_DAYS : PLEDGE_REEL_PM_DAYS;
}

function mapDay(
  dayRow: DayRow,
  slides: SlideRow[],
): PledgeReelDay | null {
  const ordered = slides
    .filter((s) => s.day === dayRow.day)
    .sort((a, b) => a.slide_index - b.slide_index)
    .map((s) => ({
      icon: s.icon,
      headline: s.headline,
      emphasisWord: s.emphasis_word,
      caption: s.caption,
    }));
  if (ordered.length !== 4) return null;
  return { day: dayRow.day, theme: dayRow.theme, slides: ordered };
}

/**
 * Load a single day's reel for a joinedDate — not the full AM/PM catalog.
 */
export async function loadEdubitePledgeReelForJoinedDate(
  slot: "am" | "pm",
  joinedDate: string,
): Promise<{
  reel: PledgeReelDay;
  dayNumber: number;
  totalDays: number;
  source: "supabase" | "static";
}> {
  const fallback = staticForSlot(slot);
  const dayNumber = getPledgeReelDayNumber(joinedDate, fallback);
  const staticReel = getPledgeReelForDay(dayNumber, fallback);

  try {
    const supabase = await createEdubiteSupabaseServer();
    const [{ data: dayRow, error: dayError }, { data: slideRows, error: slideError }] =
      await Promise.all([
        supabase
          .from(EDUBITE_PLEDGE_DAYS_TABLE)
          .select("day, theme, pledge_slot")
          .eq("pledge_slot", slot)
          .eq("day", dayNumber)
          .maybeSingle(),
        supabase
          .from(EDUBITE_PLEDGE_SLIDES_TABLE)
          .select(
            "day, slide_index, icon, headline, emphasis_word, caption, pledge_slot",
          )
          .eq("pledge_slot", slot)
          .eq("day", dayNumber)
          .order("slide_index", { ascending: true }),
      ]);

    if (dayError) throw dayError;
    if (slideError) throw slideError;

    if (dayRow) {
      const mapped = mapDay(dayRow as DayRow, (slideRows as SlideRow[] | null) ?? []);
      if (mapped) {
        return {
          reel: mapped,
          dayNumber,
          totalDays: fallback.length,
          source: "supabase",
        };
      }
    }

    return {
      reel: staticReel,
      dayNumber,
      totalDays: fallback.length,
      source: "static",
    };
  } catch (err) {
    console.warn("[loadEdubitePledgeReelForJoinedDate]", err);
    return {
      reel: staticReel,
      dayNumber,
      totalDays: fallback.length,
      source: "static",
    };
  }
}

/**
 * Full AM/PM pack — used by admin schedule preview only.
 * Cached 1h per process so admin refreshes do not re-dump the catalog.
 */
export async function loadEdubitePledgeReelDays(
  slot: "am" | "pm" = "pm",
): Promise<{ days: PledgeReelDay[]; source: "supabase" | "static" }> {
  const now = Date.now();
  const cached = packCache.get(slot);
  if (cached && now - cached.loadedAt < PACK_TTL_MS) {
    return { days: cached.days, source: cached.source };
  }

  const existing = packInflight.get(slot);
  if (existing) {
    const pack = await existing;
    return { days: pack.days, source: pack.source };
  }

  const work = (async (): Promise<PackCache> => {
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
        return { loadedAt: Date.now(), days: fallback, source: "static" };
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
        return { loadedAt: Date.now(), days: fallback, source: "static" };
      }
      return { loadedAt: Date.now(), days, source: "supabase" };
    } catch (err) {
      console.warn("[loadEdubitePledgeReelDays]", err);
      return { loadedAt: Date.now(), days: fallback, source: "static" };
    }
  })();

  packInflight.set(slot, work);
  try {
    const pack = await work;
    packCache.set(slot, pack);
    return { days: pack.days, source: pack.source };
  } finally {
    packInflight.delete(slot);
  }
}
