import type { Question } from "@/lib/types";

export const DAILY_DOSE_QUESTIONS_11: Question[] = [
  {
    tag: "PHYSICS · KINEMATICS",
    q: "A ball is thrown upward at 20 m/s. What's its velocity at the highest point?",
    opts: ["10 m/s", "0 m/s", "20 m/s", "−20 m/s"],
    correct: 1,
  },
  {
    tag: "CHEMISTRY · ATOMIC STRUCTURE",
    q: "Which quantum number determines the orientation of an orbital in space?",
    opts: ["Principal Quantum Number", "Azimuthal Quantum Number", "Magnetic Quantum Number", "Spin Quantum Number"],
    correct: 2,
  },
  {
    tag: "MATHS · QUADRATIC EQUATIONS",
    q: "If the roots of x² - 5x + k = 0 differ by 1, what is the value of k?",
    opts: ["4", "5", "6", "8"],
    correct: 2,
  },
  {
    tag: "BIOLOGY · CELL BIOLOGY",
    q: "Which cell organelle is responsible for synthesizing proteins?",
    opts: ["Mitochondria", "Ribosome", "Lysosome", "Golgi apparatus"],
    correct: 1,
  },
  {
    tag: "PHYSICS · THERMODYNAMICS",
    q: "For a cyclic process, the change in internal energy of the system is:",
    opts: ["Positive", "Negative", "Zero", "Dependant on path"],
    correct: 2,
  },
];

export const DAILY_DOSE_QUESTIONS_12: Question[] = [
  {
    tag: "PHYSICS · ELECTROSTATICS",
    q: "The electric potential at a point on the equatorial line of an electric dipole is:",
    opts: ["Zero", "Maximum", "Infinite", "Negative"],
    correct: 0,
  },
  {
    tag: "CHEMISTRY · KINETICS",
    q: "If the rate constant of a reaction is 2.5 × 10⁻⁴ s⁻¹, what is the order of the reaction?",
    opts: ["Zero order", "First order", "Second order", "Third order"],
    correct: 1,
  },
  {
    tag: "MATHS · MATRICES",
    q: "If A is a square matrix of order 3 such that |A| = 5, what is |adj A|?",
    opts: ["5", "25", "125", "15"],
    correct: 1,
  },
  {
    tag: "BIOLOGY · GENETICS",
    q: "What is the phenotypic ratio of a Mendelian dihybrid cross in F2 generation?",
    opts: ["3:1", "9:3:3:1", "1:2:1", "9:7"],
    correct: 1,
  },
  {
    tag: "PHYSICS · WAVE OPTICS",
    q: "In Young's double-slit experiment, if the distance between slits is halved, the fringe width becomes:",
    opts: ["Halved", "Doubled", "Four times", "Unchanged"],
    correct: 1,
  },
];

// Fallback compatibility export
export const DAILY_DOSE_QUESTIONS: Question[] = DAILY_DOSE_QUESTIONS_11;

export const FUNBRAIN_POOL: Omit<Question, "tag">[] = [
  {
    q: "Which planet is closest to the Sun?",
    opts: ["Venus", "Mercury", "Earth", "Mars"],
    correct: 1,
  },
  {
    q: "H₂O is the chemical formula for:",
    opts: ["Salt", "Oxygen", "Water", "Hydrogen"],
    correct: 2,
  },
  {
    q: "What is 12 × 8?",
    opts: ["96", "88", "108", "86"],
    correct: 0,
  },
  {
    q: "Newton's first law is also called the law of:",
    opts: ["Motion", "Inertia", "Gravity", "Momentum"],
    correct: 1,
  },
  {
    q: "What is the powerhouse of the cell?",
    opts: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"],
    correct: 2,
  },
  {
    q: "Speed of light in vacuum is approximately:",
    opts: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"],
    correct: 1,
  },
];
