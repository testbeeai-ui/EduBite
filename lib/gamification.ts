import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { GYAN_CARDS } from "@/data/gyan";
import { HABIT_DEFINITIONS } from "@/data/habits";
import {
  DOSE_QUESTION_COUNT,
  DOSE_DURATION_SEC,
  FUNBRAIN_DURATION_SEC,
  GYAN_STREAK_GOAL_MS,
  LEVELS,
  RDM_PER_DOSE_CORRECT,
} from "@/data/config";
import { DAILY_DOSE_QUESTIONS } from "@/data/questions";
import { getLiveRdmAmount } from "@/lib/rdm/live-amounts";
import type {
  AchievementProgress,
  DayCriteria,
  GameState,
  JourneyDay,
} from "@/lib/types";
import { ensureQaJourneyJoin } from "@/lib/clock/override-store";
import { addDaysToKey, daysBetween, todayKey } from "@/lib/utils";

export function createInitialState(): GameState {
  return {
    rdm: 0,
    streak: 0,
    signedIn: false,
    pledgeAM: false,
    pledgePM: false,
    gyanTimeMs: 0,
    gyanOpenId: null,
    habits: HABIT_DEFINITIONS.map((h) => ({ ...h, done: false })),
    dose: {
      index: 0,
      locked: false,
      correct: 0,
      completed: false,
      running: false,
      timeLeft: DOSE_DURATION_SEC,
      index11: 0,
      locked11: false,
      correct11: 0,
      completed11: false,
      index12: 0,
      locked12: false,
      correct12: 0,
      completed12: false,
      currentClass: "11",
      classChosen: false,
      answers11: [],
      answers12: [],
    },
    funbrain: {
      running: false,
      timeLeft: FUNBRAIN_DURATION_SEC,
      score: 0,
      combo: 0,
      highScore: 0,
      currentQuestionIndex: 0,
      answers: [],
      finished: false,
      completed: false,
    },
    gyanUnlockedIds: ["velocity-vs-speed"],
    notifications: [
      {
        id: "welcome",
        icon: "✨",
        text: "Welcome to Edubite — start with today's DailyDose.",
        targetView: "dailydose",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ],
    history: [],
    joinedDate: todayKey(),
    lastActiveDate: todayKey(),
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
    puzzleCompleted: false,
    doseDayLog: {},
    dayCriteriaLog: {},
    challengeEnrolledMonthKey: null,
    challengeEnrolledMonths: [],
    challengePuzzleSubmittedMonthKey: null,
  };
}

export function getLevelInfo(rdm: number) {
  type LevelEntry = (typeof LEVELS)[number];
  let current: LevelEntry = LEVELS[0];
  let next: LevelEntry = LEVELS[1] ?? LEVELS[0];

  for (let i = 0; i < LEVELS.length; i++) {
    if (rdm >= LEVELS[i].rdmRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? LEVELS[i];
    }
  }

  const rdmToNext =
    next.level > current.level ? next.rdmRequired - rdm : 0;
  const range = next.rdmRequired - current.rdmRequired;
  const progress =
    range > 0
      ? Math.min(100, Math.round(((rdm - current.rdmRequired) / range) * 100))
      : 100;

  return { current, next, rdmToNext, progress };
}

export function todayCriteria(state: GameState): DayCriteria {
  const habitsDone = state.habits.filter((h) => h.done).map((h) => h.id);
  return {
    dose: state.dose.completed,
    funbrain: state.funbrain.completed,
    puzzles: state.puzzleCompleted,
    habits: state.habits.length > 0 && state.habits.every((h) => h.done),
    pledges: state.pledgeAM && state.pledgePM,
    pledgeAM: state.pledgeAM,
    pledgePM: state.pledgePM,
    habitsDone,
  };
}

export function isFullDay(criteria: DayCriteria): boolean {
  return (
    criteria.dose &&
    criteria.funbrain &&
    criteria.puzzles &&
    criteria.habits &&
    criteria.pledges
  );
}

/** Merge pillar flags and stamp completedAt the first time the day is full. */
export function mergeDayCriteriaRecord(
  prev: DayCriteria | undefined,
  live: DayCriteria,
  nowIso: string = new Date().toISOString(),
): DayCriteria {
  const habitsDoneCombined = Array.from(
    new Set([...(prev?.habitsDone || []), ...(live.habitsDone || [])]),
  );

  const merged: DayCriteria = {
    dose: Boolean(live.dose || prev?.dose),
    funbrain: Boolean(live.funbrain || prev?.funbrain),
    puzzles: Boolean(live.puzzles || prev?.puzzles),
    habits: Boolean(live.habits || prev?.habits),
    pledges: Boolean(live.pledges || prev?.pledges),
    completedAt: prev?.completedAt ?? null,
    pledgeAM: Boolean(live.pledgeAM || prev?.pledgeAM),
    pledgePM: Boolean(live.pledgePM || prev?.pledgePM),
    habitsDone: habitsDoneCombined,
  };
  if (isFullDay(merged) && !merged.completedAt) {
    merged.completedAt = nowIso;
  }
  return merged;
}

function emptyDayCriteria(): DayCriteria {
  return {
    dose: false,
    funbrain: false,
    puzzles: false,
    habits: false,
    pledges: false,
    completedAt: null,
    pledgeAM: false,
    pledgePM: false,
    habitsDone: [],
  };
}

/**
 * Rebuild missing dayCriteriaLog flags from durable side sources
 * (doseDayLog + puzzle attempts) so Date-traveler / hydrate races
 * cannot leave "completed work" invisible on the streak meter.
 */
export function repairDayCriteriaLogFromSources(
  state: GameState,
  puzzleAttempts: Record<string, unknown> = {},
): GameState {
  const keys = new Set([
    ...Object.keys(state.dayCriteriaLog ?? {}),
    ...Object.keys(state.doseDayLog ?? {}),
    ...Object.keys(puzzleAttempts ?? {}),
  ]);
  if (keys.size === 0) return state;

  const dayCriteriaLog: GameState["dayCriteriaLog"] = {
    ...(state.dayCriteriaLog ?? {}),
  };
  let changed = false;

  for (const dateKey of keys) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;
    const prev = dayCriteriaLog[dateKey];
    const doseDone = Boolean(state.doseDayLog?.[dateKey]?.completed);
    const puzzleDone = Boolean(puzzleAttempts?.[dateKey]);
    if (!doseDone && !puzzleDone) continue;

    const patched = mergeDayCriteriaRecord(prev, {
      ...emptyDayCriteria(),
      dose: doseDone,
      puzzles: puzzleDone,
    });
    const same =
      prev &&
      prev.dose === patched.dose &&
      prev.puzzles === patched.puzzles &&
      prev.funbrain === patched.funbrain &&
      prev.habits === patched.habits &&
      prev.pledges === patched.pledges;
    if (same) continue;
    dayCriteriaLog[dateKey] = patched;
    changed = true;
  }

  return changed ? { ...state, dayCriteriaLog } : state;
}

