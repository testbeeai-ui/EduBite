"use client";

import { useMemo, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { cn } from "@/lib/utils";
import { range } from "@/lib/brain-gym/utils/shuffle";

function buildMaze(size: number, wallRate: number): boolean[][] {
  // true = wall
  const m = range(size).map(() =>
    range(size).map(() => Math.random() < wallRate),
  );
  m[0]![0] = false;
  m[size - 1]![size - 1] = false;
  // carve a guaranteed path
  let r = 0;
  let c = 0;
  while (r < size - 1 || c < size - 1) {
    m[r]![c] = false;
    if (r === size - 1) c++;
    else if (c === size - 1) r++;
    else if (Math.random() < 0.5) r++;
    else c++;
  }
  m[size - 1]![size - 1] = false;
  return m;
}

export function PathFinderGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
}: GameComponentProps) {
  const size = difficulty === "easy" ? 6 : difficulty === "medium" ? 7 : 8;
  const walls = useMemo(
    () => buildMaze(size, difficulty === "hard" ? 0.28 : 0.22),
    [size, difficulty],
  );
  const [path, setPath] = useState<[number, number][]>([[0, 0]]);
  const [start] = useState(() => Date.now());

  const last = path[path.length - 1]!;
  const neighbors = (r: number, c: number) =>
    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].filter(
      ([nr, nc]) =>
        nr! >= 0 &&
        nr! < size &&
        nc! >= 0 &&
        nc! < size &&
        !walls[nr!]![nc!],
    ) as [number, number][];

  const tap = (r: number, c: number) => {
    if (walls[r]![c]) return;
    const inPath = path.findIndex(([pr, pc]) => pr === r && pc === c);
    if (inPath >= 0) {
      setPath(path.slice(0, inPath + 1));
      sfx.tap(soundEnabled);
      return;
    }
    const ok = neighbors(last[0], last[1]).some(([nr, nc]) => nr === r && nc === c);
    if (!ok) {
      sfx.wrong(soundEnabled);
      return;
    }
    sfx.tap(soundEnabled);
    const next = [...path, [r, c] as [number, number]];
    setPath(next);
    if (r === size - 1 && c === size - 1) {
      const timeMs = Date.now() - start;
      const score = Math.max(
        80,
        Math.round(
          (900 - next.length * 8 - timeMs / 50) * difficultyMultiplier(difficulty),
        ),
      );
      onScoreChange?.(score);
      sfx.win(soundEnabled);
      onComplete({ score, won: true, timeMs, difficulty });
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        Path S → E · Length {path.length} · Tap adjacent cells
      </StatusLine>
      <div
        className="grid gap-1 max-w-sm mx-auto"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {range(size).map((r) =>
          range(size).map((c) => {
            const onPath = path.some(([pr, pc]) => pr === r && pc === c);
            const isS = r === 0 && c === 0;
            const isE = r === size - 1 && c === size - 1;
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => tap(r, c)}
                className={cn(
                  "aspect-square rounded-md border text-[10px] font-mono touch-manipulation",
                  walls[r]![c]
                    ? "bg-[var(--line)] border-transparent"
                    : "border-[var(--line)] bg-[var(--surface-2)]",
                  onPath && !walls[r]![c] && "bg-purple/40 border-purple/40",
                  isS && "ring-1 ring-teal",
                  isE && "ring-1 ring-amber",
                )}
              >
                {isS ? "S" : isE ? "E" : ""}
              </button>
            );
          }),
        )}
      </div>
      <button
        type="button"
        onClick={() => setPath([[0, 0]])}
        className="mt-3 w-full py-2 rounded-full border border-[var(--line)] text-sm font-display font-bold"
      >
        Reset path
      </button>
    </GameBoard>
  );
}
