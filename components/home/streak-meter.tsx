"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  buildJourneyHeatmap,
  buildJourneyWeek,
  countFullJourneyDays,
  criteriaCount,
  effectiveJourneyJoinDate,
  isFullDay,
} from "@/lib/gamification";
import { useAppClock } from "@/lib/clock/app-clock";
import { useGame } from "@/lib/store/game-provider";
import type { DayCriteria, JourneyDay } from "@/lib/types";
import { cn, daysBetween, formatShortDate, parseDateKey } from "@/lib/utils";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const CRITERIA = [
  {
    key: "dose" as const,
    active: "bg-[#1D9E75]",
    ghost: "border border-[#1D9E75]/35 bg-[#1D9E75]/10",
  },
  {
    key: "funbrain" as const,
    active: "bg-[#EF9F27]",
    ghost: "border border-[#EF9F27]/35 bg-[#EF9F27]/10",
  },
  {
    key: "puzzles" as const,
    active: "bg-[#D4537E]",
    ghost: "border border-[#D4537E]/35 bg-[#D4537E]/10",
  },
  {
    key: "habits" as const,
    active: "bg-[#378ADD]",
    ghost: "border border-[#378ADD]/35 bg-[#378ADD]/10",
  },
  {
    key: "pledges" as const,
    active: "bg-[#7F77DD]",
    ghost: "border border-[#7F77DD]/35 bg-[#7F77DD]/10",
  },
];

