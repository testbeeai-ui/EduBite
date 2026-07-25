"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { VIEW_TO_PATH, PATH_TO_VIEW } from "@/lib/routes";
import { DOSE_QUESTION_COUNT, DOSE_DURATION_SEC, FEATURES, FUNBRAIN_DURATION_SEC } from "@/data/config";
import { HABIT_DEFINITIONS } from "@/data/habits";
import { HABIT_ID_TO_RDM_KEY } from "@/data/rdm-rewards";
import { FUNBRAIN_QUESTIONS_PER_DAY } from "@/lib/content/schedule";
import { getLiveRdmAmount } from "@/lib/rdm/live-amounts";
import {
  computeStreak,
  createInitialState,
  funbrainPoints,
  getAchievementProgress,
  getGyanCards,
  getLevelInfo,
  habitsProgress,
  isFullDay,
  mergeDayCriteriaRecord,
  repairDayCriteriaLogFromSources,
  todayCriteria,
} from "@/lib/gamification";
import {
  isInEntryWindow,
  getChallengeMonthMeta,
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
  isEnrolledForChallengeMonth,
  recordDoseDayInState,
  withChallengeEnrollment,
} from "@/lib/challenge/monthly";
import { useAuth } from "@/lib/auth/auth-provider";
import { storePendingView, readPendingView, clearPendingView } from "@/lib/auth/pending-action";
import { useAppClock } from "@/lib/clock/app-clock";
import { toPersistableGameState } from "@/lib/persistence/persistable-game-state";
import { createSaveQueue } from "@/lib/persistence/save-queue";
import { loadPuzzleProgress } from "@/lib/puzzles/storage";
import { storageAdapter } from "@/lib/storage";
import type {
  AppView,
  GameState,
  ModalState,
  PledgeType,
} from "@/lib/types";
import { todayKey } from "@/lib/utils";

const PUBLIC_VIEWS = new Set<AppView>(["home"]);

type GameAction =
  | { type: "HYDRATE"; payload: GameState }
  | { type: "SET_SIGNED_IN"; payload: boolean }
  | { type: "TOGGLE_HABIT"; payload: string }
  | { type: "ANSWER_DOSE"; payload: { selected: number; correct: number } }
  | { type: "NEXT_DOSE"; payload?: { questionCount: number } }
  | { type: "START_DOSE" }
  | { type: "TICK_DOSE"; payload?: { questionCount: number } }
  | { type: "RESET_DOSE" }
  | { type: "START_FUNBRAIN" }
  | { type: "TICK_FUNBRAIN" }
  | {
      type: "ANSWER_FUNBRAIN";
      payload: { selected: number; correct: number; poolLength?: number };
    }
  | { type: "END_FUNBRAIN" }
  | { type: "RESET_FUNBRAIN" }
  | { type: "TICK_GYAN"; payload: number }
  | { type: "TOGGLE_GYAN"; payload: string | null }
  | { type: "SIGN_PLEDGE"; payload: PledgeType }
  | { type: "RESET_PLEDGE"; payload: PledgeType }
  | { type: "SELECT_DOSE_CLASS"; payload: "11" | "12" }
  | { type: "UNLOCK_GYAN_FROM_DOSE" }
  | { type: "AWARD_RDM"; payload: number }
  | { type: "SYNC_RDM"; payload: number }
  | { type: "SET_RDM"; payload: number }
  | { type: "SET_PUZZLE_COMPLETED"; payload?: boolean }
  | { type: "ENROLL_MONTHLY_CHALLENGE"; payload: string }
  | {
      type: "APPLY_CHALLENGE_ENROLLMENT";
      payload: { monthKey: string; rdm: number };
    }
  | { type: "MARK_CHALLENGE_PUZZLE_SUBMITTED"; payload: string }
  | {
      type: "PUSH_NOTIFICATION";
      payload: { id: string; icon: string; text: string };
    }
  | { type: "CLEAR_NOTIFICATION"; payload: string }
  | { type: "ROLL_DAY" };

function withDerived(state: GameState): GameState {
  const today = todayKey();
  const live = todayCriteria(state);
  const prevDay = state.dayCriteriaLog?.[today];
  // Always record under App Clock today once lastActiveDate matches (caller rolls first).
  const dayCriteriaLog =
    state.lastActiveDate === today
      ? {
          ...(state.dayCriteriaLog ?? {}),
          [today]: mergeDayCriteriaRecord(prevDay, live),
        }
      : (state.dayCriteriaLog ?? {});
  const next = { ...state, dayCriteriaLog };
  const streak = computeStreak(next, today);
  return { ...next, streak };
}

