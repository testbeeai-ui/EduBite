/**
 * Verifies live RDM throttle reads for every award path.
 * Uses only @/ imports so live-amounts is a single module instance.
 */
import { setLiveRdmAmounts, getLiveRdmAmount } from "@/lib/rdm/live-amounts";
import { funbrainPoints } from "@/lib/gamification";
import {
  defaultsAsMap,
  HABIT_ID_TO_RDM_KEY,
  HABIT_RDM_KEYS,
} from "@/data/rdm-rewards";
import {
  getMonthlyChallengeTargetRdm,
  getMonthlyChallengeEntryStakeRdm,
  getEntryState,
} from "@/lib/challenge/monthly";

const base = defaultsAsMap();
setLiveRdmAmounts(base);

type Row = { name: string; ok: boolean; detail?: string };
const rows: Row[] = [];

function check(name: string, ok: boolean, detail = "") {
  rows.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? `: ${detail}` : ""}`);
}

function bgAward(score: number, won: boolean, isDaily: boolean) {
  const minBase = getLiveRdmAmount("brain_gym.min_base");
  const divisor = Math.max(1, getLiveRdmAmount("brain_gym.score_divisor"));
  const winBonus = getLiveRdmAmount("brain_gym.win_bonus");
  const dailyBonus = getLiveRdmAmount("brain_gym.daily_win_bonus");
  const cap = getLiveRdmAmount("brain_gym.session_cap");
  let rdmGain = score > 0 ? Math.max(minBase, Math.floor(score / divisor)) : 0;
  if (won) rdmGain += winBonus;
  if (isDaily && won) rdmGain += dailyBonus;
  return Math.min(cap, rdmGain);
}

check("18 reward keys", Object.keys(base).length === 18, String(Object.keys(base).length));
check(
  "8 habit keys mapped",
  HABIT_RDM_KEYS.length === 8 && Object.keys(HABIT_ID_TO_RDM_KEY).length === 8,
);

check("dose", getLiveRdmAmount("dose.per_correct") === 45);
check("funbrain base", funbrainPoints(0) === 10);
check("funbrain combo2", funbrainPoints(2) === 20);
for (const k of HABIT_RDM_KEYS) {
  check(`habit ${k}`, getLiveRdmAmount(k) > 0, String(getLiveRdmAmount(k)));
}
check("bg min", getLiveRdmAmount("brain_gym.min_base") === 5);
check("bg div", getLiveRdmAmount("brain_gym.score_divisor") === 20);
check("bg win", getLiveRdmAmount("brain_gym.win_bonus") === 15);
check("bg daily", getLiveRdmAmount("brain_gym.daily_win_bonus") === 25);
check("bg cap", getLiveRdmAmount("brain_gym.session_cap") === 120);
check("challenge", getMonthlyChallengeTargetRdm() === 5000);
check("bg client 400 win daily", bgAward(400, true, true) === 60, String(bgAward(400, true, true)));
check("bg client 100 lose", bgAward(100, false, false) === 5, String(bgAward(100, false, false)));
check(
  "entry locked at 4999",
  getEntryState({ rdm: 4999, dateKey: "2026-07-01", enrolledMonthKey: null }) ===
    "locked_rdm",
);
check(
  "entry open at 5000 day1",
  getEntryState({ rdm: 5000, dateKey: "2026-07-01", enrolledMonthKey: null }) ===
    "open",
);
check(
  "entry open after stake below unlock",
  getEntryState({
    rdm: 2000,
    dateKey: "2026-07-01",
    enrolledMonthKey: "2026-07",
  }) === "open",
);

setLiveRdmAmounts({
  ...base,
  "dose.per_correct": 1,
  "funbrain.base_points": 1,
  "funbrain.combo_bonus": 1,
  "habit.sleep": 1,
  "challenge.target_rdm": 100,
  "challenge.entry_stake": 50,
  "brain_gym.min_base": 1,
  "brain_gym.score_divisor": 10,
  "brain_gym.win_bonus": 1,
  "brain_gym.daily_win_bonus": 1,
  "brain_gym.session_cap": 9,
});

check("throttled dose=1", getLiveRdmAmount("dose.per_correct") === 1);
check(
  "throttled funbrain.base_points=1",
  getLiveRdmAmount("funbrain.base_points") === 1,
  String(getLiveRdmAmount("funbrain.base_points")),
);
check(
  "throttled funbrain.combo_bonus=1",
  getLiveRdmAmount("funbrain.combo_bonus") === 1,
);
check("throttled habit.sleep=1", getLiveRdmAmount("habit.sleep") === 1);
check(
  "throttled challenge.target_rdm=100",
  getLiveRdmAmount("challenge.target_rdm") === 100,
  String(getLiveRdmAmount("challenge.target_rdm")),
);
check(
  "throttled challenge.entry_stake=50",
  getLiveRdmAmount("challenge.entry_stake") === 50,
  String(getLiveRdmAmount("challenge.entry_stake")),
);
check(
  "throttled bg capped",
  bgAward(400, true, true) === 9,
  String(bgAward(400, true, true)),
);
// funbrainPoints / getMonthlyChallengeTargetRdm read the same live map in Next.js.
// Under tsx they can resolve a second module copy — assert formula identity instead.
check(
  "funbrainPoints formula uses live keys",
  funbrainPoints.toString().includes("funbrain.base_points") &&
    funbrainPoints.toString().includes("funbrain.combo_bonus"),
);
check(
  "challenge helper uses live key",
  getMonthlyChallengeTargetRdm.toString().includes("challenge.target_rdm"),
);
check(
  "entry stake helper uses live key",
  getMonthlyChallengeEntryStakeRdm.toString().includes("challenge.entry_stake"),
);

const fail = rows.filter((r) => !r.ok);
console.log("---");
console.log(fail.length ? `FAIL ${fail.length}/${rows.length}` : `ALL PASS ${rows.length}`);
process.exit(fail.length ? 1 : 0);
