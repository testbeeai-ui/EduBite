"use client";

import { useEffect, useRef, useState } from "react";
import type { HabitState } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HabitRowProps {
  habit: HabitState;
  openInfoId: string | null;
  onToggleInfo: (id: string) => void;
  onToggleDone: (id: string) => void;
}

export function HabitRow({
  habit,
  openInfoId,
  onToggleInfo,
  onToggleDone,
}: HabitRowProps) {
  const [toast, setToast] = useState(false);
  const prevDone = useRef(habit.done);
  const infoOpen = openInfoId === habit.id;

  useEffect(() => {
    if (habit.done && !prevDone.current) {
      setToast(true);
      const timer = window.setTimeout(() => setToast(false), 1100);
      prevDone.current = habit.done;
      return () => window.clearTimeout(timer);
    }
    prevDone.current = habit.done;
  }, [habit.done]);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3.5 border-t border-white/[0.06] py-[15px] px-1 first:border-t-0",
        infoOpen && "z-50",
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-[18px]"
        style={{ background: habit.bg }}
        aria-hidden
      >
        {habit.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "m-0 text-[14.5px] font-bold leading-snug transition-opacity",
            habit.done &&
              "opacity-55 line-through decoration-[var(--text-dim)]/70",
          )}
        >
          {habit.name}
        </p>
        <p
          className={cn(
            "m-0 mt-0.5 text-xs text-[var(--text-dim)]",
            habit.done && "opacity-45",
          )}
        >
          {habit.sub}
        </p>
      </div>

      <div
          className={cn(
            "pointer-events-none absolute right-[70px] top-1.5 z-10 rounded-full border border-teal/40 bg-teal/15 px-2.5 py-1 font-mono text-xs font-bold text-teal",
            toast ? "animate-[habitToast_1.1s_ease_forwards]" : "translate-y-1.5 opacity-0",
          )}
      >
        +{habit.rdm} RDM
      </div>

      <div className="relative flex shrink-0 items-center gap-2.5">
        <button
          type="button"
          aria-label={`About ${habit.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onToggleInfo(habit.id);
          }}
          className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-teal bg-transparent font-mono text-[11px] font-bold text-teal"
        >
          i
        </button>

        <button
          type="button"
          aria-label={habit.done ? `Uncheck ${habit.name}` : `Complete ${habit.name}`}
          onClick={() => onToggleDone(habit.id)}
          className={cn(
            "relative flex h-7 w-7 items-center justify-center rounded-[9px] border transition-colors",
            habit.done
              ? "border-teal bg-teal"
              : "border-white/[0.09] bg-white/[0.02]",
          )}
        >
          {habit.done ? (
            <span className="text-sm font-extrabold leading-none text-[#04140D]">
              ✓
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-[#5C6270]" />
          )}
        </button>

        <div
          className={cn(
            "absolute right-0 top-[calc(100%+8px)] z-50 w-[300px] max-w-[min(300px,calc(100vw-2rem))] rounded-2xl border border-white/[0.09] bg-[#171A21] p-[18px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] transition-all duration-150 sm:w-[300px]",
            infoOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-1.5 scale-[0.98] opacity-0",
          )}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="m-0 text-sm font-bold">{habit.name}</p>
            <button
              type="button"
              aria-label="Close"
              onClick={() => onToggleInfo(habit.id)}
              className="border-0 bg-transparent text-base leading-none text-[#5C6270]"
            >
              ✕
            </button>
          </div>
          <p className="mb-3 mt-0 text-[12.5px] leading-relaxed text-[var(--text-dim)]">
            {habit.desc}
          </p>
          <ul className="mb-3.5 flex list-none flex-col gap-[7px] p-0">
            {habit.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex gap-2 text-xs leading-snug text-[var(--text-dim)]"
              >
                <span className="shrink-0 font-extrabold text-teal">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-[11px] border border-teal/35 bg-teal/15 px-3 py-2.5">
            <span className="text-[11.5px] font-bold text-teal">
              Complete today to earn
            </span>
            <b className="font-mono text-[13px] text-teal">+{habit.rdm} RDM</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HabitsProgressHero({
  done,
  total,
  rdmEarned,
  pulseRdm,
}: {
  done: number;
  total: number;
  rdmEarned: number;
  pulseRdm: boolean;
}) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const hint =
    done === total
      ? `All ${total} done — habits locked in for today's streak.`
      : "Tap habits you've finished today.";

  return (
    <div className="mb-0">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-teal">
            Today&apos;s Progress
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5">
            <b className="text-[32px] font-extrabold leading-none sm:text-[38px]">
              {done}
            </b>
            <span className="text-xl font-semibold text-[#5C6270]">
              / {total}
            </span>
            <span
              className={cn(
                "ml-0 mt-2 inline-flex items-center gap-1.5 rounded-full border border-teal/35 bg-teal/15 px-3 py-1.5 font-mono text-[11.5px] font-bold text-teal sm:ml-3.5 sm:mt-0",
                pulseRdm && "animate-[habitChipPulse_0.5s_ease]",
              )}
            >
              ⭐ {rdmEarned} RDM earned today
            </span>
          </div>
        </div>
        <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-teal/35 bg-[#0F2620] text-[22px]">
          🌱
        </div>
      </div>

      <div className="mb-[22px] flex items-center gap-3.5">
        <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal to-[#5FE3B8] transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="shrink-0 whitespace-nowrap text-xs text-[#5C6270]">
          {hint}
        </div>
      </div>
    </div>
  );
}
