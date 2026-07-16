"use client";

import { useEffect, useState } from "react";
import type { GameComponentProps } from "@/lib/brain-gym/types";
import { sfx } from "@/lib/brain-gym/utils/sound";
import { difficultyMultiplier } from "@/lib/brain-gym/storage";
import { GameBoard, StatusLine } from "./_shared";
import { shuffle } from "@/lib/brain-gym/utils/shuffle";

const FACTS: { q: string; t: boolean }[] = [
  // ── SCIENCE: Physics, Chemistry, Biology, Astronomy (45) ──
  { q: "The Earth orbits the Sun.", t: true },
  { q: "Water freezes at 100°C.", t: false },
  { q: "Light travels faster than sound.", t: true },
  { q: "Photosynthesis needs sunlight.", t: true },
  { q: "Sound needs a medium to travel.", t: true },
  { q: "The chemical symbol for oxygen is O.", t: true },
  { q: "Gold is a liquid at room temperature.", t: false },
  { q: "The speed of light is approximately 300,000 km/s.", t: true },
  { q: "Electrons are larger than protons.", t: false },
  { q: "Water is made up of hydrogen and oxygen.", t: true },
  { q: "An atom is the smallest unit of matter.", t: false },
  { q: "The chemical formula for table salt is NaCl.", t: true },
  { q: "Helium is heavier than air.", t: false },
  { q: "DNA stands for deoxyribonucleic acid.", t: true },
  { q: "Mitochondria are known as the powerhouse of the cell.", t: true },
  { q: "Venus is the closest planet to the Sun.", t: false },
  { q: "Jupiter is the largest planet in our solar system.", t: true },
  { q: "The Moon has its own light source.", t: false },
  { q: "A year on Earth is approximately 365.25 days.", t: true },
  { q: "Pluto is currently classified as a dwarf planet.", t: true },
  { q: "Sound travels faster in water than in air.", t: true },
  { q: "Gravity is stronger on the Moon than on Earth.", t: false },
  { q: "The Sun is a star.", t: true },
  { q: "Diamonds are made of carbon.", t: true },
  { q: "Mercury is the hottest planet in the solar system.", t: false },
  { q: "The chemical symbol for gold is Au.", t: true },
  { q: "Neutrons have a positive electrical charge.", t: false },
  { q: "Acid rain is caused by sulfur dioxide and nitrogen oxides.", t: true },
  { q: "The Milky Way is a spiral galaxy.", t: true },
  { q: "Plants take in carbon dioxide and release oxygen.", t: true },
  { q: "The boiling point of water is 50°C at sea level.", t: false },
  { q: "Newton's first law is about inertia.", t: true },
  { q: "Light cannot travel through a vacuum.", t: false },
  { q: "Mars is known as the Red Planet.", t: true },
  { q: "Saturn is the only planet with rings.", t: false },
  { q: "The periodic table has 118 confirmed elements.", t: true },
  { q: "Kinetic energy is the energy of motion.", t: true },
  { q: "Absolute zero is 0°C.", t: false },
  { q: "The speed of sound at sea level is about 343 m/s.", t: true },
  { q: "Photons have mass.", t: false },
  { q: "Black holes can emit no light.", t: true },
  { q: "Copper is a good conductor of electricity.", t: true },
  { q: "The chemical symbol for iron is Fe.", t: true },
  { q: "Chlorophyll gives plants their green color.", t: true },
  { q: "The asteroid belt is located between Mars and Jupiter.", t: true },

  // ── GEOGRAPHY (32) ──
  { q: "The Nile is the longest river in Africa.", t: true },
  { q: "Australia is both a country and a continent.", t: true },
  { q: "Mount Everest is in Africa.", t: false },
  { q: "The Pacific Ocean is the largest ocean on Earth.", t: true },
  { q: "Canada has the most coastline of any country.", t: true },
  { q: "Russia is the largest country by area.", t: true },
  { q: "Tokyo is the capital of China.", t: false },
  { q: "The Amazon River is in South America.", t: true },
  { q: "There are 5 oceans on Earth.", t: true },
  { q: "The Sahara Desert is in Europe.", t: false },
  { q: "Brazil is the largest country in South America.", t: true },
  { q: "The Great Wall of China is visible from space with the naked eye.", t: false },
  { q: "Iceland is covered mostly in ice.", t: false },
  { q: "The Dead Sea is the lowest point on Earth's surface.", t: true },
  { q: "Africa has the most countries of any continent.", t: true },
  { q: "The capital of Australia is Sydney.", t: false },
  { q: "The Andes is the longest mountain range in the world.", t: true },
  { q: "Greenland is the largest island in the world.", t: true },
  { q: "The Mississippi River flows into the Pacific Ocean.", t: false },
  { q: "Vatican City is the smallest country in the world.", t: true },
  { q: "The Sahara is the largest desert in the world.", t: false },
  { q: "Lake Superior is the largest freshwater lake by surface area.", t: true },
  { q: "Mount Kilimanjaro is in Tanzania.", t: true },
  { q: "The capital of Canada is Toronto.", t: false },
  { q: "Antarctica is the driest continent.", t: true },
  { q: "The Danube River flows through ten countries.", t: true },
  { q: "The equator passes through India.", t: false },
  { q: "New Zealand is northeast of Australia.", t: false },
  { q: "The capital of Japan is Tokyo.", t: true },
  { q: "The Mariana Trench is the deepest part of the ocean.", t: true },
  { q: "France is the largest country in Europe by area.", t: true },
  { q: "K2 is the second-highest mountain in the world.", t: true },

  // ── HISTORY (27) ──
  { q: "The Titanic sank in 1912.", t: true },
  { q: "World War I began in 1914.", t: true },
  { q: "The first man on the moon was Buzz Aldrin.", t: false },
  { q: "The Berlin Wall fell in 1989.", t: true },
  { q: "The printing press was invented by Johannes Gutenberg.", t: true },
  { q: "Cleopatra was Greek, not Egyptian.", t: true },
  { q: "The French Revolution began in 1789.", t: true },
  { q: "Columbus sailed to the Americas in 1592.", t: false },
  { q: "The Roman Empire fell in 476 AD.", t: true },
  { q: "Albert Einstein invented the lightbulb.", t: false },
  { q: "The Declaration of Independence was signed in 1776.", t: true },
  { q: "Napoleon Bonaparte was unusually short for his time.", t: false },
  { q: "The Great Fire of London occurred in 1666.", t: true },
  { q: "Alexander the Great was from Greece (Macedonia).", t: true },
  { q: "The first Olympic Games were held in Rome.", t: false },
  { q: "The Renaissance began in Italy.", t: true },
  { q: "Mahatma Gandhi was born in South Africa.", t: false },
  { q: "The Magna Carta was signed in 1215.", t: true },
  { q: "The Cold War was an armed conflict between the US and USSR.", t: false },
  { q: "The telephone was invented by Alexander Graham Bell.", t: true },
  { q: "The ancient Egyptians built the Pyramids of Giza.", t: true },
  { q: "World War II ended in 1945.", t: true },
  { q: "The Wright brothers made the first powered flight in 1903.", t: true },
  { q: "The Viking age began around the 5th century.", t: false },
  { q: "Leonardo da Vinci painted the Mona Lisa.", t: true },
  { q: "The Industrial Revolution started in Germany.", t: false },
  { q: "Penicillin was discovered by Alexander Fleming.", t: true },

  // ── MATH (22) ──
  { q: "A square has 4 equal sides.", t: true },
  { q: "π is exactly 22/7.", t: false },
  { q: "Zero is an even number.", t: true },
  { q: "A decade is 100 years.", t: false },
  { q: "The sum of angles in a triangle is 180 degrees.", t: true },
  { q: "A prime number has exactly two factors.", t: true },
  { q: "The square root of 144 is 14.", t: false },
  { q: "1 is a prime number.", t: false },
  { q: "A hexagon has 6 sides.", t: true },
  { q: "Pi (π) is a rational number.", t: false },
  { q: "The Fibonacci sequence starts with 0 and 1.", t: true },
  { q: "An obtuse angle is greater than 90 degrees.", t: true },
  { q: "The number 0.999... (repeating) equals 1.", t: true },
  { q: "A cube has 8 faces.", t: false },
  { q: "The square root of 2 is an irrational number.", t: true },
  { q: "Parallel lines eventually meet.", t: false },
  { q: "There are infinitely many prime numbers.", t: true },
  { q: "A circle has exactly one line of symmetry.", t: false },
  { q: "The number e (Euler's number) is approximately 2.718.", t: true },
  { q: "A rhombus has all sides equal in length.", t: true },
  { q: "The perimeter of a circle is called the circumference.", t: true },
  { q: "Negative numbers have real square roots.", t: false },

  // ── LANGUAGE (18) ──
  { q: "An adjective describes a noun.", t: true },
  { q: "English has more words than any other language.", t: true },
  { q: "A verb is a doing word.", t: true },
  { q: "The word 'alphabet' comes from the first two Greek letters.", t: true },
  { q: "A palindrome reads the same backward and forward.", t: true },
  { q: "There are 24 letters in the English alphabet.", t: false },
  { q: "Mandarin Chinese is the most spoken native language in the world.", t: true },
  { q: "An oxymoron is a figure of speech with contradictory terms.", t: true },
  { q: "The longest word in English has 20 letters.", t: false },
  { q: "A synonym is a word that means the opposite of another word.", t: false },
  { q: "The word 'set' has the most definitions in English.", t: true },
  { q: "Latin is still an official language of Vatican City.", t: true },
  { q: "A haiku has 5-7-5 syllable structure.", t: true },
  { q: "All sentences must contain an adjective.", t: false },
  { q: "An adverb can modify a verb, adjective, or another adverb.", t: true },
  { q: "The word 'queue' is pronounced the same if you remove the last four letters.", t: true },
  { q: "French is the most widely spoken language in Africa.", t: false },
  { q: "The dot over the letters 'i' and 'j' is called a tittle.", t: true },

  // ── TECHNOLOGY (22) ──
  { q: "Python is only a snake, not a language.", t: false },
  { q: "The first computer virus was created in the 1980s.", t: true },
  { q: "HTML stands for HyperText Markup Language.", t: true },
  { q: "The first iPhone was released in 2005.", t: false },
  { q: "A byte is 8 bits.", t: true },
  { q: "Tim Berners-Lee invented the World Wide Web.", t: true },
  { q: "RAM stands for Random Access Memory.", t: true },
  { q: "The first programmable computer was created by Charles Babbage.", t: true },
  { q: "Java and JavaScript are the same programming language.", t: false },
  { q: "Wi-Fi stands for Wireless Fidelity.", t: false },
  { q: "Google was originally called BackRub.", t: true },
  { q: "Moore's Law predicts that computer speed doubles every 10 years.", t: false },
  { q: "USB stands for Universal Serial Bus.", t: true },
  { q: "Linux is an open-source operating system.", t: true },
  { q: "The first email was sent in 1971.", t: true },
  { q: "Bluetooth is named after a Viking king.", t: true },
  { q: "A gigabyte is 1,000 megabytes (in decimal).", t: true },
  { q: "Amazon started as an online bookstore.", t: true },
  { q: "CSS stands for Computer Style Sheets.", t: false },
  { q: "The first website went live in 1991.", t: true },
  { q: "Apple's first product was a smartphone.", t: false },
  { q: "The @ symbol in email was chosen by Ray Tomlinson.", t: true },

  // ── NATURE: Animals, Plants, Ecosystems, Weather (22) ──
  { q: "Dolphins are mammals.", t: true },
  { q: "A group of lions is called a pride.", t: true },
  { q: "Penguins can fly.", t: false },
  { q: "Bats are blind.", t: false },
  { q: "Honey never spoils.", t: true },
  { q: "An octopus has three hearts.", t: true },
  { q: "Sharks are mammals.", t: false },
  { q: "The blue whale is the largest animal ever to have lived.", t: true },
  { q: "Bamboo is the fastest-growing plant.", t: true },
  { q: "Spiders are insects.", t: false },
  { q: "A chameleon changes color only to camouflage.", t: false },
  { q: "Lightning strikes the Earth about 100 times per second.", t: true },
  { q: "Bananas grow on trees.", t: false },
  { q: "Rainforests produce about 20% of the world's oxygen.", t: true },
  { q: "Tornadoes can occur on water (waterspouts).", t: true },
  { q: "All deserts are hot.", t: false },
  { q: "Koalas are bears.", t: false },
  { q: "A starfish can regenerate its arms.", t: true },
  { q: "Venus flytraps are native to a small area in North and South Carolina.", t: true },
  { q: "Earthquakes can trigger tsunamis.", t: true },
  { q: "Hummingbirds can fly backwards.", t: true },
  { q: "Moss grows only on the north side of trees.", t: false },

  // ── HUMAN BODY (18) ──
  { q: "Humans have 3 lungs.", t: false },
  { q: "There are 24 hours in a day.", t: true },
  { q: "The human body has 206 bones.", t: true },
  { q: "The largest organ in the human body is the skin.", t: true },
  { q: "Humans use only 10% of their brains.", t: false },
  { q: "Red blood cells carry oxygen.", t: true },
  { q: "The human heart has four chambers.", t: true },
  { q: "Fingernails grow faster than toenails.", t: true },
  { q: "The smallest bone in the human body is in the ear.", t: true },
  { q: "Adults have more bones than babies.", t: false },
  { q: "The human nose can detect over 1 trillion scents.", t: true },
  { q: "Blood is blue inside the body.", t: false },
  { q: "Your stomach gets a new lining every few days.", t: true },
  { q: "Humans are born with 300 bones.", t: true },
  { q: "The liver is the largest internal organ.", t: true },
  { q: "Taste buds are only on the tongue.", t: false },
  { q: "The cornea is the only body part with no blood supply.", t: true },
  { q: "Muscles make up about 40% of total body weight.", t: true },

  // ── SPORTS (17) ──
  { q: "The Olympic Games are held every 4 years.", t: true },
  { q: "A marathon is exactly 26.2 miles (42.195 km).", t: true },
  { q: "Soccer is called 'football' in most countries outside the US.", t: true },
  { q: "A baseball team has 11 players on the field.", t: false },
  { q: "The FIFA World Cup is held every 2 years.", t: false },
  { q: "Basketball was invented by James Naismith.", t: true },
  { q: "Tennis uses a scoring system of 15, 30, 40.", t: true },
  { q: "An Olympic swimming pool is 50 meters long.", t: true },
  { q: "Golf balls have dimples to help them fly farther.", t: true },
  { q: "The first modern Olympics were held in Athens in 1896.", t: true },
  { q: "Cricket is the most popular sport in the United States.", t: false },
  { q: "A rugby ball is round.", t: false },
  { q: "The Tour de France is a cycling race.", t: true },
  { q: "A standard soccer game has two halves of 45 minutes each.", t: true },
  { q: "Table tennis originated in India.", t: false },
  { q: "The Super Bowl is the championship game of the NFL.", t: true },
  { q: "Ice hockey originated in Canada.", t: true },

  // ── GENERAL KNOWLEDGE (22) ──
  { q: "The moon is a planet.", t: false },
  { q: "A fortnight is two weeks.", t: true },
  { q: "There are 52 cards in a standard deck (excluding jokers).", t: true },
  { q: "The Great Pyramid of Giza is one of the Seven Wonders of the Ancient World.", t: true },
  { q: "The currency of Japan is the yuan.", t: false },
  { q: "A group of crows is called a murder.", t: true },
  { q: "Humans have 5 senses.", t: true },
  { q: "The Statue of Liberty was a gift from the United Kingdom.", t: false },
  { q: "Chess originated in India.", t: true },
  { q: "The Mona Lisa is displayed in the Louvre Museum.", t: true },
  { q: "Espresso has more caffeine per cup than drip coffee.", t: false },
  { q: "The unicorn is the national animal of Scotland.", t: true },
  { q: "Tomatoes are botanically classified as fruits.", t: true },
  { q: "The piano has 88 keys.", t: true },
  { q: "Mount Rushmore features the faces of five presidents.", t: false },
  { q: "Octopi is the correct plural of octopus.", t: false },
  { q: "A leap year occurs every 4 years.", t: true },
  { q: "Sushi means 'raw fish' in Japanese.", t: false },
  { q: "The Eiffel Tower is in Paris.", t: true },
  { q: "Goldfish have a 3-second memory.", t: false },
  { q: "The human eye can distinguish about 10 million colors.", t: true },
  { q: "A jiffy is an actual unit of time.", t: true },
];

