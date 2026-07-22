"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";
import { usePausableScheduler } from "./_pausable-scheduler";

const MAX_FALSE_STARTS_FOR_WIN = 2;

export function isReactionRunWon(falseStarts: number, score: number): boolean {
  return falseStarts <= MAX_FALSE_STARTS_FOR_WIN && score >= 60;
}

export function reactionScoreForMs(
  reactionMs: number,
  difficulty: GameComponentProps["difficulty"],
): number {
  void difficulty;
  const humanAdjustedMs = Math.max(120, Math.min(1_000, reactionMs));
  const score = 100 - Math.max(0, humanAdjustedMs - 180) * 0.25;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function ReactionTimeGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const rounds = 5;
  const [phase, setPhase] = useState<"wait" | "ready" | "go" | "early" | "done">("wait");
  const [times, setTimes] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const goAt = useRef(0);
  const activeReactionMsRef = useRef(0);
  const completedRef = useRef(false);
  const inputLockedRef = useRef(false);
  const falseStartsRef = useRef(0);
  const armCancelRef = useRef<(() => void) | null>(null);
  const { schedule } = usePausableScheduler(paused);
  const [start] = useState(() => Date.now());

  const arm = () => {
    if (completedRef.current) return;
    inputLockedRef.current = false;
    setPhase("ready");
    const delay =
      (difficulty === "hard" ? 800 : 1200) + Math.random() * (difficulty === "easy" ? 2500 : 1800);
    armCancelRef.current = schedule(() => {
      if (completedRef.current) return;
      goAt.current = performance.now();
      activeReactionMsRef.current = 1;
      setPhase("go");
      sfx.tick(soundEnabled);
    }, delay);
  };

  useEffect(() => {
    arm();
    return () => armCancelRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "go" || paused || completedRef.current) return;
    let last = performance.now();
    const interval = window.setInterval(() => {
      const now = performance.now();
      activeReactionMsRef.current += now - last;
      last = now;
    }, 10);
    return () => window.clearInterval(interval);
  }, [paused, phase]);

  const tap = () => {
    if (paused || completedRef.current || inputLockedRef.current) return;
    if (phase === "ready") {
      inputLockedRef.current = true;
      armCancelRef.current?.();
      falseStartsRef.current += 1;
      sfx.wrong(soundEnabled);
      if (falseStartsRef.current > MAX_FALSE_STARTS_FOR_WIN) {
        completedRef.current = true;
        onComplete({
          score: 0,
          won: false,
          timeMs: Date.now() - start,
          difficulty,
          extra: { falseStarts: falseStartsRef.current },
        });
        setPhase("done");
        return;
      }
      setPhase("early");
      schedule(arm, 800);
      return;
    }
    if (phase !== "go") return;
    inputLockedRef.current = true;
    const ms = Math.max(
      1,
      Math.round(activeReactionMsRef.current || performance.now() - goAt.current),
    );
    sfx.correct(soundEnabled);
    const next = [...times, ms];
    setTimes(next);
    const r = round + 1;
    setRound(r);
    const avg = next.reduce((a, b) => a + b, 0) / next.length;
    const reactionScores = next.map((reactionMs) =>
      reactionScoreForMs(reactionMs, difficulty),
    );
    const averageReactionScore =
      reactionScores.reduce((sum, value) => sum + value, 0) /
      reactionScores.length;
    const score = Math.max(
      1,
      Math.round(
        averageReactionScore - falseStartsRef.current * 5,
      ),
    );
    onScoreChange?.(score);
    if (r >= rounds) {
      completedRef.current = true;
      onComplete({
        score,
        won: isReactionRunWon(falseStartsRef.current, score),
        timeMs: Date.now() - start,
        difficulty,
        extra: {
          avgMs: Math.round(avg),
          falseStarts: falseStartsRef.current,
        },
      });
      setPhase("done");
    } else {
      setPhase("wait");
      schedule(arm, 600);
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        Round {Math.min(round + 1, rounds)}/{rounds}
        {times.length > 0 && ` · last ${times[times.length - 1]}ms`}
      </StatusLine>
      <button
        type="button"
        onClick={tap}
        className={cn(
          "w-full min-h-[220px] sm:min-h-[280px] rounded-2xl font-display font-extrabold text-xl sm:text-2xl transition-colors touch-manipulation select-none",
          phase === "ready" && "bg-red-500/80 text-white",
          phase === "go" && "bg-emerald-500 text-[#04140b]",
          phase === "early" && "bg-amber/40",
          (phase === "wait" || phase === "done") && "bg-[var(--surface-2)]",
        )}
      >
        {phase === "ready" && "Wait for green…"}
        {phase === "go" && "TAP!"}
        {phase === "early" && "Too soon!"}
        {phase === "wait" && "Get ready…"}
        {phase === "done" && "Done"}
      </button>
      {times.length > 0 && (
        <p className="text-center text-xs font-mono text-[var(--text-dim)] mt-3">
          Times: {times.join(" · ")} ms
        </p>
      )}
    </GameBoard>
  );
}
