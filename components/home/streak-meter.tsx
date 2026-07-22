"use client";

import { motion } from "framer-motion";
import {
  buildJourneyHeatmap,
  buildJourneyWeek,
  countFullJourneyDays,
  criteriaCount,
  isFullDay,
} from "@/lib/gamification";
import { useGame } from "@/lib/store/game-provider";
import type { DayCriteria, JourneyDay } from "@/lib/types";
import { cn, formatShortDate, parseDateKey, todayKey } from "@/lib/utils";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CRITERIA = [
  {
    key: "dose" as const,
    active: "bg-teal shadow-[0_0_6px_rgba(45,212,191,0.55)]",
    ghost: "border border-teal/35 bg-teal/10",
  },
  {
    key: "funbrain" as const,
    active: "bg-amber shadow-[0_0_6px_rgba(251,191,36,0.5)]",
    ghost: "border border-amber/35 bg-amber/10",
  },
  {
    key: "puzzles" as const,
    active: "bg-gold shadow-[0_0_6px_rgba(232,196,104,0.5)]",
    ghost: "border border-gold/35 bg-gold/10",
  },
  {
    key: "habits" as const,
    active: "bg-blue shadow-[0_0_6px_rgba(96,165,250,0.5)]",
    ghost: "border border-blue/35 bg-blue/10",
  },
  {
    key: "pledges" as const,
    active: "bg-purple shadow-[0_0_6px_rgba(167,139,250,0.5)]",
    ghost: "border border-purple/35 bg-purple/10",
  },
];

function CriteriaDots({
  day,
  upcoming,
  showGhost,
}: {
  day: DayCriteria;
  upcoming?: boolean;
  showGhost?: boolean;
}) {
  return (
    <div className="flex justify-center gap-1 mt-2.5">
      {CRITERIA.map((c) => {
        const on = day[c.key];
        return (
          <span
            key={c.key}
            className={cn(
              "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 transition-all duration-300",
              on && !upcoming && c.active,
              !on && !upcoming && showGhost && c.ghost,
              !on && !upcoming && !showGhost && "bg-[var(--line)]",
              upcoming && "bg-[var(--line)]/70",
            )}
          />
        );
      })}
    </div>
  );
}

function dayLabel(j: JourneyDay): string {
  if (j.status === "today") return j.dayNumber === 1 ? "DAY 1" : "TODAY";
  if (j.status === "join") return "DAY 1";
  if (j.status === "upcoming") return "SOON";
  return DAY_LABELS[parseDateKey(j.dateKey).getDay()];
}

function daySubLabel(j: JourneyDay): string {
  if (j.status === "upcoming") return `Day ${j.dayNumber}`;
  if (j.status === "join" || (j.status === "today" && j.dayNumber === 1))
    return "Joined";
  if (j.status === "today") return String(parseDateKey(j.dateKey).getDate());
  return String(parseDateKey(j.dateKey).getDate());
}

function HeatmapCell({ j }: { j: JourneyDay }) {
  const count = criteriaCount(j.criteria);
  const upcoming = j.status === "upcoming";
  const isToday = j.status === "today";
  const full = !upcoming && isFullDay(j.criteria);

  return (
    <motion.div
      whileHover={!upcoming ? { scale: 1.08, y: -1 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn(
        "aspect-square w-full rounded-lg relative border flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-default",
        upcoming &&
          "border-dashed border-white/15 bg-white/[0.02] text-slate-500",
        !upcoming &&
          count === 0 &&
          "bg-slate-900/80 border-white/10 text-slate-400 hover:border-white/20",
        !upcoming && count >= 1 && count <= 2 && "bg-teal/15 border-teal/30 text-teal-300",
        !upcoming && count >= 3 && count <= 4 && "bg-teal/35 border-teal/50 text-teal-200 font-semibold",
        !upcoming &&
          (count === 5 || full) &&
          "bg-gradient-to-br from-teal-500 to-emerald-500 border-teal-300 text-white font-bold shadow-[0_0_12px_rgba(45,212,191,0.35)]",
        isToday &&
          "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#121422] z-10 font-bold",
        j.status === "join" &&
          !isToday &&
          "ring-1 ring-amber-400/60 ring-offset-1 ring-offset-[#121422]",
      )}
      title={
        upcoming
          ? `Day ${j.dayNumber} · Coming up`
          : `Day ${j.dayNumber} · ${formatShortDate(j.dateKey)} — ${count}/5 completed`
      }
    >
      {/* Day Number */}
      <span
        className={cn(
          "text-[10px] font-mono leading-none",
          full ? "text-white" : isToday ? "text-amber-300 font-bold" : "text-slate-400",
        )}
      >
        {j.dayNumber}
      </span>

      {/* Indicator icon or dot */}
      <div className="mt-0.5 leading-none">
        {full ? (
          <span className="text-[10px]">🔥</span>
        ) : count > 0 ? (
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-teal-300 shrink-0" />
            ))}
          </div>
        ) : upcoming ? (
          <span className="text-[8px] text-slate-600 font-mono">·</span>
        ) : null}
      </div>
    </motion.div>
  );
}

