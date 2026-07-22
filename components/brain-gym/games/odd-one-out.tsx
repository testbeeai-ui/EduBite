"use client";

import { useRef, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine, CellButton } from "./_shared";
import { shuffle } from "@/lib/brain-gym/utils/shuffle";

/* ── 40+ emoji categories, 8-15 emojis each ─────────────────────── */
const CATEGORIES: Record<string, string[]> = {
  fruits:       ["🍎","🍌","🍇","🍊","🍋","🍉","🍓","🫐","🍑","🍒","🥝","🥭","🍍","🫒","🍐"],
  vegetables:   ["🥕","🥦","🌽","🧅","🧄","🥬","🥒","🌶️","🍆","🫑","🥔","🍠","🫛","🫚"],
  animals:      ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵"],
  seaLife:      ["🐙","🦑","🦐","🦀","🐠","🐟","🐡","🦈","🐳","🐋","🦭","🦦","🐚","🪸"],
  birds:        ["🦅","🦆","🦉","🦜","🐓","🦩","🕊️","🦚","🦤","🪿","🐧","🦃","🐤","🦢"],
  insects:      ["🐝","🦋","🐛","🐞","🦗","🪲","🐜","🦂","🪳","🪰","🦟","🐌","🪱"],
  vehicles:     ["🚗","🚕","🚌","🚑","🚒","🏎️","🚓","🚲","🛵","🏍️","🚂","🛻","🚐","🚎"],
  airSpace:     ["🚀","🛸","✈️","🛩️","🚁","🪂","🎈","🛰️","🌍","🌙","⭐","💫","☄️"],
  sports:       ["⚽","🏀","🎾","⚾","🏐","🏈","🥎","🏉","🎱","🏓","🏸","🥊","🥋","🤺"],
  musical:      ["🎸","🎹","🥁","🎺","🎷","🪗","🎻","🪘","🎵","🎶","🎤","🎧","🪈"],
  food:         ["🍕","🍔","🌮","🌯","🍟","🍗","🥩","🥓","🌭","🧆","🥪","🫔","🥙","🧇"],
  drinks:       ["☕","🍵","🧃","🥤","🧋","🍺","🍷","🥂","🍹","🫖","🥛","🍶","🧉"],
  desserts:     ["🍰","🎂","🧁","🍩","🍪","🍫","🍬","🍭","🍦","🥧","🍮","🍡"],
  clothing:     ["👕","👖","👗","👔","🧣","🧤","🧥","👒","🎩","🧢","👟","👠","👢","🥾"],
  weather:      ["☀️","🌤️","⛅","🌧️","⛈️","🌩️","❄️","💨","🌊","🌈","🌪️","🌫️","🔥"],
  plants:       ["🌸","🌺","🌻","🌷","🌹","🌵","🎋","🎍","🍀","🌿","🪴","🌾","🪻","🌼"],
  tools:        ["🔨","🪛","🔧","🪚","🔩","🪝","🔑","🗝️","🪤","🧰","🪜","🧲","🪠"],
  electronics:  ["📱","💻","🖥️","⌨️","🖱️","📷","📺","📻","🔋","💡","🔌","📡","🕹️"],
  office:       ["📎","📏","📐","✂️","🖊️","📝","📋","📌","📍","🗂️","📂","📁","💼"],
  shapes:       ["🔴","🟠","🟡","🟢","🔵","🟣","⚫","⬛","🔷","🔶","🔺","🔻","💠"],
  buildings:    ["🏠","🏢","🏫","🏥","🏦","🏪","🏛️","⛪","🕌","🕍","🏰","🏯","🗼"],
  faces:        ["😀","😂","🥲","😍","🤩","😎","🥳","🤔","😴","🤯","😱","🥶","🤮"],
  hands:        ["👍","👎","✌️","🤞","🤟","🤙","👋","🤚","✋","🖐️","👌","🤏","🤌"],
  hearts:       ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💗","💖","💝","💕"],
  zodiac:       ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"],
  time:         ["⏰","⏱️","⏲️","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛"],
  kitchen:      ["🍽️","🥄","🍴","🔪","🫕","🍳","🥘","🫙","🧂","🥣","🥡","🫗"],
  stationery:   ["✏️","🖍️","🖌️","📏","📐","✂️","📌","📍","🖇️","🗒️","📓","📔"],
  science:      ["🔬","🧪","🧫","🧬","💊","🩺","🩻","🩸","🦠","🧲","⚛️","🔭"],
  games:        ["🎮","🕹️","🎲","🎯","🎳","🧩","♟️","🪀","🎪","🎠","🎢","🎡"],
  money:        ["💰","💵","💴","💶","💷","💎","🪙","💳","🏧","💲","🤑"],
  transport:    ["🚢","⛵","🚤","🛥️","🛳️","⛴️","🚁","🚂","🚃","🚄","🚅","🚆"],
  holiday:      ["🎄","🎃","🎆","🎇","🧨","🎁","🎊","🎋","🎍","🎎","🎏","🎐"],
  flags:        ["🏁","🚩","🎌","🏴","🏳️","🇺🇸","🇬🇧","🇫🇷","🇩🇪","🇯🇵","🇰🇷","🇮🇳","🇧🇷","🇦🇺","🇨🇦"],
  fantasy:      ["🧙","🧛","🧟","🧞","🧜","🧚","🦄","🐉","🧝","🧌","🪄","👻"],
  professions:  ["👨‍⚕️","👩‍🔬","👨‍🍳","👩‍🎓","👨‍🏫","👩‍💻","👨‍🎨","👩‍🚀","👨‍🚒","👩‍✈️","👷","💂"],
  marine:       ["🐙","🦑","🦐","🦀","🐠","🐟","🦈","🐳","🐋","🦭","🦦","🐚"],
  reptiles:     ["🐍","🦎","🐊","🐢","🐲","🦕","🦖","🐸"],
  celestial:    ["🌍","🌎","🌏","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌝","🌚"],
  fruitsExotic: ["🥥","🥑","🫐","🍈","🍋","🥝","🥭","🍍","🫒","🍐","🍑","🍒"],
  ocean:        ["🌊","🏄","🏊","🚣","🤽","🏖️","🐚","⛵","🦈","🐋","🐬","🐳"],
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);
const CATEGORY_FAMILIES: Record<string, string> = {
  fruits: "produce",
  fruitsExotic: "produce",
  vegetables: "produce",
  animals: "animals",
  birds: "animals",
  insects: "animals",
  reptiles: "animals",
  seaLife: "ocean",
  marine: "ocean",
  ocean: "ocean",
  vehicles: "transport",
  transport: "transport",
  airSpace: "transport",
  office: "stationery",
  stationery: "stationery",
};

