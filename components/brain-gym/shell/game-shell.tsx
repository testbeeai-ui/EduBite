"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_MAP } from "@/data/brain-gym/registry";
import { useBrainGym } from "@/lib/brain-gym/hooks/use-brain-gym";
import type {
  Difficulty,
  GameComponentProps,
  GameSessionResult,
} from "@/lib/brain-gym/types";
import { formatMsAsClock, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sfx } from "@/lib/brain-gym/utils/sound";
import {
  isDifficultyLocked,
} from "@/lib/brain-gym/storage";

export function GameShell({
  Game,
}: {
  Game: React.ComponentType<GameComponentProps>;
}) {
  const {
    activeGameId,
    closeGame,
    completeSession,
    difficulty,
    setDifficulty,
    progress,
    toggleSound,
    lastResult,
    clearLastResult,
    isDailyRun,
  } = useBrainGym();

  const meta = activeGameId ? GAME_MAP[activeGameId] : null;
  const [phase, setPhase] = useState<"intro" | "play" | "result">("intro");
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(meta?.maxLives ?? 0);
  const [restartKey, setRestartKey] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const completionHandledRef = useRef(false);
  const elapsedRef = useRef(0);
  const activeRunKeyRef = useRef(0);
  const shellActiveRef = useRef(true);

  useEffect(() => {
    setPhase("intro");
    setPaused(false);
    setScore(0);
    setLives(meta?.maxLives ?? 0);
    setRestartKey(0);
    setElapsed(0);
    elapsedRef.current = 0;
    completionHandledRef.current = false;
    activeRunKeyRef.current = 0;
    clearLastResult();
  }, [activeGameId, meta?.maxLives, clearLastResult]);

  useEffect(() => {
    shellActiveRef.current = true;
    return () => {
      shellActiveRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== "play" || paused) return;
    const id = window.setInterval(
      () =>
        setElapsed((value) => {
          const next = value + 1000;
          elapsedRef.current = next;
          return next;
        }),
      1000,
    );
    return () => window.clearInterval(id);
  }, [phase, paused]);

  useEffect(() => {
    if (
      !activeGameId ||
      !isDifficultyLocked(progress, activeGameId, difficulty)
    ) {
      return;
    }
    const fallback = (["easy", "medium", "hard"] as Difficulty[]).find(
      (candidate) =>
        !isDifficultyLocked(progress, activeGameId, candidate),
    );
    if (fallback && fallback !== difficulty) setDifficulty(fallback);
  }, [activeGameId, difficulty, progress, setDifficulty]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const onComplete = useCallback(
    (result: GameSessionResult, runKey: number) => {
      if (
        !shellActiveRef.current ||
        runKey !== activeRunKeyRef.current ||
        completionHandledRef.current
      ) {
        return;
      }
      completionHandledRef.current = true;
      const safeResult = {
        ...result,
        score: Number.isFinite(result.score)
          ? Math.max(0, Math.round(result.score))
          : 0,
      };
      if (safeResult.won) sfx.win(progress.soundEnabled);
      else sfx.lose(progress.soundEnabled);
      completeSession({
        ...safeResult,
        difficulty: safeResult.difficulty || difficulty,
        timeMs: elapsedRef.current,
      });
      setPhase("result");
    },
    [completeSession, difficulty, progress.soundEnabled],
  );

  const gameOnComplete = useCallback(
    (result: GameSessionResult) => onComplete(result, restartKey),
    [onComplete, restartKey],
  );

  const requestClose = useCallback(() => {
    if (phase === "play") {
      const leave = window.confirm(
        "Leave this game? Your current run will end.",
      );
      if (!leave) return;
    }
    closeGame();
  }, [phase, closeGame]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  if (!meta || !activeGameId) return null;
  const difficultyLocked = isDifficultyLocked(
    progress,
    activeGameId,
    difficulty,
  );
  const startRun = () => {
    if (difficultyLocked) return;
    completionHandledRef.current = false;
    setElapsed(0);
    elapsedRef.current = 0;
    setScore(0);
    setLives(meta.maxLives ?? 0);
    setPaused(false);
    const nextRunKey = activeRunKeyRef.current + 1;
    activeRunKeyRef.current = nextRunKey;
    setRestartKey(nextRunKey);
    clearLastResult();
    setPhase("play");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="game-popup-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-[100] flex justify-center bg-[rgba(5,7,11,0.78)] backdrop-blur-[4px]",
          "items-end sm:items-center p-0 sm:p-5",
        )}
        onClick={requestClose}
        role="presentation"
      >
        <motion.div
          key={activeGameId}
          role="dialog"
          aria-modal="true"
          aria-label={meta.name}
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full flex flex-col overflow-hidden",
            "border border-[var(--line)] bg-[var(--surface)]",
            "shadow-[0_28px_80px_rgba(0,0,0,0.55)]",
            "sm:max-w-[720px] lg:max-w-[860px] max-h-[92vh] sm:max-h-[88vh] rounded-t-[22px] sm:rounded-[22px]",
          )}
        >
          <header className="shrink-0 border-b border-[var(--line)] bg-[var(--surface-2)]/40 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Close Button */}
              <button
                type="button"
                onClick={requestClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(255,255,255,0.12)] bg-[var(--surface-2)] text-[var(--text)] hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all duration-150 cursor-pointer"
                aria-label="Close game"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-1.5 leading-none">
                  <span>{meta.emoji}</span>
                  <span>{meta.name}</span>
                  {isDailyRun && (
                    <span className="text-[10px] uppercase tracking-wide text-amber font-mono bg-amber/10 border border-amber/20 px-1.5 py-0.5 rounded">
                      Daily
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[var(--text-dim)] font-mono mt-1 lowercase">
                  {meta.category} · {difficulty}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-2">
                {/* Score badge */}
                <div className="flex h-9 items-center justify-center px-3.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] font-mono font-bold text-sm text-white">
                  {score}
                </div>

                {/* Hearts / Lives Badge */}
                {meta.hasLives && (
                  <div className="flex h-9 items-center justify-center px-3.5 rounded-full bg-[rgba(244,114,182,0.06)] border border-pink-500/20 text-pink-400 font-mono text-sm tracking-widest">
                    {"💖".repeat(Math.max(0, lives))}
                    {lives <= 0 ? "💀" : ""}
                  </div>
                )}

                {/* Timer Badge */}
                {meta.hasTimer && (
                  <div className="flex h-9 items-center justify-center px-3.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] font-mono text-sm text-[var(--text-dim)]">
                    {formatTime(Math.floor(elapsed / 1000))}
                  </div>
                )}

                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface)] transition-all cursor-pointer"
                  aria-label="Toggle sound"
                >
                  {progress.soundEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>

                {/* Pause / Play Toggle */}
                {phase === "play" && (
                  <button
                    type="button"
                    onClick={() => setPaused((p) => !p)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface)] transition-all cursor-pointer"
                    aria-label={paused ? "Resume" : "Pause"}
                  >
                    {paused ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Restart Button */}
                <button
                  type="button"
                  onClick={startRun}
                  disabled={difficultyLocked}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] text-[var(--text-dim)] hover:text-white hover:bg-[var(--surface)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            <div className="px-3 sm:px-5 py-4 sm:py-5 pb-8">
              {phase === "intro" && (
                <div className="rounded-[22px] border border-[var(--line)] bg-[rgba(22,26,35,0.4)] p-6 sm:p-8">
                  <div className="text-5xl mb-4 select-none">{meta.emoji}</div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl mb-3 text-white">
                    {meta.name}
                  </h2>
                  <p className="text-[13.5px] leading-relaxed text-[var(--text-dim)] mb-6 max-w-xl">
                    {meta.instructions}
                  </p>
                  
                  {/* Difficulty selector */}
                  <div className="flex items-center gap-2.5 mb-7">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => {
                      const locked = isDifficultyLocked(
                        progress,
                        activeGameId,
                        d,
                      );
                      return (
                        <span key={d} className="group relative">
                          <button
                            type="button"
                            disabled={locked}
                            aria-label={
                              locked
                                ? `${d} difficulty mastered`
                                : `${d} difficulty`
                            }
                            onClick={() => {
                              if (!locked) setDifficulty(d);
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full text-xs font-display font-semibold border capitalize transition-all duration-150 cursor-pointer select-none disabled:cursor-not-allowed disabled:opacity-55",
                              locked
                                ? "border-amber/30 bg-amber/10 text-amber"
                                : difficulty === d
                                  ? "border-[#2DD4BF] bg-[rgba(45,212,191,0.18)] text-white shadow-[0_0_12px_rgba(45,212,191,0.15)] font-bold"
                                  : "border-[var(--line)] bg-[rgba(29,34,48,0.4)] text-[var(--text-dim)] hover:text-white hover:border-teal/30",
                            )}
                          >
                            {d}
                          </button>
                          {locked && (
                            <span
                              role="tooltip"
                              className={cn(
                                "pointer-events-none absolute bottom-full z-30 mb-2 hidden w-64 max-w-[calc(100vw-3rem)] rounded-xl border border-amber/30 bg-[#181d29] px-4 py-3 text-left text-xs leading-relaxed normal-case text-slate-200 shadow-[0_12px_32px_rgba(0,0,0,0.55)] group-hover:block",
                                d === "easy"
                                  ? "left-0"
                                  : d === "hard"
                                    ? "right-0"
                                    : "left-1/2 -translate-x-1/2",
                              )}
                            >
                              <span className="mb-1 block font-display font-bold text-amber">
                                {d[0]?.toUpperCase()}
                                {d.slice(1)} mastered
                              </span>
                              You&apos;re excellent at this level. Try another
                              difficulty.
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>

                  {/* Start Button */}
                  <button
                    type="button"
                    onClick={startRun}
                    disabled={difficultyLocked}
                    className="w-full py-[14px] rounded-full bg-gradient-to-r from-[var(--teal)] to-[var(--blue)] text-[#04141c] hover:brightness-[1.08] hover:-translate-y-[1px] shadow-[0_8px_24px_rgba(45,212,191,0.2)] transition-all font-display font-bold text-base cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start playing
                  </button>
                </div>
              )}

              {phase === "play" && (
                <div className="relative">
                  {paused && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
                      <div className="text-center space-y-3">
                        <p className="font-display font-bold text-xl">Paused</p>
                        <Button onClick={() => setPaused(false)}>Resume</Button>
                      </div>
                    </div>
                  )}
                  <Game
                    key={restartKey}
                    difficulty={difficulty}
                    soundEnabled={progress.soundEnabled}
                    onComplete={gameOnComplete}
                    onScoreChange={setScore}
                    onLivesChange={setLives}
                    paused={paused}
                    restartKey={restartKey}
                  />
                </div>
              )}

              {phase === "result" && lastResult && (
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--bg)]/40 p-6 sm:p-8 text-center space-y-4"
                >
                  <p className="text-5xl">
                    {lastResult.result.won ? "🏆" : "💪"}
                  </p>
                  <h3 className="font-display font-extrabold text-2xl">
                    {lastResult.result.won ? "Nice work!" : "Session over"}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                    <Stat
                      label="Score"
                      value={String(lastResult.result.score)}
                    />
                    <Stat
                      label="Time"
                      value={formatMsAsClock(lastResult.result.timeMs)}
                    />
                    <Stat label="+RDM" value={String(lastResult.rdmGain)} />
                  </div>
                  {lastResult.newBadges.length > 0 && (
                    <p className="text-sm text-amber">
                      New badges: {lastResult.newBadges.join(", ")}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                    <Button
                      onClick={
                        difficultyLocked ? () => setPhase("intro") : startRun
                      }
                    >
                      {difficultyLocked ? "Choose another level" : "Play again"}
                    </Button>
                    <Button variant="ghost" onClick={closeGame}>
                      Close
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] py-3">
      <div className="font-mono font-bold text-lg">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
        {label}
      </div>
    </div>
  );
}