function rollDayIfNeeded(state: GameState): GameState {
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  // Snapshot the day we're leaving so completions are not lost on clock jumps.
  const leavingKey = state.lastActiveDate;
  const leavingLive = todayCriteria(state);
  const leavingPrev = state.dayCriteriaLog?.[leavingKey];
  const snappedLeaving = mergeDayCriteriaRecord(leavingPrev, leavingLive);
  const snappedLog = {
    ...(state.dayCriteriaLog ?? {}),
    [leavingKey]: snappedLeaving,
  };
  const stateWithSnap = { ...state, dayCriteriaLog: snappedLog };

  // Admin clock jumped backward — keep logs; retarget "today" without wiping history.
  if (today < leavingKey) {
    const saved = snappedLog[today];
    if (saved) {
      const doneHabitIds = new Set(saved.habitsDone ?? []);
      return withDerived({
        ...stateWithSnap,
        lastActiveDate: today,
        puzzleCompleted: saved.puzzles,
        pledgeAM: Boolean(saved.pledgeAM || saved.pledges),
        pledgePM: Boolean(saved.pledgePM || saved.pledges),
        dose: { ...stateWithSnap.dose, completed: saved.dose },
        funbrain: { ...stateWithSnap.funbrain, completed: saved.funbrain },
        habits: stateWithSnap.habits.map((h) => ({
          ...h,
          done:
            doneHabitIds.size > 0
              ? doneHabitIds.has(h.id)
              : Boolean(saved.habits),
        })),
      });
    }
    return withDerived({ ...stateWithSnap, lastActiveDate: today });
  }

  // Snapshot yesterday's dose score + full criteria before reset.
  const withDoseLog = recordDoseDayInState(stateWithSnap, leavingKey);
  const yesterdayCriteria = mergeDayCriteriaRecord(
    withDoseLog.dayCriteriaLog?.[leavingKey],
    todayCriteria(withDoseLog),
  );
  const history = [...withDoseLog.history, yesterdayCriteria].slice(-27);
  const dayCriteriaLog = {
    ...(withDoseLog.dayCriteriaLog ?? {}),
    [leavingKey]: yesterdayCriteria,
  };

  return withDerived({
    ...withDoseLog,
    history,
    dayCriteriaLog,
    lastActiveDate: today,
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
    puzzleCompleted: false,
    pledgeAM: false,
    pledgePM: false,
    gyanTimeMs: 0,
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
      currentClass: state.dose?.currentClass || "11",
      answers11: [],
      answers12: [],
    },
    funbrain: {
      running: false,
      timeLeft: FUNBRAIN_DURATION_SEC,
      score: 0,
      combo: 0,
      highScore: state.funbrain.highScore,
      currentQuestionIndex: 0,
      answers: [],
      finished: false,
      completed: false,
    },
    habits: state.habits.map((h) => ({ ...h, done: false })),
    notifications: state.notifications,
  });
}