export function TrueFalseGame({
  difficulty,
  soundEnabled,
  onComplete,
  onScoreChange,
  onLivesChange,
  paused,
}: GameComponentProps) {
  const duration = 40;
  const [left, setLeft] = useState(duration);
  const [deck, setDeck] = useState(() => shuffle(FACTS));
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [start] = useState(() => Date.now());
  const [touchX, setTouchX] = useState<number | null>(null);

  const q = deck[i % deck.length]!;

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onComplete({ score, won: score >= 60, timeMs: Date.now() - start, difficulty });
      return;
    }
    const id = window.setTimeout(() => setLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [left, paused, score, start, difficulty, onComplete]);

  const answer = (val: boolean) => {
    if (paused || left <= 0) return;
    if (val === q.t) {
      sfx.correct(soundEnabled);
      const ns = score + Math.round(14 * difficultyMultiplier(difficulty));
      setScore(ns);
      onScoreChange?.(ns);
    } else {
      sfx.wrong(soundEnabled);
      const nl = lives - 1;
      setLives(nl);
      onLivesChange?.(nl);
      if (nl <= 0) {
        onComplete({ score, won: false, timeMs: Date.now() - start, difficulty });
        return;
      }
    }
    setI((x) => x + 1);
  };

  return (
    <GameBoard>
      <StatusLine>⏱ {left}s · Swipe or tap · Score {score}</StatusLine>
      <div
        className="min-h-[140px] rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-6 flex items-center justify-center text-center font-display font-bold text-lg sm:text-xl"
        onTouchStart={(e) => setTouchX(e.touches[0]!.clientX)}
        onTouchEnd={(e) => {
          if (touchX == null) return;
          const dx = e.changedTouches[0]!.clientX - touchX;
          if (dx > 50) answer(true);
          else if (dx < -50) answer(false);
          setTouchX(null);
        }}
      >
        {q.q}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={() => answer(false)}
          className="py-4 rounded-2xl bg-red-500/20 border border-red-500/30 font-display font-bold text-red-300"
        >
          False ←
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className="py-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 font-display font-bold text-emerald-300"
        >
          True →
        </button>
      </div>
    </GameBoard>
  );
}
