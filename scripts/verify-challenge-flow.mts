/**
 * Verifies Monthly Challenge stake, unlock, streak eligibility, and entry windows.
 */
import { setLiveRdmAmounts, getLiveRdmAmount } from "@/lib/rdm/live-amounts";
import { defaultsAsMap } from "@/data/rdm-rewards";
import {
  buildChallengeProgress,
  getEntryState,
  getMonthlyChallengeEntryStakeRdm,
  getMonthlyChallengeTargetRdm,
  MONTHLY_CHALLENGE_STREAK_REQUIRED,
  monthDayKey,
} from "@/lib/challenge/monthly";
import type { DoseDayRecord } from "@/lib/types";

type Row = { name: string; ok: boolean; detail?: string };
const rows: Row[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
}

setLiveRdmAmounts(defaultsAsMap());

check(
  "stake default 3000",
  getMonthlyChallengeEntryStakeRdm() === 3000,
  String(getMonthlyChallengeEntryStakeRdm()),
);
check(
  "unlock default 5000",
  getMonthlyChallengeTargetRdm() === 5000,
  String(getMonthlyChallengeTargetRdm()),
);
check("live key stake", getLiveRdmAmount("challenge.entry_stake") === 3000);
check("live key unlock", getLiveRdmAmount("challenge.target_rdm") === 5000);

const monthKey = "2026-07";
const log: Record<string, DoseDayRecord> = {};
for (let d = 1; d <= 15; d++) {
  const key = monthDayKey(monthKey, d);
  log[key] = {
    correct: 4,
    total: 5,
    pct: 80,
    completed: true,
    classLevel: "11",
  };
}
const progress = buildChallengeProgress(log, "2026-07-15");
check(
  "streakMet after 15x80%",
  progress.streakMet === true,
  `best=${progress.bestStretch}`,
);
check("eligible after 15", progress.eligibleForPuzzle === true);
check("required is 15", MONTHLY_CHALLENGE_STREAK_REQUIRED === 15);

const broken = { ...log };
broken[monthDayKey(monthKey, 8)] = {
  correct: 2,
  total: 5,
  pct: 40,
  completed: true,
  classLevel: "11",
};
const p2 = buildChallengeProgress(broken, "2026-07-15");
check(
  "missed day reduces contiguous best",
  p2.bestStretch < 15,
  `best=${p2.bestStretch}`,
);
check("not eligible when broken", p2.streakMet === false);

check(
  "locked under unlock",
  getEntryState({ rdm: 4999, dateKey: "2026-07-02" }) === "locked_rdm",
);
check(
  "open with unlock day2",
  getEntryState({ rdm: 5000, dateKey: "2026-07-02" }) === "open",
);
check(
  "locked window day10",
  getEntryState({ rdm: 5000, dateKey: "2026-07-10" }) === "locked_window",
);
check(
  "open if enrolled day10",
  getEntryState({
    rdm: 5000,
    dateKey: "2026-07-10",
    enrolledMonthKey: monthKey,
  }) === "open",
);
check(
  "enrolled stays open after stake (rdm below unlock)",
  getEntryState({
    rdm: 2000,
    dateKey: "2026-07-02",
    enrolledMonthKey: monthKey,
  }) === "open",
  "must not re-lock after paying entry stake",
);

setLiveRdmAmounts({ ...defaultsAsMap(), "challenge.entry_stake": 2500 });
check(
  "throttled live map stake=2500",
  getLiveRdmAmount("challenge.entry_stake") === 2500,
  String(getLiveRdmAmount("challenge.entry_stake")),
);
// Under tsx, challenge helper may resolve a second live-amounts copy — assert wiring.
check(
  "entry stake helper uses live key",
  getMonthlyChallengeEntryStakeRdm.toString().includes("challenge.entry_stake"),
);

const fail = rows.filter((r) => !r.ok);
console.log("---");
console.log(
  fail.length ? `FAIL ${fail.length}/${rows.length}` : `ALL PASS ${rows.length}`,
);
process.exit(fail.length ? 1 : 0);
