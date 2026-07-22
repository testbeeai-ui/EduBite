"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { cn } from "@/lib/utils";
import { shuffle, range } from "@/lib/brain-gym/utils/shuffle";
import { motion, AnimatePresence } from "framer-motion";

function buildAdjacency(
  size: number,
  mineSet: Set<number>,
): number[] {
  const adjacency = Array(size * size).fill(0) as number[];
  for (let i = 0; i < size * size; i++) {
    if (mineSet.has(i)) continue;
    const row = Math.floor(i / size);
    const column = i % size;
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {
        if (!rowOffset && !columnOffset) continue;
        const nextRow = row + rowOffset;
        const nextColumn = column + columnOffset;
        if (
          nextRow >= 0 &&
          nextRow < size &&
          nextColumn >= 0 &&
          nextColumn < size &&
          mineSet.has(nextRow * size + nextColumn)
        ) {
          adjacency[i]!++;
        }
      }
    }
  }
  return adjacency;
}

export function MinesweeperGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === "hard" ? 9 : 8;
  const mines = difficulty === "easy" ? 8 : difficulty === "medium" ? 12 : 16;
  const [mineSet, setMineSet] = useState(
    () => new Set(shuffle(range(size * size)).slice(0, mines)),
  );
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [dead, setDead] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const completedRef = useRef(false);
  const activeTimeMsRef = useRef(0);

  // Screen shake on detonation
  useEffect(() => {
    if (dead) {
      setShouldShake(true);
      const t = setTimeout(() => setShouldShake(false), 450);
      return () => clearTimeout(t);
    }
  }, [dead]);

  const adj = useMemo(() => buildAdjacency(size, mineSet), [mineSet, size]);

  useEffect(() => {
    if (paused || completedRef.current) return;
    const timer = window.setInterval(() => {
      activeTimeMsRef.current += 100;
    }, 100);
    return () => window.clearInterval(timer);
  }, [paused]);

  const flood = (
    startIdx: number,
    rev: Set<number>,
    activeMines: Set<number>,
    activeAdjacency: number[],
  ) => {
    const stack = [startIdx];
    while (stack.length) {
      const i = stack.pop()!;
      if (rev.has(i) || activeMines.has(i)) continue;
      rev.add(i);
      if (activeAdjacency[i] !== 0) continue;
      const r = Math.floor(i / size);
      const c = i % size;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) stack.push(nr * size + nc);
        }
    }
  };

  const reveal = (i: number) => {
    if (
      paused ||
      completedRef.current ||
      dead ||
      revealed.has(i) ||
      flagged.has(i)
    ) {
      return;
    }
    let activeMines = mineSet;
    let activeAdjacency = adj;
    if (revealed.size === 0 && activeMines.has(i)) {
      const relocated = new Set(activeMines);
      relocated.delete(i);
      const replacement = range(size * size).find(
        (cell) => cell !== i && !relocated.has(cell),
      );
      if (replacement !== undefined) relocated.add(replacement);
      activeMines = relocated;
      activeAdjacency = buildAdjacency(size, relocated);
      setMineSet(relocated);
    }
    if (activeMines.has(i)) {
      completedRef.current = true;
      sfx.lose(soundEnabled);
      setDead(true);
      setRevealed(new Set(range(size * size)));
      onComplete({
        score: Math.round(revealed.size * 5 * difficultyMultiplier(difficulty)),
        won: false,
        timeMs: activeTimeMsRef.current,
        difficulty,
      });
      return;
    }
    sfx.tap(soundEnabled);
    const next = new Set(revealed);
    flood(i, next, activeMines, activeAdjacency);
    setRevealed(next);
    const safe = size * size - mines;
    if (next.size >= safe) {
      completedRef.current = true;
      const timeMs = activeTimeMsRef.current;
      const score = Math.max(
        100,
        Math.min(
          1_400,
          Math.round(
            (difficulty === "easy"
              ? 700
              : difficulty === "medium"
                ? 900
                : 1_100) +
              300 *
                Math.max(
                  0,
                  1 -
                    timeMs /
                      (difficulty === "easy"
                        ? 120_000
                        : difficulty === "medium"
                          ? 150_000
                          : 180_000),
                ),
          ),
        ),
      );
      onScoreChange?.(score);
      sfx.win(soundEnabled);
      onComplete({ score, won: true, timeMs, difficulty });
    }
  };

  const flag = (e: React.MouseEvent | React.TouchEvent, i: number) => {
    e.preventDefault();
    if (paused || completedRef.current || dead || revealed.has(i)) return;
    sfx.tap(soundEnabled);
    setFlagged((f) => {
      const n = new Set(f);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  // Text color based on count
  const getNumberColor = (count: number): string => {
    switch (count) {
      case 1: return "text-[#60A5FA] drop-shadow-[0_0_3px_rgba(96,165,250,0.4)]"; // blue
      case 2: return "text-[#34D399] drop-shadow-[0_0_3px_rgba(52,211,153,0.4)]"; // green
      case 3: return "text-[#F87171] drop-shadow-[0_0_3px_rgba(248,113,113,0.4)]"; // red
      case 4: return "text-[#C084FC] drop-shadow-[0_0_3px_rgba(192,132,252,0.4)]"; // purple
      case 5: return "text-[#FBBF24] drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]"; // amber
      case 6: return "text-[#22D3EE] drop-shadow-[0_0_3px_rgba(34,211,238,0.4)]"; // cyan
      case 7: return "text-[#F472B6] drop-shadow-[0_0_3px_rgba(244,114,182,0.4)]"; // pink
      default: return "text-[#94A3B8]"; // slate
    }
  };

  return (
    <motion.div
      animate={shouldShake ? {
        x: [0, -10, 10, -8, 8, -5, 5, 0],
        y: [0, 5, -5, 4, -4, 2, -2, 0],
      } : {}}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-[var(--line)] bg-[rgba(11,13,18,0.6)] p-5 sm:p-7 max-w-md w-full mx-auto shadow-[0_24px_50px_rgba(0,0,0,0.4)] relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-teal/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue/5 rounded-full blur-2xl pointer-events-none" />

      {/* Mini HUD bar */}
      <div className="flex items-center justify-between gap-3 mb-6 px-1">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--text-dim)] shadow-sm">
          <span>💣</span>
          <span className="text-white font-bold">{mines}</span>
        </div>
        
        <div className="text-xs font-display font-bold text-[var(--text-dim)] tracking-wide uppercase select-none">
          Long-press to flag
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono text-[var(--text-dim)] shadow-sm">
          <span>🚩</span>
          <span className="text-white font-bold">{flagged.size}</span>
        </div>
      </div>

      {/* Grid container */}
      <div
        className="grid gap-2 sm:gap-2.5 touch-manipulation"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {range(size * size).map((i) => {
          const rev = revealed.has(i);
          const fl = flagged.has(i);
          const isMine = mineSet.has(i);

          return (
            <button
              key={i}
              type="button"
              onClick={() => reveal(i)}
              onContextMenu={(e) => flag(e, i)}
              onTouchStart={(e) => {
                const t = window.setTimeout(() => flag(e, i), 450);
                const clear = () => window.clearTimeout(t);
                e.currentTarget.addEventListener("touchend", clear, { once: true });
                e.currentTarget.addEventListener("touchmove", clear, { once: true });
              }}
              className={cn(
                "aspect-square text-lg sm:text-xl font-display font-black rounded-xl border transition-all duration-150 relative overflow-hidden select-none outline-none cursor-pointer flex items-center justify-center",
                rev
                  ? isMine
                    ? "border-red-500 bg-gradient-to-b from-red-500/40 to-red-950/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                    : "border-[rgba(39,46,62,0.4)] bg-[#0a0c10] shadow-[inset_0_2px_5px_rgba(0,0,0,0.7)]"
                  : "bg-gradient-to-b from-[#2a3142] to-[#1e2433] border-t border-l border-white/10 border-r border-b border-[#0f131d] shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:-translate-y-[1.5px] hover:brightness-110 active:scale-95 active:translate-y-0"
              )}
            >
              <AnimatePresence mode="wait">
                {rev ? (
                  isMine ? (
                    <motion.span
                      key="mine"
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: [0, 1.3, 1], rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="text-xl"
                    >
                      💣
                    </motion.span>
                  ) : (
                    adj[i] > 0 && (
                      <motion.span
                        key="number"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn("font-bold font-display text-lg sm:text-xl", getNumberColor(adj[i]))}
                      >
                        {adj[i]}
                      </motion.span>
                    )
                  )
                ) : (
                  fl && (
                    <motion.span
                      key="flag"
                      initial={{ scale: 0, y: -2 }}
                      animate={{ scale: [0, 1.4, 1], y: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 12 }}
                      className="text-base select-none"
                    >
                      🚩
                    </motion.span>
                  )
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