function gameReducer(state: GameState, action: GameAction): GameState {
  // Keep lastActiveDate aligned with App Clock before any task mutation so
  // completions land in dayCriteriaLog under the simulated calendar day.
  if (action.type !== "HYDRATE" && action.type !== "ROLL_DAY") {
    state = rollDayIfNeeded(state);
  }
  switch (action.type) {
    case "HYDRATE": {
      const hydrated = rollDayIfNeeded(action.payload);
      const syncedHabits = HABIT_DEFINITIONS.map((def) => {
        const existing = (hydrated.habits || []).find((h) => h.id === def.id);
        return {
          ...def,
          done: existing ? existing.done : false,
        };
      });
      return withDerived({
        ...hydrated,
        habits: syncedHabits,
        // Payload may carry today's puzzle sync from puzzle progress (set before roll).
        puzzleCompleted:
          action.payload.puzzleCompleted || hydrated.puzzleCompleted,
      });
    }
    case "SET_SIGNED_IN":
      return { ...state, signedIn: action.payload };
    case "TOGGLE_HABIT": {
      const habit = state.habits.find((h) => h.id === action.payload);
      if (!habit) return state;
      const nextDone = !habit.done;
      const rewardKey = HABIT_ID_TO_RDM_KEY[habit.id];
      const habitRdm = rewardKey
        ? getLiveRdmAmount(rewardKey)
        : habit.rdm;
      const rdmDelta = nextDone ? habitRdm : -habitRdm;
      return withDerived({
        ...state,
        rdm: Math.max(0, state.rdm + rdmDelta),
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, done: nextDone, rdm: habitRdm } : h,
        ),
      });
    }
    case "ANSWER_DOSE": {
      if (!state.dose.running || state.dose.locked || state.dose.completed) {
        return state;
      }
      const isCorrect = action.payload.selected === action.payload.correct;
      const rdmPerCorrect = getLiveRdmAmount("dose.per_correct");
      const correct = state.dose.correct + (isCorrect ? 1 : 0);
      const earned = correct * rdmPerCorrect;
      const rdmDelta = Math.max(0, earned - state.doseRdmCredited);
      const is11 = state.dose.currentClass === "11";
      const newAnswers11 = is11
        ? [...(state.dose.answers11 || []), action.payload.selected]
        : (state.dose.answers11 || []);
      const newAnswers12 = !is11
        ? [...(state.dose.answers12 || []), action.payload.selected]
        : (state.dose.answers12 || []);
      return withDerived({
        ...state,
        rdm: state.rdm + rdmDelta,
        doseRdmCredited: state.doseRdmCredited + rdmDelta,
        dose: {
          ...state.dose,
          locked: true,
          correct,
          correct11: is11 ? correct : state.dose.correct11,
          locked11: is11 ? true : state.dose.locked11,
          correct12: !is11 ? correct : state.dose.correct12,
          locked12: !is11 ? true : state.dose.locked12,
          answers11: newAnswers11,
          answers12: newAnswers12,
        },
      });
    }
    case "NEXT_DOSE": {
      if (!state.dose.running || state.dose.completed) return state;
      const questionCount =
        action.payload?.questionCount && action.payload.questionCount > 0
          ? action.payload.questionCount
          : DOSE_QUESTION_COUNT;
      const nextIndex = state.dose.index + 1;
      const is11 = state.dose.currentClass === "11";
      if (nextIndex >= questionCount) {
        const completedState = withDerived({
          ...state,
          dose: {
            ...state.dose,
            index: nextIndex,
            locked: false,
            running: false,
            completed: true,
            completed11: is11 ? true : state.dose.completed11,
            completed12: !is11 ? true : state.dose.completed12,
          },
        });
        return recordDoseDayInState(
          completedState,
          todayKey(),
          questionCount,
        );
      }
      return {
        ...state,
        dose: {
          ...state.dose,
          index: nextIndex,
          locked: false,
          index11: is11 ? nextIndex : state.dose.index11,
          locked11: is11 ? false : state.dose.locked11,
          index12: !is11 ? nextIndex : state.dose.index12,
          locked12: !is11 ? false : state.dose.locked12,
        },
      };
    }
    case "START_DOSE": {
      if (state.dose.completed || state.dose.running) return state;
      return {
        ...state,
        dose: {
          ...state.dose,
          running: true,
          timeLeft: DOSE_DURATION_SEC,
          index: 0,
          locked: false,
          correct: 0,
          answers11:
            state.dose.currentClass === "11" ? [] : state.dose.answers11 || [],
          answers12:
            state.dose.currentClass === "12" ? [] : state.dose.answers12 || [],
          index11: state.dose.currentClass === "11" ? 0 : state.dose.index11,
          locked11: state.dose.currentClass === "11" ? false : state.dose.locked11,
          correct11: state.dose.currentClass === "11" ? 0 : state.dose.correct11,
          index12: state.dose.currentClass === "12" ? 0 : state.dose.index12,
          locked12: state.dose.currentClass === "12" ? false : state.dose.locked12,
          correct12: state.dose.currentClass === "12" ? 0 : state.dose.correct12,
        },
      };
    }
    case "TICK_DOSE": {
      if (!state.dose.running || state.dose.completed) return state;
      const timeLeft = state.dose.timeLeft - 1;
      if (timeLeft > 0) {
        return {
          ...state,
          dose: { ...state.dose, timeLeft },
        };
      }
      const questionCount =
        action.payload?.questionCount && action.payload.questionCount > 0
          ? action.payload.questionCount
          : DOSE_QUESTION_COUNT;
      const is11 = state.dose.currentClass === "11";
      const gyanAlready = state.gyanUnlockedIds.includes("velocity-vs-speed");
      const completedState = withDerived({
        ...state,
        gyanUnlockedIds: gyanAlready
          ? state.gyanUnlockedIds
          : [...state.gyanUnlockedIds, "velocity-vs-speed"],
        notifications: gyanAlready
          ? state.notifications
          : [
              {
                id: "gyan-unlock",
                icon: "✨",
                text: `New ${FEATURES.gyan.label} card unlocked from today's DailyDose.`,
              },
              ...state.notifications.filter((n) => n.id !== "gyan-unlock"),
            ].slice(0, 5),
        dose: {
          ...state.dose,
          running: false,
          timeLeft: 0,
          locked: false,
          completed: true,
          completed11: is11 ? true : state.dose.completed11,
          completed12: !is11 ? true : state.dose.completed12,
        },
      });
      return recordDoseDayInState(completedState, todayKey(), questionCount);
    }
    case "RESET_DOSE": {
      const is11 = state.dose.currentClass === "11";
      return {
        ...state,
        dose: {
          ...state.dose,
          index: 0,
          locked: false,
          correct: 0,
          completed: false,
          running: false,
          timeLeft: DOSE_DURATION_SEC,
          index11: is11 ? 0 : state.dose.index11,
          locked11: is11 ? false : state.dose.locked11,
          correct11: is11 ? 0 : state.dose.correct11,
          completed11: is11 ? false : state.dose.completed11,
          answers11: is11 ? [] : (state.dose.answers11 || []),
          index12: !is11 ? 0 : state.dose.index12,
          locked12: !is11 ? false : state.dose.locked12,
          correct12: !is11 ? 0 : state.dose.correct12,
          completed12: !is11 ? false : state.dose.completed12,
          answers12: !is11 ? [] : (state.dose.answers12 || []),
        },
      };
    }
    case "SELECT_DOSE_CLASS": {
      // Lock class switch during an active timed attempt.
      if (state.dose.running) return state;
      const targetClass = action.payload;
      const d = state.dose;
      
      const currentIs11 = d.currentClass === "11";
      const index11 = currentIs11 ? d.index : d.index11;
      const locked11 = currentIs11 ? d.locked : d.locked11;
      const correct11 = currentIs11 ? d.correct : d.correct11;
      const completed11 = currentIs11 ? d.completed : d.completed11;

      const index12 = !currentIs11 ? d.index : d.index12;
      const locked12 = !currentIs11 ? d.locked : d.locked12;
      const correct12 = !currentIs11 ? d.correct : d.correct12;
      const completed12 = !currentIs11 ? d.completed : d.completed12;

      const targetIs11 = targetClass === "11";
      const index = targetIs11 ? index11 : index12;
      const locked = targetIs11 ? locked11 : locked12;
      const correct = targetIs11 ? correct11 : correct12;
      const completed = targetIs11 ? completed11 : completed12;

      return {
        ...state,
        dose: {
          index,
          locked,
          correct,
          completed,
          running: false,
          timeLeft: DOSE_DURATION_SEC,
          index11,
          locked11,
          correct11,
          completed11,
          index12,
          locked12,
          correct12,
          completed12,
          currentClass: targetClass,
          answers11: d.answers11 || [],
          answers12: d.answers12 || [],
        }
      };
    }
    case "START_FUNBRAIN":
      if (state.funbrain.completed) return state;
      return {
        ...state,
        funbrain: {
          running: true,
          timeLeft: FUNBRAIN_DURATION_SEC,
          score: 0,
          combo: 0,
          highScore: state.funbrain.highScore,
          currentQuestionIndex: 0,
          answers: [],
          finished: false,
          completed: false,
        },
      };
    case "TICK_FUNBRAIN": {
      if (!state.funbrain.running) return state;
      const timeLeft = state.funbrain.timeLeft - 1;
      if (timeLeft <= 0) {
        const highScore = Math.max(state.funbrain.highScore, state.funbrain.score);
        const rdmDelta = Math.max(
          0,
          state.funbrain.score - state.funbrainRdmCredited,
        );
        return withDerived({
          ...state,
          rdm: state.rdm + rdmDelta,
          funbrainRdmCredited: state.funbrainRdmCredited + rdmDelta,
          funbrain: {
            ...state.funbrain,
            running: false,
            timeLeft: 0,
            finished: true,
            completed: true,
            highScore,
          },
        });
      }
      return {
        ...state,
        funbrain: { ...state.funbrain, timeLeft },
      };
    }
    case "ANSWER_FUNBRAIN": {
      if (!state.funbrain.running || state.funbrain.finished) return state;
      const isCorrect =
        action.payload.selected === action.payload.correct;
      const combo = isCorrect ? state.funbrain.combo + 1 : 0;
      const score =
        state.funbrain.score + (isCorrect ? funbrainPoints(state.funbrain.combo) : 0);
      const poolLength =
        action.payload.poolLength && action.payload.poolLength > 0
          ? action.payload.poolLength
          : FUNBRAIN_QUESTIONS_PER_DAY;
      const qIndex = state.funbrain.currentQuestionIndex;
      const answers = [...state.funbrain.answers];
      answers[qIndex] = action.payload.selected;
      const nextQ = qIndex + 1;

      // One pass through today's 6 only — no looping the full bank.
      if (nextQ >= poolLength) {
        const highScore = Math.max(state.funbrain.highScore, score);
        const rdmDelta = Math.max(0, score - state.funbrainRdmCredited);
        return withDerived({
          ...state,
          rdm: state.rdm + rdmDelta,
          funbrainRdmCredited: state.funbrainRdmCredited + rdmDelta,
          funbrain: {
            ...state.funbrain,
            score,
            combo,
            answers,
            currentQuestionIndex: poolLength,
            running: false,
            finished: true,
            completed: true,
            highScore,
          },
        });
      }

      return {
        ...state,
        funbrain: {
          ...state.funbrain,
          score,
          combo,
          answers,
          currentQuestionIndex: nextQ,
        },
      };
    }
    case "END_FUNBRAIN": {
      if (state.funbrain.completed && !state.funbrain.running) return state;
      const highScore = Math.max(state.funbrain.highScore, state.funbrain.score);
      const rdmDelta = Math.max(
        0,
        state.funbrain.score - state.funbrainRdmCredited,
      );
      return withDerived({
        ...state,
        rdm: state.rdm + rdmDelta,
        funbrainRdmCredited: state.funbrainRdmCredited + rdmDelta,
        funbrain: {
          ...state.funbrain,
          running: false,
          finished: true,
          completed: true,
          highScore,
        },
      });
    }
    case "RESET_FUNBRAIN":
      // Replay today's set without clearing funbrainRdmCredited; replays cannot farm
      // already-awarded RDM, but a better score may still award the improvement.
      return {
        ...state,
        funbrain: {
          running: false,
          timeLeft: FUNBRAIN_DURATION_SEC,
          score: 0,
          combo: 0,
          highScore: state.funbrain.highScore,
          currentQuestionIndex: 0,
          answers: [],
          finished: false,
          completed: false,
        },
      };
    case "TICK_GYAN":
      return withDerived({
        ...state,
        gyanTimeMs: state.gyanTimeMs + action.payload,
      });
    case "TOGGLE_GYAN":
      return {
        ...state,
        gyanOpenId:
          state.gyanOpenId === action.payload ? null : action.payload,
      };
    case "SIGN_PLEDGE":
      return withDerived({
        ...state,
        pledgeAM: action.payload === "am" ? true : state.pledgeAM,
        pledgePM: action.payload === "pm" ? true : state.pledgePM,
      });
    case "RESET_PLEDGE":
      return withDerived({
        ...state,
        pledgeAM: action.payload === "am" ? false : state.pledgeAM,
        pledgePM: action.payload === "pm" ? false : state.pledgePM,
      });
    case "UNLOCK_GYAN_FROM_DOSE": {
      if (state.gyanUnlockedIds.includes("velocity-vs-speed")) return state;
      return {
        ...state,
        gyanUnlockedIds: [...state.gyanUnlockedIds, "velocity-vs-speed"],
        notifications: [
          {
            id: "gyan-unlock",
            icon: "✨",
            text: `New ${FEATURES.gyan.label} card unlocked from today's DailyDose.`,
          },
          ...state.notifications.filter((n) => n.id !== "gyan-unlock"),
        ].slice(0, 5),
      };
    }
    case "AWARD_RDM":
      if (!Number.isFinite(action.payload) || action.payload <= 0) return state;
      return withDerived({ ...state, rdm: state.rdm + Math.round(action.payload) });
    case "SYNC_RDM":
      if (!Number.isFinite(action.payload) || action.payload < 0) return state;
      return withDerived({
        ...state,
        rdm: Math.max(state.rdm, Math.round(action.payload)),
      });
    case "SET_RDM":
      if (!Number.isFinite(action.payload) || action.payload < 0) return state;
      return withDerived({
        ...state,
        rdm: Math.round(action.payload),
      });
    case "SET_PUZZLE_COMPLETED": {
      const next = action.payload !== false;
      if (state.puzzleCompleted === next) return state;
      return withDerived({ ...state, puzzleCompleted: next });
    }
    case "ENROLL_MONTHLY_CHALLENGE": {
      // Client-side optimistic path — prefer server /api/challenge/enroll.
      const monthKey = action.payload;
      if (!/^\d{4}-\d{2}$/.test(monthKey)) return state;
      if (
        isEnrolledForChallengeMonth(
          monthKey,
          state.challengeEnrolledMonthKey,
          state.challengeEnrolledMonths,
        )
      ) {
        return state;
      }
      const stake = getMonthlyChallengeEntryStakeRdm();
      if (state.rdm < getMonthlyChallengeTargetRdm()) return state;
      if (state.rdm < stake) return state;
      const today = todayKey();
      const meta = getChallengeMonthMeta(today);
      if (monthKey !== meta.monthKey) return state;
      if (!isInEntryWindow(today)) return state;
      return withDerived({
        ...state,
        rdm: state.rdm - stake,
        ...withChallengeEnrollment(state, monthKey),
      });
    }
    case "APPLY_CHALLENGE_ENROLLMENT": {
      const { monthKey, rdm } = action.payload;
      if (!/^\d{4}-\d{2}$/.test(monthKey)) return state;
      if (!Number.isFinite(rdm) || rdm < 0) return state;
      return withDerived({
        ...state,
        rdm: Math.floor(rdm),
        ...withChallengeEnrollment(state, monthKey),
      });
    }
    case "MARK_CHALLENGE_PUZZLE_SUBMITTED": {
      const monthKey = action.payload;
      if (!/^\d{4}-\d{2}$/.test(monthKey)) return state;
      if (state.challengePuzzleSubmittedMonthKey === monthKey) return state;
      return withDerived({
        ...state,
        challengePuzzleSubmittedMonthKey: monthKey,
      });
    }
    case "PUSH_NOTIFICATION": {
      const note = action.payload;
      if (!note.id || !note.text) return state;
      return {
        ...state,
        notifications: [
          note,
          ...state.notifications.filter((n) => n.id !== note.id),
        ].slice(0, 5),
      };
    }
    case "CLEAR_NOTIFICATION": {
      const id = action.payload;
      if (!id) return state;
      if (!state.notifications.some((n) => n.id === id)) return state;
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== id),
      };
    }
    case "ROLL_DAY": {
      // Avoid no-op re-renders (and save spam) when already on App Clock today.
      if (state.lastActiveDate === todayKey()) return state;
      return withDerived(rollDayIfNeeded(state));
    }
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