function categoryFamily(category: string): string {
  return CATEGORY_FAMILIES[category] ?? category;
}

function pickRandomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickNFrom(arr: string[], n: number): string[] {
  const copy = [...arr];
  const result: string[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy.splice(idx, 1)[0]!);
  }
  return result;
}

function generateRound(): { items: string[]; odd: string } {
  const mainKey = pickRandomFrom(CATEGORY_KEYS);
  const mainEmojis = pickNFrom(CATEGORIES[mainKey]!, 3);

  let oddKey = pickRandomFrom(CATEGORY_KEYS);
  let oddEmoji = pickRandomFrom(CATEGORIES[oddKey]!);
  while (
    categoryFamily(oddKey) === categoryFamily(mainKey) ||
    mainEmojis.includes(oddEmoji)
  ) {
    oddKey = pickRandomFrom(CATEGORY_KEYS);
    oddEmoji = pickRandomFrom(CATEGORIES[oddKey]!);
  }

  return { items: shuffle([...mainEmojis, oddEmoji]), odd: oddEmoji };
}

export function OddOneOutGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const total = difficulty === "easy" ? 6 : difficulty === "medium" ? 8 : 10;
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(() => generateRound());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());
  const completedRef = useRef(false);

  const pick = (item: string) => {
    if (paused || completedRef.current) return;
    if (item === round.odd) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(20 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
      const n = idx + 1;
      if (n >= total) {
        completedRef.current = true;
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setIdx(n);
        setRound(generateRound());
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        completedRef.current = true;
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      }
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        Round {idx + 1}/{total} · Find the odd one out
      </StatusLine>
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
        {round.items.map((item) => (
          <CellButton
            key={item}
            onClick={() => pick(item)}
            className="aspect-square text-3xl sm:text-4xl"
          >
            {item}
          </CellButton>
        ))}
      </div>
    </GameBoard>
  );
}
