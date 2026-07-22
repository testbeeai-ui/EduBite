import {
  INSPIRATION_QUOTES,
  type InspirationQuote,
} from "@/data/inspiration-quotes";
import {
  INSPIRATION_PHENOMENA,
  type InspirationPhenomenon,
} from "@/data/inspiration-phenomena";
import {
  INSPIRATION_ROLE_MODELS,
  type InspirationRoleModel,
} from "@/data/inspiration-role-models";
import { todayKey } from "@/lib/utils";

const DAY_MS = 24 * 60 * 60 * 1_000;
const INSPIRATION_LAUNCH_ORDINAL = Math.floor(Date.UTC(2026, 6, 20) / DAY_MS);
const QUOTE_SHUFFLE_VERSION = "edubite-inspiration-cycle-v1";
const PHENOMENA_SHUFFLE_VERSION = "edubite-phenomena-cycle-v1";
const FIRST_LAUNCH_PHENOMENON_KEY = "natural-phenomena-v1-01";

function hashSeed(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const shuffled = [...items];
  const random = seededRandom(seed);
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex]!,
      shuffled[index]!,
    ];
  }
  return shuffled;
}

function mixByGroup<T>(
  items: readonly T[],
  seed: number,
  previousGroup: string | null,
  groupOf: (item: T) => string,
): T[] {
  const shuffled = seededShuffle(items, seed);
  const groups = new Map<string, T[]>();
  for (const item of shuffled) {
    const groupKey = groupOf(item);
    const group = groups.get(groupKey) ?? [];
    group.push(item);
    groups.set(groupKey, group);
  }

  const groupOrder = seededShuffle([...groups.keys()], seed ^ 0x9e3779b9);
  const random = seededRandom(seed ^ 0x85ebca6b);
  const mixed: T[] = [];
  let lastGroup = previousGroup;

  while (mixed.length < items.length) {
    const available = groupOrder.filter(
      (groupKey) => (groups.get(groupKey)?.length ?? 0) > 0,
    );
    const different = available.filter((groupKey) => groupKey !== lastGroup);
    const candidates = different.length > 0 ? different : available;
    const remainingAfterPick = items.length - mixed.length - 1;
    const feasible = candidates.filter((candidate) => {
      const candidateRemaining = (groups.get(candidate)?.length ?? 0) - 1;
      const largestOtherGroup = Math.max(
        0,
        ...available
          .filter((groupKey) => groupKey !== candidate)
          .map((groupKey) => groups.get(groupKey)?.length ?? 0),
      );
      return (
        candidateRemaining <= Math.floor(remainingAfterPick / 2) &&
        largestOtherGroup <= Math.ceil(remainingAfterPick / 2)
      );
    });
    const selectionPool = feasible.length > 0 ? feasible : candidates;
    const totalWeight = selectionPool.reduce(
      (total, groupKey) => total + (groups.get(groupKey)?.length ?? 0),
      0,
    );
    let roll = random() * totalWeight;
    const selectedGroup =
      selectionPool.find((groupKey) => {
        roll -= groups.get(groupKey)?.length ?? 0;
        return roll < 0;
      }) ?? selectionPool[selectionPool.length - 1];
    if (!selectedGroup) break;

    const selected = groups.get(selectedGroup)?.shift();
    if (!selected) break;
    mixed.push(selected);
    lastGroup = selectedGroup;
  }

  return mixed;
}

function dateOrdinal(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
}

function scheduleForDate<T>(
  dateKey: string,
  items: readonly T[],
  cycleIndexForDay: (daysSinceLaunch: number, length: number) => number,
  dayInCycle: (daysSinceLaunch: number, length: number) => number,
  buildCycle: (cycleIndex: number) => T[],
): T {
  if (items.length === 0) {
    throw new Error("Inspiration catalog is empty");
  }
  const daysSinceLaunch = dateOrdinal(dateKey) - INSPIRATION_LAUNCH_ORDINAL;
  const cycleIndex = cycleIndexForDay(daysSinceLaunch, items.length);
  const index = dayInCycle(daysSinceLaunch, items.length);
  return buildCycle(cycleIndex)[index]!;
}

