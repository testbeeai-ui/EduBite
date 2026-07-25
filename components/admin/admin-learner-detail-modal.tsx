"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChallengeParticipantRow, ParticipantDayDetail } from "@/lib/db/monthly-challenge";
import { formatCountdown, msUntilDateEnd } from "@/lib/puzzles/daily";
import { formatRdm } from "@/lib/utils";

function formatSeconds(totalSec: number): string {
  if (totalSec <= 0) return "0s";
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

function formatDetailTime(iso: string | null): string {
  if (!iso) return "Not completed";
  try {
    return (
      new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }) + " IST"
    );
  } catch {
    return iso;
  }
}

export function AdminLearnerDetailModal({
  participant,
  onClose,
}: {
  participant: ChallengeParticipantRow | null;
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    if (!participant) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [participant]);

  if (!participant) return null;

  const closesIn = msUntilDateEnd(participant.todayDateKey, new Date(nowTick));
  const todayDone = Math.min(5, Math.max(0, participant.todayCriteriaDone ?? 0));

  const days = participant.dayDetails || [];
  const activeDay = selectedDate
    ? days.find((d) => d.dateKey === selectedDate) ?? null
    : null;

  const completedDaysCount = days.filter((d) => d.status === "done").length;
  const totalDoseCorrect = days.reduce((sum, d) => sum + d.dose.correct, 0);
  const totalDoseWrong = days.reduce((sum, d) => sum + d.dose.wrong, 0);
  const totalDoseAttempted = totalDoseCorrect + totalDoseWrong;
  const doseAccuracyPct =
    totalDoseAttempted > 0
      ? Math.round((100 * totalDoseCorrect) / totalDoseAttempted)
      : 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--line)] bg-[var(--surface-2)]/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center font-display font-extrabold text-xl text-purple-300 shrink-0">
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-lg truncate m-0">
                  {participant.displayName}
                </h2>
                {participant.isWinner && (
                  <span className="px-2 py-0.5 rounded-full bg-amber/15 text-amber border border-amber/30 text-[10px] font-mono font-bold">
                    WINNER
                  </span>
                )}
              </div>
              <div className="font-mono text-[11px] text-[var(--text-dim)] truncate mt-0.5">
                ID: {participant.userId}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--text-dim)] hover:text-[var(--text)] hover:border-teal/40 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Overview Stats, Day Selector & Detailed Metrics */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Overview Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber" /> Streak
              </div>
              <div className="font-display font-extrabold text-lg mt-0.5 tabular-nums text-teal">
                {participant.bestStretch} of {participant.streakRequired}
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">
                consecutive days
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-teal" /> Days done
              </div>
              <div className="font-display font-extrabold text-lg mt-0.5 tabular-nums">
                {completedDaysCount} / {days.length}
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">
                full days this month
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-purple" /> Total Time
              </div>
              <div className="font-display font-extrabold text-lg mt-0.5 tabular-nums text-purple-300">
                {formatSeconds(participant.totalTimeSpentSec)}
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">Time spent</div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-amber" /> Stake &amp; RDM
              </div>
              <div className="font-display font-extrabold text-base mt-0.5 tabular-nums text-amber">
                {formatRdm(participant.stakeRdm)} RDM
              </div>
              <div className="text-[10px] text-[var(--text-dim)]">
                Balance: {formatRdm(participant.totalRdm)}
              </div>
            </div>
          </div>

          {/* Today's Window & Completion Timer Banner */}
          <div className="rounded-xl border border-[rgba(232,196,104,0.28)] bg-[rgba(232,196,104,0.06)] p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--gold)] font-bold">
                {participant.displayName}&apos;s Daily Activity Status
              </div>
              <div className="text-xs text-[var(--text-dim)] mt-0.5">
                Their day {participant.todayDateKey}
                {participant.todayFull
                  ? " · full day locked in"
                  : ` · ${todayDone}/5 tasks today`}
                {participant.lastActivityAt
                  ? ` · last finish ${formatDetailTime(participant.lastActivityAt)}`
                  : ""}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-display font-extrabold text-xl tabular-nums text-[var(--text)] leading-none">
                {participant.todayFull ? "Done" : formatCountdown(closesIn)}
              </div>
              <div className="font-mono text-[9px] text-[var(--text-dim)] mt-1 uppercase">
                {participant.todayFull ? "Day complete" : "Window left today"}
              </div>
            </div>
          </div>
          {/* Days Strip / Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[var(--text-dim)] m-0 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal" /> Month Activity Days ({days.length})
              </h3>
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-teal hover:underline font-mono cursor-pointer"
                >
                  View All Days
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/30 max-h-32 overflow-y-auto">
              {days.map((d) => {
                const selected = selectedDate === d.dateKey;
                const isDone = d.status === "done";
                const isPending = d.status === "today_pending";
                return (
                  <button
                    key={d.dateKey}
                    type="button"
                    onClick={() => setSelectedDate(selected ? null : d.dateKey)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
                      selected
                        ? "bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400/30"
                        : isDone
                        ? "bg-teal/15 text-teal border-teal/30 hover:bg-teal/25"
                        : isPending
                        ? "bg-amber/15 text-amber border-amber/30 hover:bg-amber/25"
                        : "bg-[var(--surface)] text-[var(--text-dim)] border-[var(--line)] hover:border-slate-600"
                    }`}
                  >
                    Day {d.day}
                    {isDone ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day View OR All-Days Breakdown */}
          {activeDay ? (
            <SingleDayDetailCard day={activeDay} />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm m-0">
                  All Days Breakdown ({completedDaysCount} full days completed)
                </h3>
                <div className="text-xs text-[var(--text-dim)] font-mono">
                  Dose Accuracy: <b className="text-teal">{doseAccuracyPct}%</b> ({totalDoseCorrect}/{totalDoseAttempted})
                </div>
              </div>

              {days.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--text-dim)] border border-[var(--line)] rounded-xl">
                  No logged activity days for this month.
                </div>
              ) : (
                <div className="space-y-3">
                  {days.map((d) => (
                    <SingleDayDetailCard key={d.dateKey} day={d} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)]/40 flex items-center justify-between">
          <div className="text-xs text-[var(--text-dim)] font-mono">
            Last active: {formatDetailTime(participant.lastActivityAt)}
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function SingleDayDetailCard({ day }: { day: ParticipantDayDetail }) {
  const isDone = day.status === "done";
  const isPending = day.status === "today_pending";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-3 shadow-sm">
      {/* Day Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[var(--text)]">
            Day {day.day} ({day.dateKey})
          </span>
          {day.isPuzzleDay && (
            <span className="px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
              Puzzle Day
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full font-mono text-[10.5px] font-semibold border ${
              isDone
                ? "bg-teal/15 text-teal border-teal/30"
                : isPending
                ? "bg-amber/15 text-amber border-amber/30"
                : "bg-pink/10 text-pink border-pink/25"
            }`}
          >
            {isDone
              ? "Done (All 5 Pillars)"
              : isPending
              ? "In Progress"
              : "Missed"}
          </span>
          <span className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-1">
            <Clock className="w-3 h-3 text-purple" /> {formatSeconds(day.dayTimeSpentSec)}
          </span>
        </div>
      </div>

      {day.completedAt && (
        <div className="text-[11px] font-mono text-[var(--text-dim)]">
          Completed at: <span className="text-[var(--text)]">{formatDetailTime(day.completedAt)}</span>
        </div>
      )}

      {/* 2-Column Grid for Daily Dose & FunBrain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Daily Dose Card */}
        <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-display font-bold text-xs text-[var(--text)]">
              <HelpCircle className="w-3.5 h-3.5 text-teal" /> Daily Dose (Class {day.dose.classLevel})
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                day.dose.completed
                  ? "bg-teal/20 text-teal"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {day.dose.completed ? "Completed" : "Incomplete"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center py-1 bg-[var(--bg)]/50 rounded-md border border-[var(--line)]">
            <div>
              <div className="text-[9px] font-mono uppercase text-teal">Correct</div>
              <div className="font-display font-bold text-sm text-teal">{day.dose.correct}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-pink">Wrong</div>
              <div className="font-display font-bold text-sm text-pink">{day.dose.wrong}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-purple">Accuracy</div>
              <div className="font-display font-bold text-sm text-purple-300">{day.dose.pct}%</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)] font-mono pt-1">
            <span>Total Qs: {day.dose.total}</span>
            <span>Time: {formatSeconds(day.dose.timeSpentSec)}</span>
          </div>
        </div>

        {/* FunBrain Card */}
        <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-display font-bold text-xs text-[var(--text)]">
              <Zap className="w-3.5 h-3.5 text-amber" /> FunBrain Sprint
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                day.funbrain.completed
                  ? "bg-amber/20 text-amber"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {day.funbrain.completed ? "Completed" : "Incomplete"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center py-1 bg-[var(--bg)]/50 rounded-md border border-[var(--line)]">
            <div>
              <div className="text-[9px] font-mono uppercase text-amber">Score</div>
              <div className="font-display font-bold text-sm text-amber">{day.funbrain.score}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-teal">Correct</div>
              <div className="font-display font-bold text-sm text-teal">{day.funbrain.correct}</div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-pink">Wrong</div>
              <div className="font-display font-bold text-sm text-pink">{day.funbrain.wrong}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)] font-mono pt-1">
            <span>Max Combo: {day.funbrain.combo}x</span>
            <span>Time: {formatSeconds(day.funbrain.timeSpentSec)}</span>
          </div>
        </div>
      </div>

      {/* Habits & Integrity Row */}
      <div className="p-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text)]">Habits Done:</span>
          <span className="font-mono text-teal">
            {day.habitsDone}/{day.totalHabits}
          </span>
          {day.habitsList.length > 0 && (
            <span className="text-[11px] text-[var(--text-dim)] truncate max-w-xs">
              ({day.habitsList.join(", ")})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={day.pledgeAM ? "text-teal" : "text-[var(--text-dim)]"}>
            AM Pledge: {day.pledgeAM ? "✓" : "✗"}
          </span>
          <span className={day.pledgePM ? "text-teal" : "text-[var(--text-dim)]"}>
            PM Pledge: {day.pledgePM ? "✓" : "✗"}
          </span>
          <span className={day.puzzleCompleted ? "text-purple-300" : "text-[var(--text-dim)]"}>
            Puzzle: {day.puzzleCompleted ? "✓" : "✗"}
          </span>
        </div>
      </div>
    </div>
  );
}
