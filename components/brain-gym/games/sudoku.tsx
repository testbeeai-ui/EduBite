"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/brain-gym/utils/shuffle";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eraser,
  Check,
  Heart,
  Sparkles,
  Undo2,
  Lightbulb,
  Pencil,
  Trophy,
  Star,
  Timer,
  AlertCircle
} from "lucide-react";
import { usePausableScheduler } from "./_pausable-scheduler";

/** Helper to format milliseconds to mm:ss */
function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Mini 4×4 Sudoku (digits 1–4). */
function generatePuzzle(blanks: number): { puzzle: number[]; solution: number[] } {
  // Base valid 4x4
  let rows = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];

  // 1. Shuffle row band 1 (rows 0 and 1)
  if (Math.random() < 0.5) {
    const temp = rows[0]!;
    rows[0] = rows[1]!;
    rows[1] = temp;
  }
  // 2. Shuffle row band 2 (rows 2 and 3)
  if (Math.random() < 0.5) {
    const temp = rows[2]!;
    rows[2] = rows[3]!;
    rows[3] = temp;
  }

  // Transpose helper
  const transpose = (grid: number[][]): number[][] => {
    return [0, 1, 2, 3].map(colIdx => grid.map(row => row[colIdx]!));
  };

  // 3. Shuffle column band 1 (columns 0 and 1)
  rows = transpose(rows);
  if (Math.random() < 0.5) {
    const temp = rows[0]!;
    rows[0] = rows[1]!;
    rows[1] = temp;
  }
  // 4. Shuffle column band 2 (columns 2 and 3)
  if (Math.random() < 0.5) {
    const temp = rows[2]!;
    rows[2] = rows[3]!;
    rows[3] = temp;
  }
  rows = transpose(rows);

  // 5. Transpose grid with 50% chance
  if (Math.random() < 0.5) {
    rows = transpose(rows);
  }

  // 6. Randomly map numbers 1, 2, 3, 4 to a shuffled permutation of 1, 2, 3, 4
  const numMapping = shuffle([1, 2, 3, 4]);
  const flatSolution = rows.flat().map(v => numMapping[v - 1]!);

  const puzzle = [...flatSolution];
  const idxs = shuffle([...Array(16).keys()]).slice(0, blanks);
  for (const i of idxs) puzzle[i] = 0;
  return { puzzle, solution: flatSolution };
}

