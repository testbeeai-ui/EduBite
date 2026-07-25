"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Lock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppClock } from "@/lib/clock/app-clock";
import {
  buildChallengeProgress,
  challengePuzzlePrompt,
  firstWeekdayOfMonth,
  formatChallengeLongDate,
  getChallengeMonthMeta,
  getEntryState,
  getMonthlyChallengeEntryStakeRdm,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  getMonthlyChallengeTargetRdm,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
  isEnrolledForChallengeMonth,
  type ChallengeCalendarDay,
  type ChallengeDayStatus,
} from "@/lib/challenge/monthly";
import {
  formatCountdown,
  formatCountdownLong,
  msUntilDateEnd,
  msUntilDateStart,
} from "@/lib/puzzles/daily";
import { useGame } from "@/lib/store/game-provider";
import { cn, formatRdm } from "@/lib/utils";
import { MonthlyChallengeInfoModal } from "@/components/modals/monthly-challenge-info-modal";

type WinnerSlot = { name: string; time: string } | null;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthlyChallengeView() {
  const {
    state,
    setActiveView,
    markChallengePuzzleSubmitted,
  } = useGame();
  const { todayKey } = useAppClock();

  const meta = useMemo(() => getChallengeMonthMeta(todayKey), [todayKey]);
  const targetRdm = getMonthlyChallengeTargetRdm();
  const entryStakeRdm = getMonthlyChallengeEntryStakeRdm();
  const entryState = getEntryState({
    rdm: state.rdm,
    dateKey: todayKey,
    enrolledMonthKey: state.challengeEnrolledMonthKey,
    enrolledMonths: state.challengeEnrolledMonths,
  });

  const progress = useMemo(
    () => buildChallengeProgress(state, todayKey),
    [state, todayKey],
  );

  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [winners, setWinners] = useState<WinnerSlot[]>(
    Array.from({ length: MONTHLY_CHALLENGE_WINNER_SLOTS }, () => null),
  );

  const alreadySubmitted =
    state.challengePuzzleSubmittedMonthKey === meta.monthKey ||
    Boolean(submitOk);

  const enrolled = isEnrolledForChallengeMonth(
    meta.monthKey,
    state.challengeEnrolledMonthKey,
    state.challengeEnrolledMonths,
  );

  const loadWinners = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/challenge/monthly?monthKey=${encodeURIComponent(meta.monthKey)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        winners?: WinnerSlot[];
        submitted?: boolean;
      };
      if (Array.isArray(data.winners)) {
        const slots = [...data.winners];
        while (slots.length < MONTHLY_CHALLENGE_WINNER_SLOTS) slots.push(null);
        setWinners(slots.slice(0, MONTHLY_CHALLENGE_WINNER_SLOTS));
      }
      if (
        data.submitted &&
        state.challengePuzzleSubmittedMonthKey !== meta.monthKey
      ) {
        markChallengePuzzleSubmitted(meta.monthKey);
      }
    } catch {
      // Board stays empty if offline / table missing
    }
  }, [
    markChallengePuzzleSubmitted,
    meta.monthKey,
    state.challengePuzzleSubmittedMonthKey,
  ]);

  useEffect(() => {
    if (entryState !== "open" || !enrolled) return;
    void loadWinners();
  }, [entryState, enrolled, loadWinners]);

  const firstWeekday = firstWeekdayOfMonth(`${meta.monthKey}-01`);
  const lastDayLabel = formatChallengeLongDate(meta.lastDayKey);
  const streak = progress.currentStretch;
  const streakMet = progress.streakMet;
  const onPuzzleDay = progress.onPuzzleDay;
  const puzzlePrompt = challengePuzzlePrompt(meta);

  const submitAnswer = async () => {
    if (!answer.trim() || submitting || alreadySubmitted) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(null);
    try {
      const res = await fetch("/api/challenge/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: answer.trim(),
          monthKey: meta.monthKey,
          dateKey: todayKey,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not submit entry");
        return;
      }
      markChallengePuzzleSubmitted(meta.monthKey);
      setSubmitOk(
        data.message ??
          "Entry recorded. Edubite will verify and notify winners on WhatsApp and email.",
      );
      void loadWinners();
    } catch {
      setSubmitError("Network error — try again");
    } finally {
      setSubmitting(false);
    }
  };

  if (entryState !== "open") {
    return (
      <LockedChallengeScreen
        entryState={entryState}
        rdm={state.rdm}
        nextEntryOpensLabel={meta.nextEntryOpensLabel}
        onBack={() => setActiveView("home")}
      />
    );
  }

  // Waiting for enroll from the home card "Enter Challenge" click.
  if (!enrolled) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-10 h-10 mx-auto rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-purple-300 animate-pulse" />
        </div>
        <p className="text-sm text-[var(--text-dim)] m-0">Opening challenge…</p>
        <Button variant="ghost" onClick={() => setActiveView("home")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[760px] mx-auto space-y-4 sm:space-y-5 pb-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 justify-center mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--purple)]" />
          <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--purple)] font-bold">
            Monthly Challenge
          </span>
        </div>
        <h1 className="font-display font-extrabold text-[26px] sm:text-[36px] leading-tight m-0">
          The <span className="text-[var(--purple)]">{meta.monthLabel} {meta.year}</span>{" "}
          Challenge
        </h1>
        <p className="text-[var(--text-dim)] text-sm max-w-[520px] mx-auto mt-2 leading-relaxed">
          Complete your full learning day every day — all 5 tasks on Day N (Daily
          Dose, FunBrain, Puzzle, Habits, and both Pledges) — for a minimum{" "}
          {MONTHLY_CHALLENGE_STREAK_REQUIRED}‑day stretch without a break. Then
          crack the final puzzle when it opens on the last day of the month.
        </p>
      </div>

      <ChallengeCard
        icon="📋"
        title="How it works"
        action={
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(127,119,221,0.18)] text-purple-300 hover:bg-[rgba(127,119,221,0.3)] hover:text-purple-200 border border-[rgba(127,119,221,0.35)] transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Learn How
          </button>
        }
      >
        <RuleStep
          n={1}
          title={`Build your ${MONTHLY_CHALLENGE_STREAK_REQUIRED}‑day streak`}
          body={`Finish the whole Day card every day — all 5 dots (Daily Dose, FunBrain, Puzzle, Habits, AM+PM Pledges) — for at least ${MONTHLY_CHALLENGE_STREAK_REQUIRED} consecutive calendar days. Missing any task before you hit ${MONTHLY_CHALLENGE_STREAK_REQUIRED} resets the streak.`}
        />
        <RuleStep
          n={2}
          title="Unlock the final puzzle"
          body={`Once your ${MONTHLY_CHALLENGE_STREAK_REQUIRED}‑day stretch is complete, you're eligible for the final puzzle — it opens for everyone on ${lastDayLabel}, the last day of the challenge.`}
        />
        <RuleStep
          n={3}
          title="Be first, be right"
          body={`The first ${MONTHLY_CHALLENGE_WINNER_SLOTS} verified-correct answers win — ranked by server submit time (shown on the timer / winners board), not by score. Edubite notifies winners on WhatsApp and email.`}
        />
      </ChallengeCard>

      <ChallengeCard icon="🔥" title="Your streak this month">
        <div className="flex items-center gap-3 rounded-[14px] border border-[rgba(127,119,221,0.5)] bg-[rgba(127,119,221,0.16)] px-4 py-3.5 mb-4">
          <span className="text-[22px] shrink-0">{streakMet ? "🎉" : "🔥"}</span>
          <div>
            <b className="block font-display text-[13.5px] text-[var(--purple)] mb-0.5">
              {streakMet
                ? `${MONTHLY_CHALLENGE_STREAK_REQUIRED}‑day streak requirement met`
                : `${streak} of ${MONTHLY_CHALLENGE_STREAK_REQUIRED} days completed`}
            </b>
            <p className="m-0 text-[11.5px] text-[var(--text-dim)] leading-snug">
              {streakBannerCopy({
                streakMet,
                onPuzzleDay,
                puzzleOpen: progress.puzzleOpen,
                alreadySubmitted,
                lastDayLabel,
                lastDay: meta.lastDay,
                monthLabel: meta.monthLabel,
              })}
            </p>
          </div>
        </div>

        <ChallengeTimerSection
          todayKey={todayKey}
          lastDayKey={meta.lastDayKey}
          lastDayLabel={lastDayLabel}
          onPuzzleDay={onPuzzleDay}
          alreadySubmitted={alreadySubmitted}
          activityDays={progress.calendar.filter((d) => d.status === "done")}
        />

        <div className="flex items-center justify-between mb-2 font-mono text-[11px] text-[var(--text-dim)]">
          <span>Current stretch</span>
          <span>
            <b className="text-[var(--purple)] text-[13px]">{streak}</b> /{" "}
            {MONTHLY_CHALLENGE_STREAK_REQUIRED} days required
          </span>
        </div>
        <div className="h-[7px] rounded-full bg-white/[0.08] overflow-hidden mb-5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5850B8] to-[var(--purple)] transition-[width] duration-500"
            style={{
              width: `${Math.min(100, (streak / MONTHLY_CHALLENGE_STREAK_REQUIRED) * 100)}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-2">
          {WEEKDAYS.map((d) => (
            <span
              key={d}
              className="text-center font-mono text-[9.5px] text-[#5A6172] tracking-wide"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstWeekday }).map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square invisible" />
          ))}
          {progress.calendar.map((day) => {
            const isToday = day.dateKey === todayKey;
            return (
              <div
                key={day.dateKey}
                className={cn(
                  "aspect-square rounded-[10px] flex flex-col items-center justify-center text-[11px] font-bold relative border border-transparent",
                  calendarCellClass(day.status, day.isPuzzleDay, progress.puzzleOpen),
                  isToday && "shadow-[0_0_0_2px_var(--amber)]",
                )}
              >
                {day.day}
                {day.isPuzzleDay ? (
                  <span className="absolute bottom-0.5 text-[9px]">
                    {progress.puzzleOpen ? "🧩" : "🔒"}
                  </span>
                ) : day.status === "done" && day.pct != null ? (
                  <span className="font-mono text-[7px] font-bold opacity-85 mt-px">
                    {day.pct}%
                  </span>
                ) : day.status === "missed" ? (
                  <span className="font-mono text-[7px] font-bold mt-px">✕</span>
                ) : day.status === "today_pending" ? (
                  <span className="font-mono text-[7px] font-bold opacity-70 mt-px">
                    ·
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-3.5">
          <LegendSwatch color="bg-[var(--purple)]" label="Full day done" />
          <LegendSwatch
            color="bg-[rgba(212,83,126,0.35)] border border-[var(--pink)]"
            label="Missed"
          />
          <LegendSwatch
            color="bg-[var(--surface-2)] border border-[var(--line)]"
            label="Upcoming"
          />
          <LegendSwatch
            color="bg-gradient-to-br from-[var(--purple)] to-[#5850B8]"
            label={`Puzzle day (${meta.lastDay}${ordinal(meta.lastDay)})`}
          />
        </div>
      </ChallengeCard>

      <ChallengeCard icon="🧩" title="Final puzzle">
        {!onPuzzleDay ? (
          <div className="flex items-center gap-3.5 px-0.5 py-1.5">
            <div className="w-[46px] h-[46px] rounded-[14px] bg-[#252C37] flex items-center justify-center text-xl shrink-0">
              🔒
            </div>
            <p className="m-0 text-[12.5px] text-[var(--text-dim)] leading-relaxed">
              <b className="block font-display text-[14px] text-[var(--text)] mb-1">
                Opens {lastDayLabel}
              </b>
              The puzzle stays locked for every participant — including those
              who&apos;ve already completed their {MONTHLY_CHALLENGE_STREAK_REQUIRED}
              ‑day stretch — until 12:00 AM on the last day of the challenge.
            </p>
          </div>
        ) : !streakMet ? (
          <div className="flex items-center gap-3.5 px-0.5 py-1.5">
            <div className="w-[46px] h-[46px] rounded-[14px] bg-[#252C37] flex items-center justify-center text-xl shrink-0">
              🔒
            </div>
            <p className="m-0 text-[12.5px] text-[var(--text-dim)] leading-relaxed">
              <b className="block font-display text-[14px] text-[var(--text)] mb-1">
                Not eligible this month
              </b>
              You needed a {MONTHLY_CHALLENGE_STREAK_REQUIRED}‑day stretch of
              full journey days (all 5 tasks) to unlock the final puzzle. Keep
              going next month.
            </p>
          </div>
        ) : alreadySubmitted ? (
          <div className="rounded-xl border border-[rgba(29,158,117,0.4)] bg-[rgba(29,158,117,0.16)] px-3.5 py-3 text-xs text-[var(--teal)] leading-relaxed">
            Your entry is recorded. Edubite will verify correctness and notify
            winners on WhatsApp and email. Names appear on the board once
            winners are declared.
          </div>
        ) : (
          <div>
            <div className="bg-[var(--surface-2)] border border-[rgba(255,255,255,0.14)] rounded-[14px] px-4 py-3.5 text-[12.5px] text-[var(--text-dim)] leading-relaxed mb-3.5">
              <b className="block font-display text-[13px] text-[var(--text)] mb-1.5">
                🧩 Today&apos;s puzzle
              </b>
              {puzzlePrompt}
            </div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              placeholder="Type your answer here..."
              className="w-full bg-[var(--surface)] border border-[rgba(255,255,255,0.14)] rounded-xl px-3.5 py-3 text-[13px] text-[var(--text)] min-h-[70px] resize-y mb-3 disabled:opacity-60"
            />
            <button
              type="button"
              disabled={submitting || !answer.trim()}
              onClick={() => void submitAnswer()}
              className="w-full rounded-[13px] py-3 font-display font-bold text-sm text-white bg-gradient-to-br from-[var(--purple)] to-[#5850B8] shadow-[0_10px_24px_-8px_rgba(127,119,221,0.5)] disabled:bg-[#252C37] disabled:text-[#5A6172] disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : "Submit answer"}
            </button>
            {submitError && (
              <div className="mt-3 rounded-xl border border-[rgba(212,83,126,0.4)] bg-[rgba(212,83,126,0.12)] px-3.5 py-3 text-xs text-[var(--pink)]">
                {submitError}
              </div>
            )}
            {submitOk && (
              <div className="mt-3 rounded-xl border border-[rgba(29,158,117,0.4)] bg-[rgba(29,158,117,0.16)] px-3.5 py-3 text-xs text-[var(--teal)]">
                {submitOk}
              </div>
            )}
          </div>
        )}
      </ChallengeCard>

      <ChallengeCard icon="🏆" title="First 5 winners">
        <p className="m-0 mb-3 text-[11.5px] text-[var(--text-dim)] leading-relaxed">
          Ranked by <b className="text-[var(--text)]">server submit time</b> among
          verified-correct answers — earliest timestamp wins. Not by score.
          You&apos;ll be notified on WhatsApp and email.
        </p>
        <div>
          {winners.map((w, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-t border-[var(--line)] first:border-t-0"
            >
              <div
                className={cn(
                  "w-[26px] h-[26px] rounded-full border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center font-mono text-[11px] font-bold text-[#5A6172] shrink-0",
                  w && "bg-[var(--purple)] text-white border-[var(--purple)]",
                )}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                {w ? (
                  <>
                    <p className="m-0 text-[12.5px] font-bold">{w.name}</p>
                    <p className="m-0 text-[10.5px] text-[#5A6172]">{w.time}</p>
                  </>
                ) : (
                  <span className="text-xs text-[#5A6172] italic">
                    — Awaiting entry —
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ChallengeCard>

      <ChallengeCard icon="📜" title="Terms & Conditions" mutedIcon>
        <div className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-4 py-3.5 space-y-2.5 text-[11px] text-[#5A6172] leading-relaxed">
          <p className="m-0">
            <b className="text-[var(--text-dim)]">1.</b> To qualify for the final
            puzzle, you must complete the full learning day — all 5 tasks on your
            Day card (Daily Dose, FunBrain, Puzzle, Habits, and AM+PM Pledges) —
            for at least {MONTHLY_CHALLENGE_STREAK_REQUIRED} consecutive calendar
            days within the challenge window. Missing any task before reaching{" "}
            {MONTHLY_CHALLENGE_STREAK_REQUIRED} resets the streak.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">2.</b> The final puzzle opens to
            all eligible participants on {lastDayLabel}, the last day of the
            challenge.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">3.</b> The first 5 entries with
            the correct answer, as logged by our system record, will be declared
            winners. Edubite notifies winners via WhatsApp and email.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">4.</b> Winner names will be
            announced on the site along with their date and time of submission,
            for full transparency.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">5.</b> The Edubite system record
            of submission time and correctness is binding on all parties.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">6.</b> Entry stake — joining
            this month&apos;s challenge claims{" "}
            <b className="text-[var(--amber)]">
              {formatRdm(entryStakeRdm)} RDM
            </b>{" "}
            from your balance. That skin-in-the-game keeps the field serious:
            only committed learners race for the prizes. The stake is
            non-refundable once you enroll.
          </p>
          <p className="m-0">
            <b className="text-[var(--text-dim)]">7.</b> Valid for this month
            only. Enrollment covers the current calendar month. Next month is a
            new challenge — unlock again at {formatRdm(targetRdm)} RDM and pay a
            fresh {formatRdm(entryStakeRdm)} RDM stake during days 1–5.
          </p>
        </div>
      </ChallengeCard>

      <MonthlyChallengeInfoModal
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}

function formatActivityTime(iso: string | null): string {
  if (!iso) return "Completed";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return iso;
  }
}

function ChallengeTimerSection({
  todayKey: clockToday,
  lastDayKey,
  lastDayLabel,
  onPuzzleDay,
  alreadySubmitted,
  activityDays,
}: {
  todayKey: string;
  lastDayKey: string;
  lastDayLabel: string;
  onPuzzleDay: boolean;
  alreadySubmitted: boolean;
  activityDays: ChallengeCalendarDay[];
}) {
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const opensIn = msUntilDateStart(lastDayKey, now);
  const closesIn = msUntilDateEnd(lastDayKey, now);

  let timerLabel: string;
  let timerValue: string;
  let timerHint: string;

  if (alreadySubmitted) {
    timerLabel = "Your entry is locked";
    timerValue = "Submitted";
    timerHint =
      "Winner rank uses the server timestamp from your submit — earliest verified-correct wins.";
  } else if (onPuzzleDay) {
    timerLabel = "Puzzle day · submit window";
    timerValue = formatCountdown(closesIn);
    timerHint =
      "Live countdown to end of puzzle day. Among correct answers, earlier server time ranks higher.";
  } else if (clockToday > lastDayKey) {
    timerLabel = "Puzzle window";
    timerValue = "Closed";
    timerHint = "This month’s final puzzle window has ended.";
  } else {
    timerLabel = "Final puzzle opens";
    timerValue = formatCountdownLong(opensIn);
    timerHint = `Opens ${lastDayLabel} at 12:00 AM — first ${MONTHLY_CHALLENGE_WINNER_SLOTS} verified-correct by server time win.`;
  }

  return (
    <div className="mb-5 space-y-3">
      <div className="rounded-[14px] border border-[rgba(232,196,104,0.35)] bg-[rgba(232,196,104,0.08)] px-4 py-3.5">
        <div className="font-mono text-[10px] tracking-wider uppercase text-[var(--gold)] mb-1">
          {timerLabel}
        </div>
        <div className="font-display font-extrabold text-[28px] tabular-nums text-[var(--text)] leading-none tracking-wide">
          {timerValue}
        </div>
        <p className="m-0 mt-2 text-[11px] text-[var(--text-dim)] leading-snug">
          {timerHint}
        </p>
      </div>

      <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-[10px] tracking-wider uppercase text-[var(--text-dim)]">
            Day-by-day activity
          </span>
          <span className="font-mono text-[10px] text-[var(--purple)]">
            {activityDays.length} full day
            {activityDays.length === 1 ? "" : "s"}
          </span>
        </div>
        {activityDays.length === 0 ? (
          <p className="m-0 text-[11.5px] text-[var(--text-dim)] leading-relaxed">
            Complete all 5 tasks today — this list grows one row per full day,
            with the time the day was finished.
          </p>
        ) : (
          <ul className="m-0 p-0 list-none space-y-1.5 max-h-40 overflow-y-auto">
            {activityDays.map((day) => (
              <li
                key={day.dateKey}
                className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1.5"
              >
                <span className="text-[12px] font-semibold text-[var(--text)]">
                  Day {day.day}
                  {day.isPuzzleDay ? " · Puzzle" : ""}
                </span>
                <span className="font-mono text-[10px] text-[var(--text-dim)] tabular-nums text-right">
                  {formatActivityTime(day.completedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function streakBannerCopy(args: {
  streakMet: boolean;
  onPuzzleDay: boolean;
  puzzleOpen: boolean;
  alreadySubmitted: boolean;
  lastDayLabel: string;
  lastDay: number;
  monthLabel: string;
}): string {
  if (args.alreadySubmitted) {
    return "Entry submitted — winners are notified by Edubite after verification.";
  }
  if (args.streakMet) {
    if (args.puzzleOpen) {
      return "The final puzzle is open — submit your answer below.";
    }
    if (args.onPuzzleDay) {
      return "Puzzle day is here, but eligibility could not be confirmed.";
    }
    return `Locked in — you're eligible for the final puzzle on ${args.lastDay} ${args.monthLabel}.`;
  }
  return "Complete all 5 tasks on today's Day card to grow your streak and unlock the final puzzle.";
}