export function criteriaCount(day: DayCriteria): number {
  return [
    day.dose,
    day.funbrain,
    day.puzzles,
    day.habits,
    day.pledges,
  ].filter(Boolean).length;
}

/**
 * Journey Day 1 is normally `joinedDate`.
 * When App Clock is set BEFORE join (admin QA), use a stable QA join date
 * (earliest simulated day) so advancing the clock does not re-anchor Day 1.
 */
export function effectiveJourneyJoinDate(
  state: Pick<GameState, "joinedDate">,
  asOfDateKey: string = todayKey(),
): string {
  const stored = state.joinedDate ?? asOfDateKey;
  if (asOfDateKey >= stored) return stored;
  const qaJoin = ensureQaJourneyJoin(asOfDateKey, stored);
  return qaJoin ?? asOfDateKey;
}

/** Criteria for a calendar date — today live, past from durable date logs only. */
export function criteriaForDate(
  state: GameState,
  dateKey: string,
  asOfDateKey: string = todayKey(),
): DayCriteria {
  const today = asOfDateKey;
  // Live task flags only apply to the day the learner is actually on.
  // Admin month clamp (e.g. viewing July while App Clock is Aug 2) must not
  // paint month-end as "done" from a later day's live completions.
  if (dateKey === today) {
    const logged = state.dayCriteriaLog?.[dateKey];
    if (state.lastActiveDate === dateKey) {
      const live = todayCriteria(state);
      if (!logged) return live;
      return mergeDayCriteriaRecord(logged, live);
    }
    if (logged) return logged;
    return emptyDayCriteria();
  }

  // Durable per-date logs are the only source for past days. QA journey join /
  // clock position must not hide days that were already completed while Date
  // traveler was elsewhere.
  const fromLog = state.dayCriteriaLog?.[dateKey];
  const doseDone = Boolean(state.doseDayLog?.[dateKey]?.completed);
  if (fromLog || doseDone) {
    return mergeDayCriteriaRecord(fromLog, {
      ...emptyDayCriteria(),
      dose: doseDone,
    });
  }

  // No log for this date → incomplete. Never fall back to state.history:
  // that array is one entry per active-day rollover (no date keys, no gap
  // padding), so a calendar-offset index paints skipped days (often Sunday)
  // with the previous active day's completions.
  return emptyDayCriteria();
}