export function SudokuGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const blanks = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 10;

  // Generate puzzle parameters
  const { puzzle: init, solution } = useMemo(
    () => generatePuzzle(blanks),
    [blanks],
  );

  // States
  const [grid, setGrid] = useState<number[]>(init);
  const [fixed, setFixed] = useState<boolean[]>(() => init.map((v) => v !== 0));
  const [sel, setSel] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [errorIndices, setErrorIndices] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  
  // Game Modes & Helpers
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<number, number[]>>({});
  const [history, setHistory] = useState<number[][]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintActiveCell, setHintActiveCell] = useState<number | null>(null);

  // Status & Completion overlays
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const maxMistakes = 3;
  const lives = Math.max(0, maxMistakes - mistakes);

  // Sync state if puzzle definition changes
  useEffect(() => {
    setGrid(init);
    setFixed(init.map((v) => v !== 0));
    setSel(null);
    setElapsedTime(0);
    setMistakes(0);
    setErrorIndices([]);
    setNotes({});
    setHistory([]);
    setHintsUsed(0);
    setWon(false);
    setLost(false);
    setFinalScore(0);
    setShowStatsModal(false);
    setParticles([]);
    completedRef.current = false;
  }, [init]);

  // Live Timer Effect
  useEffect(() => {
    if (won || lost || paused) return;
    const timer = setInterval(() => {
      setElapsedTime((elapsed) => elapsed + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, [won, lost, paused]);

  // Ambient background dust particle generator
  const dustParticles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }));
  }, []);

  // Grid editing action
  const place = useCallback((n: number) => {
    if (paused || sel == null || fixed[sel] || won || lost) return;
    setWarningMsg(null);

    // If notes mode is toggled and grid cell is empty, adjust notes
    if (notesMode && grid[sel] === 0) {
      if (n === 0) {
        setNotes((prev) => ({ ...prev, [sel]: [] }));
        sfx.tap(soundEnabled);
        return;
      }
      setNotes((prev) => {
        const currentNotes = prev[sel] || [];
        const nextNotes = currentNotes.includes(n)
          ? currentNotes.filter((x) => x !== n)
          : [...currentNotes, n].sort();
        return { ...prev, [sel]: nextNotes };
      });
      sfx.tap(soundEnabled);
      return;
    }

    // Save previous grid state to undo history
    setHistory((prev) => [...prev, [...grid]]);

    const next = [...grid];
    next[sel] = n;
    setGrid(next);
    sfx.tap(soundEnabled);

    // Clear notes for this cell since it now has a direct value
    if (n !== 0) {
      setNotes((prev) => ({ ...prev, [sel]: [] }));
    }

    // Dismiss active errors for the edited cell
    if (errorIndices.includes(sel)) {
      setErrorIndices((prev) => prev.filter((idx) => idx !== sel));
    }
  }, [paused, sel, fixed, grid, notesMode, won, lost, errorIndices, soundEnabled]);

  // Undo last action
  const undo = useCallback(() => {
    if (paused || history.length === 0 || won || lost) return;
    const previousGrid = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setGrid(previousGrid);
    sfx.tap(soundEnabled);
    setErrorIndices([]);
    setWarningMsg(null);
  }, [history, lost, paused, soundEnabled, won]);

  // Give a hint (correctly fill one empty cell)
  const getHint = useCallback(() => {
    if (paused || won || lost || hintsUsed >= 2) return;

    // Find indices of empty cells or incorrect user entries
    const candidates: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (!fixed[i] && (grid[i] === 0 || grid[i] !== solution[i])) {
        candidates.push(i);
      }
    }

    if (candidates.length === 0) {
      setWarningMsg("No hints needed!");
      return;
    }

    // Pick first candidate cell
    const targetIdx = candidates[0];
    
    // Save to history
    setHistory((prev) => [...prev, [...grid]]);

    const next = [...grid];
    next[targetIdx] = solution[targetIdx];
    setGrid(next);
    setHintsUsed((h) => h + 1);
    setHintActiveCell(targetIdx);
    sfx.correct(soundEnabled);

    // Highlight the hint cell briefly
    schedule(() => {
      setHintActiveCell(null);
    }, 1200);

    // Clear errors or notes for this cell
    setErrorIndices((prev) => prev.filter((idx) => idx !== targetIdx));
    setNotes((prev) => ({ ...prev, [targetIdx]: [] }));
  }, [
    fixed,
    grid,
    hintsUsed,
    lost,
    paused,
    schedule,
    solution,
    soundEnabled,
    won,
  ]);

  // Submit and check solution
  const checkSolution = useCallback(() => {
    if (paused || won || lost || completedRef.current) return;

    // Check for unfilled cells
    const hasEmpty = grid.some((v) => v === 0);
    if (hasEmpty) {
      setWarningMsg("Fill all cells before submitting!");
      setShakeKey((k) => k + 1);
      sfx.wrong(soundEnabled);
      schedule(() => setWarningMsg(null), 3000);
      return;
    }

    const wrongs: number[] = [];
    for (let i = 0; i < 16; i++) {
      if (grid[i] !== solution[i]) {
        wrongs.push(i);
      }
    }

    if (wrongs.length === 0) {
      // Puzzle Solved successfully!
      setWon(true);
      sfx.win(soundEnabled);
      
      // Calculate particles
      const colors = ["#2DD4BF", "#38BDF8", "#A78BFA", "#F59E0B", "#F472B6"];
      const newParticles = Array.from({ length: 45 }).map((_, i) => ({
        id: i,
        x: Math.random() * 280 - 140,
        y: Math.random() * 280 - 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
      }));
      setParticles(newParticles);

      // Score evaluation (capped min at 80)
      const penalty = mistakes * 60 + hintsUsed * 40;
      const score = Math.max(
        80,
        Math.round(
          (1000 - elapsedTime / 40 - penalty) * difficultyMultiplier(difficulty),
        ),
      );
      setFinalScore(score);
      onScoreChange?.(score);
      completedRef.current = true;
      onComplete({
        score,
        won: true,
        timeMs: elapsedTime,
        difficulty,
      });

    } else {
      // Wrong cells found
      setErrorIndices(wrongs);
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      setShakeKey((k) => k + 1);
      sfx.wrong(soundEnabled);

      if (nextMistakes >= maxMistakes) {
        setLost(true);
        sfx.lose(soundEnabled);
        completedRef.current = true;
        onComplete({
          score: 0,
          won: false,
          timeMs: elapsedTime,
          difficulty,
        });
      }
    }
  }, [
    difficulty,
    elapsedTime,
    grid,
    hintsUsed,
    lost,
    maxMistakes,
    mistakes,
    onComplete,
    onScoreChange,
    paused,
    solution,
    schedule,
    soundEnabled,
    won,
  ]);

  // Keyboard navigation and control listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused || won || lost || showStatsModal) return;

      const activeKey = e.key.toLowerCase();

      // Navigation Arrow Keys
      if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key)) {
        e.preventDefault();
        if (sel === null) {
          setSel(0);
          return;
        }
        const r = Math.floor(sel / 4);
        const c = sel % 4;
        let nr = r;
        let nc = c;

        if (e.key === "ArrowUp") nr = (r - 1 + 4) % 4;
        else if (e.key === "ArrowDown") nr = (r + 1) % 4;
        else if (e.key === "ArrowLeft") nc = (c - 1 + 4) % 4;
        else if (e.key === "ArrowRight") nc = (c + 1) % 4;

        setSel(nr * 4 + nc);
        return;
      }

      // Input digits 1-4
      if (["1", "2", "3", "4"].includes(e.key)) {
        place(Number(e.key));
        return;
      }

      // Clear actions
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        place(0);
        return;
      }

      // Hotkey modifiers
      if (activeKey === "n") {
        setNotesMode((prev) => !prev);
        sfx.tap(soundEnabled);
      } else if (activeKey === "u" || (e.ctrlKey && activeKey === "z")) {
        undo();
      } else if (activeKey === "h") {
        getHint();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        checkSolution();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    paused,
    sel,
    won,
    lost,
    showStatsModal,
    place,
    notesMode,
    history,
    hintsUsed,
    soundEnabled,
    checkSolution,
    getHint,
    undo,
  ]);

  // Helpers for Same-Number/Intersections highlights
  const selectedVal = sel !== null ? grid[sel] : 0;
  const selRow = sel !== null ? Math.floor(sel / 4) : -1;
  const selCol = sel !== null ? sel % 4 : -1;
  const selBlock = sel !== null ? Math.floor(selRow / 2) * 2 + Math.floor(selCol / 2) : -1;

  // Completion percentage
  const filledCount = grid.filter((v) => v > 0).length;
  const progressPercent = Math.round((filledCount / 16) * 100);

  return (
    <div className="relative w-full max-w-3xl mx-auto select-none">
      
      {/* Decorative Atmosphere Backlight */}
      <div className="absolute -top-16 -left-16 w-40 h-40 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating dust space particles */}
      {dustParticles.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full bg-teal-400/20 pointer-events-none z-0"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
          }}
          animate={{
            y: [0, -35, 0],
            opacity: [0.1, 0.45, 0.1],
          }}
          transition={{
            duration: d.duration,
            repeat: Infinity,
            delay: d.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Bursting Confetti on victory */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full pointer-events-none z-50"
            style={{
              backgroundColor: p.color,
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              scale: [1, 1.5, 0],
            }}
            transition={{ duration: 1.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        className="rounded-[32px] border border-white/[0.08] bg-slate-950/60 p-4 min-[480px]:p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl relative overflow-hidden"
      >
        {/* Ambient top border glow */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 min-[480px]:grid-cols-12 gap-5 min-[480px]:gap-6 items-center">
          
          {/* LEFT COLUMN: GAME BOARD (Occupies 7/12 columns on desktop) */}
          <div className="min-[480px]:col-span-7 flex flex-col justify-center">
            
            {/* Mobile HUD Bar (only visible on mobile screens) */}
            <div className="flex min-[480px]:hidden items-center justify-between gap-3 mb-4 select-none">
              {/* Level Badge Capsule */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-[11px] font-mono text-[var(--text-dim)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                <Star className="w-3 h-3 text-teal-400 fill-teal-400/20" />
                <span className="font-bold tracking-wide uppercase text-teal-300">{difficulty}</span>
              </div>

              {/* Heart Lives Bar */}
              <div className="flex items-center gap-1 bg-slate-900/60 border border-white/[0.04] px-2.5 py-1.5 rounded-full shadow-inner">
                {Array.from({ length: maxMistakes }).map((_, i) => {
                  const active = i < lives;
                  return (
                    <motion.div
                      key={i}
                      animate={
                        !active
                          ? { scale: [1, 1.35, 1], opacity: 0.15 }
                          : active && lives === 1
                          ? { scale: [1, 1.15, 1] }
                          : { scale: 1 }
                      }
                      transition={{
                        repeat: lives === 1 && active ? Infinity : 0,
                        duration: 0.8,
                      }}
                    >
                      <Heart
                        className={cn(
                          "w-4 h-4 transition-all duration-300",
                          active
                            ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.65)]"
                            : "text-slate-800 fill-slate-900/80"
                        )}
                      />
                    </motion.div>
                  );
                })}
              </div>

              {/* Digital Timer Panel */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                <Timer className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold">{formatTime(elapsedTime)}</span>
              </div>
            </div>

            {/* LUXURIOUS GAME BOARD FRAME */}
            <div className="relative rounded-3xl bg-slate-950/70 border border-slate-700/60 p-2.5 shadow-[inset_0_4px_12px_rgba(0,0,0,0.9),0_12px_36px_rgba(0,0,0,0.5)] z-10 w-full max-w-sm mx-auto min-[480px]:max-w-none">
              <motion.div
                animate={
                  shakeKey > 0
                    ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                    : {}
                }
                transition={{ duration: 0.35 }}
                className="grid grid-cols-4 gap-1 relative"
              >
                {grid.map((v, i) => {
                  const r = Math.floor(i / 4);
                  const c = i % 4;
                  const b = Math.floor(r / 2) * 2 + Math.floor(c / 2);

                  const isSelected = sel === i;
                  const isFixed = fixed[i];
                  const isError = errorIndices.includes(i);
                  const isSameNumber = selectedVal > 0 && v === selectedVal && !isSelected;
                  const isHintActive = hintActiveCell === i;
                  
                  // Intersection highlighting
                  const isRelated =
                    sel !== null &&
                    !isSelected &&
                    (r === selRow || c === selCol || b === selBlock);

                  // Dual-tone block tinting for scanning subgrids (high contrast)
                  const blockColor = b === 0 || b === 3 ? "bg-[#182238]" : "bg-[#0c101d]";

                  return (
                    <motion.button
                      key={i}
                      type="button"
                      whileTap={!isFixed ? { scale: 0.94 } : {}}
                      onClick={() => {
                        setSel(i);
                        setWarningMsg(null);
                      }}
                      animate={
                        won
                          ? {
                              scale: [1, 1.12, 1],
                              rotate: [0, 8, -8, 0],
                              backgroundColor: [
                                "rgba(15, 23, 42, 0.5)",
                                "rgba(16, 185, 129, 0.2)",
                                "rgba(245, 158, 11, 0.15)",
                                "rgba(15, 23, 42, 0.5)",
                              ],
                              borderColor: [
                                "rgba(51, 65, 85, 0.3)",
                                "#2DD4BF",
                                "#F59E0B",
                                "rgba(45, 212, 191, 0.3)",
                              ],
                            }
                          : isHintActive
                          ? {
                              scale: [1, 1.15, 1],
                              borderColor: ["#F59E0B", "#2DD4BF"],
                              boxShadow: [
                                "0 0 0px rgba(245,158,11,0)",
                                "0 0 15px rgba(245,158,11,0.5)",
                                "0 0 0px rgba(245,158,11,0)",
                              ],
                            }
                          : isError
                          ? { x: [0, -4, 4, -4, 4, 0] }
                          : {}
                      }
                      transition={
                        won
                          ? {
                              duration: 1.3,
                              delay: (r + c) * 0.1,
                              ease: "easeInOut",
                            }
                          : { duration: 0.3 }
                      }
                      className={cn(
                        "aspect-square rounded-[14px] border text-2xl font-mono font-bold flex items-center justify-center relative transition-all duration-150 touch-manipulation select-none outline-none overflow-hidden hover:bg-slate-800/50",
                        blockColor,
                        
                        // Visible cell outline (high visibility on low brightness)
                        "border-slate-700/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03)]",
                        
                        // Thicker block grouping lines
                        c === 1 && "border-r-2 border-r-teal-400",
                        r === 1 && "border-b-2 border-b-teal-400",

                        // Selection Glow (high contrast)
                        isSelected &&
                          "ring-2 ring-teal-400 border-teal-400 bg-teal-950/40 shadow-[0_0_20px_rgba(45,212,191,0.45)] z-10 scale-[1.03]",
                        
                        // Matching same numbers highlight
                        isSameNumber &&
                          "bg-teal-500/20 text-teal-200 border-teal-500/40 shadow-[0_0_12px_rgba(45,212,191,0.3)] z-10",
                        
                        // Related Row/Col guides
                        isRelated && !isSelected && !isSameNumber && "bg-teal-500/5",

                        // Locked Clues (Fixed) vs User Entered digits
                        isFixed
                          ? "text-white bg-slate-800/50 font-black cursor-not-allowed border-slate-700/50"
                          : "text-teal-300 font-semibold bg-slate-900/20",

                        // Incorrect submissions error flash
                        isError &&
                          "border-rose-500 bg-rose-950/40 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.45)] z-20",
                        
                        // Hint glow activation
                        isHintActive && "z-20 border-amber-500/90 text-amber-300"
                      )}
                    >
                      {/* Subtle Padlock watermark on fixed clues */}
                      {isFixed && (
                        <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-slate-700/60" />
                      )}

                      {/* Cell contents - filled value vs Pencil Marks */}
                      <AnimatePresence mode="wait">
                        {v > 0 ? (
                          <motion.span
                            key={`val-${v}`}
                            initial={{ scale: 0.4, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.4, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 350, damping: 14 }}
                          >
                            {v}
                          </motion.span>
                        ) : (
                          // 2x2 Pencil mark grids
                          <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-1 text-[9px] font-mono leading-none text-slate-500/80">
                            {[1, 2, 3, 4].map((num) => (
                              <span
                                key={num}
                                className={cn(
                                  "flex items-center justify-center font-bold transition-all duration-200",
                                  notes[i]?.includes(num) ? "opacity-100 scale-100 text-teal-300/80" : "opacity-0 scale-50"
                                )}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

            {/* Mobile Warning Alert (only visible on mobile screens) */}
            <AnimatePresence>
              {warningMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center text-xs font-semibold text-rose-400 mt-4 font-display flex items-center justify-center gap-1.5 z-10 relative bg-rose-950/20 py-2 rounded-xl border border-rose-900/40 min-[480px]:hidden"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{warningMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: HUD & CONTROLS PANEL (Occupies 5/12 columns on desktop) */}
          <div className="min-[480px]:col-span-5 flex flex-col justify-between h-full gap-4">
            
            {/* Desktop HUD Panel (hidden on mobile, visible on desktop) */}
            <div className="hidden min-[480px]:flex flex-col gap-3.5 select-none">
              <div className="flex items-center justify-between">
                {/* Level Badge Capsule */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-[var(--text-dim)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] font-bold tracking-wide uppercase text-teal-300">
                  <Star className="w-3.5 h-3.5 text-teal-400 fill-teal-400/20" />
                  <span>{difficulty}</span>
                </div>
                
                {/* Timer Panel */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/70 border border-white/[0.04] text-xs font-mono text-slate-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">{formatTime(elapsedTime)}</span>
                </div>
              </div>

              {/* Mistakes and progress capsule box */}
              <div className="flex items-center justify-between text-xs font-mono bg-slate-900/40 border border-white/[0.03] p-3.5 rounded-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Mistakes</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: maxMistakes }).map((_, i) => {
                      const active = i < lives;
                      return (
                        <Heart
                          key={i}
                          className={cn(
                            "w-4 h-4 transition-all duration-300",
                            active
                              ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.65)]"
                              : "text-slate-800 fill-slate-900"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Completion</span>
                  <span className="text-sm font-black text-teal-400">{progressPercent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-900/80 border border-white/[0.03] overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 15 }}
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* KEYBOARD / CONTROLS PANEL */}
            <div className="select-none z-10 relative">
              
              {/* Top Helpers (Undo, Notes, Hint) */}
              <div className="flex justify-between items-center gap-2 mb-3.5">
                
                {/* Undo Button */}
                <motion.button
                  type="button"
                  whileHover={history.length > 0 ? { scale: 1.05, y: -1 } : {}}
                  whileTap={history.length > 0 ? { scale: 0.95 } : {}}
                  onClick={undo}
                  disabled={history.length === 0}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all",
                    history.length > 0
                      ? "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-teal-500/20 active:bg-slate-800/80"
                      : "bg-slate-950/20 border-white/[0.02] text-slate-700 cursor-not-allowed"
                  )}
                  title="Undo last action"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </motion.button>

                {/* Notes Toggle Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setNotesMode((prev) => !prev);
                    sfx.tap(soundEnabled);
                  }}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all shadow-sm",
                    notesMode
                      ? "bg-teal-950/45 border-teal-500/50 text-teal-300 shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                      : "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-teal-500/20 active:bg-slate-800/80"
                  )}
                  title="Toggle notes / pencil mode"
                >
                  <Pencil className={cn("w-3.5 h-3.5", notesMode && "animate-pulse")} />
                  <span>Notes</span>
                </motion.button>

                {/* Hint Button */}
                <motion.button
                  type="button"
                  whileHover={hintsUsed < 2 ? { scale: 1.05, y: -1 } : {}}
                  whileTap={hintsUsed < 2 ? { scale: 0.95 } : {}}
                  onClick={getHint}
                  disabled={hintsUsed >= 2}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition-all",
                    hintsUsed < 2
                      ? "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-teal-500/20 active:bg-slate-800/80"
                      : "bg-slate-950/20 border-white/[0.02] text-slate-700 cursor-not-allowed"
                  )}
                  title={`Hints remaining: ${2 - hintsUsed}`}
                >
                  <Lightbulb className={cn("w-3.5 h-3.5", hintsUsed < 2 && "text-amber-400")} />
                  <span>Hint ({2 - hintsUsed})</span>
                </motion.button>

              </div>

              {/* Tactile Digit Keys pad */}
              <div className="flex justify-between items-center gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <motion.button
                    key={n}
                    type="button"
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{ scale: 0.93, y: 1 }}
                    onClick={() => place(n)}
                    className={cn(
                      "flex-1 aspect-square rounded-[20px] border font-mono font-bold text-xl shadow-md transition-all flex items-center justify-center",
                      "bg-slate-900 border-slate-700/80 text-slate-100 hover:border-teal-400 hover:bg-slate-800/90 active:bg-teal-950/20 hover:text-teal-200",
                      sel !== null && !fixed[sel] && "cursor-pointer"
                    )}
                  >
                    {n}
                  </motion.button>
                ))}
                
                {/* Eraser button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.93, y: 1 }}
                  onClick={() => place(0)}
                  className={cn(
                    "flex-1 aspect-square rounded-[20px] border shadow-md transition-all flex items-center justify-center",
                    "bg-slate-900 border-slate-700 text-slate-300 hover:border-rose-400 hover:bg-rose-950/20 hover:text-rose-400 active:bg-rose-900/20",
                    sel !== null && !fixed[sel] && "cursor-pointer"
                  )}
                  title="Clear active cell"
                >
                  <Eraser className="w-5 h-5" />
                </motion.button>
              </div>

            </div>

            {/* Desktop Warning Alert (only visible on desktop screens) */}
            <AnimatePresence>
              {warningMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-center text-xs font-semibold text-rose-400 mt-2 font-display flex items-center justify-center gap-1.5 z-10 relative bg-rose-950/20 py-2 rounded-xl border border-rose-900/40 hidden min-[480px]:flex"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{warningMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GLOWING ACTION BUTTON */}
            <div className="select-none z-10 relative">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={checkSolution}
                disabled={won || lost}
                className={cn(
                  "w-full py-4 rounded-2xl font-display font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition-all relative overflow-hidden select-none cursor-pointer border",
                  
                  // Multi-state button styles
                  won
                    ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                    : lost
                    ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black border-teal-400 shadow-[0_6px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_6px_28px_rgba(20,184,166,0.55)]"
                )}
              >
                {won ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Solved!</span>
                  </>
                ) : lost ? (
                  <span>Game Over</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3px]" />
                    <span>Submit Solution</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Desktop Keyboard Shortcuts Guide Panel (hidden on mobile, visible on desktop) */}
            <div className="hidden min-[480px]:block mt-auto p-3.5 rounded-2xl bg-slate-900/45 border border-white/[0.02] text-[10px] text-slate-500 font-mono shadow-inner select-none">
              <div className="text-[11px] font-bold text-slate-400 mb-1.5 tracking-wider uppercase flex items-center gap-1">
                <span>⌨️</span> Keyboard Shortcuts
              </div>
              <div className="flex justify-between mb-0.5"><span>↑ ↓ ← →</span> <span className="text-slate-600">Navigate Grid</span></div>
              <div className="flex justify-between mb-0.5"><span>1 - 4</span> <span className="text-slate-600">Fill Digits</span></div>
              <div className="flex justify-between mb-0.5"><span>Backspace</span> <span className="text-slate-600">Clear Cell</span></div>
              <div className="flex justify-between mb-0.5"><span>N</span> <span className="text-slate-600">Toggle Notes Mode</span></div>
              <div className="flex justify-between"><span>U / H</span> <span className="text-slate-600">Undo / Hint</span></div>
            </div>

          </div>

        </div>

      </motion.div>

      {/* WORLD-CLASS INTERACTIVE STATS VICTORY SCREEN */}
      <AnimatePresence>
        {showStatsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 rounded-[32px] overflow-hidden bg-slate-950/90 backdrop-blur-md"
          >
            {/* Sparkles decorations inside victory overlay */}
            <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <div className="absolute bottom-16 right-12 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />

            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-xs text-center flex flex-col items-center"
            >
              {/* Victory Badge */}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_8px_24px_rgba(245,158,11,0.35)] mb-4"
              >
                <Trophy className="w-9 h-9 text-slate-950 stroke-[2px]" />
              </motion.div>

              <h3 className="text-xl font-display font-black text-white tracking-wide mb-1 uppercase">
                Puzzle Solved!
              </h3>
              <p className="text-xs text-teal-400 font-semibold tracking-wider uppercase mb-5">
                Excellent Performance
              </p>

              {/* Stats Card Grid */}
              <div className="grid grid-cols-2 gap-2.5 w-full mb-6 text-left">
                
                {/* Score Stat Panel */}
                <div className="bg-slate-900/80 border border-white/[0.04] p-3 rounded-2xl shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                    Score
                  </span>
                  <span className="text-lg font-mono font-black text-amber-400">
                    {finalScore}
                  </span>
                </div>

                {/* Time Stat Panel */}
                <div className="bg-slate-900/80 border border-white/[0.04] p-3 rounded-2xl shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                    Time Taken
                  </span>
                  <span className="text-lg font-mono font-black text-teal-300">
                    {formatTime(elapsedTime)}
                  </span>
                </div>

                {/* Mistakes Stat Panel */}
                <div className="bg-slate-900/80 border border-white/[0.04] p-3 rounded-2xl shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                    Mistakes
                  </span>
                  <span className="text-lg font-mono font-black text-rose-400">
                    {mistakes} / {maxMistakes}
                  </span>
                </div>

                {/* Hints Stat Panel */}
                <div className="bg-slate-900/80 border border-white/[0.04] p-3 rounded-2xl shadow-inner">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">
                    Hints Used
                  </span>
                  <span className="text-lg font-mono font-black text-purple-300">
                    {hintsUsed}
                  </span>
                </div>

              </div>

              {/* Stars display */}
              <div className="flex items-center gap-1.5 mb-6">
                {Array.from({ length: 3 }).map((_, i) => {
                  const earned = i < (mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1);
                  return (
                    <Star
                      key={i}
                      className={cn(
                        "w-6 h-6",
                        earned
                          ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "text-slate-800 fill-slate-900"
                      )}
                    />
                  );
                })}
              </div>

              {/* Continue button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onComplete({
                    score: finalScore,
                    won: true,
                    timeMs: elapsedTime,
                    difficulty,
                  });
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase border border-teal-400 shadow-[0_6px_20px_rgba(20,184,166,0.3)] cursor-pointer"
              >
                Continue
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


