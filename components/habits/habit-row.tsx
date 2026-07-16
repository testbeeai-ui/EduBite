"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { HabitState } from "@/lib/types";
import { cn } from "@/lib/utils";

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

function CheckBurst({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
      {BURST_ANGLES.map((deg) => (
        <motion.span
          key={deg}
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-teal"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((deg * Math.PI) / 180) * 22,
            y: Math.sin((deg * Math.PI) / 180) * 22,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

function HabitCheckbox({ done, popping }: { done: boolean; popping: boolean }) {
  return (
    <motion.div
      layout
      animate={popping ? { scale: 1.35, rotate: -8 } : { scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 520, damping: 16 }}
      className={cn(
        "relative w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 border-[1.5px] transition-colors duration-300",
        done
          ? "bg-teal border-teal shadow-[0_0_20px_rgba(45,212,191,0.45)]"
          : "border-[var(--line)] bg-[var(--surface)]/80",
      )}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.span
            key="check"
            initial={{ scale: 0, opacity: 0, rotate: -40 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
            className="text-[#04141c] text-sm font-bold leading-none"
          >
            ✓
          </motion.span>
        ) : (
          <motion.span
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-2 h-2 rounded-full bg-[var(--line)]/60"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface HabitRowProps {
  habit: HabitState;
  index: number;
  onToggle: (id: string) => void;
}

export function HabitRow({ habit, index, onToggle }: HabitRowProps) {
  const [burst, setBurst] = useState(false);
  const [popping, setPopping] = useState(false);
  const prevDone = useRef(habit.done);

  useEffect(() => {
    if (habit.done && !prevDone.current) {
      setBurst(true);
      setPopping(true);
      const t1 = window.setTimeout(() => setBurst(false), 600);
      const t2 = window.setTimeout(() => setPopping(false), 400);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    prevDone.current = habit.done;
  }, [habit.done]);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.22 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onToggle(habit.id)}
      className={cn(
        "relative flex items-center gap-2.5 px-3 sm:px-4 py-2 w-full text-left border-b border-[var(--line)] last:border-b-0 overflow-hidden",
        "transition-colors duration-300",
        habit.done
          ? "bg-gradient-to-r from-teal/[0.12] via-teal/[0.04] to-transparent"
          : "hover:bg-white/[0.03]",
      )}
    >
      {habit.done && (
        <motion.span
          layoutId={`habit-glow-${habit.id}`}
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-teal shadow-[0_0_12px_rgba(45,212,191,0.6)]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
        />
      )}

      <motion.div
        animate={
          popping
            ? { scale: 1.18, rotate: -6 }
            : habit.done
              ? { scale: 1.05 }
              : { scale: 1, rotate: 0 }
        }
        transition={{ type: "spring", stiffness: 480, damping: 14 }}
        className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px] shrink-0 relative z-10"
        style={{ background: habit.bg }}
      >
        {habit.icon}
      </motion.div>

      <div className="flex-1 min-w-0 relative z-10">
        <motion.div
          animate={habit.done ? { x: 2 } : { x: 0 }}
          className={cn(
            "text-sm font-semibold transition-colors duration-300",
            habit.done ? "text-[var(--text)]" : "text-[var(--text)]/90",
          )}
        >
          {habit.name}
        </motion.div>
        <div className="text-[10.5px] text-[var(--text-dim)] mt-px leading-tight line-clamp-1">{habit.sub}</div>
      </div>

      <div className="relative z-10 ml-auto">
        <HabitCheckbox done={habit.done} popping={popping} />
      </div>

      <CheckBurst show={burst} />
    </motion.button>
  );
}

function progressMessage(done: number, total: number): string {
  if (done === 0) return "Tap habits you've finished today.";
  if (done === 1) return "First one locked — momentum starts here.";
  if (done < total / 2) return "Keep going — you're showing up.";
  if (done < total - 1) return "More than halfway there.";
  if (done === total - 1) return "One more for a full wellbeing day.";
  return `All ${total} done — protected for today.`;
}

function milestoneMessage(done: number, total: number): string | null {
  if (done === 3) return "3 habits — rhythm unlocked";
  if (done === 6) return "6 habits — you're on fire today";
  if (done === total) return `Perfect day — all ${total} habits complete`;
  return null;
}

export function HabitsProgressHero({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="px-3 sm:px-4 pt-2 pb-2 border-b border-[var(--line)] bg-gradient-to-br from-emerald/[0.08] via-transparent to-blue/[0.05]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.1em] text-teal/90">
            Today&apos;s progress
          </p>
          <p className="font-display font-bold text-2xl sm:text-[28px] text-[var(--text)] tabular-nums leading-none mt-0.5">
            <motion.span
              key={done}
              initial={{ scale: 1.2, color: "#2dd4bf" }}
              animate={{ scale: 1, color: "#f6f7fb" }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="inline-block"
            >
              {done}
            </motion.span>
            <span className="text-[var(--text-dim)] text-lg sm:text-xl font-semibold">
              {" "}/ {total}
            </span>
          </p>
        </div>
        <motion.div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0"
          animate={
            done === total
              ? { scale: 1.15, rotate: 8 }
              : done > 0
                ? { scale: 1.08 }
                : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{
            background: `conic-gradient(#2dd4bf ${pct}%, var(--line) 0)`,
          }}
        >
          <span className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-sm">
            {done === total ? "🏆" : done >= 6 ? "🔥" : done >= 3 ? "⚡" : "🌱"}
          </span>
        </motion.div>
      </div>

      <div className="flex items-center gap-2 mt-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--line)] overflow-hidden min-w-0">
          <motion.div
            className="h-full bg-gradient-to-r from-teal via-teal to-blue rounded-full"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <motion.p
          key={progressMessage(done, total)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] sm:text-[11px] text-[var(--text-dim)] leading-none shrink-0 max-w-[48%] truncate text-right"
        >
          {progressMessage(done, total)}
        </motion.p>
      </div>
    </div>
  );
}

export function HabitsMilestoneToast({
  done,
  total,
}: {
  done: number;
  total: number;
}) {
  const prevDone = useRef(done);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (done > prevDone.current) {
      const msg = milestoneMessage(done, total);
      if (msg) {
        setToast(msg);
        const t = window.setTimeout(() => setToast(null), 2400);
        prevDone.current = done;
        return () => window.clearTimeout(t);
      }
    }
    prevDone.current = done;
  }, [done, total]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] px-4 py-2.5 rounded-full border border-teal/40 bg-[var(--surface)]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(45,212,191,0.25)] text-sm font-semibold text-teal whitespace-nowrap"
        >
          ✨ {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