function journeyDay(
  state: GameState,
  dayOffset: number,
  asOfDateKey: string = todayKey(),
): JourneyDay {
  const joinDate = effectiveJourneyJoinDate(state, asOfDateKey);
  const today = asOfDateKey;
  const dateKey = addDaysToKey(joinDate, dayOffset);
  const dayNumber = dayOffset + 1;

  let status: JourneyDay["status"];
  if (dateKey > today) status = "upcoming";
  else if (dateKey === today) status = "today";
  else if (dayOffset === 0) status = "join";
  else status = "past";

  return {
    dateKey,
    dayNumber,
    status,
    criteria:
      status === "upcoming"
        ? emptyDayCriteria()
        : criteriaForDate(state, dateKey, asOfDateKey),
  };
}

/** 28-day journey grid: Day 1 (join) → upcoming days at the end. */
export function buildJourneyHeatmap(
  state: GameState,
  totalDays = 28,
  asOfDateKey: string = todayKey(),
): JourneyDay[] {
  return Array.from({ length: totalDays }, (_, i) =>
    journeyDay(state, i, asOfDateKey),
  );
}

/** Up to 7 days: from join when new, otherwise the current week ending today. */
export function buildJourneyWeek(
  state: GameState,
  asOfDateKey: string = todayKey(),
): JourneyDay[] {
  const joinDate = effectiveJourneyJoinDate(state, asOfDateKey);
  const today = asOfDateKey;
  const daysSinceJoin = daysBetween(joinDate, today);

  if (daysSinceJoin < 6) {
    return Array.from({ length: 7 }, (_, i) =>
      journeyDay(state, i, asOfDateKey),
    );
  }

  const weekStartOffset = daysSinceJoin - 6;
  return Array.from({ length: 7 }, (_, i) =>
    journeyDay(state, weekStartOffset + i, asOfDateKey),
  );
}

export function countFullJourneyDays(days: JourneyDay[]): number {
  return days.filter(
    (d) => d.status !== "upcoming" && isFullDay(d.criteria),
  ).length;
}

/** @deprecated Use buildJourneyWeek — kept for any legacy callers */
export function buildWeekHistory(state: GameState): DayCriteria[] {
  return buildJourneyWeek(state).map((d) => d.criteria);
}

/** @deprecated Use buildJourneyHeatmap */
export function buildHeatmapHistory(state: GameState): DayCriteria[] {
  return buildJourneyHeatmap(state).map((d) => d.criteria);
}

export function computeStreak(
  state: GameState,
  asOfDateKey: string = todayKey(),
): number {
  // Rebuild from journey so admin clock override is respected.
  const heat = buildJourneyHeatmap(state, 28, asOfDateKey);
  const pastAndToday = heat.filter((d) => d.status !== "upcoming");
  let streak = 0;
  // Incomplete "today" does not wipe the streak — count consecutive full days
  // ending at yesterday (or today if today is already full).
  let i = pastAndToday.length - 1;
  if (
    i >= 0 &&
    pastAndToday[i]!.status === "today" &&
    !isFullDay(pastAndToday[i]!.criteria)
  ) {
    i -= 1;
  }
  for (; i >= 0; i--) {
    if (isFullDay(pastAndToday[i]!.criteria)) streak++;
    else break;
  }
  return streak;
}