function quoteCycle(
  quotes: readonly InspirationQuote[],
  cycleIndex: number,
): InspirationQuote[] {
  let previousCategory: string | null = null;
  if (cycleIndex > 0) {
    const previousCycle = quoteCycle(quotes, cycleIndex - 1);
    previousCategory =
      previousCycle[previousCycle.length - 1]?.category ?? null;
  }
  return mixByGroup(
    quotes,
    hashSeed(`${QUOTE_SHUFFLE_VERSION}:${cycleIndex}`),
    previousCategory,
    (quote) => quote.category,
  );
}

function phenomenonCycle(
  phenomena: readonly InspirationPhenomenon[],
  cycleIndex: number,
): InspirationPhenomenon[] {
  let previousSubject: string | null = null;
  if (cycleIndex > 0) {
    const previousCycle = phenomenonCycle(phenomena, cycleIndex - 1);
    previousSubject =
      previousCycle[previousCycle.length - 1]?.subject ?? null;
  }

  const seed = hashSeed(`${PHENOMENA_SHUFFLE_VERSION}:${cycleIndex}`);
  if (cycleIndex === 0) {
    const launch = phenomena.find(
      (item) => item.contentKey === FIRST_LAUNCH_PHENOMENON_KEY,
    );
    if (!launch) {
      throw new Error("Launch phenomenon is missing from the catalog");
    }
    const remaining = phenomena.filter(
      (item) => item.contentKey !== launch.contentKey,
    );
    return [
      launch,
      ...mixByGroup(remaining, seed, launch.subject, (item) => item.subject),
    ];
  }

  return mixByGroup(
    phenomena,
    seed,
    previousSubject,
    (item) => item.subject,
  );
}

/** Shared deterministic daily quote, with no repeats inside each full cycle. */
export function quoteForDate(
  dateKey: string,
  quotes: readonly InspirationQuote[] = INSPIRATION_QUOTES,
): InspirationQuote {
  return scheduleForDate(
    dateKey,
    quotes,
    (daysSinceLaunch, length) =>
      daysSinceLaunch >= 0 ? Math.floor(daysSinceLaunch / length) : 0,
    (daysSinceLaunch, length) =>
      ((daysSinceLaunch % length) + length) % length,
    (cycleIndex) => quoteCycle(quotes, cycleIndex),
  );
}

export function todayQuote(
  quotes: readonly InspirationQuote[] = INSPIRATION_QUOTES,
): InspirationQuote {
  return quoteForDate(todayKey(), quotes);
}

/** Shared deterministic daily Natural Phenomena Q&A. */
export function phenomenonForDate(
  dateKey: string,
  phenomena: readonly InspirationPhenomenon[] = INSPIRATION_PHENOMENA,
): InspirationPhenomenon {
  return scheduleForDate(
    dateKey,
    phenomena,
    (daysSinceLaunch, length) =>
      daysSinceLaunch >= 0 ? Math.floor(daysSinceLaunch / length) : 0,
    (daysSinceLaunch, length) =>
      ((daysSinceLaunch % length) + length) % length,
    (cycleIndex) => phenomenonCycle(phenomena, cycleIndex),
  );
}

export function todayPhenomenon(
  phenomena: readonly InspirationPhenomenon[] = INSPIRATION_PHENOMENA,
): InspirationPhenomenon {
  return phenomenonForDate(todayKey(), phenomena);
}

/** One role-model profile per day; sequential cycle starting with Aryabhata on launch. */
export function roleModelForDate(
  dateKey: string,
  models: readonly InspirationRoleModel[] = INSPIRATION_ROLE_MODELS,
): InspirationRoleModel {
  if (models.length === 0) {
    throw new Error("Role model catalog is empty");
  }
  const daysSinceLaunch = dateOrdinal(dateKey) - INSPIRATION_LAUNCH_ORDINAL;
  const index = ((daysSinceLaunch % models.length) + models.length) % models.length;
  return models[index]!;
}

export function todayRoleModel(
  models: readonly InspirationRoleModel[] = INSPIRATION_ROLE_MODELS,
): InspirationRoleModel {
  return roleModelForDate(todayKey(), models);
}

export function toDidYouKnowBlock(
  item: InspirationPhenomenon,
): {
  icon: string;
  badge: string;
  question: string;
  explanation: string;
  linkedConcepts: string;
  followUpQuestion: string;
} {
  return {
    icon: item.icon,
    badge: item.badge,
    question: item.question,
    explanation: item.explanation,
    linkedConcepts: item.linkedConcepts,
    followUpQuestion: item.followUpQuestion,
  };
}
