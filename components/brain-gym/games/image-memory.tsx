"use client";

import { useEffect, useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { shuffle, range } from "@/lib/brain-gym/utils/shuffle";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { cn } from "@/lib/utils";
import { usePausableScheduler } from "./_pausable-scheduler";

const ICONS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔",
  "🐧", "🐦", "🐤", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🪱", "🐛", "🦋", "🐌",
  "🐞", "🐜", "🦗", "🕷️", "🐙", "🦑", "🦐", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊",
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝",
  "🍅", "🥑", "🍆", "🥔", "🥕", "🌽", "🌶️", "🫑", "🧅", "🧄", "🥐", "🥯", "🍞", "🥖", "🥨", "🧀",
  "🥚", "🍳", "🥞", "🧇", "🥓", "🥩", "🍗", "🌭", "🍔", "🍟", "🍕", "🥪", "🌯", "🌮", "🍿", "🧈",
  "🍦", "🍧", "🍨", "🍩", "🍪", "🎂", "🍰", "🧁", "🥧", "🍫", "🍬", "🍭", "🍮", "🍯", "🥛", "☕",
  "🍵", "🧃", "🥤", "🧋", "🍺", "🍻", "🍷", "🍹", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉",
  "🎱", "🪀", "🏓", "🏸", "🥅", "🎒", "🎓", "🕶️", "🥽", "🥼", "🛟", "🎈", "🎁", "🎨", "🎭", "🎪",
  "🎫", "🎟️", "🔋", "💻", "📺", "📷", "💡", "🏮", "🧱", "🕯️", "🪓", "🔨", "🔧", "🔩", "🧪", "🧬",
  "🩺", "🔭", "🔬", "🧲", "🔮", "🧿", "🪄", "🪘", "🎸", "🎹", "🎺", "🎻", "🥁", "🪈", "🪗", "🧩",
  "🎯", "🎲", "🎰", "🎳", "🎮", "🏎️", "🏍️", "🚢", "🛫", "✈️", "🛬", "🎡", "🎢", "🎠", "⛺", "🛖",
  "🏡", "🏠", "🏢", "🏫", "🏭", "🏦", "🏥", "🏨", "🏪", "🌋", "🏔️", "🏕️", "🏖️", "🏝️", "🏙️", "🏛️"
];

export function ImageMemoryGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const size = difficulty === "easy" ? 3 : 4;
  const n = size * size;
  const [grid, setGrid] = useState<string[]>([]);
  const [changedGrid, setChangedGrid] = useState<string[]>([]);
  const [phase, setPhase] = useState<"study" | "quiz">("study");
  const [answer, setAnswer] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);
  const { schedule } = usePausableScheduler(paused);

  const setup = () => {
    const g = shuffle(ICONS).slice(0, n);
    const changedIndex = Math.floor(Math.random() * n);
    const replacement = shuffle(
      ICONS.filter((icon) => !g.includes(icon)),
    )[0]!;
    const nextChangedGrid = g.map((icon, index) =>
      index === changedIndex ? replacement : icon,
    );
    setGrid(g);
    setChangedGrid(nextChangedGrid);
    setAnswer(changedIndex);
    setPhase("study");
    schedule(() => setPhase("quiz"), difficulty === "hard" ? 1200 : 2000);
  };

  useEffect(() => {
    setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number) => {
    if (paused || phase !== "quiz" || completedRef.current) return;
    if (i === answer) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(45 * difficultyMultiplier(difficulty) * round);
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 5) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        schedule(setup, 350);
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      } else schedule(setup, 350);
    }
  };

  const shown = phase === "study" ? grid : changedGrid;

  return (
    <GameBoard>
      <StatusLine>
        {phase === "study"
          ? "Study the icons…"
          : "Which icon changed?"}{" "}
        · Round {round}/5
      </StatusLine>
      <div
        className="grid gap-2 max-w-sm mx-auto"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {range(n).map((i) => (
          <CellButton
            key={i}
            onClick={() => pick(i)}
            disabled={phase === "study"}
            className={cn("aspect-square text-2xl sm:text-3xl", phase === "quiz" && "hover:border-pink/40")}
          >
            {shown[i]}
          </CellButton>
        ))}
      </div>
    </GameBoard>
  );
}