/**
 * If activity logs exist before joinedDate (hydrate / clock races), pull Day 1
 * back so the streak meter shows real completed days instead of a fresh join.
 */
export function repairJoinedDateFromActivity(state: GameState): GameState {
  const keys: string[] = [];
  for (const key of Object.keys(state.dayCriteriaLog ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) keys.push(key);
  }
  for (const key of Object.keys(state.doseDayLog ?? {})) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) keys.push(key);
  }
  if (keys.length === 0) return state;
  keys.sort();
  const earliest = keys[0]!;
  const current = state.joinedDate;
  if (!current || earliest < current) {
    return { ...state, joinedDate: earliest };
  }
  return state;
}

export function habitsProgress(state: GameState) {
  const done = state.habits.filter((h) => h.done).length;
  const total = state.habits.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function getAchievementProgress(
  state: GameState,
): Record<string, AchievementProgress> {
  const habits = habitsProgress(state);
  const gyanMins = Math.floor(state.gyanTimeMs / 60000);
  const pledgeCount = (state.pledgeAM ? 1 : 0) + (state.pledgePM ? 1 : 0);

  const checks: Record<string, AchievementProgress> = {
    "streak-7": {
      unlocked: state.streak >= 7,
      current: Math.min(state.streak, 7),
      target: 7,
    },
    "streak-30": {
      unlocked: state.streak >= 30,
      current: Math.min(state.streak, 30),
      target: 30,
    },
    "rdm-1000": {
      unlocked: state.rdm >= 1000,
      current: Math.min(state.rdm, 1000),
      target: 1000,
    },
    "rdm-5000": {
      unlocked: state.rdm >= 5000,
      current: Math.min(state.rdm, 5000),
      target: 5000,
    },
    "dose-perfect": {
      unlocked:
        state.dose.completed &&
        state.dose.correct === DOSE_QUESTION_COUNT,
      current: state.dose.completed ? state.dose.correct : 0,
      target: DOSE_QUESTION_COUNT,
    },
    "funbrain-high": {
      unlocked: state.funbrain.highScore >= 100,
      current: Math.min(state.funbrain.highScore, 100),
      target: 100,
    },
    "habits-perfect": {
      unlocked: habits.done === habits.total && habits.total > 0,
      current: habits.done,
      target: habits.total,
    },
    "pledge-integrity": {
      unlocked: state.pledgeAM && state.pledgePM,
      current: pledgeCount,
      target: 2,
    },
    "gyan-explorer": {
      unlocked: state.gyanTimeMs >= GYAN_STREAK_GOAL_MS,
      current: Math.min(gyanMins, 30),
      target: 30,
    },
  };

  return ACHIEVEMENT_DEFINITIONS.reduce(
    (acc, def) => {
      acc[def.id] = checks[def.id] ?? {
        unlocked: false,
        current: 0,
        target: 1,
      };
      return acc;
    },
    {} as Record<string, AchievementProgress>,
  );
}

export function getGyanCards(state: GameState) {
  const { current } = getLevelInfo(state.rdm);
  return GYAN_CARDS.map((card) => {
    let unlocked = state.gyanUnlockedIds.includes(card.id);
    if (card.id === "escape-velocity" && current.level >= 5) unlocked = true;
    if (card.id === "jee-traps" && state.streak >= 20) unlocked = true;
    return { ...card, unlocked };
  });
}

export function funbrainPoints(combo: number): number {
  const base = getLiveRdmAmount("funbrain.base_points");
  const bonus = getLiveRdmAmount("funbrain.combo_bonus");
  return base + combo * bonus;
}

export function getDoseQuestion(index: number) {
  return DAILY_DOSE_QUESTIONS[index];
}

export { RDM_PER_DOSE_CORRECT, GYAN_STREAK_GOAL_MS, FUNBRAIN_DURATION_SEC, DOSE_DURATION_SEC };
