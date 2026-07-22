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
import {
  isInEntryWindow,
  getChallengeMonthMeta,
  MONTHLY_CHALLENGE_TARGET_RDM,
  recordDoseDayInState,
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
  | { type: "MARK_CHALLENGE_PUZZLE_SUBMITTED"; payload: string }
  | { type: "ROLL_DAY" };

function withDerived(state: GameState): GameState {
  const streak = computeStreak(state);
  return { ...state, streak };
}

function rollDayIfNeeded(state: GameState): GameState {
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  // Snapshot yesterday's dose score into the challenge log before reset.
  const withDoseLog = recordDoseDayInState(state, state.lastActiveDate);
  const yesterdayCriteria = todayCriteria(withDoseLog);
  const history = [...withDoseLog.history, yesterdayCriteria].slice(-27);

  return withDerived({
    ...withDoseLog,
    history,
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
      const rdmDelta = nextDone ? habit.rdm : -habit.rdm;
      return withDerived({
        ...state,
        rdm: Math.max(0, state.rdm + rdmDelta),
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, done: nextDone } : h,
        ),
      });
    }
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
        const completedState = withDerived({
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
      const monthKey = action.payload;
      if (!/^\d{4}-\d{2}$/.test(monthKey)) return state;
      if (state.challengeEnrolledMonthKey === monthKey) return state;
      if (state.rdm < MONTHLY_CHALLENGE_TARGET_RDM) return state;
      const today = todayKey();
      const meta = getChallengeMonthMeta(today);
      if (monthKey !== meta.monthKey) return state;
      if (!isInEntryWindow(today)) return state;
      return withDerived({
        ...state,
        challengeEnrolledMonthKey: monthKey,
      });
    }
    case "MARK_CHALLENGE_PUZZLE_SUBMITTED": {
      const monthKey = action.payload;
      if (!/^\d{4}-\d{2}$/.test(monthKey)) return state;
      return withDerived({
        ...state,
        challengePuzzleSubmittedMonthKey: monthKey,
      });
    }
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
  /** Admin QA: set absolute RDM balance. */
  setRdm: (rdm: number) => void;
  /** Enroll in this month's Monthly Challenge (days 1–5). */
  enrollMonthlyChallenge: (monthKey: string) => void;
  /** Mark final puzzle submitted for a month key. */
  markChallengePuzzleSubmitted: (monthKey: string) => void;
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
  const saveQueueRef = useRef(
    createSaveQueue<GameState>(async (next) => {
      const userId = userIdRef.current;
      if (!userId) return { ok: false, error: "Not signed in" };
      return storageAdapter.save(userId, next);
    }),
  );

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

  useEffect(() => {
    if (authLoading) return;
    userIdRef.current = user?.id ?? null;
    saveQueueRef.current.invalidate();

    if (!user) {
      dispatch({ type: "HYDRATE", payload: createInitialState() });
      setHydrated(true);
      setModal({ pledge: null, reel: null });
      if (!PUBLIC_VIEWS.has(PATH_TO_VIEW[pathname] ?? "home")) {
        router.push("/");
      }
      return;
    }

    let cancelled = false;
    setHydrated(false);

    void (async () => {
      const [saved, puzzleProgress] = await Promise.all([
        storageAdapter.load(user.id),
        loadPuzzleProgress(user.id),
      ]);
      if (cancelled) return;

      const today = todayKey();
      const puzzleDoneToday = Boolean(puzzleProgress.attempts[today]);
      const payload = saved ?? createInitialState();
      const hydratedPayload = {
        ...payload,
        signedIn: true,
        joinedDate: payload.joinedDate ?? payload.lastActiveDate ?? today,
        puzzleCompleted:
          payload.lastActiveDate === today
            ? payload.puzzleCompleted || puzzleDoneToday
            : puzzleDoneToday,
      };
      saveQueueRef.current.setBaseline(toPersistableGameState(hydratedPayload));
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
        "challenge",
        "profile",
      ];
      const pending = readPendingView() as AppView | null;
      if (pending && validViews.includes(pending)) {
        clearPendingView();
        goToView(pending);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, goToView, pathname, router, setModal]);

  useEffect(() => {
    if (!hydrated || authLoading || !user) return;
    saveQueueRef.current.enqueue(toPersistableGameState(state));
  }, [state, hydrated, user, authLoading]);

  useEffect(() => {
    if (!hydrated) return;
    dispatch({ type: "ROLL_DAY" });
  }, [clockToday, hydrated]);

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
    setRdm: (rdm) =>
      requireAuth(() => dispatch({ type: "SET_RDM", payload: rdm })),
    enrollMonthlyChallenge: (monthKey) =>
      requireAuth(() =>
        dispatch({ type: "ENROLL_MONTHLY_CHALLENGE", payload: monthKey }),
      ),
    markChallengePuzzleSubmitted: (monthKey) =>
      requireAuth(() =>
        dispatch({
          type: "MARK_CHALLENGE_PUZZLE_SUBMITTED",
          payload: monthKey,
        }),
      ),
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
