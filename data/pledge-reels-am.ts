/** AM pledge reel — 180 days × 4 slides. */
export type PledgeReelAmSlide = {
  icon: string;
  headline: string;
  emphasisWord: string;
  caption: string;
};

export type PledgeReelAmDay = {
  day: number;
  theme: string;
  slides: PledgeReelAmSlide[];
};

export const PLEDGE_REEL_AM_DAYS: PledgeReelAmDay[] = [
  {
    day: 1,
    theme: "Start the day with your brain",
    slides: [
      {
        icon: "🌅",
        headline: "Brain first, phone later",
        emphasisWord: "Brain",
        caption: "Before opening AI, open your own mind. One question in Physics or Chemistry should come from you first.",
      },
      {
        icon: "🧠",
        headline: "Thinking builds stronger memory",
        emphasisWord: "Thinking",
        caption: "If AI solves everything, your brain stays sleepy. In exams, sleepy memory drops marks fast.",
      },
      {
        icon: "👨‍🎓",
        headline: "Ravi solved first, then checked",
        emphasisWord: "solved",
        caption: "Ravi tried the math sum alone for 10 minutes. Then AI helped him fix one step, not steal the whole answer.",
      },
      {
        icon: "✅",
        headline: "Write one question before AI",
        emphasisWord: "question",
        caption: "Today, solve one doubt on your own for 10 minutes. Then ask AI for a hint, not the full solution.",
      },
    ],
  },
  {
    day: 2,
    theme: "Try first, ask second",
    slides: [
      {
        icon: "📱",
        headline: "First try, then open AI",
        emphasisWord: "try",
        caption: "That urge to tap AI first is strong at 8 AM. Hold it for one round and test your own brain.",
      },
      {
        icon: "⚡",
        headline: "Attempts make the exam easier",
        emphasisWord: "Attempts",
        caption: "When you try, your mind remembers the path. In boards and JEE, the path matters as much as the answer.",
      },
      {
        icon: "📝",
        headline: "Meera wrote steps before help",
        emphasisWord: "wrote",
        caption: "Meera wrote her steps for a chemistry numericals problem. AI only showed where she was stuck.",
      },
      {
        icon: "🎯",
        headline: "Attempt one problem alone today",
        emphasisWord: "Attempt",
        caption: "Pick one NCERT or coaching question. Solve it for 10 minutes before asking anything.",
      },
    ],
  },
  {
    day: 3,
    theme: "AI explains, you solve",
    slides: [
      {
        icon: "💡",
        headline: "Let AI explain, not answer",
        emphasisWord: "explain",
        caption: "AI should be your tutor, not your answer sheet. Use it to understand, then solve with your hand.",
      },
      {
        icon: "📚",
        headline: "Concepts stick when you work",
        emphasisWord: "Concepts",
        caption: "Reading alone feels easy, but solving fixes the concept in your head. That saves marks in school tests.",
      },
      {
        icon: "👩‍🏫",
        headline: "Asha asked for a hint",
        emphasisWord: "hint",
        caption: "Asha told AI to explain the method for a board sum. She then finished the final steps herself.",
      },
      {
        icon: "✍️",
        headline: "Ask for explanation today",
        emphasisWord: "explanation",
        caption: "Type: explain this concept in simple steps. Do not ask for the final answer first.",
      },
    ],
  },
  {
    day: 4,
    theme: "Homework is practice, not paste",
    slides: [
      {
        icon: "📒",
        headline: "Homework is your practice ground",
        emphasisWord: "practice",
        caption: "Homework is where your brain trains. If you paste answers, the exam will expose the gap.",
      },
      {
        icon: "🏏",
        headline: "Practice gives real confidence",
        emphasisWord: "Practice",
        caption: "Like batting in nets, homework builds speed and timing. Copying gives only fake confidence.",
      },
      {
        icon: "👦",
        headline: "Karan copied, then forgot",
        emphasisWord: "copied",
        caption: "Karan copied his maths homework in five minutes. In class, he could not explain a single step.",
      },
      {
        icon: "🛠️",
        headline: "Do homework without copy-paste",
        emphasisWord: "homework",
        caption: "Solve first, then verify. Use AI only to check the method or clear one doubt.",
      },
    ],
  },
  {
    day: 5,
    theme: "Coaching doubts without cheating",
    slides: [
      {
        icon: "🏫",
        headline: "Coaching doubt, not shortcut",
        emphasisWord: "shortcut",
        caption: "When coaching leaves you confused, do not run to the final answer. Ask for the missing idea.",
      },
      {
        icon: "🔍",
        headline: "Good doubt solving builds skill",
        emphasisWord: "skill",
        caption: "A real doubt solved properly becomes skill. A shortcut solved quickly becomes panic in tests.",
      },
      {
        icon: "🧑‍🎓",
        headline: "Neha used AI like tutor",
        emphasisWord: "tutor",
        caption: "Neha asked AI to break a physics concept into steps. She stayed honest and learned faster.",
      },
      {
        icon: "📌",
        headline: "Ask one doubt the right way",
        emphasisWord: "right",
        caption: "Write your doubt in one line. Then ask AI for a clue, formula, or method only.",
      },
    ],
  },
  {
    day: 6,
    theme: "Board exam steps matter",
    slides: [
      {
        icon: "📄",
        headline: "Marks hide in the steps",
        emphasisWord: "steps",
        caption: "In board exams, every step can fetch marks. If AI does all the work, you miss them.",
      },
      {
        icon: "🧮",
        headline: "Step writing saves partial marks",
        emphasisWord: "Step",
        caption: "Even if the final answer slips, clean steps protect you. That matters in Physics, Maths, and Chemistry.",
      },
      {
        icon: "👧",
        headline: "Priya showed working clearly",
        emphasisWord: "working",
        caption: "Priya solved the question herself first. AI only helped her make the steps neater.",
      },
      {
        icon: "🖊️",
        headline: "Write steps before checking AI",
        emphasisWord: "steps",
        caption: "Today, write full working for one board-style question. Then compare your method with AI.",
      },
    ],
  },
  {
    day: 7,
    theme: "JEE problems need your attempt",
    slides: [
      {
        icon: "🚀",
        headline: "JEE starts with your attempt",
        emphasisWord: "attempt",
        caption: "JEE questions are built to test your thinking. No attempt means no real learning.",
      },
      {
        icon: "🧠",
        headline: "Struggle today, speed tomorrow",
        emphasisWord: "Struggle",
        caption: "The struggle in one tough sum trains your brain for many later. That is how speed grows.",
      },
      {
        icon: "👨‍💻",
        headline: "Arjun tried before any hint",
        emphasisWord: "tried",
        caption: "Arjun wrestled with a calculus problem for 12 minutes. AI then gave one hint that unlocked the method.",
      },
      {
        icon: "⏱️",
        headline: "Spend 12 minutes alone first",
        emphasisWord: "minutes",
        caption: "Choose one JEE question. Try it alone for 12 minutes before asking AI for guidance.",
      },
    ],
  },
  {
    day: 8,
    theme: "NCERT first, AI second",
    slides: [
      {
        icon: "📘",
        headline: "NCERT before every AI search",
        emphasisWord: "NCERT",
        caption: "For boards and basics, NCERT is the anchor. AI should come after your book, not before it.",
      },
      {
        icon: "🧭",
        headline: "Books keep your path clear",
        emphasisWord: "Books",
        caption: "Books give the exact syllabus road. AI can explain, but your textbook keeps you on track.",
      },
      {
        icon: "👩‍🎓",
        headline: "Sana read first, asked later",
        emphasisWord: "read",
        caption: "Sana read the NCERT example before using AI. Her doubt got smaller and easier to solve.",
      },
      {
        icon: "📖",
        headline: "Open NCERT before opening AI",
        emphasisWord: "NCERT",
        caption: "Today, read one page or example first. Then use AI only to clear the hard part.",
      },
    ],
  },
  {
    day: 9,
    theme: "Phone open, choose learning mode",
    slides: [
      {
        icon: "📲",
        headline: "Open phone, choose learning",
        emphasisWord: "learning",
        caption: "Your phone can become a study tool or a shortcut machine. Choose learning mode in the morning.",
      },
      {
        icon: "🎓",
        headline: "Smart use beats lazy use",
        emphasisWord: "Smart",
        caption: "AI is powerful when you use it well. Lazy use steals growth and leaves blank space in exams.",
      },
      {
        icon: "🧑‍🎒",
        headline: "Dev used hints, not answers",
        emphasisWord: "hints",
        caption: "Dev opened AI after trying alone. He asked for hints on one step and finished the rest himself.",
      },
      {
        icon: "🔒",
        headline: "Lock in learning mode now",
        emphasisWord: "learning",
        caption: "Before messages and reels, open one study topic. Use AI only after your own first attempt.",
      },
    ],
  },
  {
    day: 10,
    theme: "Morning pledge, honest study day",
    slides: [
      {
        icon: "☀️",
        headline: "Morning pledge sets today",
        emphasisWord: "pledge",
        caption: "This pledge is for today, not someday. Start honest and your study day feels lighter.",
      },
      {
        icon: "💪",
        headline: "Honesty makes effort stronger",
        emphasisWord: "Honesty",
        caption: "When you stay honest, your effort actually grows your brain. That strength shows in tests and viva.",
      },
      {
        icon: "👨‍🎓",
        headline: "Rohit stayed honest and calm",
        emphasisWord: "honest",
        caption: "Rohit felt pressure before his school test. He studied with AI like a tutor and walked in calm.",
      },
      {
        icon: "✅",
        headline: "Study one topic honestly",
        emphasisWord: "honestly",
        caption: "Choose one chapter now. Try, think, then ask AI only for learning support.",
      },
    ],
  },
  {
    day: 11,
    theme: "Mistakes are your best teacher",
    slides: [
      {
        icon: "❌",
        headline: "Mistakes grow your brain",
        emphasisWord: "Mistakes",
        caption: "Getting one answer wrong today is better than forgetting everything in the board exam.",
      },
      {
        icon: "🧠",
        headline: "Wrong answers reveal gaps",
        emphasisWord: "Wrong",
        caption: "AI hides your weak spots when it solves everything. Your own attempt shows what needs practice.",
      },
      {
        icon: "👩‍🎓",
        headline: "Anjali corrected her errors",
        emphasisWord: "errors",
        caption: "Anjali reviewed every mistake herself. AI explained why, but she rewrote the solution alone.",
      },
      {
        icon: "✍️",
        headline: "Review one mistake today",
        emphasisWord: "mistake",
        caption: "Find one wrong answer from yesterday and understand it before asking AI anything.",
      },
    ],
  },
  {
    day: 12,
    theme: "Think before every search",
    slides: [
      {
        icon: "🔎",
        headline: "Pause before searching AI",
        emphasisWord: "Pause",
        caption: "The fastest search is not always the smartest start. Give your brain one chance first.",
      },
      {
        icon: "💭",
        headline: "Thinking strengthens recall",
        emphasisWord: "Thinking",
        caption: "The effort you make now becomes memory during exams when AI is nowhere around.",
      },
      {
        icon: "👦",
        headline: "Vikram paused and solved",
        emphasisWord: "paused",
        caption: "Vikram stopped for five minutes before opening AI. The answer came from his own reasoning.",
      },
      {
        icon: "⏳",
        headline: "Wait five minutes first",
        emphasisWord: "five",
        caption: "Before searching AI today, think quietly for five minutes on your own.",
      },
    ],
  },
  {
    day: 13,
    theme: "Own every written step",
    slides: [
      {
        icon: "📝",
        headline: "Write before asking AI",
        emphasisWord: "Write",
        caption: "Your notebook should show your thinking, not AI's typing.",
      },
      {
        icon: "📚",
        headline: "Writing fixes concepts deeper",
        emphasisWord: "Writing",
        caption: "Writing formulas and steps by hand helps them stay during practicals and board exams.",
      },
      {
        icon: "👨‍🏫",
        headline: "Rahul filled every step",
        emphasisWord: "step",
        caption: "Rahul wrote the complete solution first. AI only checked if his method was correct.",
      },
      {
        icon: "✏️",
        headline: "Fill every missing step",
        emphasisWord: "step",
        caption: "Today, never leave blanks for AI to complete. Finish every step yourself.",
      },
    ],
  },
  {
    day: 14,
    theme: "Learn formulas with understanding",
    slides: [
      {
        icon: "📐",
        headline: "Understand before memorising formulas",
        emphasisWord: "Understand",
        caption: "A remembered formula fades. A understood formula stays even under exam pressure.",
      },
      {
        icon: "💡",
        headline: "Meaning beats memorising",
        emphasisWord: "Meaning",
        caption: "AI can explain why a formula works. You should still apply it yourself.",
      },
      {
        icon: "👧",
        headline: "Sneha learned the reason",
        emphasisWord: "reason",
        caption: "Sneha asked AI why the formula worked. She solved three questions herself afterward.",
      },
      {
        icon: "📖",
        headline: "Explain one formula yourself",
        emphasisWord: "formula",
        caption: "Today, explain one formula in your own words before solving questions.",
      },
    ],
  },
  {
    day: 15,
    theme: "Viva confidence starts today",
    slides: [
      {
        icon: "🎤",
        headline: "Speak concepts with confidence",
        emphasisWord: "confidence",
        caption: "In viva, nobody asks AI. Your understanding must answer.",
      },
      {
        icon: "🗣️",
        headline: "Explaining builds confidence",
        emphasisWord: "Explaining",
        caption: "If you can explain a concept aloud, you truly know it.",
      },
      {
        icon: "👨‍🔬",
        headline: "Ishaan explained without notes",
        emphasisWord: "explained",
        caption: "Ishaan asked AI to quiz him instead of giving answers. His practical viva felt easier.",
      },
      {
        icon: "🎯",
        headline: "Explain one concept aloud",
        emphasisWord: "concept",
        caption: "Teach one chapter to yourself for two minutes before using AI.",
      },
    ],
  },
  {
    day: 16,
    theme: "Strong basics win tough questions",
    slides: [
      {
        icon: "🏗️",
        headline: "Build basics every morning",
        emphasisWord: "basics",
        caption: "Every difficult JEE question stands on simple concepts.",
      },
      {
        icon: "📘",
        headline: "Basics unlock difficult questions",
        emphasisWord: "Basics",
        caption: "AI cannot replace strong fundamentals built through daily practice.",
      },
      {
        icon: "👩‍🎓",
        headline: "Pooja revised fundamentals first",
        emphasisWord: "fundamentals",
        caption: "Pooja revised basic laws before attempting advanced numericals. Everything became clearer.",
      },
      {
        icon: "📚",
        headline: "Revise one basic concept",
        emphasisWord: "basic",
        caption: "Spend ten minutes strengthening one weak foundation before solving harder problems.",
      },
    ],
  },
  {
    day: 17,
    theme: "Practice beats perfect answers",
    slides: [
      {
        icon: "🏃",
        headline: "Practice beats instant answers",
        emphasisWord: "Practice",
        caption: "Quick answers feel good today. Practice helps during the actual exam.",
      },
      {
        icon: "📈",
        headline: "Repetition creates confidence",
        emphasisWord: "Repetition",
        caption: "Every solved question trains your speed for board papers and mock tests.",
      },
      {
        icon: "👦",
        headline: "Aman solved five himself",
        emphasisWord: "five",
        caption: "Aman attempted five biology questions before checking AI explanations.",
      },
      {
        icon: "✅",
        headline: "Finish five questions independently",
        emphasisWord: "five",
        caption: "Solve five questions today without looking at AI solutions.",
      },
    ],
  },
  {
    day: 18,
    theme: "Curiosity creates better learners",
    slides: [
      {
        icon: "🤔",
        headline: "Ask why, not only what",
        emphasisWord: "why",
        caption: "Curiosity makes learning exciting. Answers alone never do.",
      },
      {
        icon: "🔬",
        headline: "Questions deepen understanding",
        emphasisWord: "Questions",
        caption: "Ask AI why something happens instead of asking it to finish the homework.",
      },
      {
        icon: "👧",
        headline: "Diya explored every why",
        emphasisWord: "why",
        caption: "Diya asked why reactions happened instead of copying equations. Chemistry became easier.",
      },
      {
        icon: "💬",
        headline: "Ask one why today",
        emphasisWord: "why",
        caption: "Choose one topic and ask AI to explain the reason behind it.",
      },
    ],
  },
  {
    day: 19,
    theme: "Small effort every morning",
    slides: [
      {
        icon: "🌞",
        headline: "Small starts create momentum",
        emphasisWord: "Small",
        caption: "One focused hour every morning beats last-minute panic before exams.",
      },
      {
        icon: "📅",
        headline: "Consistency wins exams",
        emphasisWord: "Consistency",
        caption: "Daily honest study always beats one big weekend marathon.",
      },
      {
        icon: "👨‍🎓",
        headline: "Harsh kept showing up",
        emphasisWord: "showing",
        caption: "Harsh solved one chapter every morning. AI became his guide, not his replacement.",
      },
      {
        icon: "📖",
        headline: "Complete one chapter today",
        emphasisWord: "chapter",
        caption: "Choose one topic and finish it honestly before moving to the next.",
      },
    ],
  },
  {
    day: 20,
    theme: "Earn your own confidence",
    slides: [
      {
        icon: "🏆",
        headline: "Confidence comes from effort",
        emphasisWord: "Confidence",
        caption: "Real confidence grows from questions you solved yourself.",
      },
      {
        icon: "💪",
        headline: "Effort beats shortcuts always",
        emphasisWord: "Effort",
        caption: "Shortcuts disappear inside the exam hall. Your preparation stays.",
      },
      {
        icon: "👩‍🎓",
        headline: "Nisha trusted her preparation",
        emphasisWord: "trusted",
        caption: "Nisha used AI only to understand concepts. During the test, she trusted her own thinking.",
      },
      {
        icon: "🌟",
        headline: "Finish today with pride",
        emphasisWord: "pride",
        caption: "Study honestly today so tomorrow's confidence belongs completely to you.",
      },
    ],
  },
  {
    day: 21,
    theme: "Clues over complete solutions",
    slides: [
      {
        icon: "🧩",
        headline: "Choose clues over answers",
        emphasisWord: "clues",
        caption: "A clue makes your brain work. A ready answer makes your brain watch.",
      },
      {
        icon: "🧠",
        headline: "Clues build lasting memory",
        emphasisWord: "Clues",
        caption: "Finding the next step yourself makes concepts easier to recall in board and JEE exams.",
      },
      {
        icon: "👦",
        headline: "Aditya requested one clue",
        emphasisWord: "clue",
        caption: "Aditya asked AI for only the next step. He finished the remaining solution on his own.",
      },
      {
        icon: "🎯",
        headline: "Request one clue today",
        emphasisWord: "clue",
        caption: "Whenever you're stuck today, ask AI for one clue instead of the complete solution.",
      },
    ],
  },
  {
    day: 22,
    theme: "Your notebook tells the story",
    slides: [
      {
        icon: "📒",
        headline: "Fill your notebook yourself",
        emphasisWord: "notebook",
        caption: "Your notebook should reflect your thinking, not copied AI responses.",
      },
      {
        icon: "✍️",
        headline: "Writing creates stronger recall",
        emphasisWord: "Writing",
        caption: "Every line you write yourself becomes easier to remember during exams.",
      },
      {
        icon: "👧",
        headline: "Riya completed every page",
        emphasisWord: "page",
        caption: "Riya solved each exercise herself. AI only clarified one confusing concept.",
      },
      {
        icon: "📚",
        headline: "Complete one page today",
        emphasisWord: "page",
        caption: "Finish one notebook page entirely on your own before checking with AI.",
      },
    ],
  },
  {
    day: 23,
    theme: "Understand every diagram",
    slides: [
      {
        icon: "🔬",
        headline: "Read every diagram carefully",
        emphasisWord: "diagram",
        caption: "Whether Biology or Physics, understanding the diagram matters more than memorising labels.",
      },
      {
        icon: "👀",
        headline: "Observation improves learning",
        emphasisWord: "Observation",
        caption: "Spend one minute observing before asking AI to explain.",
      },
      {
        icon: "👨‍🔬",
        headline: "Kabir noticed hidden details",
        emphasisWord: "details",
        caption: "Kabir studied the diagram first. AI later confirmed what he had already understood.",
      },
      {
        icon: "📝",
        headline: "Label one diagram yourself",
        emphasisWord: "diagram",
        caption: "Draw or label one diagram before opening AI today.",
      },
    ],
  },
  {
    day: 24,
    theme: "Formula sheet starts with you",
    slides: [
      {
        icon: "📐",
        headline: "Create your formula sheet",
        emphasisWord: "formula",
        caption: "The formulas you write yourself are easier to remember under pressure.",
      },
      {
        icon: "🧮",
        headline: "Revision needs active writing",
        emphasisWord: "Revision",
        caption: "Reading isn't enough. Writing formulas strengthens recall for boards and entrance exams.",
      },
      {
        icon: "👩",
        headline: "Fatima built her notes",
        emphasisWord: "notes",
        caption: "Fatima created her own formula sheet before asking AI for shortcuts to remember it.",
      },
      {
        icon: "📄",
        headline: "Write five formulas today",
        emphasisWord: "formulas",
        caption: "Choose one chapter and handwrite five important formulas before studying further.",
      },
    ],
  },
  {
    day: 25,
    theme: "Solve before checking answers",
    slides: [
      {
        icon: "🎓",
        headline: "Finish before checking AI",
        emphasisWord: "checking",
        caption: "Treat AI like the answer key, not the person taking your test.",
      },
      {
        icon: "🧠",
        headline: "Checking comes after effort",
        emphasisWord: "Checking",
        caption: "Your first attempt teaches more than reading the correct solution.",
      },
      {
        icon: "👦",
        headline: "Rohan verified his method",
        emphasisWord: "verified",
        caption: "Rohan solved every maths step first. AI only verified his approach.",
      },
      {
        icon: "✅",
        headline: "Verify after solving today",
        emphasisWord: "Verify",
        caption: "Complete one question fully before asking AI whether your method is correct.",
      },
    ],
  },
  {
    day: 26,
    theme: "Build exam thinking daily",
    slides: [
      {
        icon: "🏁",
        headline: "Train like exam day",
        emphasisWord: "exam",
        caption: "Every practice session prepares you for the moment when only your mind can answer.",
      },
      {
        icon: "⏱️",
        headline: "Pressure rewards preparation",
        emphasisWord: "Pressure",
        caption: "Daily thinking makes exam pressure feel smaller with every chapter.",
      },
      {
        icon: "👧",
        headline: "Sana practiced under timer",
        emphasisWord: "timer",
        caption: "Sana solved questions with a timer. AI reviewed only the mistakes afterward.",
      },
      {
        icon: "⌛",
        headline: "Use a timer today",
        emphasisWord: "timer",
        caption: "Attempt one set under a timer before asking AI for feedback.",
      },
    ],
  },
  {
    day: 27,
    theme: "Confusion is the starting line",
    slides: [
      {
        icon: "🌱",
        headline: "Confusion means learning begins",
        emphasisWord: "Confusion",
        caption: "Feeling stuck doesn't mean you're failing. It means your brain is growing.",
      },
      {
        icon: "💭",
        headline: "Stay curious through confusion",
        emphasisWord: "curious",
        caption: "Don't escape confusion instantly. Explore it before asking AI.",
      },
      {
        icon: "👨",
        headline: "Varun stayed with confusion",
        emphasisWord: "confusion",
        caption: "Varun spent eight minutes thinking before AI explained one missing concept.",
      },
      {
        icon: "🔍",
        headline: "Sit with confusion briefly",
        emphasisWord: "confusion",
        caption: "Today, spend a few minutes thinking before requesting AI help.",
      },
    ],
  },
  {
    day: 28,
    theme: "School tests reward preparation",
    slides: [
      {
        icon: "🏫",
        headline: "Prepare beyond today's homework",
        emphasisWord: "Prepare",
        caption: "School tests often ask questions differently. Understanding beats memorising.",
      },
      {
        icon: "📖",
        headline: "Preparation beats prediction",
        emphasisWord: "Preparation",
        caption: "AI cannot predict every question. Strong concepts prepare you for all of them.",
      },
      {
        icon: "👩‍🎓",
        headline: "Nikita revised one chapter",
        emphasisWord: "chapter",
        caption: "Nikita revised concepts before checking AI explanations. Her class test felt easier.",
      },
      {
        icon: "🗂️",
        headline: "Revise before asking today",
        emphasisWord: "Revise",
        caption: "Spend fifteen minutes revising your notes before opening AI.",
      },
    ],
  },
  {
    day: 29,
    theme: "Ask better questions daily",
    slides: [
      {
        icon: "❓",
        headline: "Better questions unlock learning",
        emphasisWord: "questions",
        caption: "The quality of your question decides the quality of your learning.",
      },
      {
        icon: "🧩",
        headline: "Specific doubts help more",
        emphasisWord: "Specific",
        caption: "Instead of asking for answers, ask exactly where your understanding breaks.",
      },
      {
        icon: "👦",
        headline: "Arnav refined his question",
        emphasisWord: "question",
        caption: "Arnav showed his attempt and asked why one step failed. AI became a real tutor.",
      },
      {
        icon: "💬",
        headline: "Improve one question today",
        emphasisWord: "question",
        caption: "Show your attempt first, then ask AI about the exact step you don't understand.",
      },
    ],
  },
  {
    day: 30,
    theme: "Finish the month stronger",
    slides: [
      {
        icon: "🌟",
        headline: "Celebrate honest progress today",
        emphasisWord: "progress",
        caption: "Thirty mornings of honest effort build confidence that shortcuts never can.",
      },
      {
        icon: "🚀",
        headline: "Growth comes from consistency",
        emphasisWord: "Growth",
        caption: "Every small decision to think first makes you stronger for boards, JEE and NEET.",
      },
      {
        icon: "👨‍🎓",
        headline: "Maya trusted her journey",
        emphasisWord: "journey",
        caption: "Maya used AI to understand difficult topics, but every solution in her notebook was her own.",
      },
      {
        icon: "💯",
        headline: "Keep this habit tomorrow",
        emphasisWord: "habit",
        caption: "Start tomorrow exactly the same way: think first, learn deeply, then let AI guide you.",
      },
    ],
  },
  {
    day: 31,
    theme: "Your brain deserves first attempt",
    slides: [
      {
        icon: "🧠",
        headline: "Trust your brain first",
        emphasisWord: "brain",
        caption: "That first attempt may feel slow, but it prepares you for the exam hall where only you can think.",
      },
      {
        icon: "🌱",
        headline: "Effort grows every concept",
        emphasisWord: "Effort",
        caption: "Every minute spent thinking strengthens concepts that coaching tests and boards will measure.",
      },
      {
        icon: "👦",
        headline: "Arun trusted himself today",
        emphasisWord: "trusted",
        caption: "Arun resisted opening AI immediately. His own attempt solved half the question before asking for guidance.",
      },
      {
        icon: "🎯",
        headline: "Attempt before every search",
        emphasisWord: "Attempt",
        caption: "Today, don't search until you've written at least one meaningful step.",
      },
    ],
  },
  {
    day: 32,
    theme: "Every chapter begins with curiosity",
    slides: [
      {
        icon: "📖",
        headline: "Open curiosity before books",
        emphasisWord: "curiosity",
        caption: "A curious mind understands faster than a mind searching for shortcuts.",
      },
      {
        icon: "💭",
        headline: "Questions unlock understanding",
        emphasisWord: "Questions",
        caption: "The best learners ask why a concept works before asking how to solve everything.",
      },
      {
        icon: "👧",
        headline: "Nandini chased the reason",
        emphasisWord: "reason",
        caption: "Nandini explored why a reaction happened. AI helped explain, not replace her learning.",
      },
      {
        icon: "❓",
        headline: "Ask one why today",
        emphasisWord: "why",
        caption: "Find one concept and ask yourself why it works before opening AI.",
      },
    ],
  },
  {
    day: 33,
    theme: "Solve slowly remember longer",
    slides: [
      {
        icon: "🐢",
        headline: "Slow solving builds confidence",
        emphasisWord: "Slow",
        caption: "Fast answers disappear quickly. Slow thinking stays during tough board questions.",
      },
      {
        icon: "🧩",
        headline: "Understanding beats speed",
        emphasisWord: "Understanding",
        caption: "Speed comes naturally after concepts become clear through practice.",
      },
      {
        icon: "👨‍🎓",
        headline: "Kunal slowed his pace",
        emphasisWord: "slowed",
        caption: "Kunal took extra time on one numerical. The next similar question became much easier.",
      },
      {
        icon: "⌛",
        headline: "Enjoy solving slowly today",
        emphasisWord: "slowly",
        caption: "Don't rush one difficult question. Let your brain finish the journey.",
      },
    ],
  },
  {
    day: 34,
    theme: "Learning happens before checking",
    slides: [
      {
        icon: "🔍",
        headline: "Check after completing work",
        emphasisWord: "Check",
        caption: "AI should verify your thinking, not replace it before it begins.",
      },
      {
        icon: "📚",
        headline: "Verification strengthens confidence",
        emphasisWord: "Verification",
        caption: "Comparing your method after solving helps you improve every chapter.",
      },
      {
        icon: "👩",
        headline: "Simran verified every answer",
        emphasisWord: "verified",
        caption: "Simran finished her chemistry exercise before AI reviewed the mistakes.",
      },
      {
        icon: "✅",
        headline: "Verify one solution today",
        emphasisWord: "Verify",
        caption: "Complete one full answer before checking it with AI.",
      },
    ],
  },
  {
    day: 35,
    theme: "Strong mornings reduce exam stress",
    slides: [
      {
        icon: "🌞",
        headline: "Morning effort beats panic",
        emphasisWord: "Morning",
        caption: "Every focused morning makes the night before exams feel calmer.",
      },
      {
        icon: "😌",
        headline: "Preparation defeats pressure",
        emphasisWord: "Preparation",
        caption: "Confidence grows from preparation, not from copied solutions.",
      },
      {
        icon: "👦",
        headline: "Harish stayed calm later",
        emphasisWord: "calm",
        caption: "Harish studied honestly every morning. His weekly test felt less stressful.",
      },
      {
        icon: "📅",
        headline: "Protect this morning habit",
        emphasisWord: "morning",
        caption: "One disciplined morning can change your entire study day.",
      },
    ],
  },
  {
    day: 36,
    theme: "Learn from every incorrect answer",
    slides: [
      {
        icon: "🔄",
        headline: "Incorrect answers teach more",
        emphasisWord: "Incorrect",
        caption: "One corrected mistake today can save four marks in the board exam.",
      },
      {
        icon: "📈",
        headline: "Corrections build mastery",
        emphasisWord: "Corrections",
        caption: "Mistakes become strengths when you understand why they happened.",
      },
      {
        icon: "👧",
        headline: "Pallavi fixed yesterday mistakes",
        emphasisWord: "mistakes",
        caption: "Pallavi reviewed yesterday's wrong answers before starting new questions.",
      },
      {
        icon: "📝",
        headline: "Correct one mistake today",
        emphasisWord: "mistake",
        caption: "Open your notebook and improve one answer before solving something new.",
      },
    ],
  },
  {
    day: 37,
    theme: "Practice speaking every concept",
    slides: [
      {
        icon: "🗣️",
        headline: "Explain before asking AI",
        emphasisWord: "Explain",
        caption: "If you can explain a concept aloud, you've already learned half of it.",
      },
      {
        icon: "🎤",
        headline: "Speaking improves memory",
        emphasisWord: "Speaking",
        caption: "This habit helps in viva, practical exams and classroom discussions.",
      },
      {
        icon: "👨‍🔬",
        headline: "Deepak explained aloud first",
        emphasisWord: "explained",
        caption: "Deepak taught himself one Biology topic before asking AI to fill the gaps.",
      },
      {
        icon: "📢",
        headline: "Teach yourself one topic",
        emphasisWord: "Teach",
        caption: "Speak one concept aloud for two minutes before using AI.",
      },
    ],
  },
  {
    day: 38,
    theme: "Think beyond memorised answers",
    slides: [
      {
        icon: "💡",
        headline: "Think beyond memorising",
        emphasisWord: "Think",
        caption: "Exams often change the question. Understanding helps you adapt.",
      },
      {
        icon: "🧠",
        headline: "Reasoning beats repetition",
        emphasisWord: "Reasoning",
        caption: "Strong reasoning helps in JEE numericals and application-based board questions.",
      },
      {
        icon: "👦",
        headline: "Ritesh found another method",
        emphasisWord: "method",
        caption: "Ritesh solved the same maths problem using his own approach before comparing with AI.",
      },
      {
        icon: "🚀",
        headline: "Find another approach today",
        emphasisWord: "approach",
        caption: "Solve one question using a different method before checking AI.",
      },
    ],
  },
  {
    day: 39,
    theme: "Build consistency one chapter daily",
    slides: [
      {
        icon: "📆",
        headline: "Consistency beats motivation",
        emphasisWord: "Consistency",
        caption: "Motivation changes every day. Consistent study keeps moving forward.",
      },
      {
        icon: "📘",
        headline: "Small chapters become success",
        emphasisWord: "Small",
        caption: "Finishing one chapter honestly every day creates huge progress over months.",
      },
      {
        icon: "👩‍🎓",
        headline: "Megha completed daily goals",
        emphasisWord: "daily",
        caption: "Megha focused on one chapter every morning instead of rushing through many.",
      },
      {
        icon: "🏁",
        headline: "Complete one chapter fully",
        emphasisWord: "chapter",
        caption: "Choose one chapter and finish it before jumping to another topic.",
      },
    ],
  },
  {
    day: 40,
    theme: "Learning today shapes tomorrow",
    slides: [
      {
        icon: "🌟",
        headline: "Today's effort builds tomorrow",
        emphasisWord: "Today's",
        caption: "Every honest study session becomes confidence waiting for your next exam.",
      },
      {
        icon: "🏔️",
        headline: "Growth happens every morning",
        emphasisWord: "Growth",
        caption: "Tiny improvements every day become big achievements by board and entrance exams.",
      },
      {
        icon: "👨‍🎓",
        headline: "Ira stayed true daily",
        emphasisWord: "true",
        caption: "Ira used AI only to understand difficult topics. Her confidence came from her own practice.",
      },
      {
        icon: "💙",
        headline: "Honor today's pledge always",
        emphasisWord: "pledge",
        caption: "Begin every study session with one promise: learn with AI, never let AI learn for you.",
      },
    ],
  },
  {
    day: 41,
    theme: "Start with the toughest question",
    slides: [
      {
        icon: "⛰️",
        headline: "Climb the hardest first",
        emphasisWord: "hardest",
        caption: "That difficult question looks smaller after your first honest attempt.",
      },
      {
        icon: "🧠",
        headline: "Challenge grows confidence",
        emphasisWord: "Challenge",
        caption: "Your brain becomes stronger every time it solves something uncomfortable without shortcuts.",
      },
      {
        icon: "👦",
        headline: "Yash faced the difficult one",
        emphasisWord: "difficult",
        caption: "Yash started with the toughest Physics numerical. AI explained only the final doubt.",
      },
      {
        icon: "🎯",
        headline: "Begin with one challenge",
        emphasisWord: "challenge",
        caption: "Choose the question you've been avoiding and give it ten honest minutes.",
      },
    ],
  },
  {
    day: 42,
    theme: "Every blank page has potential",
    slides: [
      {
        icon: "📄",
        headline: "Fill the first line",
        emphasisWord: "first",
        caption: "A blank notebook becomes progress the moment your pen starts moving.",
      },
      {
        icon: "✍️",
        headline: "Writing removes hesitation",
        emphasisWord: "Writing",
        caption: "Even one written step is better than waiting for AI to begin everything.",
      },
      {
        icon: "👧",
        headline: "Kavya filled the page",
        emphasisWord: "page",
        caption: "Kavya began with rough steps. Soon the complete solution came together naturally.",
      },
      {
        icon: "🖊️",
        headline: "Write before searching today",
        emphasisWord: "Write",
        caption: "Start every question by writing something before touching AI.",
      },
    ],
  },
  {
    day: 43,
    theme: "Understand the question deeply",
    slides: [
      {
        icon: "🔍",
        headline: "Read twice solve once",
        emphasisWord: "Read",
        caption: "Many mistakes happen because we rush before understanding the question.",
      },
      {
        icon: "📚",
        headline: "Careful reading saves marks",
        emphasisWord: "reading",
        caption: "Board exams reward students who understand every word before solving.",
      },
      {
        icon: "👨‍🎓",
        headline: "Dev read every detail",
        emphasisWord: "detail",
        caption: "Dev spotted an important condition after reading the question again.",
      },
      {
        icon: "👀",
        headline: "Read twice today",
        emphasisWord: "Read",
        caption: "Before solving, read every question one extra time today.",
      },
    ],
  },
  {
    day: 44,
    theme: "Your rough work matters",
    slides: [
      {
        icon: "📋",
        headline: "Trust your rough work",
        emphasisWord: "rough",
        caption: "Great solutions often begin with messy thinking on rough paper.",
      },
      {
        icon: "🧩",
        headline: "Scratch work builds clarity",
        emphasisWord: "clarity",
        caption: "Working through ideas yourself creates understanding AI cannot give instantly.",
      },
      {
        icon: "👩",
        headline: "Nisha filled rough pages",
        emphasisWord: "rough",
        caption: "Her first attempt looked messy, but it helped her solve the final answer confidently.",
      },
      {
        icon: "📝",
        headline: "Use rough paper today",
        emphasisWord: "rough",
        caption: "Solve one difficult question using rough work before asking AI.",
      },
    ],
  },
  {
    day: 45,
    theme: "Focus beats frequent switching",
    slides: [
      {
        icon: "🎯",
        headline: "Stay with one chapter",
        emphasisWord: "one",
        caption: "Jumping between subjects wastes energy. Deep focus builds real progress.",
      },
      {
        icon: "📖",
        headline: "Focus improves retention",
        emphasisWord: "Focus",
        caption: "One uninterrupted study session is worth more than many distracted ones.",
      },
      {
        icon: "👦",
        headline: "Manav ignored distractions",
        emphasisWord: "distractions",
        caption: "Manav finished an entire chapter before checking any other app.",
      },
      {
        icon: "⏱️",
        headline: "Study thirty focused minutes",
        emphasisWord: "focused",
        caption: "Keep AI closed until your focused study session is complete.",
      },
    ],
  },
  {
    day: 46,
    theme: "One concept many questions",
    slides: [
      {
        icon: "🔗",
        headline: "Master one idea deeply",
        emphasisWord: "Master",
        caption: "One strong concept can solve many different exam questions.",
      },
      {
        icon: "🧠",
        headline: "Depth creates flexibility",
        emphasisWord: "Depth",
        caption: "Understanding one idea deeply helps you tackle unfamiliar problems.",
      },
      {
        icon: "👧",
        headline: "Sara linked every question",
        emphasisWord: "linked",
        caption: "Sara noticed five numericals used the same concept after practicing carefully.",
      },
      {
        icon: "📘",
        headline: "Practice one concept today",
        emphasisWord: "concept",
        caption: "Solve three questions based on the same concept before moving ahead.",
      },
    ],
  },
  {
    day: 47,
    theme: "Train before seeking guidance",
    slides: [
      {
        icon: "🏋️",
        headline: "Exercise your thinking first",
        emphasisWord: "thinking",
        caption: "Your mind becomes sharper only when it gets a chance to work.",
      },
      {
        icon: "💪",
        headline: "Mental strength needs practice",
        emphasisWord: "strength",
        caption: "AI can guide you, but it cannot build your thinking muscles.",
      },
      {
        icon: "👨",
        headline: "Om practiced independently first",
        emphasisWord: "independently",
        caption: "Om struggled with a chemistry problem before asking AI for one explanation.",
      },
      {
        icon: "🏃",
        headline: "Train your mind today",
        emphasisWord: "Train",
        caption: "Let your brain solve first. Let AI coach afterward.",
      },
    ],
  },
  {
    day: 48,
    theme: "Revision starts with memory",
    slides: [
      {
        icon: "🧩",
        headline: "Recall before reopening notes",
        emphasisWord: "Recall",
        caption: "Try remembering the concept before looking at your textbook or AI.",
      },
      {
        icon: "📚",
        headline: "Memory grows through recall",
        emphasisWord: "Memory",
        caption: "Recalling information strengthens it far more than reading repeatedly.",
      },
      {
        icon: "👩‍🎓",
        headline: "Tanvi remembered most formulas",
        emphasisWord: "remembered",
        caption: "Tanvi recalled formulas from memory before checking what she missed.",
      },
      {
        icon: "📝",
        headline: "Recall one topic today",
        emphasisWord: "Recall",
        caption: "Close your book and write everything you remember before opening AI.",
      },
    ],
  },
  {
    day: 49,
    theme: "Confidence comes from preparation",
    slides: [
      {
        icon: "🌄",
        headline: "Prepare before pressure arrives",
        emphasisWord: "Prepare",
        caption: "Preparation turns stressful exam mornings into confident ones.",
      },
      {
        icon: "🛡️",
        headline: "Preparation defeats fear",
        emphasisWord: "Preparation",
        caption: "Fear becomes smaller when your understanding becomes stronger.",
      },
      {
        icon: "👦",
        headline: "Aarav prepared every morning",
        emphasisWord: "prepared",
        caption: "Daily practice made Aarav feel ready long before the school test.",
      },
      {
        icon: "📅",
        headline: "Strengthen tomorrow today",
        emphasisWord: "today",
        caption: "Study honestly this morning so tomorrow feels lighter.",
      },
    ],
  },
  {
    day: 50,
    theme: "Halfway stronger every morning",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate honest consistency",
        emphasisWord: "consistency",
        caption: "Fifty mornings of choosing learning over shortcuts is something to be proud of.",
      },
      {
        icon: "🚀",
        headline: "Progress compounds daily",
        emphasisWord: "Progress",
        caption: "Small honest efforts keep adding up into big exam confidence.",
      },
      {
        icon: "👩‍🎓",
        headline: "Ishita earned real confidence",
        emphasisWord: "earned",
        caption: "Ishita used AI as a guide every day. Her notebook became proof of her own growth.",
      },
      {
        icon: "💙",
        headline: "Continue choosing integrity",
        emphasisWord: "integrity",
        caption: "Today's promise is simple. Learn with AI, think for yourself, and keep growing.",
      },
    ],
  },
  {
    day: 51,
    theme: "The first step unlocks momentum",
    slides: [
      {
        icon: "🚪",
        headline: "Take the first step",
        emphasisWord: "first",
        caption: "Starting is usually harder than solving. Begin before your mind finds excuses.",
      },
      {
        icon: "⚙️",
        headline: "Momentum beats hesitation",
        emphasisWord: "Momentum",
        caption: "One solved step often leads to the next. That's how confidence grows.",
      },
      {
        icon: "👦",
        headline: "Arjun simply began writing",
        emphasisWord: "began",
        caption: "Arjun wrote the given values first. The rest of the solution slowly appeared.",
      },
      {
        icon: "✍️",
        headline: "Write something immediately",
        emphasisWord: "Write",
        caption: "Today, begin every question by writing the known information before asking AI.",
      },
    ],
  },
  {
    day: 52,
    theme: "Learn patterns not shortcuts",
    slides: [
      {
        icon: "🧩",
        headline: "Notice the hidden pattern",
        emphasisWord: "pattern",
        caption: "Many board and JEE questions follow familiar ideas. Train your eyes to spot them.",
      },
      {
        icon: "🔗",
        headline: "Patterns improve problem solving",
        emphasisWord: "Patterns",
        caption: "Understanding patterns helps you solve new questions without depending on AI.",
      },
      {
        icon: "👧",
        headline: "Diya spotted the pattern",
        emphasisWord: "pattern",
        caption: "Diya recognized the same concept from yesterday's homework and solved it herself.",
      },
      {
        icon: "🎯",
        headline: "Find one pattern today",
        emphasisWord: "pattern",
        caption: "Compare two similar questions and identify what stays the same.",
      },
    ],
  },
  {
    day: 53,
    theme: "Solve with patience every time",
    slides: [
      {
        icon: "🌿",
        headline: "Patience unlocks difficult questions",
        emphasisWord: "Patience",
        caption: "The answer often appears after a few extra minutes of calm thinking.",
      },
      {
        icon: "🧠",
        headline: "Calm minds solve better",
        emphasisWord: "Calm",
        caption: "Rushing increases mistakes. Slowing down improves accuracy.",
      },
      {
        icon: "👨‍🎓",
        headline: "Vihaan stayed patient throughout",
        emphasisWord: "patient",
        caption: "Vihaan resisted checking AI immediately and solved the final step himself.",
      },
      {
        icon: "⏳",
        headline: "Wait before requesting help",
        emphasisWord: "Wait",
        caption: "Give yourself two extra minutes before asking AI for guidance.",
      },
    ],
  },
  {
    day: 54,
    theme: "Revision begins from memory",
    slides: [
      {
        icon: "🧠",
        headline: "Remember before reviewing",
        emphasisWord: "Remember",
        caption: "Your memory becomes stronger when you recall first and verify later.",
      },
      {
        icon: "📖",
        headline: "Recall strengthens learning",
        emphasisWord: "Recall",
        caption: "The brain remembers better after trying to retrieve information.",
      },
      {
        icon: "👩",
        headline: "Ananya recalled the chapter",
        emphasisWord: "recalled",
        caption: "Ananya wrote everything she remembered before checking her textbook.",
      },
      {
        icon: "📝",
        headline: "Recall one lesson today",
        emphasisWord: "Recall",
        caption: "Close your notes and write key points from memory first.",
      },
    ],
  },
  {
    day: 55,
    theme: "Think like your examiner",
    slides: [
      {
        icon: "🎓",
        headline: "Think like the examiner",
        emphasisWord: "examiner",
        caption: "Ask yourself what skill this question is actually testing.",
      },
      {
        icon: "🔍",
        headline: "Questions test understanding",
        emphasisWord: "understanding",
        caption: "Examiners reward reasoning, not copied answers.",
      },
      {
        icon: "👦",
        headline: "Rohit found the objective",
        emphasisWord: "objective",
        caption: "Rohit identified the concept behind the question before solving it.",
      },
      {
        icon: "📋",
        headline: "Find the concept first",
        emphasisWord: "concept",
        caption: "Before solving, identify the chapter or principle the question belongs to.",
      },
    ],
  },
  {
    day: 56,
    theme: "Questions reveal hidden strengths",
    slides: [
      {
        icon: "💎",
        headline: "Every question teaches something",
        emphasisWord: "question",
        caption: "Even an incorrect attempt tells you where your next improvement lies.",
      },
      {
        icon: "📈",
        headline: "Learning follows effort",
        emphasisWord: "Learning",
        caption: "Growth comes from trying, correcting and trying again.",
      },
      {
        icon: "👧",
        headline: "Meera welcomed mistakes calmly",
        emphasisWord: "mistakes",
        caption: "Meera used AI to understand her errors instead of avoiding them.",
      },
      {
        icon: "🌱",
        headline: "Learn from one error",
        emphasisWord: "error",
        caption: "Choose one wrong answer today and understand why it happened.",
      },
    ],
  },
  {
    day: 57,
    theme: "Your notebook shows progress",
    slides: [
      {
        icon: "📔",
        headline: "Fill pages with thinking",
        emphasisWord: "thinking",
        caption: "Every handwritten solution reflects real effort that exams will reward.",
      },
      {
        icon: "✍️",
        headline: "Writing improves confidence",
        emphasisWord: "Writing",
        caption: "The more you write, the easier it becomes to express answers in exams.",
      },
      {
        icon: "👨",
        headline: "Advik trusted his notes",
        emphasisWord: "notes",
        caption: "Advik built his own revision notebook instead of collecting copied solutions.",
      },
      {
        icon: "📚",
        headline: "Complete one notebook page",
        emphasisWord: "notebook",
        caption: "Fill one fresh page today using only your own understanding.",
      },
    ],
  },
  {
    day: 58,
    theme: "Confidence grows through repetition",
    slides: [
      {
        icon: "🔁",
        headline: "Repeat until it feels easy",
        emphasisWord: "Repeat",
        caption: "The first attempt teaches. The second attempt builds confidence.",
      },
      {
        icon: "🏋️",
        headline: "Practice creates fluency",
        emphasisWord: "Practice",
        caption: "Repeated solving improves speed for school tests and entrance exams.",
      },
      {
        icon: "👩‍🎓",
        headline: "Siya practiced one method",
        emphasisWord: "practiced",
        caption: "Siya solved four similar numericals before moving to a new topic.",
      },
      {
        icon: "🎯",
        headline: "Repeat one problem type",
        emphasisWord: "Repeat",
        caption: "Solve three similar questions before asking AI for another example.",
      },
    ],
  },
  {
    day: 59,
    theme: "Protect your morning focus",
    slides: [
      {
        icon: "🌅",
        headline: "Guard your study hour",
        emphasisWord: "study",
        caption: "The first hour of the day deserves your full attention, not endless scrolling.",
      },
      {
        icon: "🔕",
        headline: "Silence improves concentration",
        emphasisWord: "Silence",
        caption: "Less distraction means more learning in less time.",
      },
      {
        icon: "👦",
        headline: "Neil ignored notifications today",
        emphasisWord: "notifications",
        caption: "Neil completed his maths practice before checking any messages.",
      },
      {
        icon: "📵",
        headline: "Protect one focused hour",
        emphasisWord: "focused",
        caption: "Keep unnecessary apps closed until your first study session ends.",
      },
    ],
  },
  {
    day: 60,
    theme: "Sixty mornings stronger together",
    slides: [
      {
        icon: "🏆",
        headline: "Celebrate sixty honest mornings",
        emphasisWord: "sixty",
        caption: "Every morning you've chosen learning over shortcuts has strengthened your future.",
      },
      {
        icon: "🌟",
        headline: "Habits shape success",
        emphasisWord: "Habits",
        caption: "Great results are built from small honest choices repeated every day.",
      },
      {
        icon: "👩‍🎓",
        headline: "Aisha trusted her preparation",
        emphasisWord: "preparation",
        caption: "Aisha used AI to understand concepts, but every solved page belonged to her.",
      },
      {
        icon: "💙",
        headline: "Carry this promise forward",
        emphasisWord: "promise",
        caption: "Today again, let AI guide your learning, never replace your thinking.",
      },
    ],
  },
  {
    day: 61,
    theme: "Find the idea before formulas",
    slides: [
      {
        icon: "💡",
        headline: "Find the core idea",
        emphasisWord: "idea",
        caption: "Before reaching for formulas, understand what the question is really asking.",
      },
      {
        icon: "🧠",
        headline: "Ideas simplify tough problems",
        emphasisWord: "Ideas",
        caption: "A clear idea helps you choose the right method even in unfamiliar board questions.",
      },
      {
        icon: "👦",
        headline: "Rishi found the idea",
        emphasisWord: "idea",
        caption: "Rishi understood the concept first. The correct formula became obvious afterward.",
      },
      {
        icon: "🎯",
        headline: "Identify the idea today",
        emphasisWord: "idea",
        caption: "Before solving, write the concept this question is testing.",
      },
    ],
  },
  {
    day: 62,
    theme: "Break big doubts into pieces",
    slides: [
      {
        icon: "🧩",
        headline: "Split difficult doubts carefully",
        emphasisWord: "difficult",
        caption: "Big doubts become manageable when you solve one small part at a time.",
      },
      {
        icon: "📚",
        headline: "Small steps reduce confusion",
        emphasisWord: "Small",
        caption: "Learning becomes easier when each step makes sense before moving ahead.",
      },
      {
        icon: "👧",
        headline: "Isha solved one part",
        emphasisWord: "part",
        caption: "Isha divided a long Chemistry question into smaller pieces before asking AI.",
      },
      {
        icon: "✍️",
        headline: "Break one doubt today",
        emphasisWord: "doubt",
        caption: "Write the exact step you're stuck on instead of asking for the whole answer.",
      },
    ],
  },
  {
    day: 63,
    theme: "Notice keywords before solving",
    slides: [
      {
        icon: "🔑",
        headline: "Circle important keywords first",
        emphasisWord: "keywords",
        caption: "One missed word can completely change the correct approach.",
      },
      {
        icon: "👀",
        headline: "Keywords guide your method",
        emphasisWord: "Keywords",
        caption: "Board questions often hide valuable clues inside a single phrase.",
      },
      {
        icon: "👨‍🎓",
        headline: "Kabir noticed one keyword",
        emphasisWord: "keyword",
        caption: "Kabir spotted 'constant pressure' before solving. That changed the entire solution.",
      },
      {
        icon: "🖍️",
        headline: "Highlight keywords today",
        emphasisWord: "keywords",
        caption: "Underline important words before writing your first step.",
      },
    ],
  },
  {
    day: 64,
    theme: "Respect every practice session",
    slides: [
      {
        icon: "🏃",
        headline: "Practice like exam day",
        emphasisWord: "Practice",
        caption: "Treat every practice question as if marks are already being counted.",
      },
      {
        icon: "📈",
        headline: "Serious practice builds confidence",
        emphasisWord: "practice",
        caption: "Daily effort makes difficult papers feel familiar.",
      },
      {
        icon: "👩",
        headline: "Rhea respected every question",
        emphasisWord: "question",
        caption: "Rhea gave each maths problem her best effort before checking AI.",
      },
      {
        icon: "✅",
        headline: "Solve with full focus",
        emphasisWord: "focus",
        caption: "Pretend today's worksheet is your final exam.",
      },
    ],
  },
  {
    day: 65,
    theme: "Learn through asking better why",
    slides: [
      {
        icon: "❔",
        headline: "Ask why every time",
        emphasisWord: "why",
        caption: "Understanding why makes remembering much easier than memorising alone.",
      },
      {
        icon: "🧠",
        headline: "Reasons create lasting memory",
        emphasisWord: "Reasons",
        caption: "The brain remembers explanations longer than isolated facts.",
      },
      {
        icon: "👦",
        headline: "Krish asked one why",
        emphasisWord: "why",
        caption: "Krish asked AI why the theorem worked instead of requesting the solution.",
      },
      {
        icon: "💬",
        headline: "Question one concept today",
        emphasisWord: "concept",
        caption: "Ask AI to explain the reason behind one formula or reaction.",
      },
    ],
  },
  {
    day: 66,
    theme: "Strong basics solve surprises",
    slides: [
      {
        icon: "🏗️",
        headline: "Strengthen your foundation daily",
        emphasisWord: "foundation",
        caption: "Unexpected questions become easier when your basics are strong.",
      },
      {
        icon: "📘",
        headline: "Basics unlock confidence",
        emphasisWord: "Basics",
        caption: "Strong fundamentals reduce panic during challenging papers.",
      },
      {
        icon: "👧",
        headline: "Maya revised fundamentals first",
        emphasisWord: "fundamentals",
        caption: "Maya spent ten minutes revising basics before solving advanced numericals.",
      },
      {
        icon: "📖",
        headline: "Revise one basic topic",
        emphasisWord: "basic",
        caption: "Strengthen one weak concept before moving to harder chapters.",
      },
    ],
  },
  {
    day: 67,
    theme: "Keep improving every attempt",
    slides: [
      {
        icon: "📈",
        headline: "Improve one step daily",
        emphasisWord: "Improve",
        caption: "You don't need perfection today. You only need progress.",
      },
      {
        icon: "🌱",
        headline: "Progress beats perfection",
        emphasisWord: "Progress",
        caption: "Small improvements every morning create big exam results.",
      },
      {
        icon: "👨",
        headline: "Vivaan improved his method",
        emphasisWord: "improved",
        caption: "Vivaan solved the same question faster after correcting yesterday's mistake.",
      },
      {
        icon: "📝",
        headline: "Upgrade one answer today",
        emphasisWord: "Upgrade",
        caption: "Rewrite one old solution in a clearer and better way.",
      },
    ],
  },
  {
    day: 68,
    theme: "Test yourself before checking",
    slides: [
      {
        icon: "🎯",
        headline: "Test yourself honestly",
        emphasisWord: "Test",
        caption: "Your notebook should reveal what you know before AI does.",
      },
      {
        icon: "📋",
        headline: "Self testing improves recall",
        emphasisWord: "testing",
        caption: "Testing yourself is one of the fastest ways to strengthen memory.",
      },
      {
        icon: "👩‍🎓",
        headline: "Pooja tested herself first",
        emphasisWord: "tested",
        caption: "Pooja solved five Biology questions before checking any explanations.",
      },
      {
        icon: "✔️",
        headline: "Quiz yourself today",
        emphasisWord: "Quiz",
        caption: "Answer five questions from memory before opening AI.",
      },
    ],
  },
  {
    day: 69,
    theme: "Build accuracy before speed",
    slides: [
      {
        icon: "🎯",
        headline: "Accuracy comes before speed",
        emphasisWord: "Accuracy",
        caption: "Fast wrong answers never beat slow correct ones.",
      },
      {
        icon: "📐",
        headline: "Correct methods save marks",
        emphasisWord: "Correct",
        caption: "Accuracy builds confidence. Speed naturally follows with practice.",
      },
      {
        icon: "👦",
        headline: "Ayaan checked each calculation",
        emphasisWord: "calculation",
        caption: "Ayaan focused on correctness first. His speed improved after repeated practice.",
      },
      {
        icon: "🖊️",
        headline: "Focus on accuracy today",
        emphasisWord: "accuracy",
        caption: "Solve carefully instead of racing through questions.",
      },
    ],
  },
  {
    day: 70,
    theme: "Seventy mornings of commitment",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate seventy mornings",
        emphasisWord: "seventy",
        caption: "Seventy honest mornings have built habits that shortcuts never could.",
      },
      {
        icon: "🚀",
        headline: "Discipline creates success",
        emphasisWord: "Discipline",
        caption: "Every honest study session prepares you for boards, JEE and NEET.",
      },
      {
        icon: "👩‍🎓",
        headline: "Aditi trusted every effort",
        emphasisWord: "effort",
        caption: "Aditi used AI to understand concepts while solving every answer herself.",
      },
      {
        icon: "💙",
        headline: "Honor today's commitment",
        emphasisWord: "commitment",
        caption: "Keep choosing learning over shortcuts. Your future self will thank you.",
      },
    ],
  },
  {
    day: 71,
    theme: "Own every solved question",
    slides: [
      {
        icon: "✋",
        headline: "Own every solution completely",
        emphasisWord: "Own",
        caption: "When the answer is truly yours, confidence follows you into every exam.",
      },
      {
        icon: "🧠",
        headline: "Ownership builds lasting confidence",
        emphasisWord: "Ownership",
        caption: "Questions solved by your own effort stay longer than copied solutions.",
      },
      {
        icon: "👦",
        headline: "Nikhil owned every step",
        emphasisWord: "owned",
        caption: "Nikhil solved the complete Physics question before asking AI to review one calculation.",
      },
      {
        icon: "✅",
        headline: "Own one answer today",
        emphasisWord: "Own",
        caption: "Finish one full solution without looking for the final answer.",
      },
    ],
  },
  {
    day: 72,
    theme: "One doubt one breakthrough",
    slides: [
      {
        icon: "💭",
        headline: "Every doubt hides progress",
        emphasisWord: "doubt",
        caption: "The question confusing you today could become tomorrow's strongest chapter.",
      },
      {
        icon: "🌱",
        headline: "Curiosity beats confusion",
        emphasisWord: "Curiosity",
        caption: "Stay with the doubt long enough to understand what it is teaching.",
      },
      {
        icon: "👧",
        headline: "Aanya explored one doubt",
        emphasisWord: "doubt",
        caption: "Aanya wrote what she understood first. AI explained only the missing part.",
      },
      {
        icon: "🎯",
        headline: "Solve one doubt today",
        emphasisWord: "doubt",
        caption: "Choose your toughest doubt and break it into smaller questions.",
      },
    ],
  },
  {
    day: 73,
    theme: "Learn the language of questions",
    slides: [
      {
        icon: "📖",
        headline: "Understand every instruction carefully",
        emphasisWord: "instruction",
        caption: "Words like calculate, justify and explain need different kinds of answers.",
      },
      {
        icon: "📝",
        headline: "Instructions guide your response",
        emphasisWord: "Instructions",
        caption: "Reading carefully helps you avoid easy mistakes in board exams.",
      },
      {
        icon: "👨‍🎓",
        headline: "Rehan noticed the instruction",
        emphasisWord: "instruction",
        caption: "Rehan saw 'justify' instead of 'define' and wrote a much stronger answer.",
      },
      {
        icon: "🔍",
        headline: "Underline instructions today",
        emphasisWord: "instructions",
        caption: "Highlight command words before writing your first sentence.",
      },
    ],
  },
  {
    day: 74,
    theme: "Use AI after your notebook",
    slides: [
      {
        icon: "📔",
        headline: "Notebook before every prompt",
        emphasisWord: "Notebook",
        caption: "Your notebook should always receive your first attempt before AI does.",
      },
      {
        icon: "✍️",
        headline: "Writing reveals understanding",
        emphasisWord: "Writing",
        caption: "What you write yourself shows exactly what you know and what needs work.",
      },
      {
        icon: "👩",
        headline: "Sneha filled her notebook",
        emphasisWord: "notebook",
        caption: "Sneha completed her Biology notes before asking AI to simplify one topic.",
      },
      {
        icon: "📚",
        headline: "Open notebook first today",
        emphasisWord: "notebook",
        caption: "Write your attempt before typing your first AI question.",
      },
    ],
  },
  {
    day: 75,
    theme: "Make every minute count",
    slides: [
      {
        icon: "⏰",
        headline: "Protect every study minute",
        emphasisWord: "minute",
        caption: "Small distractions quietly steal big marks over the year.",
      },
      {
        icon: "🎯",
        headline: "Focused minutes multiply learning",
        emphasisWord: "Focused",
        caption: "Thirty focused minutes beat two distracted hours.",
      },
      {
        icon: "👦",
        headline: "Parth valued every minute",
        emphasisWord: "minute",
        caption: "Parth finished his maths worksheet before checking social media or AI.",
      },
      {
        icon: "📵",
        headline: "Protect thirty minutes today",
        emphasisWord: "thirty",
        caption: "Study without interruptions before opening any other app.",
      },
    ],
  },
  {
    day: 76,
    theme: "Questions connect across chapters",
    slides: [
      {
        icon: "🔗",
        headline: "Connect ideas across chapters",
        emphasisWord: "Connect",
        caption: "Many difficult questions combine concepts you've already learned.",
      },
      {
        icon: "🧠",
        headline: "Connections strengthen understanding",
        emphasisWord: "Connections",
        caption: "Seeing links between chapters makes revision much easier.",
      },
      {
        icon: "👧",
        headline: "Tanisha connected two chapters",
        emphasisWord: "connected",
        caption: "Tanisha realised electrostatics used ideas she learned months earlier.",
      },
      {
        icon: "🧩",
        headline: "Link two concepts today",
        emphasisWord: "Link",
        caption: "Find one connection between today's topic and yesterday's lesson.",
      },
    ],
  },
  {
    day: 77,
    theme: "Confidence begins with preparation",
    slides: [
      {
        icon: "🌅",
        headline: "Prepare before confidence arrives",
        emphasisWord: "Prepare",
        caption: "Confidence is earned during study, not created inside the exam hall.",
      },
      {
        icon: "📈",
        headline: "Preparation reduces pressure",
        emphasisWord: "Preparation",
        caption: "Every honest session makes future tests feel less stressful.",
      },
      {
        icon: "👨",
        headline: "Rudra prepared every morning",
        emphasisWord: "prepared",
        caption: "Rudra solved one complete chapter daily before using AI for revision.",
      },
      {
        icon: "📅",
        headline: "Prepare one topic today",
        emphasisWord: "Prepare",
        caption: "Master one topic completely instead of rushing through many.",
      },
    ],
  },
  {
    day: 78,
    theme: "Keep your thinking active",
    slides: [
      {
        icon: "⚡",
        headline: "Keep your mind working",
        emphasisWord: "mind",
        caption: "The more your brain works today, the less it struggles during exams.",
      },
      {
        icon: "🧠",
        headline: "Thinking grows every day",
        emphasisWord: "Thinking",
        caption: "Learning happens when your brain solves, not when it only reads.",
      },
      {
        icon: "👩‍🎓",
        headline: "Ira kept thinking longer",
        emphasisWord: "thinking",
        caption: "Ira spent extra time reasoning before asking AI for a single hint.",
      },
      {
        icon: "💪",
        headline: "Challenge your mind today",
        emphasisWord: "mind",
        caption: "Stay with one difficult question until you discover the next step.",
      },
    ],
  },
  {
    day: 79,
    theme: "Every correction makes you stronger",
    slides: [
      {
        icon: "🛠️",
        headline: "Correct today's weak spots",
        emphasisWord: "Correct",
        caption: "Improving one mistake today prevents repeating it during exams.",
      },
      {
        icon: "📚",
        headline: "Corrections build mastery",
        emphasisWord: "Corrections",
        caption: "Reviewing mistakes is one of the smartest study habits.",
      },
      {
        icon: "👦",
        headline: "Laksh corrected yesterday errors",
        emphasisWord: "corrected",
        caption: "Laksh reviewed his mock test before solving new questions.",
      },
      {
        icon: "📝",
        headline: "Fix one mistake today",
        emphasisWord: "mistake",
        caption: "Rewrite one incorrect answer until you fully understand it.",
      },
    ],
  },
  {
    day: 80,
    theme: "Eighty mornings of growth",
    slides: [
      {
        icon: "🏆",
        headline: "Celebrate eighty mornings",
        emphasisWord: "eighty",
        caption: "Eighty mornings of honest effort have built habits that will serve you for years.",
      },
      {
        icon: "🚀",
        headline: "Learning compounds every day",
        emphasisWord: "Learning",
        caption: "Small improvements made consistently become remarkable exam performance.",
      },
      {
        icon: "👩‍🎓",
        headline: "Riya earned quiet confidence",
        emphasisWord: "confidence",
        caption: "Riya used AI to understand difficult ideas, but every solved page reflected her own work.",
      },
      {
        icon: "💙",
        headline: "Keep choosing honest learning",
        emphasisWord: "honest",
        caption: "Start today the same way you started Day 1. Learn with AI, think for yourself.",
      },
    ],
  },
  {
    day: 81,
    theme: "Confidence starts with your attempt",
    slides: [
      {
        icon: "🚀",
        headline: "Start before feeling ready",
        emphasisWord: "Start",
        caption: "You don't need perfect confidence to begin. Your first attempt creates it.",
      },
      {
        icon: "🧠",
        headline: "Attempts build self belief",
        emphasisWord: "Attempts",
        caption: "Each honest attempt teaches your brain that difficult questions are solvable.",
      },
      {
        icon: "👦",
        headline: "Keshav started without fear",
        emphasisWord: "started",
        caption: "Keshav couldn't solve everything, but his first attempt showed him exactly where he was stuck.",
      },
      {
        icon: "✍️",
        headline: "Begin one problem now",
        emphasisWord: "Begin",
        caption: "Choose one challenging question and write your first step before opening AI.",
      },
    ],
  },
  {
    day: 82,
    theme: "Learn one lesson completely",
    slides: [
      {
        icon: "📘",
        headline: "Finish before switching topics",
        emphasisWord: "Finish",
        caption: "Completing one lesson deeply beats touching five chapters halfway.",
      },
      {
        icon: "🎯",
        headline: "Depth creates mastery",
        emphasisWord: "Depth",
        caption: "Understanding one topic fully makes the next chapter easier.",
      },
      {
        icon: "👧",
        headline: "Megha completed one chapter",
        emphasisWord: "completed",
        caption: "Megha mastered an NCERT chapter before asking AI for additional practice questions.",
      },
      {
        icon: "✅",
        headline: "Complete one lesson today",
        emphasisWord: "Complete",
        caption: "Stay with one topic until you understand it confidently.",
      },
    ],
  },
  {
    day: 83,
    theme: "Solve with logic not luck",
    slides: [
      {
        icon: "🧩",
        headline: "Choose logic every time",
        emphasisWord: "logic",
        caption: "Correct answers found by reasoning stay with you far longer than lucky guesses.",
      },
      {
        icon: "🧠",
        headline: "Reasoning wins exams",
        emphasisWord: "Reasoning",
        caption: "Strong reasoning helps even when questions look completely new.",
      },
      {
        icon: "👨‍🎓",
        headline: "Aryan trusted his logic",
        emphasisWord: "logic",
        caption: "Aryan solved the Chemistry numerical by following concepts instead of searching immediately.",
      },
      {
        icon: "💡",
        headline: "Explain your reasoning today",
        emphasisWord: "reasoning",
        caption: "Write why each step works before checking your answer with AI.",
      },
    ],
  },
  {
    day: 84,
    theme: "Small revisions beat cramming",
    slides: [
      {
        icon: "🔄",
        headline: "Revise a little daily",
        emphasisWord: "Revise",
        caption: "Ten minutes of revision each morning beats hours of last-minute panic.",
      },
      {
        icon: "📚",
        headline: "Revision protects memory",
        emphasisWord: "Revision",
        caption: "Regular revision keeps concepts fresh for boards and entrance exams.",
      },
      {
        icon: "👧",
        headline: "Saanvi revised yesterday notes",
        emphasisWord: "revised",
        caption: "Saanvi reviewed yesterday's Physics formulas before starting today's lesson.",
      },
      {
        icon: "📝",
        headline: "Revise yesterday first",
        emphasisWord: "Revise",
        caption: "Spend ten minutes revisiting yesterday's notes before learning something new.",
      },
    ],
  },
  {
    day: 85,
    theme: "Master methods before answers",
    slides: [
      {
        icon: "🛠️",
        headline: "Learn the method first",
        emphasisWord: "method",
        caption: "Methods solve hundreds of questions. Answers solve only one.",
      },
      {
        icon: "📈",
        headline: "Methods improve adaptability",
        emphasisWord: "Methods",
        caption: "Understanding the process prepares you for unfamiliar exam questions.",
      },
      {
        icon: "👦",
        headline: "Rohan learned the process",
        emphasisWord: "process",
        caption: "Rohan asked AI to explain the approach instead of revealing the final answer.",
      },
      {
        icon: "🎯",
        headline: "Study one method today",
        emphasisWord: "method",
        caption: "Focus on understanding how to solve, not just what the answer is.",
      },
    ],
  },
  {
    day: 86,
    theme: "Curiosity beats memorising facts",
    slides: [
      {
        icon: "🤔",
        headline: "Stay curious every chapter",
        emphasisWord: "curious",
        caption: "Curiosity keeps your mind active long after memorised facts disappear.",
      },
      {
        icon: "🌱",
        headline: "Questions fuel learning",
        emphasisWord: "Questions",
        caption: "Students who ask meaningful questions remember concepts much longer.",
      },
      {
        icon: "👩",
        headline: "Anika explored every concept",
        emphasisWord: "explored",
        caption: "Anika asked AI why each Biology process happened before moving ahead.",
      },
      {
        icon: "💬",
        headline: "Ask one meaningful question",
        emphasisWord: "question",
        caption: "Choose one concept and ask why it works instead of requesting the solution.",
      },
    ],
  },
  {
    day: 87,
    theme: "Keep your notebook alive",
    slides: [
      {
        icon: "📒",
        headline: "Grow your notebook daily",
        emphasisWord: "notebook",
        caption: "Your notebook is proof of your learning journey, one page at a time.",
      },
      {
        icon: "✍️",
        headline: "Notes improve understanding",
        emphasisWord: "Notes",
        caption: "Writing summaries in your own words strengthens long-term memory.",
      },
      {
        icon: "👦",
        headline: "Dhruv updated his notes",
        emphasisWord: "notes",
        caption: "Dhruv simplified a difficult concept after AI explained it in smaller steps.",
      },
      {
        icon: "📖",
        headline: "Add one summary today",
        emphasisWord: "summary",
        caption: "Write five key points from today's lesson using your own words.",
      },
    ],
  },
  {
    day: 88,
    theme: "Respect every practice paper",
    slides: [
      {
        icon: "📄",
        headline: "Treat mocks seriously always",
        emphasisWord: "mocks",
        caption: "Mock tests are practice for your future confidence, not just marks.",
      },
      {
        icon: "🏁",
        headline: "Practice reveals readiness",
        emphasisWord: "Practice",
        caption: "Mock papers expose weak areas before the real exam does.",
      },
      {
        icon: "👩‍🎓",
        headline: "Navya analyzed her mock",
        emphasisWord: "mock",
        caption: "Navya reviewed every incorrect answer before asking AI to explain her mistakes.",
      },
      {
        icon: "📊",
        headline: "Review one mock today",
        emphasisWord: "Review",
        caption: "Find one pattern in your mistakes and improve it before the next test.",
      },
    ],
  },
  {
    day: 89,
    theme: "Build discipline before motivation",
    slides: [
      {
        icon: "🌅",
        headline: "Choose discipline every morning",
        emphasisWord: "discipline",
        caption: "Motivation changes. Discipline keeps showing up even on difficult days.",
      },
      {
        icon: "🏆",
        headline: "Habits outperform motivation",
        emphasisWord: "Habits",
        caption: "Daily routines quietly create the results everyone notices later.",
      },
      {
        icon: "👨",
        headline: "Vihaan followed his routine",
        emphasisWord: "routine",
        caption: "Vihaan studied at the same time each morning before checking AI for explanations.",
      },
      {
        icon: "📅",
        headline: "Protect your routine today",
        emphasisWord: "routine",
        caption: "Keep today's study promise even if motivation feels low.",
      },
    ],
  },
  {
    day: 90,
    theme: "Ninety mornings of integrity",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate ninety honest mornings",
        emphasisWord: "ninety",
        caption: "Ninety days of honest learning have built something stronger than marks: trust in yourself.",
      },
      {
        icon: "💙",
        headline: "Integrity builds excellence",
        emphasisWord: "Integrity",
        caption: "Every time you chose learning over shortcuts, your future became stronger.",
      },
      {
        icon: "👩‍🎓",
        headline: "Niharika trusted herself completely",
        emphasisWord: "trusted",
        caption: "Niharika used AI as her study partner, but every answer in her notebook came from her own effort.",
      },
      {
        icon: "🌟",
        headline: "Keep your promise alive",
        emphasisWord: "promise",
        caption: "Today's pledge remains the same. Learn with AI, solve with your own mind.",
      },
    ],
  },
  {
    day: 91,
    theme: "Build answers from understanding",
    slides: [
      {
        icon: "🧱",
        headline: "Build answers stepwise",
        emphasisWord: "Build",
        caption: "Strong answers are built one step at a time, not copied in one click.",
      },
      {
        icon: "🧠",
        headline: "Understanding supports every step",
        emphasisWord: "Understanding",
        caption: "When every step makes sense, unexpected exam questions become less scary.",
      },
      {
        icon: "👦",
        headline: "Aarush built each step",
        emphasisWord: "built",
        caption: "Aarush solved a Physics derivation himself. AI only explained one confusing transition.",
      },
      {
        icon: "✍️",
        headline: "Build one answer today",
        emphasisWord: "Build",
        caption: "Complete one solution step by step before asking AI to review it.",
      },
    ],
  },
  {
    day: 92,
    theme: "Ask clearer study questions",
    slides: [
      {
        icon: "💬",
        headline: "Ask smarter questions",
        emphasisWord: "smarter",
        caption: "Better questions bring better learning. Vague questions bring vague understanding.",
      },
      {
        icon: "🎯",
        headline: "Clarity improves learning",
        emphasisWord: "Clarity",
        caption: "Show your attempt and ask about the exact step where you got stuck.",
      },
      {
        icon: "👧",
        headline: "Ritika refined her question",
        emphasisWord: "question",
        caption: "Ritika shared her working first. AI quickly identified the missing concept.",
      },
      {
        icon: "📝",
        headline: "Refine one question today",
        emphasisWord: "question",
        caption: "Instead of asking for the answer, ask why one step is incorrect.",
      },
    ],
  },
  {
    day: 93,
    theme: "Turn confusion into clarity",
    slides: [
      {
        icon: "🌤️",
        headline: "Welcome temporary confusion",
        emphasisWord: "confusion",
        caption: "Confusion often appears just before real understanding arrives.",
      },
      {
        icon: "🔍",
        headline: "Exploration creates clarity",
        emphasisWord: "clarity",
        caption: "Spend time exploring the problem before expecting instant explanations.",
      },
      {
        icon: "👨‍🎓",
        headline: "Pranav embraced confusion",
        emphasisWord: "confusion",
        caption: "Pranav worked through a difficult maths proof before asking AI for one hint.",
      },
      {
        icon: "🌱",
        headline: "Stay curious today",
        emphasisWord: "curious",
        caption: "Give yourself a few extra minutes before asking AI for help.",
      },
    ],
  },
  {
    day: 94,
    theme: "Understand before memorising",
    slides: [
      {
        icon: "📚",
        headline: "Understand before remembering",
        emphasisWord: "Understand",
        caption: "Concepts that make sense stay longer than facts learned by heart.",
      },
      {
        icon: "💡",
        headline: "Meaning strengthens memory",
        emphasisWord: "Meaning",
        caption: "Learning becomes easier when you know why something works.",
      },
      {
        icon: "👩",
        headline: "Anvi understood the concept",
        emphasisWord: "understood",
        caption: "Anvi explored the idea behind a Biology process before revising definitions.",
      },
      {
        icon: "🧠",
        headline: "Explain one concept today",
        emphasisWord: "concept",
        caption: "Describe one topic in your own words before asking AI anything.",
      },
    ],
  },
  {
    day: 95,
    theme: "Learn from every revision",
    slides: [
      {
        icon: "🔄",
        headline: "Revision reveals weak spots",
        emphasisWord: "Revision",
        caption: "Revising isn't repeating. It's discovering what still needs attention.",
      },
      {
        icon: "📖",
        headline: "Review with purpose",
        emphasisWord: "Review",
        caption: "Don't just reread. Pause and check what you actually remember.",
      },
      {
        icon: "👦",
        headline: "Harsh reviewed carefully",
        emphasisWord: "reviewed",
        caption: "Harsh found two forgotten formulas during revision and strengthened them immediately.",
      },
      {
        icon: "✅",
        headline: "Review one chapter today",
        emphasisWord: "Review",
        caption: "Revise one chapter and list three concepts that need more practice.",
      },
    ],
  },
  {
    day: 96,
    theme: "Practice improves precision",
    slides: [
      {
        icon: "🎯",
        headline: "Aim for accurate solutions",
        emphasisWord: "accurate",
        caption: "Accuracy today creates speed naturally tomorrow.",
      },
      {
        icon: "📐",
        headline: "Precision earns marks",
        emphasisWord: "Precision",
        caption: "Careful calculations and complete steps protect marks in board exams.",
      },
      {
        icon: "👧",
        headline: "Mira checked every calculation",
        emphasisWord: "calculation",
        caption: "Mira verified each maths step herself before comparing with AI.",
      },
      {
        icon: "🖊️",
        headline: "Check every step today",
        emphasisWord: "step",
        caption: "Slow down and verify your calculations before submitting to AI.",
      },
    ],
  },
  {
    day: 97,
    theme: "Learn actively every session",
    slides: [
      {
        icon: "⚡",
        headline: "Stay active while studying",
        emphasisWord: "active",
        caption: "Learning happens when you question, write and solve, not just read.",
      },
      {
        icon: "📝",
        headline: "Active study wins",
        emphasisWord: "Active",
        caption: "Writing examples and solving problems strengthen memory much faster.",
      },
      {
        icon: "👨",
        headline: "Dhruv kept solving actively",
        emphasisWord: "actively",
        caption: "Dhruv paused after every concept and solved one practice question.",
      },
      {
        icon: "📘",
        headline: "Practice after every topic",
        emphasisWord: "Practice",
        caption: "Finish one example immediately after learning each new concept.",
      },
    ],
  },
  {
    day: 98,
    theme: "Trust your growing ability",
    slides: [
      {
        icon: "🌱",
        headline: "Believe your progress",
        emphasisWord: "Believe",
        caption: "Today's difficult chapter may become next month's easiest revision.",
      },
      {
        icon: "📈",
        headline: "Growth rewards patience",
        emphasisWord: "Growth",
        caption: "Consistent effort quietly transforms confusion into confidence.",
      },
      {
        icon: "👩‍🎓",
        headline: "Shreya noticed improvement",
        emphasisWord: "improvement",
        caption: "Shreya solved questions this week that felt impossible a month ago.",
      },
      {
        icon: "🌟",
        headline: "Notice today's improvement",
        emphasisWord: "improvement",
        caption: "Compare today's work with an older notebook page and celebrate your growth.",
      },
    ],
  },
  {
    day: 99,
    theme: "Prepare your future self",
    slides: [
      {
        icon: "🚀",
        headline: "Study for tomorrow",
        emphasisWord: "tomorrow",
        caption: "Every honest study session makes your future exams a little easier.",
      },
      {
        icon: "🏔️",
        headline: "Preparation builds resilience",
        emphasisWord: "Preparation",
        caption: "Prepared students recover faster even when a question looks unfamiliar.",
      },
      {
        icon: "👦",
        headline: "Arnav invested in tomorrow",
        emphasisWord: "tomorrow",
        caption: "Arnav solved today's worksheet completely instead of depending on instant answers.",
      },
      {
        icon: "📅",
        headline: "Help tomorrow's you",
        emphasisWord: "tomorrow",
        caption: "Finish one extra practice question today as a gift to your future self.",
      },
    ],
  },
  {
    day: 100,
    theme: "One hundred mornings stronger",
    slides: [
      {
        icon: "💯",
        headline: "Celebrate one hundred mornings",
        emphasisWord: "hundred",
        caption: "One hundred mornings of honest learning have created habits that no shortcut can replace.",
      },
      {
        icon: "🏆",
        headline: "Character shapes success",
        emphasisWord: "Character",
        caption: "Real achievement comes from consistent effort, honest learning and disciplined practice.",
      },
      {
        icon: "👩‍🎓",
        headline: "Kriti earned every mark",
        emphasisWord: "earned",
        caption: "Kriti used AI to understand concepts, but every solution in her notebook was written by her.",
      },
      {
        icon: "💙",
        headline: "Continue this journey",
        emphasisWord: "journey",
        caption: "Keep choosing understanding over shortcuts. Let AI teach you, never replace your thinking.",
      },
    ],
  },
  {
    day: 101,
    theme: "Think before touching the keyboard",
    slides: [
      {
        icon: "⌨️",
        headline: "Pause before you type",
        emphasisWord: "Pause",
        caption: "Before asking AI anything, spend one minute thinking about your own approach.",
      },
      {
        icon: "🧠",
        headline: "Thinking sharpens judgement",
        emphasisWord: "Thinking",
        caption: "Your first idea may not be perfect, but it trains the decision-making exams require.",
      },
      {
        icon: "👨‍🎓",
        headline: "Vivaan paused before searching",
        emphasisWord: "paused",
        caption: "Vivaan found the correct formula himself after taking a minute to think.",
      },
      {
        icon: "⏱️",
        headline: "Pause one minute today",
        emphasisWord: "Pause",
        caption: "Before every AI prompt, stop and think for sixty seconds.",
      },
    ],
  },
  {
    day: 102,
    theme: "Draw before you decide",
    slides: [
      {
        icon: "✏️",
        headline: "Sketch the problem first",
        emphasisWord: "Sketch",
        caption: "Diagrams often reveal solutions that paragraphs cannot.",
      },
      {
        icon: "📐",
        headline: "Visuals improve understanding",
        emphasisWord: "Visuals",
        caption: "Drawing forces your brain to organise information more clearly.",
      },
      {
        icon: "👧",
        headline: "Nitya drew the circuit",
        emphasisWord: "drew",
        caption: "After sketching the circuit, Nitya understood the current flow without needing the full solution.",
      },
      {
        icon: "📄",
        headline: "Draw one diagram today",
        emphasisWord: "Draw",
        caption: "Turn one difficult concept into a simple sketch before using AI.",
      },
    ],
  },
  {
    day: 103,
    theme: "Questions deserve patient reading",
    slides: [
      {
        icon: "📖",
        headline: "Read beyond the numbers",
        emphasisWord: "Read",
        caption: "Hidden clues often sit quietly between the values and formulas.",
      },
      {
        icon: "🔎",
        headline: "Attention prevents mistakes",
        emphasisWord: "Attention",
        caption: "Careful reading saves marks that rushed solving can lose.",
      },
      {
        icon: "👦",
        headline: "Harit spotted the clue",
        emphasisWord: "clue",
        caption: "Harit noticed one important condition before solving and avoided a common mistake.",
      },
      {
        icon: "🖍️",
        headline: "Mark one clue today",
        emphasisWord: "clue",
        caption: "Underline the most important sentence before writing your answer.",
      },
    ],
  },
  {
    day: 104,
    theme: "Let mistakes become mentors",
    slides: [
      {
        icon: "🪞",
        headline: "Face mistakes confidently",
        emphasisWord: "mistakes",
        caption: "Every corrected mistake quietly becomes an extra mark in a future exam.",
      },
      {
        icon: "📈",
        headline: "Reflection builds improvement",
        emphasisWord: "Reflection",
        caption: "Looking back at errors is part of moving forward.",
      },
      {
        icon: "👩",
        headline: "Radhika embraced feedback",
        emphasisWord: "feedback",
        caption: "Radhika reviewed every wrong Biology answer before asking AI to explain the pattern.",
      },
      {
        icon: "📝",
        headline: "Review one error today",
        emphasisWord: "error",
        caption: "Correct one old mistake before starting today's practice.",
      },
    ],
  },
  {
    day: 105,
    theme: "Strong habits beat talent",
    slides: [
      {
        icon: "🌅",
        headline: "Choose habits every morning",
        emphasisWord: "habits",
        caption: "Daily discipline quietly beats occasional bursts of motivation.",
      },
      {
        icon: "🏗️",
        headline: "Routine builds excellence",
        emphasisWord: "Routine",
        caption: "Consistent practice shapes results long before report cards arrive.",
      },
      {
        icon: "👦",
        headline: "Armaan trusted his routine",
        emphasisWord: "routine",
        caption: "Armaan solved one worksheet every morning before opening AI.",
      },
      {
        icon: "📅",
        headline: "Protect your routine",
        emphasisWord: "routine",
        caption: "Complete today's first study session before anything else.",
      },
    ],
  },
  {
    day: 106,
    theme: "Explain before you verify",
    slides: [
      {
        icon: "🗣️",
        headline: "Teach the concept aloud",
        emphasisWord: "Teach",
        caption: "If you can explain it simply, you probably understand it deeply.",
      },
      {
        icon: "🎤",
        headline: "Explaining strengthens memory",
        emphasisWord: "Explaining",
        caption: "Teaching yourself reveals gaps that silent reading often hides.",
      },
      {
        icon: "👧",
        headline: "Kiara taught herself",
        emphasisWord: "taught",
        caption: "Kiara explained chemical bonding aloud before checking AI's explanation.",
      },
      {
        icon: "📢",
        headline: "Teach one topic today",
        emphasisWord: "Teach",
        caption: "Spend two minutes explaining one concept in your own words.",
      },
    ],
  },
  {
    day: 107,
    theme: "Persistence solves more problems",
    slides: [
      {
        icon: "🧗",
        headline: "Stay with the problem",
        emphasisWord: "Stay",
        caption: "The answer sometimes appears one minute after you feel like giving up.",
      },
      {
        icon: "💪",
        headline: "Persistence creates breakthroughs",
        emphasisWord: "Persistence",
        caption: "Students improve fastest when they don't quit after the first obstacle.",
      },
      {
        icon: "👨",
        headline: "Veer kept trying",
        emphasisWord: "trying",
        caption: "Veer solved the final maths step after resisting the urge to search immediately.",
      },
      {
        icon: "🎯",
        headline: "Try two minutes longer",
        emphasisWord: "Try",
        caption: "Give every difficult question two extra minutes before asking AI.",
      },
    ],
  },
  {
    day: 108,
    theme: "Organised notes simplify revision",
    slides: [
      {
        icon: "📂",
        headline: "Organise today's learning",
        emphasisWord: "Organise",
        caption: "Clear notes save precious time during revision week.",
      },
      {
        icon: "📝",
        headline: "Structure improves recall",
        emphasisWord: "Structure",
        caption: "Well-organised notes help your brain find information faster.",
      },
      {
        icon: "👩‍🎓",
        headline: "Siya arranged her notes",
        emphasisWord: "arranged",
        caption: "Siya grouped formulas by chapter before asking AI for memory tips.",
      },
      {
        icon: "📚",
        headline: "Organise one chapter today",
        emphasisWord: "Organise",
        caption: "Clean up one page of notes so revision becomes easier.",
      },
    ],
  },
  {
    day: 109,
    theme: "Accuracy deserves extra attention",
    slides: [
      {
        icon: "🎯",
        headline: "Check before celebrating",
        emphasisWord: "Check",
        caption: "A quick review catches small mistakes before they become lost marks.",
      },
      {
        icon: "🔍",
        headline: "Accuracy rewards patience",
        emphasisWord: "Accuracy",
        caption: "One careful check often matters more than one extra question.",
      },
      {
        icon: "👦",
        headline: "Lakshit verified every answer",
        emphasisWord: "verified",
        caption: "Lakshit caught a sign error by reviewing his calculations before AI.",
      },
      {
        icon: "✔️",
        headline: "Review every calculation",
        emphasisWord: "Review",
        caption: "Spend one final minute checking your completed solution.",
      },
    ],
  },
  {
    day: 110,
    theme: "One hundred ten honest mornings",
    slides: [
      {
        icon: "🌟",
        headline: "Celebrate steady progress",
        emphasisWord: "progress",
        caption: "One hundred ten mornings of honest effort have quietly transformed your study habits.",
      },
      {
        icon: "💙",
        headline: "Integrity inspires excellence",
        emphasisWord: "Integrity",
        caption: "Every time you chose learning over shortcuts, your future became stronger.",
      },
      {
        icon: "👩‍🎓",
        headline: "Meera trusted her growth",
        emphasisWord: "growth",
        caption: "Meera let AI explain concepts while every written solution remained her own work.",
      },
      {
        icon: "🚀",
        headline: "Continue growing today",
        emphasisWord: "growing",
        caption: "Keep using AI to understand, and keep trusting yourself to solve.",
      },
    ],
  },
  {
    day: 111,
    theme: "Discover before you depend",
    slides: [
      {
        icon: "🧭",
        headline: "Explore before asking AI",
        emphasisWord: "Explore",
        caption: "Spend a few minutes discovering the path yourself before looking for guidance.",
      },
      {
        icon: "🧠",
        headline: "Discovery strengthens learning",
        emphasisWord: "Discovery",
        caption: "Finding ideas on your own helps them stay during boards and entrance exams.",
      },
      {
        icon: "👦",
        headline: "Reyansh explored independently first",
        emphasisWord: "explored",
        caption: "Reyansh understood half the Physics problem before AI explained the final concept.",
      },
      {
        icon: "🎯",
        headline: "Explore one solution today",
        emphasisWord: "Explore",
        caption: "Try finding the approach yourself before writing your AI prompt.",
      },
    ],
  },
  {
    day: 112,
    theme: "Master concepts through comparison",
    slides: [
      {
        icon: "⚖️",
        headline: "Compare similar questions carefully",
        emphasisWord: "Compare",
        caption: "Different questions often test the same concept in different ways.",
      },
      {
        icon: "🔗",
        headline: "Comparison reveals patterns",
        emphasisWord: "Comparison",
        caption: "Recognising similarities helps you solve unfamiliar questions faster.",
      },
      {
        icon: "👧",
        headline: "Aditi compared both methods",
        emphasisWord: "compared",
        caption: "Aditi noticed two Chemistry questions followed the same reasoning.",
      },
      {
        icon: "📘",
        headline: "Compare two examples today",
        emphasisWord: "Compare",
        caption: "Find one common idea between two solved questions.",
      },
    ],
  },
  {
    day: 113,
    theme: "Solve first verify later",
    slides: [
      {
        icon: "🏁",
        headline: "Finish before verifying",
        emphasisWord: "Finish",
        caption: "Complete your solution before checking whether it's correct.",
      },
      {
        icon: "✅",
        headline: "Verification improves confidence",
        emphasisWord: "Verification",
        caption: "Checking your own work teaches more than reading perfect answers.",
      },
      {
        icon: "👨‍🎓",
        headline: "Rohan finished independently",
        emphasisWord: "finished",
        caption: "Rohan completed the entire Maths solution before asking AI to review one step.",
      },
      {
        icon: "📝",
        headline: "Finish one answer today",
        emphasisWord: "Finish",
        caption: "Write the complete solution before comparing it with AI.",
      },
    ],
  },
  {
    day: 114,
    theme: "Every chapter deserves attention",
    slides: [
      {
        icon: "📚",
        headline: "Respect every chapter equally",
        emphasisWord: "chapter",
        caption: "Easy chapters build confidence. Difficult chapters build strength.",
      },
      {
        icon: "🌱",
        headline: "Balanced learning wins",
        emphasisWord: "Balanced",
        caption: "Don't skip weaker topics because they feel uncomfortable.",
      },
      {
        icon: "👩",
        headline: "Mahi tackled weak chapters",
        emphasisWord: "weak",
        caption: "Mahi began with her weakest Biology chapter before using AI for revision.",
      },
      {
        icon: "📖",
        headline: "Study one weak chapter",
        emphasisWord: "weak",
        caption: "Spend today's first session improving a topic you've been avoiding.",
      },
    ],
  },
  {
    day: 115,
    theme: "Confidence follows preparation",
    slides: [
      {
        icon: "🌄",
        headline: "Prepare before feeling confident",
        emphasisWord: "Prepare",
        caption: "Confidence grows quietly through preparation, not wishful thinking.",
      },
      {
        icon: "🏗️",
        headline: "Preparation builds certainty",
        emphasisWord: "Preparation",
        caption: "Every honest study session removes a little more exam fear.",
      },
      {
        icon: "👦",
        headline: "Dev prepared consistently",
        emphasisWord: "prepared",
        caption: "Dev solved one NCERT exercise every morning before asking AI for explanations.",
      },
      {
        icon: "🎯",
        headline: "Prepare one topic today",
        emphasisWord: "Prepare",
        caption: "Master one concept fully before moving to the next.",
      },
    ],
  },
  {
    day: 116,
    theme: "Write your learning journey",
    slides: [
      {
        icon: "📓",
        headline: "Document your understanding",
        emphasisWord: "Document",
        caption: "Writing your own explanations helps your future revision.",
      },
      {
        icon: "✍️",
        headline: "Writing deepens memory",
        emphasisWord: "Writing",
        caption: "Your own words stay longer than copied paragraphs.",
      },
      {
        icon: "👧",
        headline: "Naina rewrote difficult ideas",
        emphasisWord: "rewrote",
        caption: "Naina simplified one difficult Physics topic after understanding it with AI.",
      },
      {
        icon: "🖊️",
        headline: "Write one summary today",
        emphasisWord: "Write",
        caption: "Summarise one lesson without looking at your textbook.",
      },
    ],
  },
  {
    day: 117,
    theme: "Protect your problem solving",
    slides: [
      {
        icon: "🛡️",
        headline: "Guard your thinking time",
        emphasisWord: "thinking",
        caption: "The first few minutes belong to your brain, not your browser.",
      },
      {
        icon: "🧠",
        headline: "Independent thinking matters",
        emphasisWord: "Independent",
        caption: "Every solved question strengthens your reasoning for future exams.",
      },
      {
        icon: "👨",
        headline: "Adarsh trusted his reasoning",
        emphasisWord: "reasoning",
        caption: "Adarsh solved most of the derivation before requesting one hint from AI.",
      },
      {
        icon: "⏳",
        headline: "Think five minutes first",
        emphasisWord: "Think",
        caption: "Protect five minutes of uninterrupted thinking before opening AI.",
      },
    ],
  },
  {
    day: 118,
    theme: "Revision reveals real understanding",
    slides: [
      {
        icon: "🔄",
        headline: "Revisit yesterday's learning",
        emphasisWord: "Revisit",
        caption: "Revision is where strong memory is quietly built.",
      },
      {
        icon: "🧩",
        headline: "Revision uncovers gaps",
        emphasisWord: "Revision",
        caption: "Finding forgotten concepts today prevents panic before exams.",
      },
      {
        icon: "👩‍🎓",
        headline: "Sia revised before studying",
        emphasisWord: "revised",
        caption: "Sia reviewed yesterday's notes before starting a new Chemistry lesson.",
      },
      {
        icon: "📋",
        headline: "Revisit one topic today",
        emphasisWord: "Revisit",
        caption: "Spend ten minutes strengthening yesterday's learning first.",
      },
    ],
  },
  {
    day: 119,
    theme: "Choose progress every morning",
    slides: [
      {
        icon: "🌅",
        headline: "Progress begins today",
        emphasisWord: "Progress",
        caption: "Every morning gives you another opportunity to improve one small step.",
      },
      {
        icon: "📈",
        headline: "Small wins accumulate",
        emphasisWord: "Small",
        caption: "Consistent improvements create remarkable results over months.",
      },
      {
        icon: "👦",
        headline: "Vihaan celebrated improvement",
        emphasisWord: "improvement",
        caption: "Vihaan solved today's questions faster than last week's practice.",
      },
      {
        icon: "🌟",
        headline: "Improve one skill today",
        emphasisWord: "Improve",
        caption: "Focus on becoming slightly better than yesterday.",
      },
    ],
  },
  {
    day: 120,
    theme: "One hundred twenty honest days",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate one twenty",
        emphasisWord: "twenty",
        caption: "One hundred twenty mornings of honest study have strengthened both your knowledge and character.",
      },
      {
        icon: "💙",
        headline: "Integrity builds trust",
        emphasisWord: "Integrity",
        caption: "Every promise you've kept has made you more prepared for every exam ahead.",
      },
      {
        icon: "👩‍🎓",
        headline: "Kavya trusted herself",
        emphasisWord: "trusted",
        caption: "Kavya learned with AI every day but solved every board question using her own understanding.",
      },
      {
        icon: "🚀",
        headline: "Continue the promise",
        emphasisWord: "promise",
        caption: "Keep learning with AI as your guide while your own mind does the solving.",
      },
    ],
  },
  {
    day: 121,
    theme: "Think before every formula",
    slides: [
      {
        icon: "🧠",
        headline: "Understand before applying formulas",
        emphasisWord: "Understand",
        caption: "A formula works better when you know why it belongs to the question.",
      },
      {
        icon: "💡",
        headline: "Concepts choose formulas",
        emphasisWord: "Concepts",
        caption: "Recognising the idea first helps you select the correct method with confidence.",
      },
      {
        icon: "👦",
        headline: "Ishan recognised the concept",
        emphasisWord: "concept",
        caption: "Ishan identified the Physics principle before writing a single equation.",
      },
      {
        icon: "✍️",
        headline: "Name the concept today",
        emphasisWord: "concept",
        caption: "Write the chapter or idea before using any formula or asking AI.",
      },
    ],
  },
  {
    day: 122,
    theme: "Strength comes from repetition",
    slides: [
      {
        icon: "🔁",
        headline: "Repeat with full attention",
        emphasisWord: "Repeat",
        caption: "Each fresh attempt makes your understanding a little stronger.",
      },
      {
        icon: "📈",
        headline: "Repetition builds confidence",
        emphasisWord: "Repetition",
        caption: "Solving similar questions improves both speed and accuracy.",
      },
      {
        icon: "👧",
        headline: "Nidhi solved another example",
        emphasisWord: "example",
        caption: "Nidhi practiced one more numerical before asking AI for a tougher challenge.",
      },
      {
        icon: "🎯",
        headline: "Repeat one exercise today",
        emphasisWord: "Repeat",
        caption: "Solve another question from the same concept before moving ahead.",
      },
    ],
  },
  {
    day: 123,
    theme: "Challenge your own thinking",
    slides: [
      {
        icon: "🤔",
        headline: "Question your first answer",
        emphasisWord: "Question",
        caption: "Ask yourself if there could be another way before checking AI.",
      },
      {
        icon: "🧩",
        headline: "Reasoning uncovers better methods",
        emphasisWord: "Reasoning",
        caption: "Strong thinkers compare approaches instead of accepting the first idea.",
      },
      {
        icon: "👨‍🎓",
        headline: "Raghav found another method",
        emphasisWord: "method",
        caption: "Raghav discovered a shorter solution after reviewing his own working.",
      },
      {
        icon: "🔍",
        headline: "Challenge one solution today",
        emphasisWord: "Challenge",
        caption: "Look for a second method before asking AI for an explanation.",
      },
    ],
  },
  {
    day: 124,
    theme: "Turn notes into knowledge",
    slides: [
      {
        icon: "📒",
        headline: "Transform notes into learning",
        emphasisWord: "learning",
        caption: "Notes become useful only when you understand every line you've written.",
      },
      {
        icon: "✍️",
        headline: "Rewrite difficult ideas",
        emphasisWord: "Rewrite",
        caption: "Simple words make complex chapters much easier to revise.",
      },
      {
        icon: "👩",
        headline: "Anushka simplified her notes",
        emphasisWord: "simplified",
        caption: "Anushka rewrote a difficult Chemistry topic after understanding it with AI.",
      },
      {
        icon: "📝",
        headline: "Simplify one page today",
        emphasisWord: "Simplify",
        caption: "Rewrite one complicated topic using your own words.",
      },
    ],
  },
  {
    day: 125,
    theme: "Train your exam mindset",
    slides: [
      {
        icon: "🎓",
        headline: "Practice under real conditions",
        emphasisWord: "Practice",
        caption: "Study sometimes without help, just like you'll write the actual exam.",
      },
      {
        icon: "⏱️",
        headline: "Timing improves confidence",
        emphasisWord: "Timing",
        caption: "Working against the clock prepares you for board and entrance papers.",
      },
      {
        icon: "👦",
        headline: "Karan solved under timer",
        emphasisWord: "timer",
        caption: "Karan completed his Maths worksheet before checking AI for corrections.",
      },
      {
        icon: "⌛",
        headline: "Time one exercise today",
        emphasisWord: "Time",
        caption: "Solve one question with a timer before reviewing your answer.",
      },
    ],
  },
  {
    day: 126,
    theme: "Keep curiosity alive daily",
    slides: [
      {
        icon: "🌱",
        headline: "Feed your curiosity daily",
        emphasisWord: "curiosity",
        caption: "Every great learner asks one extra question beyond the textbook.",
      },
      {
        icon: "💬",
        headline: "Curiosity unlocks understanding",
        emphasisWord: "Curiosity",
        caption: "Exploring ideas deeply makes revision faster later.",
      },
      {
        icon: "👧",
        headline: "Mira explored beyond syllabus",
        emphasisWord: "explored",
        caption: "Mira asked AI how a Physics concept is used in everyday life.",
      },
      {
        icon: "❓",
        headline: "Ask one extra why",
        emphasisWord: "why",
        caption: "Choose one lesson and explore a question that isn't in the exercise.",
      },
    ],
  },
  {
    day: 127,
    theme: "Strong focus creates results",
    slides: [
      {
        icon: "🎯",
        headline: "Protect your attention today",
        emphasisWord: "attention",
        caption: "Deep focus turns ordinary study sessions into meaningful progress.",
      },
      {
        icon: "🔕",
        headline: "Silence supports concentration",
        emphasisWord: "Silence",
        caption: "Fewer interruptions help your brain connect ideas more effectively.",
      },
      {
        icon: "👨",
        headline: "Harsh ignored distractions",
        emphasisWord: "distractions",
        caption: "Harsh completed his Biology revision before opening any other app.",
      },
      {
        icon: "📵",
        headline: "Protect thirty minutes",
        emphasisWord: "Protect",
        caption: "Keep notifications away until your first study session is complete.",
      },
    ],
  },
  {
    day: 128,
    theme: "Accuracy begins with patience",
    slides: [
      {
        icon: "🎯",
        headline: "Slow down for accuracy",
        emphasisWord: "accuracy",
        caption: "One careful calculation is worth more than three rushed guesses.",
      },
      {
        icon: "📐",
        headline: "Careful work saves marks",
        emphasisWord: "Careful",
        caption: "Precision grows when you check every important step.",
      },
      {
        icon: "👩‍🎓",
        headline: "Pooja verified every value",
        emphasisWord: "verified",
        caption: "Pooja found a calculation error before comparing her solution with AI.",
      },
      {
        icon: "✔️",
        headline: "Check one calculation today",
        emphasisWord: "Check",
        caption: "Review every number before asking AI to verify your work.",
      },
    ],
  },
  {
    day: 129,
    theme: "Celebrate daily improvement",
    slides: [
      {
        icon: "🌟",
        headline: "Notice today's progress",
        emphasisWord: "progress",
        caption: "Every solved question is proof that you're stronger than yesterday.",
      },
      {
        icon: "📈",
        headline: "Progress grows quietly",
        emphasisWord: "Progress",
        caption: "Small improvements become big achievements through consistency.",
      },
      {
        icon: "👦",
        headline: "Aditya noticed improvement",
        emphasisWord: "improvement",
        caption: "Aditya solved questions this week that once felt impossible.",
      },
      {
        icon: "💙",
        headline: "Celebrate one victory today",
        emphasisWord: "Celebrate",
        caption: "Recognise one concept you've mastered through honest effort.",
      },
    ],
  },
  {
    day: 130,
    theme: "One hundred thirty promises kept",
    slides: [
      {
        icon: "🏆",
        headline: "Celebrate one thirty",
        emphasisWord: "thirty",
        caption: "One hundred thirty mornings of integrity have built a learner who trusts their own mind.",
      },
      {
        icon: "🧠",
        headline: "Character drives achievement",
        emphasisWord: "Character",
        caption: "The habits you've built today will stay long after the exams are over.",
      },
      {
        icon: "👩‍🎓",
        headline: "Diya earned confidence",
        emphasisWord: "earned",
        caption: "Diya used AI to understand every chapter, but every answer she submitted was her own.",
      },
      {
        icon: "🚀",
        headline: "Keep learning honestly",
        emphasisWord: "honestly",
        caption: "Let AI continue to be your teacher while your own thinking earns every mark.",
      },
    ],
  },
  {
    day: 131,
    theme: "Start with what you know",
    slides: [
      {
        icon: "🧩",
        headline: "Begin with known facts",
        emphasisWord: "Begin",
        caption: "Every difficult question has something familiar. Find that first.",
      },
      {
        icon: "🧠",
        headline: "Known ideas reduce stress",
        emphasisWord: "Known",
        caption: "Connecting new questions to familiar concepts keeps your thinking calm.",
      },
      {
        icon: "👦",
        headline: "Ritvik found familiar concepts",
        emphasisWord: "familiar",
        caption: "Ritvik listed the given information before asking AI for one small hint.",
      },
      {
        icon: "✍️",
        headline: "List known facts today",
        emphasisWord: "facts",
        caption: "Before solving, write everything you already know about the question.",
      },
    ],
  },
  {
    day: 132,
    theme: "Solve with complete attention",
    slides: [
      {
        icon: "🎧",
        headline: "Give one task everything",
        emphasisWord: "everything",
        caption: "Multitasking feels productive but often slows real learning.",
      },
      {
        icon: "🎯",
        headline: "Attention creates accuracy",
        emphasisWord: "Attention",
        caption: "One focused attempt teaches more than many distracted ones.",
      },
      {
        icon: "👧",
        headline: "Khushi stayed fully focused",
        emphasisWord: "focused",
        caption: "Khushi completed her Chemistry worksheet before checking any notifications.",
      },
      {
        icon: "📵",
        headline: "Focus without distractions",
        emphasisWord: "Focus",
        caption: "Keep your phone silent until one study session is complete.",
      },
    ],
  },
  {
    day: 133,
    theme: "Confidence grows from correction",
    slides: [
      {
        icon: "🛠️",
        headline: "Correct before repeating mistakes",
        emphasisWord: "Correct",
        caption: "Improvement begins the moment you understand why something went wrong.",
      },
      {
        icon: "📈",
        headline: "Reflection creates progress",
        emphasisWord: "Reflection",
        caption: "Every corrected mistake strengthens your preparation for the next test.",
      },
      {
        icon: "👨‍🎓",
        headline: "Arya fixed yesterday answers",
        emphasisWord: "fixed",
        caption: "Arya reviewed yesterday's Physics errors before solving fresh questions.",
      },
      {
        icon: "📝",
        headline: "Improve one mistake today",
        emphasisWord: "Improve",
        caption: "Rewrite one incorrect solution until every step makes sense.",
      },
    ],
  },
  {
    day: 134,
    theme: "Train your explanation skills",
    slides: [
      {
        icon: "🗣️",
        headline: "Explain every important concept",
        emphasisWord: "Explain",
        caption: "If you can teach it simply, you probably understand it deeply.",
      },
      {
        icon: "🎤",
        headline: "Explanation reveals understanding",
        emphasisWord: "Explanation",
        caption: "Speaking aloud uncovers gaps that reading quietly can hide.",
      },
      {
        icon: "👩",
        headline: "Myra explained cell division",
        emphasisWord: "explained",
        caption: "Myra taught herself Biology before asking AI to check her explanation.",
      },
      {
        icon: "📢",
        headline: "Teach one lesson today",
        emphasisWord: "Teach",
        caption: "Explain one concept aloud for two minutes without looking at notes.",
      },
    ],
  },
  {
    day: 135,
    theme: "Difficult chapters deserve courage",
    slides: [
      {
        icon: "⛰️",
        headline: "Choose difficult chapters first",
        emphasisWord: "difficult",
        caption: "The chapter you avoid today could become your biggest strength tomorrow.",
      },
      {
        icon: "💪",
        headline: "Courage grows through effort",
        emphasisWord: "Courage",
        caption: "Facing hard topics every morning reduces exam fear little by little.",
      },
      {
        icon: "👦",
        headline: "Kabir faced organic chemistry",
        emphasisWord: "organic",
        caption: "Kabir attempted reactions himself before asking AI to explain one mechanism.",
      },
      {
        icon: "🚀",
        headline: "Open toughest chapter today",
        emphasisWord: "toughest",
        caption: "Spend your freshest energy on the chapter you've postponed.",
      },
    ],
  },
  {
    day: 136,
    theme: "Practice without instant rescue",
    slides: [
      {
        icon: "🏋️",
        headline: "Struggle a little longer",
        emphasisWord: "Struggle",
        caption: "Your brain grows strongest during the moments you almost give up.",
      },
      {
        icon: "🧠",
        headline: "Persistence develops ability",
        emphasisWord: "Persistence",
        caption: "Learning becomes permanent when your own thinking solves the challenge.",
      },
      {
        icon: "👧",
        headline: "Anaya resisted quick answers",
        emphasisWord: "quick",
        caption: "Anaya stayed with a Maths proof before requesting one guiding question from AI.",
      },
      {
        icon: "⏳",
        headline: "Wait three minutes today",
        emphasisWord: "Wait",
        caption: "Give yourself three extra minutes before asking AI for help.",
      },
    ],
  },
  {
    day: 137,
    theme: "Build smarter revision habits",
    slides: [
      {
        icon: "🗂️",
        headline: "Group similar concepts together",
        emphasisWord: "Group",
        caption: "Connecting related ideas makes revision faster before exams.",
      },
      {
        icon: "🔗",
        headline: "Organisation improves recall",
        emphasisWord: "Organisation",
        caption: "Your memory works better when information is connected.",
      },
      {
        icon: "👨",
        headline: "Yuvan linked related formulas",
        emphasisWord: "linked",
        caption: "Yuvan organised Physics formulas by topic before revising them.",
      },
      {
        icon: "📚",
        headline: "Organise one chapter today",
        emphasisWord: "Organise",
        caption: "Create one summary page connecting important concepts.",
      },
    ],
  },
  {
    day: 138,
    theme: "Think beyond textbook examples",
    slides: [
      {
        icon: "🌍",
        headline: "Connect learning with life",
        emphasisWord: "Connect",
        caption: "Real-world examples make difficult concepts easier to remember.",
      },
      {
        icon: "💡",
        headline: "Examples deepen understanding",
        emphasisWord: "Examples",
        caption: "Learning becomes meaningful when you see where concepts are used.",
      },
      {
        icon: "👩‍🎓",
        headline: "Rhea explored real applications",
        emphasisWord: "applications",
        caption: "Rhea asked AI where electrolysis is used after solving NCERT questions.",
      },
      {
        icon: "🔍",
        headline: "Find one application today",
        emphasisWord: "application",
        caption: "Discover one real-life use of today's lesson after solving it yourself.",
      },
    ],
  },
  {
    day: 139,
    theme: "Stay curious until clarity",
    slides: [
      {
        icon: "🔦",
        headline: "Keep searching for clarity",
        emphasisWord: "clarity",
        caption: "Don't stop at the answer. Understand why the answer works.",
      },
      {
        icon: "🌱",
        headline: "Curiosity drives mastery",
        emphasisWord: "Curiosity",
        caption: "Students who ask deeper questions build stronger understanding.",
      },
      {
        icon: "👦",
        headline: "Aarav explored one concept",
        emphasisWord: "explored",
        caption: "Aarav asked AI to explain why the shortcut worked instead of simply using it.",
      },
      {
        icon: "❓",
        headline: "Ask one deeper why",
        emphasisWord: "why",
        caption: "Choose one topic and understand the reason behind the rule.",
      },
    ],
  },
  {
    day: 140,
    theme: "One hundred forty mornings stronger",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate one forty",
        emphasisWord: "forty",
        caption: "One hundred forty mornings of honest study have strengthened your mind one day at a time.",
      },
      {
        icon: "💙",
        headline: "Integrity becomes identity",
        emphasisWord: "Integrity",
        caption: "Honest learning is no longer just a promise. It's becoming your habit.",
      },
      {
        icon: "👩‍🎓",
        headline: "Sara trusted her preparation",
        emphasisWord: "preparation",
        caption: "Sara used AI to understand every chapter but relied on herself to solve every question.",
      },
      {
        icon: "🌟",
        headline: "Carry honesty forward",
        emphasisWord: "honesty",
        caption: "Keep choosing understanding over shortcuts. Your future self is built one morning at a time.",
      },
    ],
  },
  {
    day: 141,
    theme: "Own the learning process",
    slides: [
      {
        icon: "🛤️",
        headline: "Walk your own path",
        emphasisWord: "own",
        caption: "Every honest attempt takes you one step closer to exam confidence.",
      },
      {
        icon: "🧠",
        headline: "Ownership creates mastery",
        emphasisWord: "Ownership",
        caption: "Learning stays longer when the solution comes from your own thinking.",
      },
      {
        icon: "👦",
        headline: "Neel owned the solution",
        emphasisWord: "owned",
        caption: "Neel completed the derivation himself before asking AI to explain one missing idea.",
      },
      {
        icon: "✍️",
        headline: "Own one solution today",
        emphasisWord: "Own",
        caption: "Complete one answer entirely by yourself before opening AI.",
      },
    ],
  },
  {
    day: 142,
    theme: "Questions unlock hidden understanding",
    slides: [
      {
        icon: "🔓",
        headline: "Unlock deeper understanding",
        emphasisWord: "Unlock",
        caption: "A thoughtful question often teaches more than a quick answer.",
      },
      {
        icon: "💬",
        headline: "Curious minds improve faster",
        emphasisWord: "Curious",
        caption: "Students who question ideas remember them far longer.",
      },
      {
        icon: "👧",
        headline: "Tanvi questioned everything",
        emphasisWord: "questioned",
        caption: "Tanvi asked why a theorem worked instead of memorising it.",
      },
      {
        icon: "❓",
        headline: "Ask one better question",
        emphasisWord: "question",
        caption: "Show your attempt first, then ask AI about the exact concept you're missing.",
      },
    ],
  },
  {
    day: 143,
    theme: "Strong mornings shape success",
    slides: [
      {
        icon: "🌞",
        headline: "Protect your first hour",
        emphasisWord: "first",
        caption: "The way you begin your morning often decides the quality of your study day.",
      },
      {
        icon: "📈",
        headline: "Morning focus multiplies learning",
        emphasisWord: "Morning",
        caption: "Fresh energy is perfect for your toughest NCERT or JEE questions.",
      },
      {
        icon: "👨‍🎓",
        headline: "Ayaan studied before distractions",
        emphasisWord: "distractions",
        caption: "Ayaan finished his hardest maths problems before checking messages.",
      },
      {
        icon: "📵",
        headline: "Protect your first hour",
        emphasisWord: "first",
        caption: "Finish one focused study session before opening entertainment apps.",
      },
    ],
  },
  {
    day: 144,
    theme: "Understand every calculation",
    slides: [
      {
        icon: "🧮",
        headline: "Know every calculation",
        emphasisWord: "calculation",
        caption: "Don't just trust the answer. Understand how every number appears.",
      },
      {
        icon: "📐",
        headline: "Precision builds confidence",
        emphasisWord: "Precision",
        caption: "Careful calculations protect valuable marks in exams.",
      },
      {
        icon: "👩",
        headline: "Riya checked each calculation",
        emphasisWord: "calculation",
        caption: "Riya verified every Physics step herself before comparing with AI.",
      },
      {
        icon: "✔️",
        headline: "Verify every number today",
        emphasisWord: "Verify",
        caption: "Review each calculation before asking AI if your solution is correct.",
      },
    ],
  },
  {
    day: 145,
    theme: "Learning rewards consistency",
    slides: [
      {
        icon: "📅",
        headline: "Keep showing up daily",
        emphasisWord: "daily",
        caption: "Small efforts repeated every morning create remarkable improvement.",
      },
      {
        icon: "🌱",
        headline: "Consistency beats intensity",
        emphasisWord: "Consistency",
        caption: "One honest study session every day beats one rushed weekend marathon.",
      },
      {
        icon: "👦",
        headline: "Rudra never skipped mornings",
        emphasisWord: "skipped",
        caption: "Rudra studied every morning before asking AI for explanations.",
      },
      {
        icon: "🏁",
        headline: "Complete today's session",
        emphasisWord: "today's",
        caption: "Keep today's promise even if motivation feels low.",
      },
    ],
  },
  {
    day: 146,
    theme: "Notice your own improvement",
    slides: [
      {
        icon: "🌟",
        headline: "Celebrate small improvements",
        emphasisWord: "Celebrate",
        caption: "Progress is easier to see when you compare yourself with yesterday.",
      },
      {
        icon: "📊",
        headline: "Growth happens gradually",
        emphasisWord: "Growth",
        caption: "Every solved question quietly adds to your confidence.",
      },
      {
        icon: "👧",
        headline: "Manya recognised her progress",
        emphasisWord: "progress",
        caption: "Manya solved questions this week that once felt impossible.",
      },
      {
        icon: "💙",
        headline: "Notice one improvement today",
        emphasisWord: "improvement",
        caption: "Compare today's work with an older notebook page.",
      },
    ],
  },
  {
    day: 147,
    theme: "Understanding beats remembering",
    slides: [
      {
        icon: "🧠",
        headline: "Understand before memorising",
        emphasisWord: "Understand",
        caption: "Concepts remembered through understanding stay longer in exams.",
      },
      {
        icon: "💡",
        headline: "Meaning improves recall",
        emphasisWord: "Meaning",
        caption: "When ideas make sense, revision becomes much easier.",
      },
      {
        icon: "👨",
        headline: "Vivaan understood first",
        emphasisWord: "understood",
        caption: "Vivaan asked AI to explain the concept before attempting practice questions.",
      },
      {
        icon: "📖",
        headline: "Explain one idea today",
        emphasisWord: "idea",
        caption: "Describe one concept in simple words before solving questions.",
      },
    ],
  },
  {
    day: 148,
    theme: "Your effort creates confidence",
    slides: [
      {
        icon: "💪",
        headline: "Earn your confidence",
        emphasisWord: "confidence",
        caption: "Real confidence comes from practice you know you completed honestly.",
      },
      {
        icon: "🏆",
        headline: "Effort beats shortcuts",
        emphasisWord: "Effort",
        caption: "Shortcuts disappear in exams. Your preparation stays.",
      },
      {
        icon: "👩‍🎓",
        headline: "Ira trusted her effort",
        emphasisWord: "effort",
        caption: "Ira solved every Biology question herself and used AI only for explanations.",
      },
      {
        icon: "🎯",
        headline: "Earn today's confidence",
        emphasisWord: "Earn",
        caption: "Complete one challenging worksheet using your own reasoning.",
      },
    ],
  },
  {
    day: 149,
    theme: "Think deeper every day",
    slides: [
      {
        icon: "🔍",
        headline: "Look beyond answers",
        emphasisWord: "answers",
        caption: "Understanding why something works matters more than memorising the result.",
      },
      {
        icon: "🌱",
        headline: "Deep thinking lasts",
        emphasisWord: "thinking",
        caption: "Ideas discovered through reasoning stay long after exams.",
      },
      {
        icon: "👦",
        headline: "Advik explored deeper ideas",
        emphasisWord: "deeper",
        caption: "Advik asked AI why the shortcut worked instead of simply copying it.",
      },
      {
        icon: "💭",
        headline: "Explore one reason today",
        emphasisWord: "reason",
        caption: "Choose one concept and understand why each step works.",
      },
    ],
  },
  {
    day: 150,
    theme: "One hundred fifty honest mornings",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate one fifty",
        emphasisWord: "fifty",
        caption: "One hundred fifty mornings of honest study have built discipline that no shortcut can replace.",
      },
      {
        icon: "💙",
        headline: "Integrity becomes strength",
        emphasisWord: "Integrity",
        caption: "Choosing learning over shortcuts every day has strengthened both your mind and character.",
      },
      {
        icon: "👩‍🎓",
        headline: "Anika trusted herself",
        emphasisWord: "trusted",
        caption: "Anika used AI to understand concepts, but every answer she wrote came from her own effort.",
      },
      {
        icon: "🚀",
        headline: "Keep this promise",
        emphasisWord: "promise",
        caption: "Continue learning with AI as your teacher while your own thinking earns every mark.",
      },
    ],
  },
  {
    day: 151,
    theme: "Build solutions with confidence",
    slides: [
      {
        icon: "🧱",
        headline: "Build one step first",
        emphasisWord: "Build",
        caption: "Every complete solution begins with one thoughtful first step.",
      },
      {
        icon: "🧠",
        headline: "Small steps create mastery",
        emphasisWord: "Small",
        caption: "Understanding each step is more valuable than rushing to the final answer.",
      },
      {
        icon: "👦",
        headline: "Vihaan trusted each step",
        emphasisWord: "step",
        caption: "Vihaan solved the derivation one line at a time before asking AI to verify it.",
      },
      {
        icon: "✍️",
        headline: "Write your first step",
        emphasisWord: "first",
        caption: "Start every question by writing the first logical step on your own.",
      },
    ],
  },
  {
    day: 152,
    theme: "See patterns across subjects",
    slides: [
      {
        icon: "🔍",
        headline: "Spot hidden connections",
        emphasisWord: "connections",
        caption: "Different chapters often share the same thinking process.",
      },
      {
        icon: "🧩",
        headline: "Patterns simplify learning",
        emphasisWord: "Patterns",
        caption: "Recognising similarities helps you solve unfamiliar questions with confidence.",
      },
      {
        icon: "👧",
        headline: "Diya connected both chapters",
        emphasisWord: "connected",
        caption: "Diya realised one Physics idea helped solve a new problem immediately.",
      },
      {
        icon: "📘",
        headline: "Link two concepts today",
        emphasisWord: "Link",
        caption: "Find one common idea between today's lesson and an older chapter.",
      },
    ],
  },
  {
    day: 153,
    theme: "Review your own thinking",
    slides: [
      {
        icon: "🪞",
        headline: "Review before requesting help",
        emphasisWord: "Review",
        caption: "Looking at your own work often reveals the mistake before AI does.",
      },
      {
        icon: "📈",
        headline: "Reflection improves judgement",
        emphasisWord: "Reflection",
        caption: "Reviewing your approach strengthens problem-solving skills.",
      },
      {
        icon: "👨‍🎓",
        headline: "Aarush found his error",
        emphasisWord: "error",
        caption: "Aarush corrected a sign mistake after reading his own solution again.",
      },
      {
        icon: "✔️",
        headline: "Check your approach today",
        emphasisWord: "Check",
        caption: "Read your complete solution once before opening AI.",
      },
    ],
  },
  {
    day: 154,
    theme: "Questions deserve patience",
    slides: [
      {
        icon: "🌿",
        headline: "Stay patient while solving",
        emphasisWord: "patient",
        caption: "Difficult questions often become easier after a little more thinking.",
      },
      {
        icon: "💪",
        headline: "Patience builds resilience",
        emphasisWord: "Patience",
        caption: "Calm thinking leads to better decisions under exam pressure.",
      },
      {
        icon: "👩",
        headline: "Meera stayed patient",
        emphasisWord: "patient",
        caption: "Meera solved the last Biology question after resisting the urge to search immediately.",
      },
      {
        icon: "⏳",
        headline: "Think two minutes longer",
        emphasisWord: "Think",
        caption: "Give yourself two extra minutes before asking AI for a clue.",
      },
    ],
  },
  {
    day: 155,
    theme: "Practice for the unexpected",
    slides: [
      {
        icon: "🎲",
        headline: "Expect unfamiliar questions",
        emphasisWord: "unfamiliar",
        caption: "Exams reward understanding, not memorising identical examples.",
      },
      {
        icon: "🚀",
        headline: "Concepts beat surprises",
        emphasisWord: "Concepts",
        caption: "Strong fundamentals help when the question looks completely new.",
      },
      {
        icon: "👦",
        headline: "Rohan handled surprises",
        emphasisWord: "surprises",
        caption: "Rohan recognised the concept even though the question looked different.",
      },
      {
        icon: "🎯",
        headline: "Solve one unseen problem",
        emphasisWord: "unseen",
        caption: "Try one new question without checking any solved example first.",
      },
    ],
  },
  {
    day: 156,
    theme: "Improve through comparison",
    slides: [
      {
        icon: "⚖️",
        headline: "Compare your solutions",
        emphasisWord: "Compare",
        caption: "Comparing methods helps you discover better ways of thinking.",
      },
      {
        icon: "📚",
        headline: "Comparison reveals improvement",
        emphasisWord: "Comparison",
        caption: "Notice how your approach becomes clearer with practice.",
      },
      {
        icon: "👧",
        headline: "Saanvi compared both methods",
        emphasisWord: "compared",
        caption: "Saanvi found a simpler way after reviewing her first attempt.",
      },
      {
        icon: "📝",
        headline: "Compare one answer today",
        emphasisWord: "Compare",
        caption: "After solving, compare your method with AI's explanation.",
      },
    ],
  },
  {
    day: 157,
    theme: "Turn effort into habit",
    slides: [
      {
        icon: "🔄",
        headline: "Repeat honest effort",
        emphasisWord: "Repeat",
        caption: "Every honest morning makes the next one a little easier.",
      },
      {
        icon: "🌱",
        headline: "Habits create excellence",
        emphasisWord: "Habits",
        caption: "Success grows from small routines repeated consistently.",
      },
      {
        icon: "👨",
        headline: "Kian protected his routine",
        emphasisWord: "routine",
        caption: "Kian solved one NCERT exercise before opening AI every morning.",
      },
      {
        icon: "📅",
        headline: "Repeat today's routine",
        emphasisWord: "Repeat",
        caption: "Keep your first study hour focused and distraction free.",
      },
    ],
  },
  {
    day: 158,
    theme: "Learn by simplifying ideas",
    slides: [
      {
        icon: "📝",
        headline: "Simplify difficult concepts",
        emphasisWord: "Simplify",
        caption: "If you can explain it simply, you've probably understood it well.",
      },
      {
        icon: "💡",
        headline: "Simple explanations last",
        emphasisWord: "Simple",
        caption: "Clear ideas stay in memory longer than memorised paragraphs.",
      },
      {
        icon: "👩‍🎓",
        headline: "Navya simplified reactions",
        emphasisWord: "simplified",
        caption: "Navya rewrote a Chemistry mechanism using simple everyday language.",
      },
      {
        icon: "📖",
        headline: "Simplify one topic today",
        emphasisWord: "Simplify",
        caption: "Write one difficult concept as if teaching a younger student.",
      },
    ],
  },
  {
    day: 159,
    theme: "Your effort earns marks",
    slides: [
      {
        icon: "🏅",
        headline: "Earn every mark",
        emphasisWord: "Earn",
        caption: "Marks earned through understanding stay meaningful long after exams.",
      },
      {
        icon: "🧠",
        headline: "Honest effort succeeds",
        emphasisWord: "Honest",
        caption: "Every genuine attempt strengthens both knowledge and confidence.",
      },
      {
        icon: "👦",
        headline: "Advik earned confidence",
        emphasisWord: "earned",
        caption: "Advik solved his mock test independently before reviewing difficult questions with AI.",
      },
      {
        icon: "🌟",
        headline: "Earn today's progress",
        emphasisWord: "Earn",
        caption: "Complete one practice set using your own thinking from start to finish.",
      },
    ],
  },
  {
    day: 160,
    theme: "One hundred sixty mornings together",
    slides: [
      {
        icon: "🏆",
        headline: "Celebrate one sixty",
        emphasisWord: "sixty",
        caption: "One hundred sixty mornings of honest study have built a powerful learning habit.",
      },
      {
        icon: "💙",
        headline: "Discipline shapes destiny",
        emphasisWord: "Discipline",
        caption: "Every promise you've kept has prepared you for bigger challenges ahead.",
      },
      {
        icon: "👩‍🎓",
        headline: "Riya honored her pledge",
        emphasisWord: "pledge",
        caption: "Riya learned with AI every day but trusted herself to solve every board question.",
      },
      {
        icon: "🚀",
        headline: "Keep moving forward",
        emphasisWord: "forward",
        caption: "Continue using AI to learn deeply while your own mind earns every success.",
      },
    ],
  },
  {
    day: 161,
    theme: "Begin with your own strategy",
    slides: [
      {
        icon: "🗺️",
        headline: "Plan before solving",
        emphasisWord: "Plan",
        caption: "A clear plan often saves more time than rushing into calculations.",
      },
      {
        icon: "🧠",
        headline: "Planning improves accuracy",
        emphasisWord: "Planning",
        caption: "Thinking about the approach first reduces avoidable mistakes in exams.",
      },
      {
        icon: "👦",
        headline: "Ivaan planned his approach",
        emphasisWord: "planned",
        caption: "Ivaan listed the formulas he might need before solving the Physics problem.",
      },
      {
        icon: "📋",
        headline: "Plan one solution today",
        emphasisWord: "Plan",
        caption: "Write your approach in one line before asking AI for any help.",
      },
    ],
  },
  {
    day: 162,
    theme: "Every attempt has value",
    slides: [
      {
        icon: "🌱",
        headline: "Respect every attempt",
        emphasisWord: "attempt",
        caption: "Even unfinished attempts teach your brain something useful.",
      },
      {
        icon: "📈",
        headline: "Attempts build resilience",
        emphasisWord: "Attempts",
        caption: "Each question you genuinely try prepares you for tougher papers.",
      },
      {
        icon: "👧",
        headline: "Kriti attempted independently",
        emphasisWord: "attempted",
        caption: "Kriti solved most of the Chemistry problem before checking one confusing step.",
      },
      {
        icon: "✍️",
        headline: "Attempt before assistance",
        emphasisWord: "Attempt",
        caption: "Write your own working first, then let AI explain only the difficult part.",
      },
    ],
  },
  {
    day: 163,
    theme: "Understand every definition deeply",
    slides: [
      {
        icon: "📘",
        headline: "Go beyond definitions",
        emphasisWord: "definitions",
        caption: "Knowing what a term means is only the beginning. Know where it is used.",
      },
      {
        icon: "💡",
        headline: "Meaning beats memorising",
        emphasisWord: "Meaning",
        caption: "Understanding definitions makes application questions much easier.",
      },
      {
        icon: "👨‍🎓",
        headline: "Arnav explained osmosis",
        emphasisWord: "explained",
        caption: "Arnav described osmosis using his own words before asking AI for feedback.",
      },
      {
        icon: "📝",
        headline: "Explain one definition",
        emphasisWord: "Explain",
        caption: "Rewrite one textbook definition in simple everyday language.",
      },
    ],
  },
  {
    day: 164,
    theme: "Practice without answer keys",
    slides: [
      {
        icon: "🔒",
        headline: "Hide the solutions",
        emphasisWord: "solutions",
        caption: "Your brain learns best when it cannot peek at the answer.",
      },
      {
        icon: "🎯",
        headline: "Independent practice matters",
        emphasisWord: "Independent",
        caption: "Solving alone prepares you for the silence of the exam hall.",
      },
      {
        icon: "👩",
        headline: "Siya closed the answerbook",
        emphasisWord: "answerbook",
        caption: "Siya completed every Biology question before comparing with AI.",
      },
      {
        icon: "📚",
        headline: "Solve without answers",
        emphasisWord: "Solve",
        caption: "Keep solutions hidden until you've completed the entire question.",
      },
    ],
  },
  {
    day: 165,
    theme: "Your notebook tells progress",
    slides: [
      {
        icon: "📒",
        headline: "Fill another page",
        emphasisWord: "page",
        caption: "Every handwritten page becomes future revision made by you.",
      },
      {
        icon: "✍️",
        headline: "Writing improves recall",
        emphasisWord: "Writing",
        caption: "The hand remembers what the eyes alone often forget.",
      },
      {
        icon: "👦",
        headline: "Rehan completed notes",
        emphasisWord: "notes",
        caption: "Rehan finished summarising an NCERT chapter before opening AI.",
      },
      {
        icon: "🖊️",
        headline: "Complete one page",
        emphasisWord: "Complete",
        caption: "Add one full page of your own notes before today's study ends.",
      },
    ],
  },
  {
    day: 166,
    theme: "Learn through self questioning",
    slides: [
      {
        icon: "🤔",
        headline: "Question your understanding",
        emphasisWord: "Question",
        caption: "Ask yourself what would happen if one condition changed.",
      },
      {
        icon: "🔍",
        headline: "Questions deepen concepts",
        emphasisWord: "Questions",
        caption: "Curious learners remember ideas longer than passive readers.",
      },
      {
        icon: "👧",
        headline: "Anaya challenged herself",
        emphasisWord: "challenged",
        caption: "Anaya imagined different Biology scenarios before checking AI explanations.",
      },
      {
        icon: "💬",
        headline: "Ask yourself why",
        emphasisWord: "why",
        caption: "Create one 'what if' question before using AI today.",
      },
    ],
  },
  {
    day: 167,
    theme: "Confidence comes from clarity",
    slides: [
      {
        icon: "✨",
        headline: "Choose clarity first",
        emphasisWord: "clarity",
        caption: "Confident answers begin with clear thinking, not quick guessing.",
      },
      {
        icon: "🧠",
        headline: "Clear concepts stay",
        emphasisWord: "Clear",
        caption: "When ideas are clear, revision becomes faster and less stressful.",
      },
      {
        icon: "👨",
        headline: "Kabir cleared confusion",
        emphasisWord: "confusion",
        caption: "Kabir asked AI to explain one concept instead of solving the entire worksheet.",
      },
      {
        icon: "🌟",
        headline: "Clarify one topic",
        emphasisWord: "Clarify",
        caption: "Resolve one confusing concept completely before moving ahead.",
      },
    ],
  },
  {
    day: 168,
    theme: "Grow beyond comfort zones",
    slides: [
      {
        icon: "🚶",
        headline: "Choose uncomfortable questions",
        emphasisWord: "uncomfortable",
        caption: "Growth rarely happens inside the easiest chapter.",
      },
      {
        icon: "📈",
        headline: "Challenges build strength",
        emphasisWord: "Challenges",
        caption: "The hardest practice often creates the biggest improvement.",
      },
      {
        icon: "👩‍🎓",
        headline: "Misha faced calculus",
        emphasisWord: "calculus",
        caption: "Misha attempted a difficult problem before asking AI for one small hint.",
      },
      {
        icon: "🏔️",
        headline: "Pick hardest question",
        emphasisWord: "hardest",
        caption: "Use your freshest energy on the problem you've been avoiding.",
      },
    ],
  },
  {
    day: 169,
    theme: "Preparation creates calmness",
    slides: [
      {
        icon: "🌤️",
        headline: "Study before stress",
        emphasisWord: "Study",
        caption: "Prepared minds stay calmer when the exam paper arrives.",
      },
      {
        icon: "🛡️",
        headline: "Preparation reduces anxiety",
        emphasisWord: "Preparation",
        caption: "Every completed chapter removes a little more uncertainty.",
      },
      {
        icon: "👦",
        headline: "Ved prepared early",
        emphasisWord: "prepared",
        caption: "Ved revised one chapter every morning instead of cramming at night.",
      },
      {
        icon: "📅",
        headline: "Prepare calmly today",
        emphasisWord: "Prepare",
        caption: "Finish one revision session before thinking about tomorrow's syllabus.",
      },
    ],
  },
  {
    day: 170,
    theme: "One hundred seventy honest mornings",
    slides: [
      {
        icon: "🏅",
        headline: "Celebrate one seventy",
        emphasisWord: "seventy",
        caption: "One hundred seventy mornings of honest effort have shaped a stronger learner.",
      },
      {
        icon: "💙",
        headline: "Honesty becomes habit",
        emphasisWord: "Honesty",
        caption: "Your daily choices have built skills that shortcuts never could.",
      },
      {
        icon: "👩‍🎓",
        headline: "Anvi honored integrity",
        emphasisWord: "integrity",
        caption: "Anvi learned with AI every day while solving every board question using her own thinking.",
      },
      {
        icon: "🚀",
        headline: "Continue choosing growth",
        emphasisWord: "growth",
        caption: "Keep learning with AI as your guide and let your own effort earn every success.",
      },
    ],
  },
  {
    day: 171,
    theme: "Finish stronger than you started",
    slides: [
      {
        icon: "🏁",
        headline: "Finish what you begin",
        emphasisWord: "Finish",
        caption: "Starting feels exciting. Finishing builds the confidence that exams reward.",
      },
      {
        icon: "💪",
        headline: "Completion creates confidence",
        emphasisWord: "Completion",
        caption: "Every completed worksheet is proof that your effort is growing.",
      },
      {
        icon: "👦",
        headline: "Aarav finished every question",
        emphasisWord: "finished",
        caption: "Aarav completed the entire Maths exercise before asking AI to review only two doubts.",
      },
      {
        icon: "✅",
        headline: "Complete one task today",
        emphasisWord: "Complete",
        caption: "Don't leave one worksheet unfinished. Finish it before opening another chapter.",
      },
    ],
  },
  {
    day: 172,
    theme: "Understand every formula origin",
    slides: [
      {
        icon: "📐",
        headline: "Know where formulas come",
        emphasisWord: "formulas",
        caption: "A formula becomes powerful when you understand why it exists.",
      },
      {
        icon: "🧠",
        headline: "Origins improve recall",
        emphasisWord: "Origins",
        caption: "Understanding the idea behind formulas makes them easier to remember.",
      },
      {
        icon: "👧",
        headline: "Siya explored derivation first",
        emphasisWord: "derivation",
        caption: "Siya understood the derivation before using the formula in numericals.",
      },
      {
        icon: "📖",
        headline: "Study one derivation today",
        emphasisWord: "derivation",
        caption: "Learn how one important formula is built before solving questions.",
      },
    ],
  },
  {
    day: 173,
    theme: "Your rough work matters",
    slides: [
      {
        icon: "📄",
        headline: "Respect rough calculations",
        emphasisWord: "rough",
        caption: "Messy thinking often leads to clear answers.",
      },
      {
        icon: "🧩",
        headline: "Drafts improve solutions",
        emphasisWord: "Drafts",
        caption: "Your rough work helps your brain organise ideas before the final answer.",
      },
      {
        icon: "👨‍🎓",
        headline: "Kiaan filled rough pages",
        emphasisWord: "rough",
        caption: "Kiaan solved the difficult Physics problem using rough work before writing neatly.",
      },
      {
        icon: "✍️",
        headline: "Use rough paper today",
        emphasisWord: "rough",
        caption: "Solve one difficult problem using rough work before checking AI.",
      },
    ],
  },
  {
    day: 174,
    theme: "Grow by teaching others",
    slides: [
      {
        icon: "👥",
        headline: "Teach to understand better",
        emphasisWord: "Teach",
        caption: "Explaining a concept to someone else reveals how well you know it.",
      },
      {
        icon: "🎓",
        headline: "Teaching strengthens memory",
        emphasisWord: "Teaching",
        caption: "The best revision often sounds like a conversation.",
      },
      {
        icon: "👧",
        headline: "Naina explained photosynthesis",
        emphasisWord: "explained",
        caption: "Naina taught her friend the topic before asking AI to quiz both of them.",
      },
      {
        icon: "🗣️",
        headline: "Teach one concept today",
        emphasisWord: "Teach",
        caption: "Explain one lesson aloud as if you're the classroom teacher.",
      },
    ],
  },
  {
    day: 175,
    theme: "Respect every revision cycle",
    slides: [
      {
        icon: "🔄",
        headline: "Revise before forgetting",
        emphasisWord: "Revise",
        caption: "Knowledge stays fresh when you revisit it before it fades.",
      },
      {
        icon: "📚",
        headline: "Revision protects confidence",
        emphasisWord: "Revision",
        caption: "Regular revision reduces last-minute stress before board exams.",
      },
      {
        icon: "👦",
        headline: "Yash reviewed weekly notes",
        emphasisWord: "reviewed",
        caption: "Yash revised his formulas every Sunday before solving fresh questions.",
      },
      {
        icon: "📝",
        headline: "Revise one old chapter",
        emphasisWord: "Revise",
        caption: "Strengthen one chapter you haven't visited in a while.",
      },
    ],
  },
  {
    day: 176,
    theme: "Protect your learning energy",
    slides: [
      {
        icon: "🔋",
        headline: "Use energy wisely",
        emphasisWord: "energy",
        caption: "Your sharpest thinking deserves the hardest questions.",
      },
      {
        icon: "⚡",
        headline: "Fresh minds learn faster",
        emphasisWord: "Fresh",
        caption: "Start difficult topics when your concentration is highest.",
      },
      {
        icon: "👩",
        headline: "Aanya tackled Physics early",
        emphasisWord: "early",
        caption: "Aanya solved numericals in the morning and saved revision for later.",
      },
      {
        icon: "🌅",
        headline: "Use morning wisely",
        emphasisWord: "morning",
        caption: "Reserve your first study session for your toughest subject.",
      },
    ],
  },
  {
    day: 177,
    theme: "Trust your preparation journey",
    slides: [
      {
        icon: "🛤️",
        headline: "Believe your preparation",
        emphasisWord: "Believe",
        caption: "Every honest study session is quietly preparing you for success.",
      },
      {
        icon: "🌱",
        headline: "Preparation grows confidence",
        emphasisWord: "Preparation",
        caption: "The more you prepare, the less you fear unexpected questions.",
      },
      {
        icon: "👨",
        headline: "Parth trusted practice",
        emphasisWord: "practice",
        caption: "Parth solved every mock paper himself before reviewing mistakes with AI.",
      },
      {
        icon: "🏆",
        headline: "Trust today's effort",
        emphasisWord: "Trust",
        caption: "Finish today's work knowing it strengthens tomorrow's confidence.",
      },
    ],
  },
  {
    day: 178,
    theme: "Keep asking better questions",
    slides: [
      {
        icon: "💬",
        headline: "Ask with purpose",
        emphasisWord: "purpose",
        caption: "Specific questions help AI become a better tutor.",
      },
      {
        icon: "🔍",
        headline: "Precision improves learning",
        emphasisWord: "Precision",
        caption: "The clearer your question, the clearer the explanation.",
      },
      {
        icon: "👩‍🎓",
        headline: "Maya refined every prompt",
        emphasisWord: "prompt",
        caption: "Maya showed her attempt before asking why one Chemistry step failed.",
      },
      {
        icon: "📋",
        headline: "Improve one prompt today",
        emphasisWord: "prompt",
        caption: "Describe exactly where you're stuck instead of asking for the complete solution.",
      },
    ],
  },
  {
    day: 179,
    theme: "The exam hall is waiting",
    slides: [
      {
        icon: "🎓",
        headline: "Prepare for exam silence",
        emphasisWord: "exam",
        caption: "Inside the exam hall, your preparation becomes your only guide.",
      },
      {
        icon: "🧠",
        headline: "Independent thinking wins",
        emphasisWord: "Independent",
        caption: "Every honest practice session prepares you for that silent moment.",
      },
      {
        icon: "👦",
        headline: "Dev trusted himself",
        emphasisWord: "trusted",
        caption: "Dev realised his own reasoning was enough after months of honest practice.",
      },
      {
        icon: "💙",
        headline: "Prepare for yourself",
        emphasisWord: "Prepare",
        caption: "Study today so tomorrow's answers come from your own understanding.",
      },
    ],
  },
  {
    day: 180,
    theme: "One hundred eighty mornings transformed",
    slides: [
      {
        icon: "🎉",
        headline: "Celebrate one eighty",
        emphasisWord: "eighty",
        caption: "One hundred eighty mornings ago you made a promise. Today you've built a habit.",
      },
      {
        icon: "🏅",
        headline: "Integrity shaped your journey",
        emphasisWord: "Integrity",
        caption: "Choosing learning over shortcuts every day has strengthened both your character and your mind.",
      },
      {
        icon: "👩‍🎓",
        headline: "You earned this confidence",
        emphasisWord: "earned",
        caption: "Every page you solved, every mistake you corrected and every concept you understood belongs to you.",
      },
      {
        icon: "🚀",
        headline: "Keep the promise alive",
        emphasisWord: "promise",
        caption: "Use AI to learn. Trust yourself to solve. Let this habit stay with you beyond every exam.",
      },
    ],
  },
];