function CriteriaDots({
  day,
  upcoming,
}: {
  day: DayCriteria;
  upcoming?: boolean;
}) {
  return (
    <div className="mt-2 flex justify-center gap-[3px]">
      {CRITERIA.map((c) => {
        const on = day[c.key];
        return (
          <span
            key={c.key}
            className={cn(
              "h-[5px] w-[5px] shrink-0 rounded-full transition-all duration-300",
              // Only real completions get color — never decorative “ghost” fills.
              on && !upcoming ? c.active : "bg-white/[0.07]",
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
      whileHover={!upcoming ? { scale: 1.04 } : undefined}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={cn(
        "flex min-h-[34px] items-center justify-center rounded-[10px] border text-xs font-semibold transition-all",
        upcoming && "border-white/[0.045] bg-[#171E28] text-[#8B96A8]",
        !upcoming &&
          count === 0 &&
          "border-white/[0.045] bg-[#171E28] text-[#8B96A8]",
        !upcoming &&
          count >= 1 &&
          count <= 2 &&
          "border-[rgba(29,158,117,0.25)] bg-[rgba(29,158,117,0.35)] text-[#9FE1CB]",
        !upcoming &&
          count >= 3 &&
          count <= 4 &&
          "border-[rgba(29,158,117,0.4)] bg-[rgba(29,158,117,0.7)] text-white",
        !upcoming &&
          (count === 5 || full) &&
          "border-[#1D9E75] bg-[#1D9E75] text-white",
        isToday &&
          "border-[#EF9F27] bg-[rgba(239,159,39,0.14)] font-extrabold text-[#EF9F27] shadow-[inset_0_0_0_1px_#EF9F27]",
      )}
      title={
        upcoming
          ? `Day ${j.dayNumber} · Coming up`
          : `Day ${j.dayNumber} · ${formatShortDate(j.dateKey)} — ${count}/5 completed`
      }
    >
      {j.dayNumber}
    </motion.div>
  );
}

function WeekDayCard({ j }: { j: JourneyDay }) {
  const full = j.status !== "upcoming" && isFullDay(j.criteria);
  const upcoming = j.status === "upcoming";
  const isToday = j.status === "today";
  const doneCount = criteriaCount(j.criteria);

  return (
    <div
      className={cn(
        "rounded-xl border bg-[#171E28] px-2 py-3 text-center",
        upcoming && "border-white/[0.07]",
        !upcoming && !full && "border-white/[0.07]",
        full &&
          "border-[#1D9E75] bg-[rgba(29,158,117,0.14)] shadow-[inset_0_0_0_1px_#1D9E75,0_6px_18px_rgba(29,158,117,0.22)]",
        isToday &&
          !full &&
          "border-[#EF9F27]/50 shadow-[inset_0_0_0_1px_rgba(239,159,39,0.35)]",
      )}
      title={
        upcoming
          ? `Day ${j.dayNumber} · Coming up`
          : `Day ${j.dayNumber} · ${formatShortDate(j.dateKey)} — ${doneCount}/5 completed`
      }
    >
      <div className="text-[9.5px] font-bold tracking-[0.05em] text-[#5C6577]">
        {dayLabel(j)}
      </div>
      <div
        className={cn(
          "my-0.5 text-[12.5px] font-bold",
          full ? "text-[#1D9E75]" : "text-[#EAEEF3]",
          upcoming && "text-[#8B96A8]",
          isToday && !full && "text-[#EF9F27]",
        )}
      >
        {daySubLabel(j)}
      </div>
      <CriteriaDots day={j.criteria} upcoming={upcoming} />
    </div>
  );
}

export function StreakMeter() {
  const { state } = useGame();
  const { todayKey: clockToday, isOverridden } = useAppClock();
  const storedJoin = state.joinedDate ?? clockToday;
  const joinDate = effectiveJourneyJoinDate(state, clockToday);
  const week = useMemo(
    () => buildJourneyWeek(state, clockToday),
    [state, clockToday],
  );
  const heat = useMemo(
    () => buildJourneyHeatmap(state, 28, clockToday),
    [state, clockToday],
  );
  // Align Day 1 under its real weekday (Sun=0 … Sat=6), matching
  // monthly-challenge-view's leading blank padding.
  const joinWeekday = useMemo(
    () => parseDateKey(joinDate).getDay(),
    [joinDate],
  );

  const fullDays7 = countFullJourneyDays(
    week.filter((d) => d.status !== "upcoming"),
  );
  const fullDays28 = countFullJourneyDays(
    heat.filter((d) => d.status !== "upcoming"),
  );
  const todayCard = week.find((d) => d.status === "today");
  const daysSinceJoin = Math.max(
    0,
    todayCard?.dayNumber ?? daysBetween(joinDate, clockToday) + 1,
  );
  const qaBeforeRealJoin = isOverridden && clockToday < storedJoin;

  const legend = [
    { color: "bg-[#1D9E75]", label: "Daily Dose" },
    { color: "bg-[#EF9F27]", label: "Fun Brain" },
    { color: "bg-[#D4537E]", label: "Puzzles" },
    { color: "bg-[#378ADD]", label: "Habits" },
    { color: "bg-[#7F77DD]", label: "Pledge" },
  ];

  return (
    <div className="space-y-4">
      {isOverridden ? (
        <p className="hidden m-0 px-1 text-[11px] font-mono leading-relaxed text-amber-300/90" aria-hidden="true">
          Admin date active: {formatShortDate(clockToday)}
          {todayCard ? ` — Day ${todayCard.dayNumber} is Today` : ""}
          {qaBeforeRealJoin
            ? ` (QA mode: before real join ${formatShortDate(storedJoin)})`
            : ""}
          .
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(239,159,39,0.25)] bg-[rgba(239,159,39,0.14)] px-3 py-3">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(239,159,39,0.2)] text-base">
                🔥
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.04em] text-[#5C6577]">
                  Current Streak
                </div>
                <div className="font-display text-base font-extrabold text-[#EAEEF3]">
                  {state.streak} Days
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(29,158,117,0.25)] bg-[rgba(29,158,117,0.14)] px-3 py-3">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(29,158,117,0.2)] text-base">
                ⚡
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.04em] text-[#5C6577]">
                  Week Progress
                </div>
                <div className="font-display text-base font-extrabold text-[#EAEEF3]">
                  {fullDays7}/{Math.min(daysSinceJoin, 7)} Full
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-[rgba(212,83,126,0.25)] bg-[rgba(212,83,126,0.14)] px-3 py-3">
              <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(212,83,126,0.2)] text-base">
                🎯
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.04em] text-[#5C6577]">
                  28‑Day Journey
                </div>
                <div className="font-display text-base font-extrabold text-[#EAEEF3]">
                  {fullDays28}/{Math.min(daysSinceJoin, 28)} Full
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-[18px] border border-white/[0.07] bg-[#141A23] px-5 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.03em] text-[#5C6577]">
              Criteria legend
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {legend.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 text-[11.5px] text-[#8B96A8]"
                >
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", item.color)} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/[0.07] bg-[#141A23] px-5 py-[18px]">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#EAEEF3]">
              <span className="text-[#1D9E75]" aria-hidden>
                ✦
              </span>
              {daysSinceJoin <= 7 ? "Your first week" : "This week"}
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-7">
              {week.map((j) => (
                <WeekDayCard key={j.dateKey} j={j} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[18px] border border-white/[0.07] bg-[#141A23] px-5 py-[18px]">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#EAEEF3]">
            <span className="text-[#1D9E75]" aria-hidden>
              ✦
            </span>
            Your first 4 weeks
          </div>
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[10.5px] font-bold text-[#5C6577]">
            <div>S</div>
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: joinWeekday }).map((_, i) => (
              <div
                key={`blank-${i}`}
                className="min-h-[34px] invisible"
                aria-hidden
              />
            ))}
            {heat.map((j) => (
              <HeatmapCell key={j.dateKey} j={j} />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-[#5C6577]">
            <span>
              <b className="font-semibold text-[#8B96A8]">Day 1</b> · Joined{" "}
              {formatShortDate(joinDate)} · Columns Sun–Sat
            </span>
            <span className="inline-flex items-center gap-1.5">
              Less
              <span className="h-[9px] w-[9px] rounded-[3px] bg-[#1B2330]" />
              <span className="h-[9px] w-[9px] rounded-[3px] bg-[rgba(29,158,117,0.35)]" />
              <span className="h-[9px] w-[9px] rounded-[3px] bg-[rgba(29,158,117,0.7)]" />
              <span className="h-[9px] w-[9px] rounded-[3px] bg-[#1D9E75]" />
              More
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
