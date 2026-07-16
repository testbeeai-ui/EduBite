"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { shuffle, pickRandom } from "@/lib/brain-gym/utils/shuffle";

const BANKS: { letters: string; words: string[] }[] = [
  // ── Original banks ──
  { letters: "TRAIN", words: ["TRAIN", "RAIN", "RAN", "ART", "RAT", "TIN", "TAN", "ANT", "AIR"] },
  { letters: "STONE", words: ["STONE", "ONES", "TONE", "NOTE", "NET", "SET", "TEN", "SON", "TOE", "ONE"] },
  { letters: "HEART", words: ["HEART", "EARTH", "HATE", "HEAT", "TEAR", "RATE", "HART", "EAR", "ART", "HAT"] },
  { letters: "PLATE", words: ["PLATE", "PLEAT", "LATE", "TALE", "PALE", "PEAT", "PEA", "TEA", "APE", "LET"] },

  // ── Expanded banks ──
  { letters: "PLANET", words: ["PLANET", "PLANE", "PLANT", "PANEL", "PLATE", "LATE", "LANE", "PLAN", "PANT", "PALE", "LEAN", "LEAP", "TALE", "PEN", "PAN", "TAN", "NET", "APE", "ATE"] },
  { letters: "STREAM", words: ["STREAM", "MASTER", "STEAM", "MAST", "MARS", "STAR", "TRAM", "MATE", "RATS", "TEAR", "STEM", "REST", "MAR", "ATE", "ARM", "ART", "SET", "EAR"] },
  { letters: "BRIDGE", words: ["BRIDGE", "RIDGE", "BRIDE", "DIRE", "RIDE", "GRID", "BIRD", "GIRD", "RIG", "BIG", "BID", "RID", "DIG", "RED", "IRE", "RIB"] },
  { letters: "CASTLE", words: ["CASTLE", "LEAST", "STEAL", "SCALE", "TALES", "SLATE", "LACE", "CASE", "LAST", "SALT", "EAST", "CAST", "SEAL", "ALE", "ACE", "ATE", "SET", "SAT", "LET"] },
  { letters: "GARDEN", words: ["GARDEN", "RANGE", "GRAND", "GRADE", "ANGER", "GANDER", "DEAR", "DARE", "DEAN", "EARN", "GEAR", "DRAG", "RANG", "AGED", "DEN", "RAN", "AGE", "AND", "RED", "RAG", "END", "EAR"] },
  { letters: "WINTER", words: ["WINTER", "TWINE", "WRITE", "WREN", "WIRE", "WINE", "TIRE", "TWIN", "RENT", "TIER", "RITE", "WRIT", "WIT", "WIN", "TIN", "NET", "NEW", "TEN", "WET"] },
  { letters: "SUMMER", words: ["SUMMER", "SERUM", "RUSE", "MUSE", "USER", "SURE", "RUES", "RUMS", "EMUS", "MRS", "RUM", "EMU", "SUM", "USE", "RUE", "MUM"] },
  { letters: "SPRING", words: ["SPRING", "GRINS", "RINGS", "PIGS", "RIGS", "PINS", "GRIN", "RING", "SPIN", "GRIP", "SING", "SIGN", "PIG", "PIN", "RIG", "SIN", "SIP", "SIR", "GIN", "NIP", "RIN"] },
  { letters: "FOREST", words: ["FOREST", "STORE", "FROST", "FORTE", "ROOST", "FORE", "FORT", "REST", "TORE", "ROTE", "SOFT", "SORT", "ROSE", "TOES", "FOE", "FOR", "SET", "ORE", "ROT", "TOE"] },
  { letters: "MASTER", words: ["MASTER", "STREAM", "STEAM", "SMART", "MAST", "STAR", "TRAM", "RATS", "MARE", "MATE", "MARS", "REST", "TEAR", "ARM", "ART", "MAR", "ATE", "EAR", "ERA", "RAM", "MAT", "SET"] },
  { letters: "SILVER", words: ["SILVER", "LIVER", "VILER", "RILES", "EVIL", "VILE", "LIVE", "RILE", "RISE", "VISE", "LIRE", "LIES", "SIR", "IRE", "VIE", "LIE"] },
  { letters: "GOLDEN", words: ["GOLDEN", "LODGE", "OGLED", "LINGO", "LONGED", "GONE", "DONE", "LEND", "LONG", "GLEN", "DOLE", "LONE", "NODE", "GOLD", "OGLE", "DEN", "DOG", "LOG", "NOD", "OLD", "ONE", "LEG", "GEL", "LED", "GOD", "END"] },
  { letters: "PURPLE", words: ["PURPLE", "UPPER", "REPULP", "PULP", "PURE", "RULE", "LURE", "RULE", "PERL", "PUP", "PER", "RUE", "PEP"] },
  { letters: "ORANGE", words: ["ORANGE", "GROAN", "ANGER", "RANGE", "NEAR", "EARN", "GORE", "GEAR", "GONE", "RAGE", "RANG", "OGRE", "ORGAN", "ORE", "AGE", "AGO", "ERA", "RAN", "NAG", "OAR", "EAR", "RAG", "NOG"] },
  { letters: "BREEZE", words: ["BREEZE", "BEEZE", "BEER", "BREE", "REEF", "FREE", "BEE"] },
  { letters: "FLIGHT", words: ["FLIGHT", "FIGHT", "LIGHT", "FILTH", "GILT", "LIFT", "FLIT", "GRIT", "HILT", "HIT", "FIG", "FIT", "LIT", "GIT"] },
  { letters: "FROZEN", words: ["FROZEN", "FROZE", "FERN", "FORE", "REZONE", "ZONE", "ZERO", "FROE", "FOE", "FOR", "FEN", "FON", "NOR", "ORE", "ROE", "ONE", "ERE"] },
  { letters: "DANGER", words: ["DANGER", "GARDEN", "RANGE", "GRAND", "GRADE", "ANGER", "RAGED", "DEAR", "DARE", "EARN", "GEAR", "DRAG", "RANG", "AGED", "DEN", "RAN", "AGE", "RED", "RAG", "END", "AND", "EAR"] },
  { letters: "LESSON", words: ["LESSON", "LOSES", "NOSES", "LOESS", "NOSE", "LONE", "LOSS", "SOLE", "ONES", "LENS", "LESS", "SON", "ONE", "OLE"] },
  { letters: "PENCIL", words: ["PENCIL", "LIPEN", "CLINE", "LINE", "PILE", "PINE", "CLIP", "LICE", "NICE", "EPIC", "PICE", "PIE", "LIE", "NIL", "PEN", "PIN", "LIP", "PIG", "ICE", "PEC"] },
  { letters: "SIGNAL", words: ["SIGNAL", "ALIGN", "SNAIL", "SLAIN", "GAINS", "SLING", "SING", "SIGN", "SLAG", "SAIL", "NAIL", "GAIL", "GAIN", "AGIN", "NAG", "GAL", "SIN", "GIN", "NIL", "LAG", "SAG"] },
  { letters: "BROKEN", words: ["BROKEN", "BROKE", "BORNE", "BONE", "BORE", "BORN", "ROBE", "KNOB", "BONER", "KERN", "NORE", "ORE", "NOR", "ROB", "ONE", "ROE", "BRO"] },
  { letters: "CLEVER", words: ["CLEVER", "LEVER", "REVEL", "CREEL", "LEER", "EVER", "REEL", "VEER", "EVE", "EEL", "ERE", "LEE"] },
  { letters: "DRIVER", words: ["DRIVER", "DIVER", "DRIVE", "RIVER", "RIDE", "DIRE", "DIVE", "VIED", "IRED", "RIVED", "RID", "VIE", "IRE", "RIG", "RED"] },
  { letters: "FASTER", words: ["FASTER", "FEAST", "AFTER", "TEARS", "RATES", "STARE", "STAR", "FAST", "FEAR", "FATE", "SAFE", "RAFT", "REST", "EAST", "RATS", "SEAT", "FEAT", "FAR", "ATE", "EAR", "SET", "ART", "FAT", "SAT"] },
  { letters: "GLOBAL", words: ["GLOBAL", "ALGOL", "BALL", "GALL", "GOAL", "BLOG", "GLOB", "BOLA", "GLOW", "ALL", "BAG", "GAL", "GOB", "LAB", "LOG", "BOG", "GAB"] },
  { letters: "HONEST", words: ["HONEST", "STONE", "THOSE", "ETHOS", "SHONE", "HOST", "HOSE", "NOTE", "TONE", "THEN", "ONES", "NOSE", "SHOT", "SHOE", "SENT", "HONE", "NEST", "TENS", "SON", "NET", "SET", "TEN", "THE", "HOT", "NOT", "TOE", "ONE", "HEN"] },
  { letters: "ISLAND", words: ["ISLAND", "SNAIL", "SLAIN", "NAILS", "LANDS", "DIALS", "SAIL", "LAID", "NAIL", "LAND", "SAID", "DIAL", "SAND", "SLID", "LIDS", "AID", "SIN", "AND", "LID", "NIL", "DIN", "LAD"] },
  { letters: "JACKET", words: ["JACKET", "TACK", "CAKE", "TAKE", "JACK", "JETA", "TEAK", "ACE", "ATE", "AKE", "JET", "JAM", "EAT", "TEA"] },
  { letters: "KNIGHT", words: ["KNIGHT", "NIGHT", "THINK", "THING", "TIGHT", "KNIT", "KING", "HINT", "KITH", "TIKI", "GINK", "KIN", "KIT", "HIT", "GIN", "TIN", "NIT", "INK", "GIG", "NIG", "GIT"] },
  { letters: "LEMON", words: ["LEMON", "MELON", "MOLE", "LONE", "MOLE", "LOOM", "MOON", "MONO", "NOME", "OLE", "MOO", "ELM", "MEN", "ONE", "NOM"] },
  { letters: "MAPLE", words: ["MAPLE", "AMPLE", "LAMP", "LEAP", "MALE", "LAME", "PALE", "PALM", "PLEA", "MEAL", "PEAL", "ALE", "APE", "MAP", "LAP", "ELM", "PAL", "PEA", "LAM"] },
  { letters: "NORTH", words: ["NORTH", "THORN", "HORN", "TORN", "ROTH", "THRO", "FONT", "NOR", "HOT", "NOT", "ROT", "TON", "NOR", "ROT"] },
  { letters: "POWER", words: ["POWER", "TOWER", "PROWL", "ROPE", "WORE", "PORE", "WOKE", "CROW", "PROW", "ROWEL", "ROWE", "OWE", "ORE", "PER", "ROW", "POW", "ROE", "WOE", "OWE"] },
  { letters: "QUEEN", words: ["QUEEN", "KEEN", "KNEE", "SEEN", "GENE", "NEQUE"] },
  { letters: "ROAST", words: ["ROAST", "TOAST", "SOAR", "RATS", "STAR", "TARO", "SORT", "OARS", "ARTS", "OAST", "ROTA", "OAR", "ART", "OAT", "RAT", "SAT", "TAR", "ROT"] },
  { letters: "SNACK", words: ["SNACK", "SANK", "CASK", "SCAN", "CANS", "SACK", "ANKH", "CASK", "CAN", "ASK", "SKA", "NAG"] },
  { letters: "TOWER", words: ["TOWER", "WROTE", "LOWER", "TORE", "WORE", "ROTE", "WORT", "WOKE", "TWO", "TOW", "ROW", "OWE", "ROT", "TOE", "WET", "ORE", "OWE", "WOE", "ROE"] },
  { letters: "UNDER", words: ["UNDER", "RUDE", "RUNE", "DUNE", "REND", "NUDE", "UNDO", "RUNE", "RUED", "DEN", "DUN", "RUN", "RED", "RUE", "END", "DUE", "URN"] },
  { letters: "VOICE", words: ["VOICE", "COVE", "VICE", "VIBE", "VIE", "ICE"] },
  { letters: "CRISP", words: ["CRISP", "PRISM", "SCRIP", "RIPS", "SPIT", "CRIS", "SIRE", "SIP", "SIR", "RIP"] },
  { letters: "DREAM", words: ["DREAM", "ARMED", "DRAM", "MARE", "MADE", "DARE", "DEAR", "READ", "DAME", "MEAD", "MAD", "MAR", "ARM", "ERA", "EAR", "RED", "RAM", "ARE"] },
  { letters: "FLAME", words: ["FLAME", "MALE", "LAME", "FAME", "LEAF", "FLEA", "MEAL", "FLAM", "ALE", "ELF", "ELM", "LAM"] },
  { letters: "GRAPE", words: ["GRAPE", "DRAPE", "PAGE", "GEAR", "RAGE", "PARE", "PAGER", "REAP", "GAPE", "AGER", "RAG", "RAP", "PEA", "AGE", "APE", "GAP", "EAR", "ERA", "PER", "REP", "PAR"] },
  { letters: "HAVEN", words: ["HAVEN", "HAVE", "VANE", "NAVE", "EVEN", "HIVE", "VINE", "VAN", "HEN", "AVE"] },
  { letters: "IVORY", words: ["IVORY", "VISOR", "IRON", "ROVY", "RIVY", "IRE", "IVY"] },
  { letters: "JEWEL", words: ["JEWEL", "JEEL", "WEEL", "LWEI", "JEW", "WEE", "EWE", "LEE", "EEL"] },
  { letters: "KNEEL", words: ["KNEEL", "KNEEL", "KEEN", "KNEE", "KEEL", "LENE", "LEEK", "EEL", "EEK", "LEE", "ELK"] },
  { letters: "LASER", words: ["LASER", "EARLS", "REALS", "SEAL", "REAL", "SALE", "EARL", "LIAR", "ALES", "EARS", "ERAS", "ALE", "ARE", "EAR", "ERA", "SEA"] },
  { letters: "METAL", words: ["METAL", "MATTE", "MALE", "MATE", "MEAL", "MELT", "LATE", "TALE", "TAME", "LAME", "TEAM", "MEAT", "ELM", "ALE", "MET", "ATE", "EAT", "MAT", "LET", "TEA", "LAM"] },
  { letters: "NOVEL", words: ["NOVEL", "LONE", "LOVE", "OVEN", "VOLE", "LENO", "LOBE", "ONE", "OLE", "NOV"] },
  { letters: "ORBIT", words: ["ORBIT", "RIOT", "TRIO", "BRIT", "ROTI", "BRIO", "BORT", "ROB", "BIT", "ROT", "RIB", "ORT", "BRO"] },
  { letters: "PEARL", words: ["PEARL", "REPAL", "LEAP", "PEAR", "PALE", "REAL", "PLEA", "REAP", "PARE", "EARL", "LEPER", "ALE", "APE", "EAR", "ERA", "LAP", "PAL", "PEA", "PER", "RAP", "REP"] },
  { letters: "QUEST", words: ["QUEST", "QUES", "QUSE", "STEW", "STUE", "TUES", "SET", "USE", "SUE"] },
  { letters: "RIDGE", words: ["RIDGE", "RIDER", "DIRGE", "GIRD", "RIDE", "DIRE", "GRID", "RIDS", "RIG", "RID", "DIG", "IRE", "RED"] },
  { letters: "SHORE", words: ["SHORE", "HORSE", "HOSE", "HERO", "ROSE", "SHOE", "SORE", "ROES", "HOES", "EROS", "ORE", "HER", "ROE", "SHE", "HOE"] },
  { letters: "TIMER", words: ["TIMER", "REMIT", "MERIT", "MITE", "TIRE", "RITE", "MIRE", "EMIT", "TERM", "TRIM", "TIER", "ITEM", "MET", "RIM", "TIE", "IRE"] },
  { letters: "UNITE", words: ["UNITE", "UNTIE", "TUNE", "UNIT", "NINE", "TINE", "NUT", "TIN", "NET", "TEN", "TIE", "NIT"] },
  { letters: "VERSE", words: ["VERSE", "SERVE", "SEVER", "EVER", "VEER", "SERE", "EVES", "REVS", "ERE", "EVE", "SEE"] },
  { letters: "STARE", words: ["STARE", "TEARS", "RATES", "ASTER", "STAR", "RATE", "TEAR", "REST", "EAST", "RATS", "SEAT", "EARS", "ERAS", "ARTS", "ATE", "ART", "EAR", "ERA", "SAT", "SET", "EAT", "TEA", "ARE"] },
  { letters: "CRANE", words: ["CRANE", "DANCE", "ACNE", "EARN", "NEAR", "CARE", "RACE", "CANE", "ACRE", "ARCED", "ARC", "ACE", "RAN", "EAR", "ERA", "ARE", "CAN"] },
  { letters: "GLIDE", words: ["GLIDE", "GELID", "IDLE", "GELD", "GILD", "LIED", "DELI", "GILD", "OGLE", "GEL", "LID", "DIG", "LED", "LEG", "LIE", "DIE", "GIG"] },
  { letters: "CHARM", words: ["CHARM", "MARCH", "CHAR", "ARCH", "HARM", "CRAM", "MARC", "MARSH", "HAM", "ARC", "ARM", "CAR", "MAR", "RAM"] },
  { letters: "BLEND", words: ["BLEND", "BLEED", "LEND", "BEND", "BLED", "LOBE", "DEN", "BED", "LED", "END", "ELM"] },
  { letters: "SPARK", words: ["SPARK", "PARKS", "RAPS", "PARK", "RASP", "SPAR", "PARS", "ARKS", "ARK", "ASK", "PAR", "RAP", "SPA", "SAP", "SKA"] },
  { letters: "CLOTH", words: ["CLOTH", "CLOT", "COLT", "LOCH", "LOTH", "CLOG", "COT", "HOT", "LOT", "COL"] },
  { letters: "SPEAR", words: ["SPEAR", "SPARE", "PARSE", "PEARS", "REAPS", "PARE", "PEAR", "REAP", "RAPS", "RASP", "SPAR", "APES", "EARS", "ERAS", "APE", "ARE", "EAR", "ERA", "PAR", "PEA", "RAP", "REP", "SEA", "SPA"] },
  { letters: "HOUND", words: ["HOUND", "UNDO", "DOUGH", "NOUN", "NOSH", "UPON", "DON", "DUO", "HUN", "NUN", "HOD", "NOD", "DUN"] },
  { letters: "TRACE", words: ["TRACE", "CRATE", "CATER", "CARE", "CART", "RACE", "ACRE", "RATE", "TEAR", "TARE", "ARC", "ACE", "ART", "ATE", "CAR", "EAR", "ERA", "EAT", "TEA", "ARE"] },
  { letters: "SPINE", words: ["SPINE", "PINES", "SNIPE", "PINE", "SPIN", "SINE", "PENS", "NIPS", "PIES", "PEIN", "PIN", "PIE", "SIN", "SIP", "PEN", "NIP", "PEW"] },
  { letters: "CLOAK", words: ["CLOAK", "LOCK", "COAL", "COLA", "LACK", "COOK", "COOL", "LOCO", "OAK", "COL"] },
  { letters: "SURGE", words: ["SURGE", "RUSE", "RUES", "USER", "SURE", "GUST", "RUGS", "URGE", "URGES", "RUG", "RUE", "USE", "SUE"] },
  { letters: "BLAZE", words: ["BLAZE", "ABLE", "BALE", "LAZE", "ZEAL", "BALE", "ALE", "LAB"] },
  { letters: "PRANK", words: ["PRANK", "RANK", "PARK", "NARK", "RINK", "KNAP", "RAP", "RAN", "PAN", "NAP", "ARK", "PAR", "NAG"] },
  { letters: "SWIFT", words: ["SWIFT", "FIST", "FITS", "WITS", "SIFT", "WIST", "WIT", "FIT", "SIT", "IFS"] },
  { letters: "PLUME", words: ["PLUME", "LUMP", "MULE", "PLUM", "PULSE", "PULE", "LURE", "LUMPS", "ELM", "PEW", "MUG", "LUG", "PUL"] },
  { letters: "CREST", words: ["CREST", "RECTS", "REST", "SECT", "ERST", "RECS", "STRE", "SET", "REC"] },
  { letters: "DROWN", words: ["DROWN", "WORN", "DOWN", "WORD", "ROWN", "NODS", "WORM", "NOR", "NOW", "OWN", "ROW", "ROD", "DON", "NOD", "OWN", "WON"] },
  { letters: "FLINT", words: ["FLINT", "LIFT", "LINT", "FLIT", "TILT", "FILL", "THIN", "FIN", "FIT", "LIT", "TIN", "NIT", "NIL"] },
  { letters: "GRASP", words: ["GRASP", "RAPS", "GASP", "RASP", "SPAR", "PARS", "RAGS", "GAPS", "RAG", "RAP", "GAP", "GAS", "PAR", "SPA", "SAP", "SAG"] },
  { letters: "PRISM", words: ["PRISM", "RIMS", "RIPS", "IMPS", "PRIM", "MIRS", "PRIS", "SIP", "SIR", "RIM", "RIP", "IMP"] },
  { letters: "WITCH", words: ["WITCH", "WHICH", "ITCH", "WHIT", "CHIT", "WITH", "WICK", "TWIT", "WIT", "HIT", "HIT"] },
  { letters: "SCENE", words: ["SCENE", "SEEN", "CENSE", "SENSE", "SEC", "SEE", "SEN"] },
  { letters: "SHELF", words: ["SHELF", "FLESH", "SELF", "FISH", "ELFS", "FELT", "ELF", "SHE"] },
  { letters: "PROUD", words: ["PROUD", "POUR", "DROP", "DOUR", "ROUP", "UPDO", "DUO", "OUR", "PRO", "ROD", "RUG", "PUR"] },
  { letters: "GLEAM", words: ["GLEAM", "EAGLE", "MALE", "LAME", "MEAL", "GAME", "GALE", "MAGE", "GLAM", "GEL", "ALE", "AGE", "ELM", "GAL", "GEM", "LAM", "LEG", "GAG", "LAG", "MAG"] },
  { letters: "SWORN", words: ["SWORN", "ROWNS", "SWORN", "WORN", "ROWS", "OWNS", "SNOW", "WONS", "SOWN", "SON", "ROW", "OWN", "NOR", "NOW", "WON", "SOW"] },
];

