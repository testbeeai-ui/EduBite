"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/data/config";
import {
  buildJourneyHeatmap,
  buildJourneyWeek,
  countFullJourneyDays,
  isFullDay,
} from "@/lib/gamification";
import { useGame } from "@/lib/store/game-provider";
import type { DayCriteria, JourneyDay } from "@/lib/types";
import { cn, formatShortDate, parseDateKey, todayKey } from "@/lib/utils";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CRITERIA = [
  { key: "routine" as const, color: "teal", active: "bg-teal shadow-[0_0_6px_rgba(45,212,191,0.55)]", ghost: "border border-teal/35 bg-teal/10" },
  { key: "pledges" as const, color: "amber", active: "bg-amber shadow-[0_0_6px_rgba(251,191,36,0.5)]", ghost: "border border-amber/35 bg-amber/10" },
  { key: "habits" as const, color: "blue", active: "bg-blue shadow-[0_0_6px_rgba(96,165,250,0.5)]", ghost: "border border-blue/35 bg-blue/10" },
  { key: "gyan" as const, color: "purple", active: "bg-purple shadow-[0_0_6px_rgba(167,139,250,0.5)]", ghost: "border border-purple/35 bg-purple/10" },
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
    <div className="flex justify-center gap-1.5 mt-2.5">
      {CRITERIA.map((c) => {
        const on = day[c.key];
        return (
          <span
            key={c.key}
            className={cn(
              "w-2 h-2 rounded-full shrink-0 transition-all duration-300",
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
  if (j.status === "join" || (j.status === "today" && j.dayNumber === 1)) return "Joined";
  if (j.status === "today") return String(parseDateKey(j.dateKey).getDate());
  return String(parseDateKey(j.dateKey).getDate());
}

function criteriaCount(day: DayCriteria) {
  return [day.routine, day.pledges, day.habits, day.gyan].filter(Boolean).length;
}

function HeatmapCell({ j }: { j: JourneyDay }) {
  const count = criteriaCount(j.criteria);
  const upcoming = j.status === "upcoming";
  const isToday = j.status === "today";
  const full = !upcoming && isFullDay(j.criteria);

  return (
    <motion.div
      whileHover={!upcoming ? { scale: 1.06, y: -1 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn(
        "aspect-square rounded-[6px] relative border transition-shadow duration-200",
        upcoming &&
          "border-dashed border-white/20 bg-[var(--surface-2)]/60",
        !upcoming && count === 0 &&
          "bg-[var(--line)]/55 border-[var(--line)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        !upcoming && count === 1 &&
          "bg-teal/20 border-teal/30",
        !upcoming && count === 2 &&
          "bg-teal/42 border-teal/42",
        !upcoming && count === 3 &&
          "bg-teal/68 border-teal/68",
        !upcoming && (count === 4 || full) &&
          "bg-teal border-teal shadow-[0_0_14px_rgba(45,212,191,0.28)]",
        isToday &&
          "outline outline-2 outline-offset-[2px] outline-[var(--text)] z-[1]",
        j.status === "join" && !isToday && "ring-1 ring-amber/50 ring-offset-1 ring-offset-[var(--surface)]",
      )}
      title={
        upcoming
          ? `Day ${j.dayNumber} · coming up`
          : `Day ${j.dayNumber} · ${formatShortDate(j.dateKey)} — ${count}/4`
      }
    >
      {full && (
        <span className="absolute inset-0 flex items-center justify-center text-[9px] sm:text-[10px]">
          🔥
        </span>
      )}
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
        "relative rounded-[14px] py-2.5 px-1.5 sm:py-3 sm:px-2 text-center",
        "border bg-[var(--surface-2)] transition-all duration-200",
        upcoming
          ? "border-dashed border-white/18 bg-[var(--surface)]/40"
          : "border-[var(--line)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        full && "border-teal bg-teal/[0.08] shadow-[0_0_18px_rgba(45,212,191,0.14)]",
        emptyToday && "border-[var(--line)]",
        isToday && "outline outline-2 outline-offset-[3px] outline-[var(--text)] z-[1]",
        isJoin && !full && "border-amber/45",
      )}
    >
      <div
        className={cn(
          "font-mono text-[9px] sm:text-[9.5px] tracking-wide uppercase",
          upcoming && "text-[var(--text-dim)]",
          isJoin && "text-amber",
          isToday && !isJoin && "text-teal",
          !upcoming && !isToday && !isJoin && "text-[var(--text-dim)]",
        )}
      >
        {dayLabel(j)}
      </div>
      <div
        className={cn(
          "font-display font-bold text-[13px] sm:text-[13px] mt-0.5",
          upcoming ? "text-[var(--text-dim)]/80" : "text-[var(--text)]",
        )}
      >
        {daySubLabel(j)}
      </div>

      <CriteriaDots day={j.criteria} upcoming={upcoming} showGhost={emptyToday || isJoin} />

      <div className="text-sm mt-1.5 min-h-[18px] leading-none">
        {full ? (
          <span className="inline-block text-[12px]">🔥</span>
        ) : upcoming ? (
          <span className="text-[var(--text-dim)]/40 text-[10px] font-mono tracking-widest">···</span>
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
      ? "text-teal/90 border-teal/15 from-teal/[0.04]"
      : "text-purple/90 border-purple/15 from-purple/[0.04]";

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--line)] bg-gradient-to-br to-transparent p-3 sm:p-4",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        accentCls,
      )}
    >
      <p
        className={cn(
          "text-[11px] sm:text-xs font-mono uppercase tracking-[0.14em] mb-3",
          accent === "teal" ? "text-[var(--text)]/90" : "text-[var(--text)]/90",
        )}
      >
        <span className="text-teal/80 mr-1.5">✦</span>
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

  const fullDays7 = countFullJourneyDays(week.filter((d) => d.status !== "upcoming"));
  const fullDays28 = countFullJourneyDays(heat.filter((d) => d.status !== "upcoming"));
  const daysSinceJoin = week.find((d) => d.status === "today")?.dayNumber ?? 1;

  const legend = [
    { color: "bg-teal", label: "Daily Routine" },
    { color: "bg-amber", label: "Pledges" },
    { color: "bg-blue", label: "Habits" },
    { color: "bg-purple", label: FEATURES.gyan.streakLabel },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {legend.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 text-[11px] sm:text-[11.5px] text-[var(--text-dim)]"
          >
            <span className={cn("w-[9px] h-[9px] rounded-[3px] shrink-0", item.color)} />
            {item.label}
          </span>
        ))}
      </div>

      <p className="text-xs sm:text-[12px] text-[var(--text-dim)] leading-relaxed">
        Your journey from{" "}
        <span className="text-teal font-semibold">Day 1 · {formatShortDate(joinDate)}</span>
        {" "}— a day only fully counts when all four are done.
        {state.streak === 0 && fullDays28 === 0 && (
          <span className="block mt-1.5 text-amber/85 text-[11px]">
            Complete today&apos;s four criteria to ignite your streak.
          </span>
        )}
      </p>

      <SectionShell title={daysSinceJoin <= 7 ? "Your first week" : "This week"} accent="teal">
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-2.5">
          {week.map((j) => (
            <WeekDayCard key={j.dateKey} j={j} />
          ))}
        </div>
      </SectionShell>

      <SectionShell title="Your first 4 weeks" accent="purple">
        <div className="w-[94%] sm:w-[90%] mx-auto px-1 sm:px-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {heat.map((j) => (
              <HeatmapCell key={j.dateKey} j={j} />
            ))}
          </div>
        </div>
        <div className="flex justify-between font-mono text-[9px] sm:text-[9.5px] text-[var(--text-dim)] mt-2.5 px-0.5">
          <span>Day 1 · Joined</span>
          <span>Week 2</span>
          <span>Week 3</span>
          <span>Upcoming</span>
        </div>
      </SectionShell>

      <div className="flex flex-wrap gap-3 sm:gap-6 font-mono text-xs text-[var(--text-dim)]">
        <div>
          🔥 Current streak
          <b className="block font-body font-bold text-[15px] text-[var(--text)] mt-0.5">
            {state.streak} days
          </b>
        </div>
        <div>
          {daysSinceJoin <= 7 ? "This week" : "Week progress"}
          <b className="block font-body font-bold text-[15px] text-[var(--text)] mt-0.5">
            {fullDays7}/{Math.min(daysSinceJoin, 7)} full days
          </b>
        </div>
        <div>
          Last 4 weeks
          <b className="block font-body font-bold text-[15px] text-[var(--text)] mt-0.5">
            {fullDays28}/{Math.min(daysSinceJoin, 28)} full days
          </b>
        </div>
      </div>
    </div>
  );
}
