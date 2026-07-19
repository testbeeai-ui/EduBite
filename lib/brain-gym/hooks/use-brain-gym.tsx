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
  isDifficultyLocked,
  loadBrainGym,
  saveBrainGym,
  setSound,
  toggleFavorite,
} from "@/lib/brain-gym/storage";
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
  const mutationSeqRef = useRef(0);

  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    mutationSeqRef.current++;
    setProgress(null);
    setActiveGameId(null);
    setIsDailyRun(false);
    setLastResult(null);

    void (async () => {
      const next = await loadBrainGym(userId);
      if (!cancelled) {
        setProgress(next);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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
      if (
        isDifficultyLocked(progress, activeGameId, result.difficulty)
      ) {
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
      const sessionId = crypto.randomUUID();
      const mutationSeq = ++mutationSeqRef.current;
      void saveBrainGym(userId, next, {
        type: "session",
        sessionId,
        gameId: activeGameId,
        result,
        isDaily: isDailyRun,
        baseProgress: progress,
      }).then((save) => {
        if (!save.ok) return;
        if (mutationSeq === mutationSeqRef.current) {
          setProgress(save.progress);
        }
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
    if (!progress) return;
    const enabled = !progress.soundEnabled;
    const next = setSound(progress, enabled);
    setProgress(next);
    const mutationSeq = ++mutationSeqRef.current;
    void saveBrainGym(userId, next, { type: "sound", enabled }).then((save) => {
      if (save.ok && mutationSeq === mutationSeqRef.current) {
        setProgress(save.progress);
      }
    });
  }, [progress, userId]);

  const toggleFav = useCallback(
    (id: GameId) => {
      withAuth(() => {
        if (!progress) return;
        const next = toggleFavorite(progress, id);
        const favorite = !!next.games[id]?.favorite;
        setProgress(next);
        const mutationSeq = ++mutationSeqRef.current;
        void saveBrainGym(userId, next, {
          type: "favorite",
          gameId: id,
          favorite,
        }).then((save) => {
          if (save.ok && mutationSeq === mutationSeqRef.current) {
            setProgress(save.progress);
          }
        });
      });
    },
    [progress, userId, withAuth],
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
