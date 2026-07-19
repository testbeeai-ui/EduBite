import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES } from "@/data/brain-gym/registry";
import { GAME_COMPONENTS } from "@/components/brain-gym/games";
import {
  applySessionResult,
  createDefaultProgress,
  difficultyWinsFor,
  isDifficultyLocked,
  MASTERY_WIN_LIMIT,
} from "@/lib/brain-gym/storage";
import type {
  BrainGymProgress,
  Difficulty,
  GameId,
} from "@/lib/brain-gym/types";
import { normalizeBrainGymProgress } from "@/lib/db/normalize";

const gameId: GameId = "sequence-memory";

function finish(
  progress: BrainGymProgress,
  difficulty: Difficulty,
  won = true,
): BrainGymProgress {
  return applySessionResult(
    progress,
    gameId,
    { difficulty, won, score: won ? 100 : 10, timeMs: 1_000 },
    false,
  ).progress;
}

const legacy = normalizeBrainGymProgress({
  version: 1,
  totalPlays: 12,
  totalWins: 8,
  games: {
    [gameId]: {
      plays: 12,
      wins: 8,
      bestScore: 900,
      bestTimeMs: 1_200,
      favorite: true,
      recentScores: [900],
    },
  },
});
assert.equal(legacy.version, 2);
assert.deepEqual(legacy.games[gameId]?.winsByDifficulty, {
  easy: 0,
  medium: 0,
  hard: 0,
});
assert.equal(legacy.games[gameId]?.wins, 8);
assert.equal(legacy.games[gameId]?.favorite, true);

let progress = createDefaultProgress();
progress = finish(progress, "easy", false);
assert.equal(difficultyWinsFor(progress, gameId, "easy"), 0);
assert.equal(progress.games[gameId]?.plays, 1);

for (let count = 0; count < MASTERY_WIN_LIMIT; count++) {
  progress = finish(progress, "easy");
}
assert.equal(difficultyWinsFor(progress, gameId, "easy"), 5);
assert.equal(isDifficultyLocked(progress, gameId, "easy"), true);
assert.equal(isDifficultyLocked(progress, gameId, "medium"), false);
assert.equal(isDifficultyLocked(progress, gameId, "hard"), false);

const playsAtLock = progress.games[gameId]?.plays;
progress = finish(progress, "easy");
assert.equal(progress.games[gameId]?.plays, playsAtLock);
assert.equal(difficultyWinsFor(progress, gameId, "easy"), 5);

progress = finish(progress, "medium");
assert.equal(difficultyWinsFor(progress, gameId, "medium"), 1);
assert.equal(difficultyWinsFor(progress, gameId, "easy"), 5);

for (let count = 0; count < 8; count++) progress = finish(progress, "hard");
assert.equal(difficultyWinsFor(progress, gameId, "hard"), 8);
assert.equal(isDifficultyLocked(progress, gameId, "hard"), false);

const roundTripped = normalizeBrainGymProgress(
  JSON.parse(JSON.stringify(progress)),
);
assert.deepEqual(
  roundTripped.games[gameId]?.winsByDifficulty,
  progress.games[gameId]?.winsByDifficulty,
);

assert.equal(GAMES.length, 15);
assert.deepEqual(
  GAMES.map((game) => game.id).sort(),
  Object.keys(GAME_COMPONENTS).sort(),
);

const root = process.cwd();
const migration = readFileSync(
  join(
    root,
    "supabase",
    "migrations",
    "20260719150000_brain_gym_five_win_mastery.sql",
  ),
  "utf8",
);
assert.match(migration, /pg_advisory_xact_lock/);
assert.match(migration, /brain-gym-session:/);
assert.match(migration, /difficulty mastered/);
assert.match(migration, /wins_before >= 5/);

const sequenceMemory = readFileSync(
  join(
    root,
    "components",
    "brain-gym",
    "games",
    "sequence-memory.tsx",
  ),
  "utf8",
);
assert.doesNotMatch(sequenceMemory, /won:\s*score\s*>=/);

const activeGameFiles = [
  "sequence-memory",
  "pattern-memory",
  "number-flash",
  "recall-reader",
  "letter-memory",
  "image-memory",
  "sudoku",
  "minesweeper",
  "game-2048",
  "hidden-objects",
  "odd-one-out",
  "match-shadow",
  "visual-search",
  "reaction-time",
  "speed-math",
];
for (const file of activeGameFiles) {
  const source = readFileSync(
    join(root, "components", "brain-gym", "games", `${file}.tsx`),
    "utf8",
  );
  assert.match(source, /completedRef/, `${file} needs a terminal latch`);
}

for (const file of [
  "sequence-memory",
  "pattern-memory",
  "number-flash",
  "recall-reader",
  "letter-memory",
  "image-memory",
  "sudoku",
  "hidden-objects",
  "match-shadow",
  "visual-search",
  "reaction-time",
  "speed-math",
]) {
  const source = readFileSync(
    join(root, "components", "brain-gym", "games", `${file}.tsx`),
    "utf8",
  );
  assert.match(
    source,
    /usePausableScheduler/,
    `${file} needs pause-aware delayed effects`,
  );
}

const hiddenObjects = readFileSync(
  join(root, "components", "brain-gym", "games", "hidden-objects.tsx"),
  "utf8",
);
assert.match(hiddenObjects, /sceneObjects\[index\]\?\.isTarget === true/);
assert.match(hiddenObjects, /Set<number>/);
assert.match(hiddenObjects, /isTarget:\s*useTarget/);

const game2048 = readFileSync(
  join(root, "components", "brain-gym", "games", "game-2048.tsx"),
  "utf8",
);
assert.match(game2048, /const target = 2048/);

const matchShadow = readFileSync(
  join(root, "components", "brain-gym", "games", "match-shadow.tsx"),
  "utf8",
);
assert.match(matchShadow, /correctRounds >= roundsToWin/);

const reactionTime = readFileSync(
  join(root, "components", "brain-gym", "games", "reaction-time.tsx"),
  "utf8",
);
assert.match(reactionTime, /won:\s*true/);
assert.doesNotMatch(reactionTime, /won:\s*avg\s*</);

const speedMath = readFileSync(
  join(root, "components", "brain-gym", "games", "speed-math.tsx"),
  "utf8",
);
assert.match(speedMath, /if \(nextLives <= 0\)/);
assert.match(speedMath, /usePausableScheduler/);

console.log("Brain Gym mastery regression tests passed.");