function WeekDayCard({ j }: { j: JourneyDay }) {
  const full = j.status !== "upcoming" && isFullDay(j.criteria);
  const upcoming = j.status === "upcoming";
  const isToday = j.status === "today";
  const isJoin = j.status === "join" || (isToday && j.dayNumber === 1);
  const emptyToday = isToday && !full && !upcoming;

  return (
    <div
      className={cn(
        "relative rounded-xl py-2 px-1 text-center border transition-all duration-200 flex flex-col justify-between min-h-[72px]",
        upcoming
          ? "border-dashed border-white/15 bg-white/[0.02]"
          : "border-white/10 bg-slate-900/60 shadow-inner",
        full && "border-teal-500/60 bg-teal-500/10 shadow-[0_0_14px_rgba(45,212,191,0.15)]",
        emptyToday && "border-white/15",
        isToday && "ring-2 ring-teal-400 ring-offset-2 ring-offset-[#121422] z-10",
        isJoin && !full && "border-amber-400/40",
      )}
    >
      <div
        className={cn(
          "font-mono text-[9px] tracking-wide uppercase font-semibold",
          upcoming && "text-slate-500",
          isJoin && "text-amber-400",
          isToday && !isJoin && "text-teal-300",
          !upcoming && !isToday && !isJoin && "text-slate-400",
        )}
      >
        {dayLabel(j)}
      </div>
      <div
        className={cn(
          "font-display font-bold text-xs mt-0.5",
          upcoming ? "text-slate-500" : "text-white",
        )}
      >
        {daySubLabel(j)}
      </div>

      <CriteriaDots day={j.criteria} upcoming={upcoming} showGhost={emptyToday || isJoin} />

      <div className="text-xs mt-1 min-h-[16px] leading-none flex items-center justify-center">
        {full ? (
          <span className="text-[11px]">🔥</span>
        ) : upcoming ? (
          <span className="text-slate-600 text-[9px] font-mono">···</span>
        ) : null}
      </div>
    </div>
  );
}

function SectionShell({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "teal" | "purple";
  children: React.ReactNode;
}) {
  const accentCls =
    accent === "teal"
      ? "text-teal-300 border-teal-500/20 bg-teal-950/10"
      : "text-purple-300 border-purple-500/20 bg-purple-950/10";

  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 sm:p-4 shadow-lg",
        accentCls,
      )}
    >
      <p className="text-xs font-mono uppercase tracking-[0.12em] mb-3 text-slate-300 font-semibold flex items-center gap-1.5">
        <span className={accent === "teal" ? "text-teal" : "text-purple-400"}>✦</span>
        {title}
      </p>
      {children}
    </div>
  );
}

export function StreakMeter() {
  const { state } = useGame();
  const joinDate = state.joinedDate ?? todayKey();
  const week = buildJourneyWeek(state);
  const heat = buildJourneyHeatmap(state);

  const fullDays7 = countFullJourneyDays(
    week.filter((d) => d.status !== "upcoming"),
  );
  const fullDays28 = countFullJourneyDays(
    heat.filter((d) => d.status !== "upcoming"),
  );
  const daysSinceJoin = week.find((d) => d.status === "today")?.dayNumber ?? 1;

  const legend = [
    { color: "bg-teal-400", label: "Daily Dose" },
    { color: "bg-amber-400", label: "Fun Brain" },
    { color: "bg-yellow-400", label: "Puzzles" },
    { color: "bg-blue-400", label: "Habits" },
    { color: "bg-purple-400", label: "Pledge" },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Streak Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-base shrink-0">
            🔥
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Current Streak</div>
            <div className="text-sm font-bold text-amber-300">{state.streak} Days</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-base shrink-0">
            ⚡
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Week Progress</div>
            <div className="text-sm font-bold text-teal-300">{fullDays7}/{Math.min(daysSinceJoin, 7)} Full Days</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-base shrink-0">
            🎯
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">28-Day Journey</div>
            <div className="text-sm font-bold text-purple-300">{fullDays28}/{Math.min(daysSinceJoin, 28)} Full Days</div>
          </div>
        </div>
      </div>

      {/* Criteria Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
        <span className="text-[11px] font-mono text-slate-400 font-semibold">Criteria Legend:</span>
        <div className="flex flex-wrap gap-x-3.5 gap-y-1">
          {legend.map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className={cn("w-2 h-2 rounded-full shrink-0", item.color)} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* This Week Section */}
      <SectionShell
        title={daysSinceJoin <= 7 ? "Your first week" : "This week"}
        accent="teal"
      >
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {week.map((j) => (
            <WeekDayCard key={j.dateKey} j={j} />
          ))}
        </div>
      </SectionShell>

      {/* Your First 4 Weeks Section */}
      <SectionShell title="Your first 4 weeks" accent="purple">
        <div className="w-full py-1">
          {/* Grid Header: Weekday Headers across 14 columns */}
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 sm:gap-2 mb-2 text-center text-[10px] font-mono text-slate-400 uppercase font-semibold">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            <span className="hidden sm:inline">S</span>
            <span className="hidden sm:inline">M</span>
            <span className="hidden sm:inline">T</span>
            <span className="hidden sm:inline">W</span>
            <span className="hidden sm:inline">T</span>
            <span className="hidden sm:inline">F</span>
            <span className="hidden sm:inline">S</span>
          </div>

          {/* 28-Day Heatmap Grid: 14 columns x 2 rows on desktop */}
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 sm:gap-2 w-full">
            {heat.map((j) => (
              <HeatmapCell key={j.dateKey} j={j} />
            ))}
          </div>
        </div>

        {/* Heatmap Legend: Activity Scale & Key Milestones */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-400 mt-3 pt-2 border-t border-white/5">
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-teal-300 font-semibold">Day 1 · Joined {formatShortDate(joinDate)}</span>
            <span className="hidden sm:inline text-purple-300 font-medium">Row 1: Weeks 1–2 · Row 2: Weeks 3–4</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-900 border border-white/10" />
            <span className="w-2.5 h-2.5 rounded-sm bg-teal/20 border border-teal/30" />
            <span className="w-2.5 h-2.5 rounded-sm bg-teal/40 border border-teal/50" />
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
            <span>More</span>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
