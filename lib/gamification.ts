import { ACHIEVEMENT_DEFINITIONS } from "@/data/achievements";
import { GYAN_CARDS } from "@/data/gyan";
import { HABIT_DEFINITIONS } from "@/data/habits";
import {
  DOSE_QUESTION_COUNT,
  FUNBRAIN_COMBO_BONUS,
  FUNBRAIN_DURATION_SEC,
  GYAN_STREAK_GOAL_MS,
  LEVELS,
  RDM_PER_DOSE_CORRECT,
} from "@/data/config";
import { DAILY_DOSE_QUESTIONS } from "@/data/questions";
import type {
  AchievementProgress,
  DayCriteria,
  GameState,
  JourneyDay,
} from "@/lib/types";
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
      index11: 0,
      locked11: false,
      correct11: 0,
      completed11: false,
      index12: 0,
      locked12: false,
      correct12: 0,
      completed12: false,
      currentClass: "11",
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
      finished: false,
      completed: false,
    },
    gyanUnlockedIds: ["velocity-vs-speed"],
    notifications: [
      {
        id: "welcome",
        icon: "✨",
        text: "Welcome to Edubite — start with today's DailyDose.",
      },
    ],
    history: [],
    joinedDate: todayKey(),
    lastActiveDate: todayKey(),
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
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
  const habitsDone = state.habits.every((h) => h.done);
  const doseDone = state.dose.completed;
  return {
    routine: doseDone,
    pledges: state.pledgeAM && state.pledgePM,
    habits: habitsDone,
    gyan: state.gyanTimeMs >= GYAN_STREAK_GOAL_MS,
  };
}

export function isFullDay(criteria: DayCriteria): boolean {
  return criteria.routine && criteria.pledges && criteria.habits && criteria.gyan;
}

function emptyDayCriteria(): DayCriteria {
  return { routine: false, pledges: false, habits: false, gyan: false };
}

function criteriaForDate(state: GameState, dateKey: string): DayCriteria {
  const today = todayKey();
  const joinDate = state.joinedDate ?? today;
  const offset = daysBetween(joinDate, dateKey);

  if (offset < 0) return emptyDayCriteria();
  if (dateKey > today) return emptyDayCriteria();
  if (dateKey === today) return todayCriteria(state);

  const daysBeforeToday = daysBetween(dateKey, today);
  const historyIndex = state.history.length - daysBeforeToday;
  if (historyIndex >= 0 && historyIndex < state.history.length) {
    return state.history[historyIndex];
  }
  return emptyDayCriteria();
}

function journeyDay(state: GameState, dayOffset: number): JourneyDay {
  const joinDate = state.joinedDate ?? todayKey();
  const today = todayKey();
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
    criteria: status === "upcoming" ? emptyDayCriteria() : criteriaForDate(state, dateKey),
  };
}

/** 28-day journey grid: Day 1 (join) → upcoming days at the end. */
export function buildJourneyHeatmap(state: GameState, totalDays = 28): JourneyDay[] {
  return Array.from({ length: totalDays }, (_, i) => journeyDay(state, i));
}

/** Up to 7 days: from join when new, otherwise the current week ending today. */
export function buildJourneyWeek(state: GameState): JourneyDay[] {
  const joinDate = state.joinedDate ?? todayKey();
  const today = todayKey();
  const daysSinceJoin = daysBetween(joinDate, today);

  if (daysSinceJoin < 6) {
    return Array.from({ length: 7 }, (_, i) => journeyDay(state, i));
  }

  const weekStartOffset = daysSinceJoin - 6;
  return Array.from({ length: 7 }, (_, i) => journeyDay(state, weekStartOffset + i));
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

export function computeStreak(state: GameState): number {
  const allDays = [...state.history, todayCriteria(state)];
  let streak = 0;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (isFullDay(allDays[i])) streak++;
    else break;
  }
  return streak;
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
  return 10 + combo * FUNBRAIN_COMBO_BONUS;
}

export function getDoseQuestion(index: number) {
  return DAILY_DOSE_QUESTIONS[index];
}

export { RDM_PER_DOSE_CORRECT, GYAN_STREAK_GOAL_MS, FUNBRAIN_DURATION_SEC };
