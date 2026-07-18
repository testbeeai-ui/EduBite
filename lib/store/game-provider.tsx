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
import { DOSE_QUESTION_COUNT, FEATURES, FUNBRAIN_DURATION_SEC } from "@/data/config";
import { HABIT_DEFINITIONS } from "@/data/habits";
import { FUNBRAIN_QUESTIONS_PER_DAY } from "@/lib/content/schedule";
import {
  computeStreak,
  createInitialState,
  funbrainPoints,
  getAchievementProgress,
  getGyanCards,
  getLevelInfo,
  habitsProgress,
  RDM_PER_DOSE_CORRECT,
  todayCriteria,
} from "@/lib/gamification";
import { useAuth } from "@/lib/auth/auth-provider";
import { storePendingView, readPendingView, clearPendingView } from "@/lib/auth/pending-action";
import { createSaveQueue } from "@/lib/persistence/save-queue";
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
  | { type: "ROLL_DAY" };

function withDerived(state: GameState): GameState {
  const streak = computeStreak(state);
  return { ...state, streak };
}

function rollDayIfNeeded(state: GameState): GameState {
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  const yesterdayCriteria = todayCriteria(state);
  const history = [...state.history, yesterdayCriteria].slice(-27);

  return withDerived({
    ...state,
    history,
    lastActiveDate: today,
    doseRdmCredited: 0,
    funbrainRdmCredited: 0,
    pledgeAM: false,
    pledgePM: false,
    gyanTimeMs: 0,
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
      finished: false,
      completed: false,
    },
    habits: state.habits.map((h) => ({ ...h, done: false })),
    notifications: state.notifications,
  });
}

function gameReducer(state: GameState, action: GameAction): GameState {
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
      });
    }
    case "SET_SIGNED_IN":
      return { ...state, signedIn: action.payload };
    case "TOGGLE_HABIT":
      return withDerived({
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, done: !h.done } : h,
        ),
      });
    case "ANSWER_DOSE": {
      if (state.dose.locked || state.dose.completed) return state;
      const isCorrect = action.payload.selected === action.payload.correct;
      const correct = state.dose.correct + (isCorrect ? 1 : 0);
      const earned = correct * RDM_PER_DOSE_CORRECT;
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
      const questionCount =
        action.payload?.questionCount && action.payload.questionCount > 0
          ? action.payload.questionCount
          : DOSE_QUESTION_COUNT;
      const nextIndex = state.dose.index + 1;
      const is11 = state.dose.currentClass === "11";
      if (nextIndex >= questionCount) {
        return withDerived({
          ...state,
          dose: {
            ...state.dose,
            index: nextIndex,
            locked: false,
            completed: true,
            completed11: is11 ? true : state.dose.completed11,
            completed12: !is11 ? true : state.dose.completed12,
          },
        });
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
      const nextQ = state.funbrain.currentQuestionIndex + 1;

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
    case "ROLL_DAY":
      return withDerived(rollDayIfNeeded(state));
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
  toggleHabit: (id: string) => void;
  answerDose: (selected: number, correct: number) => void;
  nextDose: (questionCount?: number) => void;
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
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, requireAuth } = useAuth();
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [activeView, setActiveViewState] = useState<AppView>("home");
  const [modal, setModal] = useState<ModalState>({ pledge: null, reel: null });
  const userIdRef = useRef<string | null>(null);
  const saveQueueRef = useRef(
    createSaveQueue<GameState>(async (next) => {
      const userId = userIdRef.current;
      if (!userId) return { ok: false, error: "Not signed in" };
      return storageAdapter.save(userId, next);
    }),
  );

  const goToView = useCallback((view: AppView) => {
    setActiveViewState(view);
    window.history.replaceState(null, "", `#${view}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    userIdRef.current = user?.id ?? null;
    saveQueueRef.current.invalidate();

    if (!user) {
      dispatch({ type: "HYDRATE", payload: createInitialState() });
      setHydrated(true);
      setModal({ pledge: null, reel: null });
      setActiveViewState((current) => {
        if (PUBLIC_VIEWS.has(current)) return current;
        window.history.replaceState(null, "", "#home");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return "home";
      });
      return;
    }

    let cancelled = false;
    setHydrated(false);

    void (async () => {
      const saved = await storageAdapter.load(user.id);
      if (cancelled) return;

      const payload = saved ?? createInitialState();
      const hydratedPayload = {
        ...payload,
        signedIn: true,
        joinedDate: payload.joinedDate ?? payload.lastActiveDate ?? todayKey(),
      };
      saveQueueRef.current.setBaseline(hydratedPayload);
      dispatch({
        type: "HYDRATE",
        payload: hydratedPayload,
      });
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
      ];
      const pending = readPendingView() as AppView | null;
      if (pending && validViews.includes(pending)) {
        clearPendingView();
        goToView(pending);
        return;
      }
      const hash = window.location.hash.replace("#", "") as AppView;
      if (validViews.includes(hash) && !PUBLIC_VIEWS.has(hash)) {
        goToView(hash);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, goToView]);

  useEffect(() => {
    if (!hydrated || authLoading || !user) return;
    saveQueueRef.current.enqueue(state);
  }, [state, hydrated, user, authLoading]);

  useEffect(() => {
    if (!state.funbrain.running) return;
    const id = window.setInterval(() => dispatch({ type: "TICK_FUNBRAIN" }), 1000);
    return () => window.clearInterval(id);
  }, [state.funbrain.running]);

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
    tickGyan,
    toggleGyan: (id) =>
      requireAuth(() => dispatch({ type: "TOGGLE_GYAN", payload: id })),
    openPledgeModal: (type) =>
      requireAuth(() => setModal({ pledge: type, reel: null })),
    closePledgeModal: () => setModal((m) => ({ ...m, pledge: null })),
    openReel: (type) =>
      requireAuth(() => setModal({ pledge: null, reel: type })),
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