export function AnagramRushGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  paused,
}: GameComponentProps) {
  const bank = useMemo(() => pickRandom(BANKS), []);
  const letters = useMemo(() => shuffle(bank.letters.split("")), [bank]);
  const [picked, setPicked] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(difficulty === "hard" ? 50 : 60);
  const [start] = useState(() => Date.now());
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (paused || done) return;
    if (left <= 0) {
      setDone(true);
      onComplete({
        score,
        won: found.length >= 3,
        timeMs: Date.now() - start,
        difficulty,
      });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, done, score, found.length, start, difficulty, onComplete]);

  const word = picked.map((i) => letters[i]).join("");

  const addLetter = (i: number) => {
    if (paused || done || picked.includes(i)) return;
    sfx.tap(soundEnabled);
    setPicked((p) => [...p, i]);
  };

  const submit = () => {
    if (paused || done || word.length < 3) return;
    const w = word.toUpperCase();
    if (bank.words.includes(w) && !found.includes(w)) {
      sfx.correct(soundEnabled);
      const pts = Math.round(w.length * 12 * difficultyMultiplier(difficulty));
      const ns = score + pts;
      setScore(ns);
      onScoreChange?.(ns);
      const nf = [...found, w];
      setFound(nf);
      setPicked([]);
      if (nf.length >= Math.min(6, bank.words.length)) {
        setDone(true);
        onComplete({
          score: ns + left * 2,
          won: true,
          timeMs: Date.now() - start,
          difficulty,
        });
      }
    } else {
      sfx.wrong(soundEnabled);
      setPicked([]);
    }
  };

  return (
    <GameBoard>
      <StatusLine>
        ⏱ {left}s · Found {found.length} · Score {score}
      </StatusLine>
      <div className="text-center font-mono text-2xl tracking-widest min-h-[2rem] mb-4">
        {word || "—"}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {letters.map((L, i) => (
          <button
            key={i}
            type="button"
            disabled={picked.includes(i)}
            onClick={() => addLetter(i)}
            className="w-12 h-12 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] font-mono font-bold text-lg disabled:opacity-30"
          >
            {L}
          </button>
        ))}
      </div>
      <div className="flex gap-2 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setPicked([])}
          className="flex-1 py-3 rounded-full border border-[var(--line)] font-display font-bold text-sm"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={submit}
          className="flex-[2] py-3 rounded-full bg-gradient-to-r from-amber to-[#f59e0b] text-[#241900] font-display font-bold text-sm"
        >
          Submit word
        </button>
      </div>
      {found.length > 0 && (
        <p className="text-center text-xs text-[var(--text-dim)] mt-3">
          {found.join(" · ")}
        </p>
      )}
    </GameBoard>
  );
}
