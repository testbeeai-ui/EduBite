"use client";

import { useMemo, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { shuffle, pickRandom } from "@/lib/brain-gym/utils/shuffle";

const WORDS_E = [
  "BEACH", "BLAZE", "BRAVE", "BRUSH", "CARGO", "CHARM", "CHASE", "CLEAN", "CLIMB", "CLOUD",
  "COACH", "CORAL", "CRANE", "CRAFT", "DANCE", "DRAFT", "DREAM", "DRIVE", "EAGLE", "EVENT",
  "FEAST", "FIBER", "FLAME", "FLASH", "FLOAT", "FORGE", "FROST", "GHOST", "GIANT", "GLAZE",
  "GLOBE", "GRACE", "GRAIN", "GRASP", "GREEN", "GUARD", "GUIDE", "HAVEN", "HONEY", "HUMOR",
  "IMAGE", "IVORY", "JUICE", "KARMA", "LASER", "LAYER", "LEMON", "LIGHT", "LUNAR", "MAGIC",
  "MAPLE", "MARSH", "MEDAL", "MERIT", "MIRTH", "NERVE", "NOBLE", "NORTH", "OASIS", "ORBIT",
  "PANEL", "PATCH", "PEARL", "PHASE", "PIXEL", "PLAZA", "PLUME", "POWER", "PRISM", "PROBE",
  "PULSE", "QUEST", "RADAR", "REIGN", "RIDGE", "RIVER", "ROYAL", "RUSTY", "SCALE", "SHINE",
  "SIGMA", "SLATE", "SMART", "SOLAR", "SPACE", "SPARK", "SPEAR", "SPINE", "SPIRE", "STAMP",
  "STARK", "STEAM", "STEEL", "STONE", "STORM", "SURGE", "SWORD", "THEIR", "THORN", "TIGER",
  "TOAST", "TOKEN", "TORCH", "TOWER", "TRACE", "TRAIL", "TREND", "TRICK", "TROUT", "TRUMP",
  "TRUST", "ULTRA", "UNITY", "VALOR", "VAULT", "VIGOR", "VIVID", "WATCH", "WHEEL", "WORLD",
  "YACHT", "YOUTH", "ZEBRA"
];
const WORDS_M = [
  "ALCHEMY", "AMNESTY", "ANCIENT", "BALANCE", "BASTION", "CABINET", "CALIBER", "CAPTAIN", "CAPTURE", "CASCADE",
  "CENTURY", "CHAMBER", "CHANNEL", "CHAPTER", "CHARTER", "CHIMNEY", "CIRCUIT", "CLARITY", "CLIMATE", "CLUSTER",
  "COLLEGE", "COMFORT", "COMMAND", "COMPACT", "COMPASS", "COMPLEX", "CONCEPT", "CONDUCT", "CONNECT", "CONTEST",
  "CONTROL", "CONVERT", "COURAGE", "CRUSADE", "CRYSTAL", "CULTURE", "CURRENT", "CUSTOMS", "DECIMAL", "DEFENSE",
  "DELIVER", "DESERVE", "DESTINY", "DEVELOP", "DIAGRAM", "DIGITAL", "DISPLAY", "DISTANT", "DYNAMIC", "ECONOMY",
  "EDITION", "ELEMENT", "EMBRACE", "EMOTION", "EMPEROR", "ENCHANT", "ENDLESS", "ESSENCE", "ETERNAL", "EVIDENT",
  "EXHIBIT", "EXPLOIT", "EXPLORE", "FANTASY", "FICTION", "FINDING", "FORMULA", "FORTUNE", "FOUNDER", "FREEDOM",
  "FRONTIER", "GALLERY", "GATEWAY", "GENUINE", "GLIMPSE", "GRAVITY", "HABITAT", "HALFWAY", "HARMONY", "HEADING",
  "HELPFUL", "HISTORY", "HOLIDAY", "HORIZON", "HYGIENE", "ICEBERG", "IGNITE", "IMAGERY", "IMAGINE", "IMMENSE",
  "IMPULSE", "INITIAL", "INSPIRE", "INTENSE", "INVOICE", "ISOLATE", "JUSTICE", "KINGDOM", "LANTERN", "LIBERAL",
  "LIBERTY", "LIMITED", "LOGICAL", "MANDATE", "MASSIVE", "MILITIA", "MINERAL", "MIRACLE", "MISSION", "MIXTURE",
  "MONARCH", "MONSTER", "MYSTERY", "NATURAL", "NEUTRAL", "NUCLEUS", "NUMERAL", "OBSCURE", "OBVIOUS", "OPACITY",
  "OPTIMAL", "ORGANIC", "OUTLINE", "OVERLAP", "PARADOX", "PARTIAL", "PASSAGE", "PASSION", "PATIENT", "PATTERN",
  "PENALTY", "PENDING", "PENSION", "PERFECT", "PHANTOM", "PILLAR", "PIONEER", "PLASTIC", "PLATEAU", "PLUNDER",
  "POPULAR", "PORTION", "POTTERY", "PREMIER", "PREMIUM", "PREVIEW", "PRIMARY", "PRIVACY", "PROBLEM", "PROCESS",
  "PRODIGY", "PRODUCT", "PROFILE", "PROGRAM", "PROJECT", "PROLONG", "PROMISE", "PROSPER", "PROTECT", "PROTEST",
  "QUANTUM", "QUARREL", "QUARTER", "RADICAL", "REALTOR", "RECEIPT", "REFINED", "REFLECT", "REGULAR", "REJOICE",
  "RELEASE", "RESOLVE", "RESPECT", "RESTORE", "REVOLVE", "ROUTINE", "SANDBOX", "SCHOLAR", "SCIENCE", "SECTION",
  "SEGMENT", "SILICON", "SIMILAR", "SHELTER", "SKEPTIC", "SOCIETY", "SOLDIER", "SPATIAL", "SPINDLE", "STADIUM",
  "STAMINA", "STELLAR", "STORAGE", "STRANGE", "STRATUM", "SUBJECT", "SUPPORT", "SURFACE", "SURPLUS", "SUSPECT",
  "TENSION", "THERAPY", "THOUGHT", "TRAFFIC", "TRIGGER", "TROUBLE", "TRUSTEE", "TYPICAL", "UNCOVER", "UNICORN",
  "UNIFORM", "URANIUM", "UTILITY", "VACCINE", "VENTURE", "VERDICT", "VERSION", "VICTORY", "VINTAGE", "VIRTUAL",
  "VOLCANO", "WARRIOR", "WESTERN", "WHISPER", "WITNESS"
];
const WORDS_H = [
  "ABUNDANCE", "ACCORDION", "ADVENTURE", "ALGORITHM", "AMBIGUITY", "AMPLITUDE", "ANOMALOUS", "APPLIANCE", "ARBITRARY", "ARCHITECT",
  "ASTRONOMY", "AUTHORITY", "AWARENESS", "BACKTRACK", "BANDWIDTH", "BEAUTIFUL", "BENCHMARK", "BIOGRAPHY", "BLUEPRINT", "BOTANICAL",
  "BRILLIANT", "CALCULATE", "CALIBRATE", "CELEBRITY", "CHARACTER", "CHEMISTRY", "CHROMATIC", "CHRONICLE", "CLOCKWORK", "COGNITION",
  "COMMUNITY", "COMPANION", "COMPONENT", "COMPOSITE", "CONUNDRUM", "COPYRIGHT", "CORROSION", "CRAFTSMAN", "CRITERION", "CUSTOMIZE",
  "DANGEROUS", "DASHBOARD", "DECEPTION", "DECOMPOSE", "DEMOCRACY", "DEPARTURE", "DETECTIVE", "DETERMINE", "DEVELOPED", "DIAGNOSIS",
  "DIFFERENT", "DIMENSION", "DIPLOMACY", "DIRECTION", "DISCOVERY", "ELABORATE", "ELECTORAL", "ELECTRODE", "ELEVATION", "ELIMINATE",
  "EMERGENCY", "ENLIGHTEN", "EQUIPMENT", "ESTABLISH", "ESTRANGED", "ETYMOLOGY", "EVERGREEN", "EVOLUTION", "EXCEPTION", "EXCLUSIVE",
  "EXECUTIVE", "EXEMPLARY", "EXISTENCE", "EXPANSION", "EXPLOSION", "FABRICATE", "FACETIOUS", "FACTORIAL", "FANTASTIC", "FIGURATIVE",
  "FLASHBACK", "FLUCTUATE", "FOOLPROOF", "FOOTPRINT", "FORECLOSE", "FORMATION", "FREQUENCY", "FURNITURE", "GARDENING", "GENERATOR",
  "GEOMETRIC", "GLACIATED", "GRADUALLY", "GUARANTEE", "GUIDELINE", "GYMNASIUM", "HAPPINESS", "HARMONIZE", "HEADPHONE", "HIBERNATE",
  "HIGHLIGHT", "HISTOGRAM", "HURRICANE", "HYPNOTIZE", "IMAGINARY", "IMMEDIATE", "IMPLEMENT", "IMPORTANT", "IMPROVISE", "INCOGNITO",
  "INCORRECT", "INDICATOR", "INTERPRET", "INTRODUCE", "INVISIBLE", "IRONCLAD", "IRREGULAR", "JELLYFISH", "JUXTAPOSE", "KEYSTROKE",
  "KNOWLEDGE", "LABYRINTH", "LANDSCAPE", "LEGENDARY", "LOGARITHM", "LOWERCASE", "MACHINERY", "MAGNITUDE", "MANGROVES", "MANIFESTO",
  "MARVELOUS", "MECHANISM", "MOONLIGHT", "NARRATIVE", "NEGOTIATE", "NIGHTMARE", "NORTHWARD", "NUTRITION", "OBJECTIVE", "OBSERVANT",
  "OFFSPRING", "OPERATING", "ORCHESTRA", "OTHERWISE", "OUTSKIRTS", "OVERPOWER", "OXIDATION", "PARAGRAPH", "PATCHWORK", "PENINSULA",
  "PERIMETER", "PETROLEUM", "PHOTOCOPY", "PINEAPPLE", "PNEUMONIA", "POTENTIAL", "PRECISELY", "PREDATORY", "PREJUDICE", "PRINCIPLE",
  "PRIVILEGE", "PROCEDURE", "PROMINENT", "PROSECUTE", "PROTOTYPE", "PROVISION", "PROXIMITY", "QUADRATIC", "QUARTERLY", "QUICKSAND",
  "RAINSTORM", "RECAPTURE", "RECOGNIZE", "RECONCILE", "RECTANGLE", "REDUNDANT", "REFERENCE", "REIMBURSE", "REINFORCE", "RELUCTANT",
  "REPRODUCE", "RESERVOIR", "RESIDENCE", "RESILIENT", "RESOURCES", "RESTRAINT", "RHETORICAL", "RIGHTEOUS", "SAFEGUARD", "SAXOPHONE",
  "SCHOLARLY", "SCULPTURE", "SENSATION", "SENTIMENT", "SHAPELESS", "SHIPWRECK", "SHORTWAVE", "SIGNATURE", "SIMULATOR", "SITUATION",
  "SKEPTICAL", "SOLSTICE", "SOMEWHERE", "SOVEREIGN", "SPECTACLE", "SPOTLIGHT", "SQUIRRELS", "STARLIGHT", "STATEMENT", "STATISTIC",
  "STEAMSHIP", "STIMULATE", "STRATEGIC", "STRUCTURE", "SUBMARINE", "SUBSTANCE", "SUCCESSOR", "SUNDOWNER", "SUPERNOVA", "SURRENDER",
  "SURVIVING", "SUSPICION", "SYMMETRY", "SYNDICATE", "TECHNIQUE", "TELEGRAPH", "TELESCOPE", "TERMINATE", "TERRITORY", "THREADING",
  "THRESHOLD", "THUMBNAIL", "TOLERANCE", "TRADEMARK", "TRANSFORM", "TRANSLATE", "TRANSPORT", "TRAPEZOID", "TREATMENT", "TREMBLING",
  "TURBULENT", "UNDERLINE", "UNDERTAKE", "UNIVERSAL", "UPPERCASE", "WATERFALL", "WHOLESALE", "WINDSTORM", "WONDERFUL", "WORLDWIDE",
  "XENOPHOBE", "YESTERDAY", "YOUTHFULLY", "ZEALOUSLY"
];

export function WordScrambleGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const pool =
    difficulty === "easy" ? WORDS_E : difficulty === "medium" ? WORDS_M : WORDS_H;
  const [word, setWord] = useState(() => pickRandom(pool));
  const scrambled = useMemo(() => {
    let s = shuffle(word.split("")).join("");
    while (s === word) s = shuffle(word.split("")).join("");
    return s;
  }, [word]);
  const [answer, setAnswer] = useState("");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [start] = useState(() => Date.now());
  const [hint, setHint] = useState(false);

  const next = () => {
    setWord(pickRandom(pool));
    setAnswer("");
    setHint(false);
  };

  const submit = () => {
    if (paused) return;
    if (answer.toUpperCase().trim() === word) {
      sfx.correct(soundEnabled);
      const ns =
        score +
        Math.round(
          (30 + word.length * 5 - (hint ? 10 : 0)) * difficultyMultiplier(difficulty),
        );
      setScore(ns);
      onScoreChange?.(ns);
      if (round >= 6) {
        onComplete({ score: ns, won: true, timeMs: Date.now() - start, difficulty });
      } else {
        setRound((r) => r + 1);
        next();
      }
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
      }
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        Round {round}/6 · Unscramble the word
      </StatusLine>
      <div className="text-center text-3xl sm:text-4xl font-mono font-bold tracking-[0.25em] py-6 text-blue">
        {scrambled}
      </div>
      {hint && (
        <p className="text-center text-xs text-amber mb-2">
          Starts with {word[0]} · {word.length} letters
        </p>
      )}
      <div className="max-w-sm mx-auto space-y-3">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full text-center text-xl font-mono rounded-xl border border-[var(--line)] bg-[var(--surface-2)] py-3 outline-none focus:border-blue/50"
          placeholder="Your answer"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setHint(true)}
            className="flex-1 py-3 rounded-full border border-[var(--line)] text-sm font-display font-bold"
          >
            Hint
          </button>
          <button
            type="button"
            onClick={submit}
            className="flex-[2] py-3 rounded-full bg-gradient-to-r from-teal to-blue text-[#04141c] font-display font-bold"
          >
            Submit
          </button>
        </div>
      </div>
    </GameBoard>
  );
}