function calendarCellClass(
  status: ChallengeDayStatus,
  isPuzzleDay: boolean,
  puzzleOpen: boolean,
): string {
  if (isPuzzleDay) {
    return puzzleOpen
      ? "bg-gradient-to-br from-[var(--purple)] to-[#5850B8] text-white"
      : "bg-[#252C37] text-[#5A6172] border-dashed border-[rgba(255,255,255,0.14)]";
  }
  switch (status) {
    case "upcoming":
      return "bg-[var(--surface-2)] text-[#5A6172] border-[var(--line)]";
    case "done":
      return "bg-[var(--purple)] text-white";
    case "missed":
      return "bg-[rgba(212,83,126,0.16)] text-[var(--pink)] border-[rgba(212,83,126,0.4)]";
    case "today_pending":
      return "bg-[var(--surface-2)] text-[var(--text)] border-[var(--amber)]";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function LockedChallengeScreen({
  entryState,
  rdm,
  nextEntryOpensLabel,
  onBack,
}: {
  entryState: "locked_rdm" | "locked_window";
  rdm: number;
  nextEntryOpensLabel: string;
  onBack: () => void;
}) {
  const targetRdm = getMonthlyChallengeTargetRdm();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-center space-y-5">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center">
        {entryState === "locked_rdm" ? (
          <Lock className="w-6 h-6 text-amber-400" />
        ) : (
          <Trophy className="w-6 h-6 text-purple-300" />
        )}
      </div>
      <div>
        <h1 className="font-display font-extrabold text-2xl m-0">
          {entryState === "locked_rdm"
            ? "Challenge locked"
            : "Entry window closed"}
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-2 leading-relaxed">
          {entryState === "locked_rdm"
            ? `Reach ${formatRdm(targetRdm)} RDM to unlock Monthly Challenge. You have ${formatRdm(rdm)} RDM. Entry stake is listed in Terms & Conditions.`
            : `Entry is only open on days 1–5. Once you enter, the challenge stays valid for the rest of that month. Next window: ${nextEntryOpensLabel}.`}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="primary" onClick={onBack}>
          Back to dashboard
        </Button>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-xs font-mono text-indigo-300 hover:text-indigo-200 underline cursor-pointer"
        >
          Learn how it works
        </button>
      </div>
      <MonthlyChallengeInfoModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

function ChallengeCard({
  icon,
  title,
  children,
  action,
  mutedIcon,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  mutedIcon?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--line)] bg-[var(--surface)] p-[22px]">
      <div className="flex items-center justify-between gap-2.5 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-[10px] flex items-center justify-center text-[15px] shrink-0",
              mutedIcon
                ? "bg-[var(--surface-2)] text-[var(--text-dim)]"
                : "bg-[rgba(127,119,221,0.16)] text-[var(--purple)]",
            )}
          >
            {icon}
          </div>
          <h3 className="font-display text-[15.5px] m-0">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function RuleStep({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-3.5 py-3.5 border-t border-[var(--line)] first:border-t-0 first:pt-0">
      <div className="w-7 h-7 rounded-full bg-[rgba(127,119,221,0.16)] text-[var(--purple)] font-mono font-bold text-[12.5px] flex items-center justify-center shrink-0">
        {n}
      </div>
      <div>
        <h4 className="font-display text-[13.5px] m-0 mb-1">{title}</h4>
        <p className="m-0 text-[12.5px] text-[var(--text-dim)] leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--text-dim)]">
      <span className={cn("w-[11px] h-[11px] rounded-[4px] shrink-0", color)} />
      {label}
    </div>
  );
}

function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
