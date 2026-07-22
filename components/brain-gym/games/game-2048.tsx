"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";

type Board = number[][];
type Dir = "L" | "R" | "U" | "D";

export function targetForDifficulty(
  difficulty: GameComponentProps["difficulty"],
): number {
  if (difficulty === "easy") return 256;
  if (difficulty === "medium") return 512;
  return 2048;
}

function empty(): Board {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function spawn(b: Board): Board {
  const free: [number, number][] = [];
  b.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) free.push([r, c]);
    }),
  );
  if (!free.length) return b;
  const [r, c] = free[Math.floor(Math.random() * free.length)]!;
  const n = b.map((row) => [...row]);
  n[r]![c] = Math.random() < 0.9 ? 2 : 4;
  return n;
}

function slide(row: number[]): { row: number[]; gained: number } {
  const filtered = row.filter((x) => x);
  let gained = 0;
  const out: number[] = [];
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const v = filtered[i]! * 2;
      out.push(v);
      gained += v;
      i++;
    } else {
      out.push(filtered[i]!);
    }
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained };
}

function transpose(m: Board): Board {
  return m[0]!.map((_, c) => m.map((r) => r[c]!));
}

function move(
  b: Board,
  dir: Dir,
): { board: Board; gained: number; moved: boolean } {
  let gained = 0;
  let board = b.map((r) => [...r]);

  if (dir === "U") board = transpose(board);
  if (dir === "D") board = transpose(board).map((r) => [...r].reverse());
  if (dir === "R") board = board.map((r) => [...r].reverse());

  board = board.map((row) => {
    const { row: nr, gained: g } = slide(row);
    gained += g;
    return nr;
  });

  if (dir === "R") board = board.map((r) => r.reverse());
  if (dir === "U") board = transpose(board);
  if (dir === "D") {
    board = board.map((r) => r.reverse());
    board = transpose(board);
  }

  const moved = JSON.stringify(board) !== JSON.stringify(b);
  return { board, gained, moved };
}

function canMove(b: Board): boolean {
  for (const d of ["L", "R", "U", "D"] as const) {
    if (move(b, d).moved) return true;
  }
  return false;
}

function tileClass(v: number): string {
  if (v === 0) return "bg-slate-950/50 text-transparent border-white/[0.03]";
  if (v === 2) return "bg-slate-700 text-slate-100 border-white/10";
  if (v === 4) return "bg-slate-600 text-white border-white/10";
  if (v === 8) return "bg-orange-600/90 text-white border-orange-400/30";
  if (v === 16) return "bg-orange-500 text-white border-orange-300/30";
  if (v === 32) return "bg-amber-500 text-slate-950 border-amber-300/40";
  if (v === 64) return "bg-amber-400 text-slate-950 border-amber-200/50";
  if (v === 128) return "bg-teal-500 text-slate-950 border-teal-300/40";
  if (v === 256) return "bg-teal-400 text-slate-950 border-teal-200/50";
  if (v === 512) return "bg-cyan-400 text-slate-950 border-cyan-200/50";
  if (v === 1024) return "bg-violet-500 text-white border-violet-300/40";
  return "bg-fuchsia-500 text-white border-fuchsia-300/40 shadow-[0_0_18px_rgba(217,70,239,0.45)]";
}

export function Game2048({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
  restartKey,
}: GameComponentProps) {
  const target = targetForDifficulty(difficulty);

  const [board, setBoard] = useState<Board>(() => spawn(spawn(empty())));
  const [score, setScore] = useState(0);
  const [start, setStart] = useState(() => Date.now());
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [finished, setFinished] = useState(false);

  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const completedRef = useRef(false);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const reset = useCallback(() => {
    const next = spawn(spawn(empty()));
    setBoard(next);
    boardRef.current = next;
    setScore(0);
    scoreRef.current = 0;
    setStart(Date.now());
    setWon(false);
    setLost(false);
    setFinished(false);
    completedRef.current = false;
    onScoreChange?.(0);
  }, [onScoreChange]);

  useEffect(() => {
    reset();
  }, [difficulty, restartKey, reset]);

  const finish = useCallback(
    (didWin: boolean, finalScore: number) => {
      if (completedRef.current) return;
      completedRef.current = true;
      setFinished(true);
      onComplete({
        score: Math.round(finalScore * difficultyMultiplier(difficulty)),
        won: didWin,
        timeMs: Date.now() - start,
        difficulty,
      });
    },
    [onComplete, difficulty, start],
  );

  const apply = useCallback(
    (dir: Dir) => {
      if (paused || won || lost || finished) return;
      const { board: nb, gained, moved } = move(boardRef.current, dir);
      if (!moved) return;

      sfx.tap(soundEnabled);
      const withSpawn = spawn(nb);
      const ns = scoreRef.current + gained;
      setBoard(withSpawn);
      boardRef.current = withSpawn;
      setScore(ns);
      scoreRef.current = ns;
      onScoreChange?.(ns);

      const max = Math.max(...withSpawn.flat());
      if (max >= target) {
        setWon(true);
        sfx.win(soundEnabled);
        finish(true, ns + max);
        return;
      }

      if (!canMove(withSpawn)) {
        setLost(true);
        sfx.lose(soundEnabled);
        finish(false, ns);
      }
    },
    [paused, won, lost, finished, soundEnabled, target, onScoreChange, finish],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const map: Record<string, Dir> = {
        ArrowLeft: "L",
        ArrowRight: "R",
        ArrowUp: "U",
        ArrowDown: "D",
        a: "L",
        d: "R",
        w: "U",
        s: "D",
      };
      const dir = map[key];
      if (!dir) return;
      e.preventDefault();
      apply(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [apply]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const startPt = dragRef.current;
    dragRef.current = null;
    if (!startPt) return;
    const dx = e.clientX - startPt.x;
    const dy = e.clientY - startPt.y;
    if (Math.abs(dx) < 28 && Math.abs(dy) < 28) return;
    if (Math.abs(dx) > Math.abs(dy)) apply(dx > 0 ? "R" : "L");
    else apply(dy > 0 ? "D" : "U");
  };

  return (
    <GameBoard>
      <StatusLine>
        Score {score} · Target {target}
        {won ? " · Won!" : lost ? " · Game over" : ""}
      </StatusLine>

      <div
        className="relative mx-auto w-full max-w-[320px] rounded-2xl bg-slate-950/70 border border-white/[0.06] p-2.5 touch-manipulation select-none cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <div className="grid grid-cols-4 gap-2">
          {board.flat().map((v, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center border font-display font-black text-lg sm:text-xl transition-colors",
                tileClass(v),
              )}
            >
              {v > 0 ? v : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-[11px] text-[var(--text-dim)] font-mono">
          Swipe / drag board · arrows or WASD
        </p>
        <div className="grid grid-cols-3 gap-1.5 w-[132px]">
          <div />
          <DirBtn label="↑" onClick={() => apply("U")} disabled={paused || won || lost} />
          <div />
          <DirBtn label="←" onClick={() => apply("L")} disabled={paused || won || lost} />
          <DirBtn label="↓" onClick={() => apply("D")} disabled={paused || won || lost} />
          <DirBtn label="→" onClick={() => apply("R")} disabled={paused || won || lost} />
        </div>
      </div>
    </GameBoard>
  );
}

function DirBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="h-10 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] font-mono font-bold text-[var(--text)] hover:border-teal/40 hover:bg-teal/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
    >
      {label}
    </button>
  );
}