interface GameContextValue {
  state: GameState;
  hydrated: boolean;
  activeView: AppView;
  modal: ModalState;
  levelInfo: ReturnType<typeof getLevelInfo>;
  habitsStats: ReturnType<typeof habitsProgress>;
  achievements: ReturnType<typeof getAchievementProgress>;
  gyanCards: ReturnType<typeof getGyanCards>;
  today: ReturnType<typeof todayCriteria>;
  setActiveView: (view: AppView) => void;
  /** Run an action only when signed in; otherwise show login modal. */
  withAuth: (fn: () => void) => void;
  /** Add RDM (e.g. rewards from Brain Gym games). No-op if signed out. */
  awardRDM: (amount: number) => void;
  /** Raise local RDM to at least the server value after an atomic reward write. */
  syncRdm: (rdm: number) => void;
  /** Admin QA: set absolute RDM balance. */
  setRdm: (rdm: number) => void;
  /** Enroll in this month's Monthly Challenge (days 1–5). Deducts entry stake on server. */
  enrollMonthlyChallenge: (monthKey: string) => void;
  /** Remove a flash notification by id (after toast is shown). */
  clearNotification: (id: string) => void;
  /** Mark final puzzle submitted for a month key. */
  markChallengePuzzleSubmitted: (monthKey: string) => void;
  toggleHabit: (id: string) => void;
  answerDose: (selected: number, correct: number) => void;
  nextDose: (questionCount?: number) => void;
  startDose: () => void;
  resetDose: () => void;
  startFunbrain: () => void;
  answerFunbrain: (
    selected: number,
    correct: number,
    poolLength?: number,
  ) => void;
  resetFunbrain: () => void;
  tickGyan: (ms: number) => void;
  toggleGyan: (id: string | null) => void;
  openPledgeModal: (type: PledgeType) => void;
  closePledgeModal: () => void;
  openReel: (type: PledgeType) => void;
  completePledge: (type: PledgeType) => void;
  resetPledge: (type: PledgeType) => void;
  selectDoseClass: (cls: "11" | "12") => void;
  closeReel: () => void;
  /** Mark today's puzzle as done for the main learning streak. */
  markPuzzleCompleted: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, requireAuth } = useAuth();
  const { todayKey: clockToday } = useAppClock();
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  // Guest home can render immediately; signed-in progress still re-hydrates below.
  const [hydrated, setHydrated] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const activeView = useMemo<AppView>(() => {
    return PATH_TO_VIEW[pathname] ?? "home";
  }, [pathname]);

  const modalState = useState<ModalState>({ pledge: null, reel: null });
  const modal = modalState[0];
  const setModal = modalState[1];

  const userIdRef = useRef<string | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);
  const enrollInFlightRef = useRef(false);
  const prevFullDayRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const saveQueueRef = useRef(
    createSaveQueue<GameState>(async (next) => {
      const userId = userIdRef.current;
      if (!userId) return { ok: false, error: "Not signed in" };
      return storageAdapter.save(userId, next);
    }),
  );

  const flushProgressNow = useCallback(() => {
    if (!userIdRef.current) return;
    void saveQueueRef.current.flushNow(
      toPersistableGameState(stateRef.current),
    );
  }, []);

  const goToView = useCallback(
    (view: AppView) => {
      const targetPath = VIEW_TO_PATH[view] ?? "/";
      if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
        router.push(targetPath);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router],
  );
  const goToViewRef = useRef(goToView);
  goToViewRef.current = goToView;

  // Guest on a private route → home. Kept separate so auth hydrate does not
  // re-run (and flash a skeleton) on every pathname change.
  useEffect(() => {
    if (authLoading || user) return;
    if (!PUBLIC_VIEWS.has(PATH_TO_VIEW[pathname] ?? "home")) {
      router.push("/");
    }
  }, [authLoading, user, pathname, router]);

  useEffect(() => {
    if (authLoading) return;
    const uid = user?.id ?? null;
    userIdRef.current = uid;

    if (!uid) {
      loadedUserIdRef.current = null;
      prevFullDayRef.current = false;
      saveQueueRef.current.invalidate();
      dispatch({ type: "HYDRATE", payload: createInitialState() });
      setHydrated(true);
      setModal({ pledge: null, reel: null });
      return;
    }

    // Same signed-in user already loaded — skip reload so a debounce-window
    // re-render cannot wipe unsaved dose/funbrain/pledge completions.
    if (loadedUserIdRef.current === uid) return;

    let cancelled = false;
    setHydrated(false);
    saveQueueRef.current.invalidate();

    void (async () => {
      const [saved, puzzleProgress] = await Promise.all([
        storageAdapter.load(uid),
        loadPuzzleProgress(uid),
      ]);
      if (cancelled) return;

      const today = todayKey();
      const puzzleDoneToday = Boolean(puzzleProgress.attempts[today]);
      const payload = saved ?? createInitialState();
      const repaired = repairDayCriteriaLogFromSources(
        payload,
        puzzleProgress.attempts,
      );
      const hydratedPayload = {
        ...repaired,
        signedIn: true,
        joinedDate: repaired.joinedDate ?? repaired.lastActiveDate ?? today,
        // Keep prior-day puzzleCompleted for rollDayIfNeeded snapshot.
        // Do NOT swap to "today's puzzle" before the leaving day is snapshotted.
        puzzleCompleted: repaired.puzzleCompleted,
      };
      // Baseline = what Supabase already has. Post-HYDRATE roll snapshots
      // must flush so leaving-day completions are not lost on restart.
      saveQueueRef.current.setBaseline(toPersistableGameState(hydratedPayload));
      dispatch({
        type: "HYDRATE",
        payload: hydratedPayload,
      });
      // After roll, apply today's puzzle from the puzzle store.
      if (puzzleDoneToday) {
        dispatch({ type: "SET_PUZZLE_COMPLETED", payload: true });
      }
      loadedUserIdRef.current = uid;
      setHydrated(true);

      const validViews: AppView[] = [
        "home",
        "dailydose",
        "funbrain",
        "gyan",
        "puzzles",
        "wasquad",
        "habits",
        "achievements",
        "inspiration",
        "ai",
        "challenge",
        "profile",
      ];
      const pending = readPendingView() as AppView | null;
      if (pending && validViews.includes(pending)) {
        clearPendingView();
        goToViewRef.current(pending);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, setModal]);

  useEffect(() => {
    if (!hydrated || authLoading || !user) return;
    saveQueueRef.current.enqueue(toPersistableGameState(state));
  }, [state, hydrated, user, authLoading]);

  // Persist immediately after hydrate/roll so dayCriteriaLog snapshots hit Supabase.
  useEffect(() => {
    if (!hydrated || !user) return;
    const id = window.setTimeout(() => flushProgressNow(), 0);
    return () => window.clearTimeout(id);
  }, [hydrated, user, flushProgressNow]);

  // Flush pending progress when tab hides so completions land in Supabase.
  useEffect(() => {
    if (!hydrated || !user) return;
    const flush = () => flushProgressNow();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [hydrated, user, flushProgressNow]);

  // App Clock change: roll first, then flush so leaving-day completions stick.
  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "ROLL_DAY" });
    if (!user) return;
    const id = window.setTimeout(() => flushProgressNow(), 0);
    return () => window.clearTimeout(id);
  }, [clockToday, hydrated, user, flushProgressNow]);

  // The moment a full day locks in, write to Supabase (don't wait for debounce).
  useEffect(() => {
    if (!hydrated || !user) return;
    const today = todayKey();
    const criteria =
      state.dayCriteriaLog?.[today] ?? todayCriteria(state);
    const full = isFullDay(criteria);
    if (full && !prevFullDayRef.current) {
      flushProgressNow();
    }
    prevFullDayRef.current = full;
  }, [state, hydrated, user, flushProgressNow]);

  useEffect(() => {
    if (!state.funbrain.running) return;
    const id = window.setInterval(() => dispatch({ type: "TICK_FUNBRAIN" }), 1000);
    return () => window.clearInterval(id);
  }, [state.funbrain.running]);

  useEffect(() => {
    if (!state.dose.running) return;
    const id = window.setInterval(
      () =>
        dispatch({
          type: "TICK_DOSE",
          payload: { questionCount: DOSE_QUESTION_COUNT },
        }),
      1000,
    );
    return () => window.clearInterval(id);
  }, [state.dose.running]);

  const setActiveView = useCallback(
    (view: AppView) => {
      if (PUBLIC_VIEWS.has(view)) {
        goToView(view);
        return;
      }
      storePendingView(view);
      requireAuth(() => {
        clearPendingView();
        goToView(view);
      });
    },
    [goToView, requireAuth],
  );

  const withAuth = useCallback(
    (fn: () => void) => {
      requireAuth(fn);
    },
    [requireAuth],
  );

  const tickGyan = useCallback(
    (ms: number) => {
      if (!user) return;
      dispatch({ type: "TICK_GYAN", payload: ms });
    },
    [user],
  );

  const clearNotification = useCallback((id: string) => {
    if (!id) return;
    dispatch({ type: "CLEAR_NOTIFICATION", payload: id });
  }, []);

  const markChallengePuzzleSubmitted = useCallback(
    (monthKey: string) => {
      requireAuth(() =>
        dispatch({
          type: "MARK_CHALLENGE_PUZZLE_SUBMITTED",
          payload: monthKey,
        }),
      );
    },
    [requireAuth],
  );

  const levelInfo = useMemo(() => getLevelInfo(state.rdm), [state.rdm]);
  const habitsStats = useMemo(() => habitsProgress(state), [state]);
  const achievements = useMemo(() => getAchievementProgress(state), [state]);
  const gyanCards = useMemo(() => getGyanCards(state), [state]);
  const today = useMemo(() => todayCriteria(state), [state]);

  const value: GameContextValue = {
    state,
    hydrated,
    activeView,
    modal,
    levelInfo,
    habitsStats,
    achievements,
    gyanCards,
    today,
    setActiveView,
    withAuth,
    toggleHabit: (id) =>
      requireAuth(() => dispatch({ type: "TOGGLE_HABIT", payload: id })),
    answerDose: (selected, correct) => {
      requireAuth(() =>
        dispatch({ type: "ANSWER_DOSE", payload: { selected, correct } }),
      );
    },
    nextDose: (questionCount) => {
      requireAuth(() => {
        const count =
          questionCount && questionCount > 0
            ? questionCount
            : DOSE_QUESTION_COUNT;
        dispatch({ type: "NEXT_DOSE", payload: { questionCount: count } });
        if (state.dose.index + 1 >= count) {
          dispatch({ type: "UNLOCK_GYAN_FROM_DOSE" });
        }
      });
    },
    startDose: () => requireAuth(() => dispatch({ type: "START_DOSE" })),
    resetDose: () => requireAuth(() => dispatch({ type: "RESET_DOSE" })),
    startFunbrain: () => requireAuth(() => dispatch({ type: "START_FUNBRAIN" })),
    answerFunbrain: (selected, correct, poolLength) =>
      requireAuth(() =>
        dispatch({
          type: "ANSWER_FUNBRAIN",
          payload: { selected, correct, poolLength },
        }),
      ),
    resetFunbrain: () => requireAuth(() => dispatch({ type: "RESET_FUNBRAIN" })),
    awardRDM: (amount) =>
      requireAuth(() => dispatch({ type: "AWARD_RDM", payload: amount })),
    syncRdm: (rdm) =>
      requireAuth(() => dispatch({ type: "SYNC_RDM", payload: rdm })),
    setRdm: (rdm) =>
      requireAuth(() => dispatch({ type: "SET_RDM", payload: rdm })),
    enrollMonthlyChallenge: (monthKey) => {
      requireAuth(() => {
        if (!/^\d{4}-\d{2}$/.test(monthKey)) return;
        if (enrollInFlightRef.current) return;
        if (
          isEnrolledForChallengeMonth(
            monthKey,
            stateRef.current.challengeEnrolledMonthKey,
            stateRef.current.challengeEnrolledMonths,
          )
        ) {
          return;
        }
        enrollInFlightRef.current = true;
        const dateKey = clockToday;
        void (async () => {
          try {
            // Persist local completions before enroll can re-hydrate from server.
            await saveQueueRef.current.flushNow(
              toPersistableGameState(stateRef.current),
            );
            const res = await fetch("/api/challenge/enroll", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ monthKey, dateKey }),
            });
            const data = (await res.json()) as {
              error?: string;
              message?: string;
              rdm?: number;
              challengeEnrolledMonthKey?: string;
              state?: GameState;
            };
            if (!res.ok) {
              console.warn("[enroll]", data.error ?? res.status);
              try {
                const syncRes = await fetch("/api/progress/game", {
                  credentials: "include",
                });
                if (syncRes.ok) {
                  const syncData = (await syncRes.json()) as {
                    state?: GameState | null;
                  };
                  if (syncData.state) {
                    dispatch({ type: "HYDRATE", payload: syncData.state });
                  }
                }
              } catch {
                /* ignore */
              }
              dispatch({
                type: "PUSH_NOTIFICATION",
                payload: {
                  id: "challenge-enroll",
                  icon: "⚠️",
                  text:
                    data.error ??
                    "Could not enter Monthly Challenge. Please try again.",
                },
              });
              return;
            }
            if (data.state) {
              dispatch({ type: "HYDRATE", payload: data.state });
            } else if (
              typeof data.rdm === "number" &&
              typeof data.challengeEnrolledMonthKey === "string"
            ) {
              dispatch({
                type: "APPLY_CHALLENGE_ENROLLMENT",
                payload: {
                  monthKey: data.challengeEnrolledMonthKey,
                  rdm: data.rdm,
                },
              });
            }
            dispatch({
              type: "PUSH_NOTIFICATION",
              payload: {
                id: "challenge-enroll",
                icon: "🏆",
                text:
                  data.message ??
                  "Thank you! You're in this month's challenge. Good luck!",
              },
            });
          } catch (err) {
            console.warn("[enroll] network", err);
            dispatch({
              type: "PUSH_NOTIFICATION",
              payload: {
                id: "challenge-enroll",
                icon: "⚠️",
                text: "Network error — could not enter the challenge.",
              },
            });
          } finally {
            enrollInFlightRef.current = false;
          }
        })();
      });
    },
    markChallengePuzzleSubmitted,
    tickGyan,
    toggleGyan: (id) =>
      requireAuth(() => dispatch({ type: "TOGGLE_GYAN", payload: id })),
    openPledgeModal: (type) => setModal({ pledge: type, reel: null }),
    closePledgeModal: () => setModal((m) => ({ ...m, pledge: null })),
    openReel: (type) => setModal({ pledge: null, reel: type }),
    completePledge: (type) => {
      requireAuth(() => {
        dispatch({ type: "SIGN_PLEDGE", payload: type });
        setModal({ pledge: null, reel: null });
      });
    },
    resetPledge: (type) => {
      requireAuth(() => {
        dispatch({ type: "RESET_PLEDGE", payload: type });
      });
    },
    selectDoseClass: (cls) => {
      requireAuth(() => {
        dispatch({ type: "SELECT_DOSE_CLASS", payload: cls });
      });
    },
    closeReel: () => setModal((m) => ({ ...m, reel: null })),
    clearNotification,
    markPuzzleCompleted: () => {
      if (!user) return;
      dispatch({ type: "SET_PUZZLE_COMPLETED", payload: true });
    },
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
