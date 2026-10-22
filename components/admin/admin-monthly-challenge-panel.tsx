"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getChallengeMonthMeta,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  MONTHLY_CHALLENGE_WINNER_SLOTS,
} from "@/lib/challenge/monthly";
import type {
  ChallengeAdminSummary,
  ChallengeParticipantRow,
} from "@/lib/db/monthly-challenge";
import { useAppClock } from "@/lib/clock/app-clock";
import { cn, formatRdm, realTodayKey, todayKey } from "@/lib/utils";

import { AdminLearnerDetailModal } from "@/components/admin/admin-learner-detail-modal";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type FilterId =
  | "all"
  | "enrolled"
  | "streak"
  | "submitted"
  | "verified"
  | "winners";

function currentMonthKey(): string {
  return getChallengeMonthMeta(realTodayKey()).monthKey;
}

function monthOptions(): string[] {
  const current = currentMonthKey();
  const [y, m] = current.split("-").map(Number) as [number, number];
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    let month = m - i;
    let year = y;
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    out.push(`${year}-${String(month).padStart(2, "0")}`);
  }
  return out;
}

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  try {
    return (
      new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }) + " IST"
    );
  } catch {
    return iso;
  }
}





function StatusPill({
  ok,
  label,
  tone = "neutral",
}: {
  ok?: boolean;
  label: string;
  tone?: "ok" | "warn" | "bad" | "neutral" | "win";
}) {
  const styles =
    tone === "ok" || ok === true
      ? "bg-teal/15 text-teal border-teal/30"
      : tone === "win"
        ? "bg-amber/15 text-amber border-amber/35"
        : tone === "warn"
          ? "bg-amber/10 text-amber border-amber/25"
          : tone === "bad" || ok === false
            ? "bg-pink/10 text-pink border-pink/25"
            : "bg-[var(--surface-2)] text-[var(--text-dim)] border-[var(--line)]";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[10px] font-semibold",
        styles,
      )}
    >
      {label}
    </span>
  );
}

