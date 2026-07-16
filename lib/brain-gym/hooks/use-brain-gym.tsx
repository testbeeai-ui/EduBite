"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applySessionResult,
  loadBrainGym,
  saveBrainGym,
  setSound,
  toggleFavorite,
} from "@/lib/brain-gym/storage";
import { createSaveQueue } from "@/lib/persistence/save-queue";
import type {
  BrainGymProgress,
  Difficulty,
  GameId,
  GameSessionResult,
} from "@/lib/brain-gym/types";
import { useAuth } from "@/lib/auth/auth-provider";
import { useGame } from "@/lib/store/game-provider";

interface BrainGymContextValue {
  progress: BrainGymProgress;
  hydrated: boolean;
  activeGameId: GameId | null;
  isDailyRun: boolean;
  difficulty: Difficulty;
  hubTab: "hub" | "progress" | "leaderboard";
  setHubTab: (t: "hub" | "progress" | "leaderboard") => void;
  setDifficulty: (d: Difficulty) => void;
  openGame: (id: GameId, daily?: boolean) => void;
  closeGame: () => void;
  completeSession: (result: GameSessionResult) => {
    rdmGain: number;
    newBadges: string[];
  };
  toggleSound: () => void;
  toggleFav: (id: GameId) => void;
  lastResult: {
    result: GameSessionResult;
    rdmGain: number;
    newBadges: string[];
  } | null;
  clearLastResult: () => void;
}

const BrainGymContext = createContext<BrainGymContextValue | null>(null);

export function BrainGymProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { tickGyan, awardRDM, syncRdm, withAuth } = useGame();
  const [progress, setProgress] = useState<BrainGymProgress | null>(null);
  const [activeGameId, setActiveGameId] = useState<GameId | null>(null);
  const [isDailyRun, setIsDailyRun] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [hubTab, setHubTab] = useState<"hub" | "progress" | "leaderboard">(
    "hub",
  );
  const [lastResult, setLastResult] =
    useState<BrainGymContextValue["lastResult"]>(null);
  const userIdRef = useRef<string | null>(null);
  const saveQueueRef = useRef(
    createSaveQueue<BrainGymProgress>(async (next) => {
      const id = userIdRef.current;
      if (!id) return { ok: false, error: "Not signed in" };
      const result = await saveBrainGym(id, next);
      return result.ok ? { ok: true } : result;
    }),
  );

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    userIdRef.current = userId;
    saveQueueRef.current.invalidate();
    setProgress(null);
    setActiveGameId(null);
    setIsDailyRun(false);
    setLastResult(null);

    void (async () => {
      const next = await loadBrainGym(userId);
      if (!cancelled) {
        saveQueueRef.current.setBaseline(next);
        setProgress(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!progress || !userId) return;
    saveQueueRef.current.enqueue(progress);
  }, [progress, userId]);

  useEffect(() => {
    if (!activeGameId) return;
    const id = window.setInterval(() => tickGyan(1000), 1000);
    return () => window.clearInterval(id);
  }, [activeGameId, tickGyan]);

  const openGame = useCallback(
    (id: GameId, daily = false) => {
      withAuth(() => {
        setActiveGameId(id);
        setIsDailyRun(daily);
        setLastResult(null);
      });
    },
    [withAuth],
  );

  const closeGame = useCallback(() => {
    setActiveGameId(null);
    setIsDailyRun(false);
  }, []);

  const completeSession = useCallback(
    (result: GameSessionResult) => {
      if (!progress || !activeGameId) {
        return { rdmGain: 0, newBadges: [] as string[] };
      }
      const { progress: next, newBadges, rdmGain } = applySessionResult(
        progress,
        activeGameId,
        result,
        isDailyRun,
      );
      setProgress(next);
      setLastResult({ result, rdmGain, newBadges });
      const claimId = `${activeGameId}:${Date.now()}:${Math.round(result.score)}:${Math.round(result.timeMs)}`;
      void saveBrainGym(userId, next, {
        claimId,
        rdmDelta: rdmGain,
      }).then((save) => {
        if (!save.ok) return;
        saveQueueRef.current.setBaseline(next);
        if (save.gameRdm !== null) {
          syncRdm(save.gameRdm);
        } else if (rdmGain > 0) {
          awardRDM(rdmGain);
        }
      });
      return { rdmGain, newBadges };
    },
    [progress, activeGameId, isDailyRun, userId, awardRDM, syncRdm],
  );

  const toggleSound = useCallback(() => {
    setProgress((p) => (p ? setSound(p, !p.soundEnabled) : p));
  }, []);

  const toggleFav = useCallback(
    (id: GameId) => {
      withAuth(() => {
        setProgress((p) => (p ? toggleFavorite(p, id) : p));
      });
    },
    [withAuth],
  );

  const clearLastResult = useCallback(() => setLastResult(null), []);

  const value = useMemo<BrainGymContextValue | null>(() => {
    if (!progress) return null;
    return {
      progress,
      hydrated: true,
      activeGameId,
      isDailyRun,
      difficulty,
      hubTab,
      setHubTab,
      setDifficulty,
      openGame,
      closeGame,
      completeSession,
      toggleSound,
      toggleFav,
      lastResult,
      clearLastResult,
    };
  }, [
    progress,
    activeGameId,
    isDailyRun,
    difficulty,
    hubTab,
    openGame,
    closeGame,
    completeSession,
    toggleSound,
    toggleFav,
    lastResult,
    clearLastResult,
  ]);

  if (!value) {
    return (
      <div className="py-16 text-center text-[var(--text-dim)] text-sm">
        Loading Brain Gym…
      </div>
    );
  }

  return (
    <BrainGymContext.Provider value={value}>{children}</BrainGymContext.Provider>
  );
}

export function useBrainGym() {
  const ctx = useContext(BrainGymContext);
  if (!ctx) throw new Error("useBrainGym must be used within BrainGymProvider");
  return ctx;
}
