"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";

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
  const timer = useRef<number | null>(null);
  const [start] = useState(() => Date.now());

  const arm = () => {
    setPhase("ready");
    const delay =
      (difficulty === "hard" ? 800 : 1200) + Math.random() * (difficulty === "easy" ? 2500 : 1800);
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
      sfx.tick(soundEnabled);
    }, delay);
  };

  useEffect(() => {
    arm();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    if (paused) return;
    if (phase === "ready") {
      if (timer.current) clearTimeout(timer.current);
      sfx.wrong(soundEnabled);
      setPhase("early");
      setTimeout(() => arm(), 800);
      return;
    }
    if (phase !== "go") return;
    const ms = Math.round(performance.now() - goAt.current);
    sfx.correct(soundEnabled);
    const next = [...times, ms];
    setTimes(next);
    const r = round + 1;
    setRound(r);
    const avg = next.reduce((a, b) => a + b, 0) / next.length;
    const score = Math.max(
      50,
      Math.round((600 - avg) * difficultyMultiplier(difficulty) * (next.length / rounds)),
    );
    onScoreChange?.(score);
    if (r >= rounds) {
      onComplete({
        score: Math.round(score * (next.length / rounds) + (600 - avg)),
        won: avg < 450,
        timeMs: Date.now() - start,
        difficulty,
        extra: { avgMs: Math.round(avg) },
      });
      setPhase("done");
    } else {
      setPhase("wait");
      setTimeout(() => arm(), 600);
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