export function AdminMonthlyChallengePanel() {
  const { todayKey: clockToday, ready: clockReady } = useAppClock();
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [summary, setSummary] = useState<ChallengeAdminSummary | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipantRow[]>(
    [],
  );
  const [filter, setFilter] = useState<FilterId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number | "all">(25);
  const [page, setPage] = useState(1);
  const [selectedLearner, setSelectedLearner] = useState<ChallengeParticipantRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ monthKey });
        qs.set("dateKey", clockToday || todayKey());
        const res = await fetch(`/api/admin/challenge?${qs}`, {
          credentials: "include",
        });
        const data = (await res.json()) as {
          error?: string;
          summary?: ChallengeAdminSummary;
          participants?: ChallengeParticipantRow[];
        };
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setSummary(data.summary ?? null);
        setParticipants(data.participants ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [monthKey, clockToday],
  );

  useEffect(() => {
    if (!clockReady) return;
    void load();
  }, [load, clockReady]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const filtered = useMemo(() => {
    let list = participants;
    switch (filter) {
      case "all":
        break;
      case "enrolled":
        list = list.filter((p) => p.enrolledAt);
        break;
      case "streak":
        list = list.filter((p) => p.streakMet);
        break;
      case "submitted":
        list = list.filter((p) => p.submitted);
        break;
      case "verified":
        list = list.filter((p) => p.verifiedCorrect);
        break;
      case "winners":
        list = list.filter((p) => p.isWinner);
        break;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.userId.toLowerCase().includes(q),
      );
    }
    return list;
  }, [participants, filter, searchQuery]);

  const totalPages = pageSize === "all" ? 1 : Math.ceil(filtered.length / (pageSize as number));
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const paginated = useMemo(() => {
    if (pageSize === "all") return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const patch = useCallback(
    async (body: Record<string, unknown>, successMsg: string) => {
      setBusyId(String(body.entryId ?? body.action ?? "x"));
      setError(null);
      try {
        const res = await fetch("/api/admin/challenge", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as {
          error?: string;
          summary?: ChallengeAdminSummary;
          participants?: ChallengeParticipantRow[];
        };
        if (!res.ok) throw new Error(data.error || "Update failed");
        if (data.summary) setSummary(data.summary);
        if (data.participants) setParticipants(data.participants);
        else await load();
        setToast(successMsg);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "enrolled", label: "Enrolled" },
    { id: "streak", label: `${MONTHLY_CHALLENGE_STREAK_REQUIRED}+ streak` },
    { id: "submitted", label: "Submitted" },
    { id: "verified", label: "Verified" },
    { id: "winners", label: "Winners" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-lg">Monthly Challenge</h2>
          <p className="text-[12.5px] text-[var(--text-dim)] mt-1 max-w-xl leading-relaxed">
            Track enrollments, {MONTHLY_CHALLENGE_STREAK_REQUIRED}-day full
            journey streaks (all 5 daily tasks), final-puzzle submissions, verify answers, and announce
            up to {MONTHLY_CHALLENGE_WINNER_SLOTS} winners (first verified by
            submit time).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] text-[var(--text-dim)] font-mono">
            Month
            <select
              value={monthKey}
              onChange={(e) => setMonthKey(e.target.value)}
              className="ml-2 rounded-lg bg-[var(--surface-2)] border border-[var(--line)] px-2.5 py-1.5 text-sm text-[var(--text)]"
            >
              {monthOptions().map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => void load()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-pink border border-pink/30 bg-pink/10 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      {toast && (
        <div className="text-sm text-teal border border-teal/30 bg-teal/10 rounded-xl px-3 py-2">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(
          [
            ["Enrolled", summary?.enrolled],
            [`Streak ≥${MONTHLY_CHALLENGE_STREAK_REQUIRED}`, summary?.streakMet],
            ["Submitted", summary?.submitted],
            ["Verified", summary?.verifiedCorrect],
            [
              "Winners",
              summary
                ? `${summary.winners}/${summary.winnerSlots}`
                : null,
            ],
            ["As of", summary?.asOfDate ?? null],
          ] as const
        ).map(([label, value]) => (
          <Card key={label} className="p-3.5">
            <div className="font-mono text-[10px] text-[var(--text-dim)] uppercase tracking-wide">
              {label}
            </div>
            <div className="font-display font-bold text-xl mt-1 tabular-nums">
              {loading && value == null ? "…" : (value ?? "—")}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display font-bold text-[15px]">
            Winner control room
          </h3>
          <Button
            type="button"
            variant="primary"
            disabled={loading || busyId !== null}
            onClick={() => {
              if (
                !window.confirm(
                  `Announce winners for ${monthKey}? This sets is_winner on the first ${MONTHLY_CHALLENGE_WINNER_SLOTS} verified-correct submissions (earliest submit time) and clears other winner flags.`,
                )
              ) {
                return;
              }
              void patch(
                { action: "declare_winners", monthKey },
                "Winners announced — public board updated",
              );
            }}
          >
            Announce first {MONTHLY_CHALLENGE_WINNER_SLOTS} verified
          </Button>
        </div>
        <p className="text-[12px] text-[var(--text-dim)] leading-relaxed m-0">
          Workflow: review each final answer → mark <b>Verified correct</b> →
          either promote individuals to Winner, or use{" "}
          <b>Announce first {MONTHLY_CHALLENGE_WINNER_SLOTS} verified</b> for a
          fair timestamp race. The learner-facing challenge board only shows{" "}
          <code className="text-teal">is_winner</code> rows.
        </p>
      </Card>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors cursor-pointer",
                filter === f.id
                  ? "border-teal bg-teal/15 text-teal"
                  : "border-[var(--line)] text-[var(--text-dim)] hover:border-teal/40",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search learners by name or ID…"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-teal/50"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {/* Table Top Pagination Bar */}
        <div className="px-4 py-2.5 bg-[var(--surface-2)]/60 border-b border-[var(--line)] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[var(--text-dim)]">
          <div>
            Showing <b className="text-[var(--text)]">{filtered.length === 0 ? 0 : (currentPage - 1) * (pageSize === "all" ? filtered.length : pageSize) + 1}–{pageSize === "all" ? filtered.length : Math.min(filtered.length, currentPage * pageSize)}</b> of <b className="text-[var(--text)]">{filtered.length}</b> learners
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === "all" ? "all" : Number(e.target.value);
                  setPageSize(val);
                  setPage(1);
                }}
                className="rounded-md bg-[var(--surface)] border border-[var(--line)] px-2 py-1 text-xs text-[var(--text)]"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All ({filtered.length})</option>
              </select>
            </label>
            {pageSize !== "all" && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="!p-1.5 !h-auto"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="!p-1.5 !h-auto"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--line)] font-mono text-[10px] uppercase tracking-wide text-[var(--text-dim)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">Learner (Tap for Full Records)</th>
                <th
                  className="px-3 py-2.5 font-medium"
                  title="Consecutive full days completed / 15 required for final puzzle"
                >
                  Streak (done / need)
                </th>
                <th
                  className="px-3 py-2.5 font-medium"
                  title="All full days completed this month (dates listed)"
                >
                  Days completed
                </th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Submitted</th>
                <th className="px-3 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-[var(--text-dim)]"
                  >
                    Loading participants…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-8 text-center text-[var(--text-dim)]"
                  >
                    No participants match this filter or search query.
                  </td>
                </tr>
              )}
              {!loading &&
                paginated.map((p) => {
                  const open = expandedId === p.userId;
                  return (
                    <tr key={p.userId} className="align-top hover:bg-teal/5 group transition-colors border-b border-[var(--line)]">
                        <td
                          className="px-3 py-3 cursor-pointer"
                          onClick={() => setSelectedLearner(p)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center font-display font-bold text-xs text-purple-300 group-hover:border-teal/50 transition-colors shrink-0">
                              {p.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-[var(--text)] group-hover:text-teal transition-colors flex items-center gap-1">
                                {p.displayName}
                                <span className="text-[10px] font-normal text-teal opacity-0 group-hover:opacity-100 transition-opacity">
                                  (tap details)
                                </span>
                              </div>
                              <div className="font-mono text-[10px] text-[var(--text-dim)] mt-0.5">
                                {p.userId.slice(0, 8)}…
                              </div>
                            </div>
                          </div>
                          {p.stakeRdm > 0 && (
                            <div className="text-[10px] text-amber mt-1">
                              Stake {formatRdm(p.stakeRdm)} RDM
                            </div>
                          )}
                        </td>
                        <td
                          className="px-3 py-3 tabular-nums cursor-pointer"
                          onClick={() => setSelectedLearner(p)}
                        >
                          <div
                            className={cn(
                              "font-bold",
                              p.streakMet ? "text-teal" : "text-[var(--text)]",
                            )}
                          >
                            {p.bestStretch} of {p.streakRequired} days
                          </div>
                        </td>
                        <td
                          className="px-3 py-3 tabular-nums cursor-pointer"
                          onClick={() => setSelectedLearner(p)}
                        >
                          <div className="font-bold text-[var(--text)]">
                            {p.daysCompleted}{" "}
                            {p.daysCompleted === 1 ? "day" : "days"} done
                          </div>
                        </td>
                        <td
                          className="px-3 py-3 cursor-pointer"
                          onClick={() => setSelectedLearner(p)}
                        >
                          <div className="flex flex-wrap gap-1">
                            {p.enrolledAt ? (
                              <StatusPill ok label="Enrolled" tone="ok" />
                            ) : (
                              <StatusPill label="No enroll row" tone="warn" />
                            )}
                            {p.streakMet && (
                              <StatusPill ok label="Streak OK" tone="ok" />
                            )}
                            {p.submitted && (
                              <StatusPill ok label="Submitted" tone="ok" />
                            )}
                            {p.verifiedCorrect && (
                              <StatusPill ok label="Verified" tone="ok" />
                            )}
                            {p.isWinner && (
                              <StatusPill label="Winner" tone="win" />
                            )}
                          </div>
                        </td>
                        <td
                          className="px-3 py-3 text-[11px] text-[var(--text-dim)] whitespace-nowrap cursor-pointer"
                          onClick={() => setSelectedLearner(p)}
                        >
                          {formatWhen(p.submittedAt)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-1.5 min-w-[160px]">
                            {p.submitted && p.entryId ? (
                              <>
                                <button
                                  type="button"
                                  className="text-left text-[11px] text-teal hover:underline cursor-pointer"
                                  onClick={() =>
                                    setExpandedId(open ? null : p.userId)
                                  }
                                >
                                  {open ? "Hide answer" : "Review answer"}
                                </button>
                                {open && (
                                  <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-2 text-[11px] text-[var(--text)] whitespace-pre-wrap max-w-[280px]">
                                    {p.answer || "—"}
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    className="!px-2.5 !py-1.5 !text-[11px]"
                                    disabled={busyId === p.entryId}
                                    onClick={() =>
                                      void patch(
                                        {
                                          action: "verify",
                                          entryId: p.entryId,
                                          verifiedCorrect: !p.verifiedCorrect,
                                        },
                                        p.verifiedCorrect
                                          ? "Cleared verification"
                                          : "Marked verified correct",
                                      )
                                    }
                                  >
                                    {p.verifiedCorrect
                                      ? "Unverify"
                                      : "Verify correct"}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={p.isWinner ? "ghost" : "am"}
                                    className="!px-2.5 !py-1.5 !text-[11px]"
                                    disabled={
                                      busyId === p.entryId ||
                                      (!p.verifiedCorrect && !p.isWinner)
                                    }
                                    onClick={() =>
                                      void patch(
                                        {
                                          action: "winner",
                                          entryId: p.entryId,
                                          isWinner: !p.isWinner,
                                        },
                                        p.isWinner
                                          ? "Removed winner"
                                          : "Announced as winner",
                                      )
                                    }
                                  >
                                    {p.isWinner
                                      ? "Remove winner"
                                      : "Make winner"}
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <span className="text-[11px] text-[var(--text-dim)] italic">
                                {p.streakMet
                                  ? "Eligible — awaiting puzzle day"
                                  : "Building streak"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pop-Up Modal for Learner Records */}
      <AdminLearnerDetailModal
        participant={selectedLearner}
        onClose={() => setSelectedLearner(null)}
      />
    </div>
  );
}
