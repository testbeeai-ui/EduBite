import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GAMES } from "@/data/brain-gym/registry";
import { GAME_COMPONENTS } from "@/components/brain-gym/games";
import { targetForDifficulty } from "@/components/brain-gym/games/game-2048";
import { isValidCompletedSudoku } from "@/components/brain-gym/games/sudoku";
import {
  isReactionRunWon,
  reactionScoreForMs,
} from "@/components/brain-gym/games/reaction-time";
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

assert.ok(reactionScoreForMs(200, "easy") >= 90);
assert.ok(reactionScoreForMs(300, "easy") < reactionScoreForMs(200, "easy"));
assert.ok(reactionScoreForMs(1_000, "easy") >= 0);
assert.ok(
  reactionScoreForMs(250, "hard") >= reactionScoreForMs(250, "easy"),
);
assert.equal(isReactionRunWon(0, 90), true);
assert.equal(isReactionRunWon(2, 60), true);
assert.equal(isReactionRunWon(3, 100), false);
assert.equal(isReactionRunWon(0, 59), false);
assert.equal(
  isValidCompletedSudoku([
    1, 2, 3, 4,
    3, 4, 1, 2,
    2, 1, 4, 3,
    4, 3, 2, 1,
  ]),
  true,
);
assert.equal(
  isValidCompletedSudoku([
    1, 1, 3, 4,
    3, 4, 1, 2,
    2, 1, 4, 3,
    4, 3, 2, 1,
  ]),
  false,
);

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

for (const game of GAMES) {
  let gameProgress = createDefaultProgress();
  for (let count = 0; count < MASTERY_WIN_LIMIT; count++) {
    gameProgress = applySessionResult(
      gameProgress,
      game.id,
      {
        difficulty: "easy",
        won: true,
        score: 100,
        timeMs: 1_000,
      },
      false,
    ).progress;
  }
  assert.equal(
    isDifficultyLocked(gameProgress, game.id, "easy"),
    true,
    `${game.id} Easy should lock after five wins`,
  );
  assert.equal(
    isDifficultyLocked(gameProgress, game.id, "medium"),
    false,
    `${game.id} Medium should remain available`,
  );

  const playsAtEasyLock = gameProgress.games[game.id]?.plays;
  gameProgress = applySessionResult(
    gameProgress,
    game.id,
    { difficulty: "easy", won: true, score: 100, timeMs: 1_000 },
    false,
  ).progress;
  assert.equal(
    gameProgress.games[game.id]?.plays,
    playsAtEasyLock,
    `${game.id} must reject plays on mastered Easy`,
  );

  for (let count = 0; count < MASTERY_WIN_LIMIT; count++) {
    gameProgress = applySessionResult(
      gameProgress,
      game.id,
      {
        difficulty: "medium",
        won: true,
        score: 140,
        timeMs: 1_000,
      },
      false,
    ).progress;
  }
  assert.equal(
    isDifficultyLocked(gameProgress, game.id, "medium"),
    true,
    `${game.id} Medium should lock after five wins`,
  );

  for (let count = 0; count < 7; count++) {
    gameProgress = applySessionResult(
      gameProgress,
      game.id,
      { difficulty: "hard", won: true, score: 180, timeMs: 1_000 },
      false,
    ).progress;
  }
  assert.equal(
    difficultyWinsFor(gameProgress, game.id, "hard"),
    7,
    `${game.id} Hard wins should remain unlimited`,
  );
  assert.equal(isDifficultyLocked(gameProgress, game.id, "hard"), false);
}

const negativeScoreResult = applySessionResult(
  createDefaultProgress(),
  gameId,
  { difficulty: "easy", won: false, score: -250, timeMs: -1 },
  false,
);
assert.equal(negativeScoreResult.progress.games[gameId]?.bestScore, 0);
assert.equal(
  negativeScoreResult.progress.games[gameId]?.recentScores[0]?.score,
  0,
);
assert.equal(
  negativeScoreResult.progress.games[gameId]?.recentScores[0]?.bestTimeMs,
  0,
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
const authoritativeMergeMigration = readFileSync(
  join(
    root,
    "supabase",
    "migrations",
    "20260719181526_brain_gym_authoritative_merge.sql",
  ),
  "utf8",
);
assert.match(
  authoritativeMergeMigration,
  /p_progress - 'games' - 'totalPlays' - 'totalWins'/,
);

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

const patternMemory = readFileSync(
  join(root, "components", "brain-gym", "games", "pattern-memory.tsx"),
  "utf8",
);
assert.match(patternMemory, /show \|\| completedRef\.current/);
assert.match(patternMemory, /gen\(round \+ 1\)/);

const imageMemory = readFileSync(
  join(root, "components", "brain-gym", "games", "image-memory.tsx"),
  "utf8",
);
assert.match(imageMemory, /const \[changedGrid, setChangedGrid\]/);
assert.doesNotMatch(imageMemory, /const quizGrid =/);

const letterMemory = readFileSync(
  join(root, "components", "brain-gym", "games", "letter-memory.tsx"),
  "utf8",
);
assert.match(letterMemory, /shuffle\(\[\.\.\.LETTERS\]\)\.slice\(0, n\)/);
assert.match(letterMemory, /setDisplay\(""\)/);
assert.match(letterMemory, /Letter \$\{flashPosition \+ 1\} of \$\{seq\.length\}/);
assert.match(letterMemory, /Replay letters once/);

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
assert.equal(targetForDifficulty("easy"), 256);
assert.equal(targetForDifficulty("medium"), 512);
assert.equal(targetForDifficulty("hard"), 2048);
assert.match(game2048, /targetForDifficulty\(difficulty\)/);

const matchShadow = readFileSync(
  join(root, "components", "brain-gym", "games", "match-shadow.tsx"),
  "utf8",
);
assert.match(matchShadow, /correctRounds >= roundsToWin/);

const reactionTime = readFileSync(
  join(root, "components", "brain-gym", "games", "reaction-time.tsx"),
  "utf8",
);
assert.match(reactionTime, /won:\s*isReactionRunWon/);
assert.doesNotMatch(reactionTime, /won:\s*avg\s*</);

const speedMath = readFileSync(
  join(root, "components", "brain-gym", "games", "speed-math.tsx"),
  "utf8",
);
assert.match(speedMath, /if \(nextLives <= 0\)/);
assert.match(speedMath, /usePausableScheduler/);
assert.match(speedMath, /answerLockedRef\.current = true/);

const gameShell = readFileSync(
  join(root, "components", "brain-gym", "shell", "game-shell.tsx"),
  "utf8",
);
assert.doesNotMatch(gameShell, /pausedRef/);
assert.match(
  gameShell,
  /activeRunKeyRef\.current = nextRunKey;\s*setRestartKey\(nextRunKey\)/,
);

console.log("Brain Gym mastery regression tests passed.");
