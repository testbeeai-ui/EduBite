/** Evening / integrity pledge reel — 180 days × 4 slides from source pack. */
export type PledgeReelPmSlide = {
  icon: string;
  headline: string;
  emphasisWord: string;
  caption: string;
};

export type PledgeReelPmDay = {
  day: number;
  theme: string;
  slides: PledgeReelPmSlide[];
};

export const PLEDGE_REEL_PM_DAYS: PledgeReelPmDay[] = [
  {
    day: 1,
    theme: "Why struggle matters",
    slides: [
      {
        icon: "🧠",
        headline: "Struggle builds recall",
        emphasisWord: "Struggle",
        caption: "If AI finishes every answer, your brain skips the rep. In exams, blank pages feel louder than notes.",
      },
      {
        icon: "⚡",
        headline: "Effort wires memory",
        emphasisWord: "Effort",
        caption: "Trying, failing, and retrying helps the brain store steps. That is what boards and JEE problems demand.",
      },
      {
        icon: "📚",
        headline: "Copied solution, frozen mind",
        emphasisWord: "Copied",
        caption: "You saw the perfect method online, but the same question in class test looked alien. No steps, no marks.",
      },
      {
        icon: "✅",
        headline: "Train yourself, not the tool",
        emphasisWord: "Train",
        caption: "Use AI for hints, then solve it solo. That is the real pledge, morning and night.",
      },
    ],
  },
  {
    day: 2,
    theme: "Blank mind in the exam hall",
    slides: [
      {
        icon: "🕳️",
        headline: "Instant answers can vanish",
        emphasisWord: "Instant",
        caption: "Fast help feels great today, but the exam hall does not come with a search bar.",
      },
      {
        icon: "⏱️",
        headline: "Speed is not memory",
        emphasisWord: "Speed",
        caption: "Knowing where the answer is online is not the same as recalling it under pressure.",
      },
      {
        icon: "😵",
        headline: "Test day, zero steps",
        emphasisWord: "Test",
        caption: "A student copies AI notes at 9 PM, then freezes at 10 AM when the same topic appears in school.",
      },
      {
        icon: "📌",
        headline: "Practice retrieval, not copying",
        emphasisWord: "Retrieval",
        caption: "Close the app, write the method from memory, then check. That is how the pledge protects marks.",
      },
    ],
  },
  {
    day: 3,
    theme: "Physics needs your brain",
    slides: [
      {
        icon: "🪂",
        headline: "Physics punishes shallow reading",
        emphasisWord: "Physics",
        caption: "One neat AI explanation can hide three tiny mistakes. In numericals, tiny mistakes become lost marks.",
      },
      {
        icon: "🧲",
        headline: "Concepts beat polished wording",
        emphasisWord: "Concepts",
        caption: "Teachers ask why, how, and derivation. A copied answer may look smart, but it melts in viva.",
      },
      {
        icon: "🧪",
        headline: "Formula sheet trap",
        emphasisWord: "Formula",
        caption: "A student uses AI for every derivation, then cannot choose the right formula in a mixed question set.",
      },
      {
        icon: "🛠️",
        headline: "Solve one problem fully",
        emphasisWord: "Solve",
        caption: "Do one Physics question from start to finish without AI. Then use AI only to check your steps.",
      },
    ],
  },
  {
    day: 4,
    theme: "Chemistry memory that sticks",
    slides: [
      {
        icon: "⚗️",
        headline: "Chemistry hates passive scrolling",
        emphasisWord: "Passive",
        caption: "Reading answers feels productive, but ions, reactions, and exceptions need active recall.",
      },
      {
        icon: "🧬",
        headline: "Reactions need repetition",
        emphasisWord: "Reactions",
        caption: "Memory gets stronger when you write equations yourself, not when AI hands you a clean list.",
      },
      {
        icon: "😬",
        headline: "Inorganic tables slip away",
        emphasisWord: "Inorganic",
        caption: "One student asks AI for every salt reaction, then mixes up products in the practical exam.",
      },
      {
        icon: "📝",
        headline: "Write, verify, remember",
        emphasisWord: "Verify",
        caption: "First write the reaction from memory. Then use AI only to verify and fix what you missed.",
      },
    ],
  },
  {
    day: 5,
    theme: "Math needs the middle steps",
    slides: [
      {
        icon: "➗",
        headline: "Math marks live in steps",
        emphasisWord: "Steps",
        caption: "Final answers look cool, but board exams give marks for the path, not just the destination.",
      },
      {
        icon: "🧩",
        headline: "One shortcut can hide ten concepts",
        emphasisWord: "Shortcut",
        caption: "AI can jump to the result, but your teacher may ask how you reached it.",
      },
      {
        icon: "📉",
        headline: "Skipped practice, skipped confidence",
        emphasisWord: "Skipped",
        caption: "A student uses AI for every integration, then panics when the same pattern appears with a twist.",
      },
      {
        icon: "✍️",
        headline: "Show the working yourself",
        emphasisWord: "Working",
        caption: "Do the first line alone, the next line alone, then compare. That is how the pledge builds confidence.",
      },
    ],
  },
  {
    day: 6,
    theme: "Night study and honesty",
    slides: [
      {
        icon: "🌙",
        headline: "Late-night AI feels harmless",
        emphasisWord: "Late-night",
        caption: "At 10 PM, AI looks like a rescue rope. Next morning, you may only remember the rope, not the climb.",
      },
      {
        icon: "🛌",
        headline: "Sleep stores learning",
        emphasisWord: "Sleep",
        caption: "The brain strengthens what you studied. But it cannot lock in what you only pasted.",
      },
      {
        icon: "📱",
        headline: "One screenshot becomes a habit",
        emphasisWord: "Screenshot",
        caption: "A student starts with one AI answer, then slowly stops thinking first. That habit grows quietly.",
      },
      {
        icon: "🔒",
        headline: "End the day clean",
        emphasisWord: "Clean",
        caption: "Use the PM pledge to review, rewrite, and rest. No cheating, no fog, no fake confidence.",
      },
    ],
  },
  {
    day: 7,
    theme: "Exam anxiety and real preparation",
    slides: [
      {
        icon: "😰",
        headline: "Anxiety pushes bad shortcuts",
        emphasisWord: "Anxiety",
        caption: "When marks feel scary, AI cheat-mode starts looking easy. But panic does not solve the paper.",
      },
      {
        icon: "🧯",
        headline: "Calm comes from practice",
        emphasisWord: "Practice",
        caption: "The more you solve by hand, the less your mind shakes in the hall.",
      },
      {
        icon: "📄",
        headline: "Mock test déjà vu",
        emphasisWord: "Mock",
        caption: "A student leans on AI for homework, then finds the mock test questions look familiar but impossible to explain.",
      },
      {
        icon: "🎯",
        headline: "Prepare like the paper is real",
        emphasisWord: "Prepare",
        caption: "Treat practice like the exam itself. Build the answer without AI, then polish it after.",
      },
    ],
  },
  {
    day: 8,
    theme: "Lost marks from lost reasoning",
    slides: [
      {
        icon: "🔎",
        headline: "Reasoning beats decoration",
        emphasisWord: "Reasoning",
        caption: "A fancy AI paragraph can hide weak logic. Examiners notice when the chain breaks.",
      },
      {
        icon: "🪜",
        headline: "Marks grow step by step",
        emphasisWord: "Step",
        caption: "Even a partly correct answer can score well if your thinking is visible.",
      },
      {
        icon: "🙈",
        headline: "Looks right, explains wrong",
        emphasisWord: "Explains",
        caption: "A student copies a neat answer, but in class cannot explain the same topic when asked out loud.",
      },
      {
        icon: "🧭",
        headline: "Build your own answer map",
        emphasisWord: "Map",
        caption: "Draft the logic yourself first. Use AI only as a compass, not the whole road.",
      },
    ],
  },
  {
    day: 9,
    theme: "Trust yourself in viva and labs",
    slides: [
      {
        icon: "🎤",
        headline: "Viva exposes borrowed knowledge",
        emphasisWord: "Viva",
        caption: "If you did not learn it yourself, one follow-up question can knock the whole answer down.",
      },
      {
        icon: "🧫",
        headline: "Lab records need real understanding",
        emphasisWord: "Lab",
        caption: "Practical work is not just neat writing. You need to know what happened and why.",
      },
      {
        icon: "😶",
        headline: "Smart notes, empty voice",
        emphasisWord: "Voice",
        caption: "A student prepares with AI text only, then goes silent when the teacher asks for the process.",
      },
      {
        icon: "🗣️",
        headline: "Say it in your own words",
        emphasisWord: "Own",
        caption: "Speak the idea, not the script. That is the pledge turning study into real skill.",
      },
    ],
  },
  {
    day: 10,
    theme: "Daily discipline wins",
    slides: [
      {
        icon: "📆",
        headline: "Small honesty compounds",
        emphasisWord: "Honesty",
        caption: "One clean study session today can matter more than ten polished but copied answers.",
      },
      {
        icon: "🏗️",
        headline: "Discipline beats last-minute rescue",
        emphasisWord: "Discipline",
        caption: "AI can patch panic for a day. Discipline builds a brain that shows up every day.",
      },
      {
        icon: "🧯",
        headline: "Cramming with AI still cracks",
        emphasisWord: "Cramming",
        caption: "A student rushes through AI summaries the night before, then loses both confidence and clarity in the exam.",
      },
      {
        icon: "🤝",
        headline: "Pledge, study, prove it",
        emphasisWord: "Pledge",
        caption: "Do the work first, ask AI second, and walk into the test with proof in your head.",
      },
    ],
  },
  {
    day: 11,
    theme: "Confidence you can carry",
    slides: [
      {
        icon: "💪",
        headline: "Confidence cannot be copied",
        emphasisWord: "Confidence",
        caption: "A copied assignment may earn praise today, but real confidence appears only when you solve alone.",
      },
      {
        icon: "🧠",
        headline: "Your brain trusts practice",
        emphasisWord: "Practice",
        caption: "Every problem you solve yourself tells your brain, 'I can do this again.'",
      },
      {
        icon: "📖",
        headline: "Homework felt easy, exam didn't",
        emphasisWord: "Homework",
        caption: "Everything looked simple with AI nearby. The exam paper had no help button.",
      },
      {
        icon: "✅",
        headline: "Earn today's confidence",
        emphasisWord: "Earn",
        caption: "Before asking AI, spend ten honest minutes solving it yourself. That's today's pledge.",
      },
    ],
  },
  {
    day: 12,
    theme: "Memory loves mistakes",
    slides: [
      {
        icon: "❓",
        headline: "Wrong answers teach faster",
        emphasisWord: "Wrong",
        caption: "Mistakes feel annoying, but they leave stronger memories than perfect copied solutions.",
      },
      {
        icon: "🔬",
        headline: "Errors reshape learning",
        emphasisWord: "Errors",
        caption: "Finding your own mistake forces the brain to rebuild the correct idea.",
      },
      {
        icon: "😅",
        headline: "Perfect notes, repeated mistakes",
        emphasisWord: "Perfect",
        caption: "AI fixed every answer, yet the same calculation error returned in the weekly test.",
      },
      {
        icon: "📝",
        headline: "Celebrate one mistake today",
        emphasisWord: "Celebrate",
        caption: "Keep one wrong solution and learn why it failed before checking AI.",
      },
    ],
  },
  {
    day: 13,
    theme: "JEE thinking vs memorizing",
    slides: [
      {
        icon: "🎯",
        headline: "JEE rewards thinking",
        emphasisWord: "Thinking",
        caption: "Many questions mix multiple concepts. Memory alone rarely survives the twist.",
      },
      {
        icon: "⚙️",
        headline: "Patterns beat formulas",
        emphasisWord: "Patterns",
        caption: "Recognizing patterns helps more than collecting endless solved examples.",
      },
      {
        icon: "📚",
        headline: "Solved everything, understood little",
        emphasisWord: "Understood",
        caption: "After reading dozens of AI solutions, a fresh question still felt impossible.",
      },
      {
        icon: "🚀",
        headline: "Think before checking",
        emphasisWord: "Think",
        caption: "Pause for two minutes before opening AI. Your brain deserves the first attempt.",
      },
    ],
  },
  {
    day: 14,
    theme: "Board exam writing",
    slides: [
      {
        icon: "✍️",
        headline: "Writing reveals understanding",
        emphasisWord: "Writing",
        caption: "Reading silently feels easy. Writing exposes what you truly know.",
      },
      {
        icon: "📄",
        headline: "Pens strengthen recall",
        emphasisWord: "Pens",
        caption: "Handwriting important answers improves memory more than endless scrolling.",
      },
      {
        icon: "😬",
        headline: "Answer looked familiar only",
        emphasisWord: "Familiar",
        caption: "You remembered seeing it yesterday, but couldn't write the first sentence.",
      },
      {
        icon: "🖊️",
        headline: "Write before reading",
        emphasisWord: "Write",
        caption: "Try answering first from memory. Then compare with AI and improve.",
      },
    ],
  },
  {
    day: 15,
    theme: "Time pressure",
    slides: [
      {
        icon: "⏳",
        headline: "Time exposes preparation",
        emphasisWord: "Time",
        caption: "Under pressure, your brain uses practiced habits, not recently copied answers.",
      },
      {
        icon: "⚡",
        headline: "Fluency saves minutes",
        emphasisWord: "Fluency",
        caption: "Repeated solving makes decisions automatic when every second matters.",
      },
      {
        icon: "📉",
        headline: "Clock defeated confidence",
        emphasisWord: "Clock",
        caption: "Knowing the answer wasn't enough because every step felt unfamiliar.",
      },
      {
        icon: "🏁",
        headline: "Race your previous self",
        emphasisWord: "Race",
        caption: "Practice one question with a timer before asking AI for improvements.",
      },
    ],
  },
  {
    day: 16,
    theme: "AI as a coach",
    slides: [
      {
        icon: "🤖",
        headline: "Use AI like a coach",
        emphasisWord: "Coach",
        caption: "Great coaches guide your effort. They don't play the match for you.",
      },
      {
        icon: "🎓",
        headline: "Hints grow stronger learners",
        emphasisWord: "Hints",
        caption: "A small hint often teaches more than a complete solution.",
      },
      {
        icon: "📲",
        headline: "First prompt became every prompt",
        emphasisWord: "Every",
        caption: "One shortcut slowly turned into asking AI before thinking.",
      },
      {
        icon: "🤝",
        headline: "Ask for guidance only",
        emphasisWord: "Guidance",
        caption: "Today's pledge: request hints, not finished assignments.",
      },
    ],
  },
  {
    day: 17,
    theme: "Revision that works",
    slides: [
      {
        icon: "🔄",
        headline: "Revision beats rereading",
        emphasisWord: "Revision",
        caption: "Testing yourself reveals forgotten topics faster than reading notes again.",
      },
      {
        icon: "🧠",
        headline: "Recall strengthens pathways",
        emphasisWord: "Recall",
        caption: "Every successful recall makes future recall quicker and easier.",
      },
      {
        icon: "📚",
        headline: "Read everything, remembered little",
        emphasisWord: "Remembered",
        caption: "Hours of revision vanished because nothing was actively recalled.",
      },
      {
        icon: "📌",
        headline: "Close notes first",
        emphasisWord: "Close",
        caption: "Recall three key points before reopening your book or AI.",
      },
    ],
  },
  {
    day: 18,
    theme: "Competing with yourself",
    slides: [
      {
        icon: "🏆",
        headline: "Your only real competition",
        emphasisWord: "Competition",
        caption: "Classmates matter less than becoming stronger than yesterday's version of you.",
      },
      {
        icon: "📈",
        headline: "Tiny gains compound daily",
        emphasisWord: "Tiny",
        caption: "One extra solved question every day becomes hundreds before the exam.",
      },
      {
        icon: "😔",
        headline: "Comparison stole focus",
        emphasisWord: "Comparison",
        caption: "Watching others finish quickly made shortcuts feel tempting.",
      },
      {
        icon: "🌱",
        headline: "Improve one percent",
        emphasisWord: "Improve",
        caption: "Solve just one more question honestly than you did yesterday.",
      },
    ],
  },
  {
    day: 19,
    theme: "Owning your progress",
    slides: [
      {
        icon: "🪞",
        headline: "Marks reflect preparation",
        emphasisWord: "Preparation",
        caption: "Scores aren't random. They usually reveal what happened before the exam.",
      },
      {
        icon: "🛠️",
        headline: "Ownership changes results",
        emphasisWord: "Ownership",
        caption: "Taking responsibility helps you improve faster than blaming difficulty.",
      },
      {
        icon: "📉",
        headline: "Copied success disappeared",
        emphasisWord: "Success",
        caption: "Assignments looked impressive, but test scores refused to match.",
      },
      {
        icon: "🎯",
        headline: "Own today's effort",
        emphasisWord: "Own",
        caption: "Sign your pledge knowing every answer represents your real learning.",
      },
    ],
  },
  {
    day: 20,
    theme: "Future you is watching",
    slides: [
      {
        icon: "🌅",
        headline: "Tomorrow starts tonight",
        emphasisWord: "Tomorrow",
        caption: "Every honest study session quietly builds the student you'll become.",
      },
      {
        icon: "🧩",
        headline: "Knowledge stacks daily",
        emphasisWord: "Stacks",
        caption: "Learning grows like building blocks. Missing foundations makes everything unstable.",
      },
      {
        icon: "🎒",
        headline: "Future self needed practice",
        emphasisWord: "Future",
        caption: "The version of you entering boards wishes today's you solved one more question.",
      },
      {
        icon: "🌟",
        headline: "Protect your future self",
        emphasisWord: "Protect",
        caption: "Make tonight's pledge simple: learn honestly so tomorrow feels easier.",
      },
    ],
  },
  {
    day: 21,
    theme: "The first five minutes",
    slides: [
      {
        icon: "🚀",
        headline: "Start before motivation arrives",
        emphasisWord: "Start",
        caption: "Waiting to feel motivated wastes time. Five focused minutes often become fifty.",
      },
      {
        icon: "🧠",
        headline: "Action wakes the brain",
        emphasisWord: "Action",
        caption: "Your brain engages after you begin solving, not while you keep planning.",
      },
      {
        icon: "📱",
        headline: "One search became one hour",
        emphasisWord: "Hour",
        caption: "You opened AI for a quick doubt, then realized your study time had disappeared.",
      },
      {
        icon: "✅",
        headline: "Solve before you search",
        emphasisWord: "Solve",
        caption: "Today's pledge: attempt the first question completely before asking AI for help.",
      },
    ],
  },
  {
    day: 22,
    theme: "Learning from doubt",
    slides: [
      {
        icon: "🤔",
        headline: "Confusion is progress",
        emphasisWord: "Confusion",
        caption: "Feeling stuck usually means your brain is building a stronger understanding.",
      },
      {
        icon: "🧩",
        headline: "Questions grow connections",
        emphasisWord: "Questions",
        caption: "Every doubt you solve yourself strengthens links between concepts.",
      },
      {
        icon: "📚",
        headline: "Skipped every difficult problem",
        emphasisWord: "Skipped",
        caption: "Easy questions boosted confidence, but difficult ones returned during the exam.",
      },
      {
        icon: "💡",
        headline: "Stay with the doubt",
        emphasisWord: "Stay",
        caption: "Spend five honest minutes thinking before opening AI. Your future self will thank you.",
      },
    ],
  },
  {
    day: 23,
    theme: "Biology understanding",
    slides: [
      {
        icon: "🧬",
        headline: "Biology is more than facts",
        emphasisWord: "Biology",
        caption: "Processes and connections matter more than memorizing isolated definitions.",
      },
      {
        icon: "🌿",
        headline: "Understanding beats cramming",
        emphasisWord: "Understanding",
        caption: "When concepts connect naturally, revision becomes much easier.",
      },
      {
        icon: "😕",
        headline: "Definitions vanished overnight",
        emphasisWord: "Definitions",
        caption: "Copied notes looked perfect, but explanations disappeared during revision.",
      },
      {
        icon: "📖",
        headline: "Explain without looking",
        emphasisWord: "Explain",
        caption: "Say the process aloud first, then check with AI for missing details.",
      },
    ],
  },
  {
    day: 24,
    theme: "Building consistency",
    slides: [
      {
        icon: "📅",
        headline: "Consistency beats intensity",
        emphasisWord: "Consistency",
        caption: "One focused hour daily usually wins against one exhausting weekend marathon.",
      },
      {
        icon: "🧠",
        headline: "Habits shape performance",
        emphasisWord: "Habits",
        caption: "Your daily routine decides your exam results long before the paper arrives.",
      },
      {
        icon: "📉",
        headline: "Weekend hero, weekday zero",
        emphasisWord: "Weekend",
        caption: "Big study bursts couldn't replace the missed weekdays.",
      },
      {
        icon: "🌱",
        headline: "Keep today's streak alive",
        emphasisWord: "Streak",
        caption: "Protect your learning streak by solving one honest question before ending the day.",
      },
    ],
  },
  {
    day: 25,
    theme: "Thinking independently",
    slides: [
      {
        icon: "🧠",
        headline: "Independent thinking wins",
        emphasisWord: "Independent",
        caption: "The best students don't know every answer. They know how to find one.",
      },
      {
        icon: "🔍",
        headline: "Reason before results",
        emphasisWord: "Reason",
        caption: "Understanding the path matters more than memorizing the destination.",
      },
      {
        icon: "📄",
        headline: "Every answer looked familiar",
        emphasisWord: "Familiar",
        caption: "Recognition isn't mastery. Exams reward recall, not recognition.",
      },
      {
        icon: "🎯",
        headline: "Trust your reasoning",
        emphasisWord: "Trust",
        caption: "Today's pledge: think first, verify later, and grow stronger every question.",
      },
    ],
  },
  {
    day: 26,
    theme: "Mock test mindset",
    slides: [
      {
        icon: "📝",
        headline: "Mocks reveal reality",
        emphasisWord: "Mocks",
        caption: "Mock tests aren't for perfect scores. They're for discovering weak spots.",
      },
      {
        icon: "📊",
        headline: "Feedback fuels growth",
        emphasisWord: "Feedback",
        caption: "Every mistake in practice saves marks in the real exam.",
      },
      {
        icon: "😬",
        headline: "Practice score fooled everyone",
        emphasisWord: "Fooled",
        caption: "AI-assisted practice looked amazing until the real timed paper began.",
      },
      {
        icon: "🏁",
        headline: "Keep mock tests honest",
        emphasisWord: "Honest",
        caption: "Treat every mock like your final exam. No shortcuts. No cheating.",
      },
    ],
  },
  {
    day: 27,
    theme: "Pressure creates diamonds",
    slides: [
      {
        icon: "💎",
        headline: "Pressure reveals preparation",
        emphasisWord: "Pressure",
        caption: "Stress doesn't create ability. It reveals the habits you've already built.",
      },
      {
        icon: "🏋️",
        headline: "Practice reduces panic",
        emphasisWord: "Practice",
        caption: "Repeated problem-solving makes difficult questions feel familiar.",
      },
      {
        icon: "😰",
        headline: "Nervous hands, forgotten steps",
        emphasisWord: "Forgotten",
        caption: "Without enough independent practice, even easy questions felt difficult.",
      },
      {
        icon: "🛡️",
        headline: "Prepare beyond pressure",
        emphasisWord: "Prepare",
        caption: "Today's pledge protects tomorrow's confidence. Practice honestly before seeking help.",
      },
    ],
  },
  {
    day: 28,
    theme: "Your future rank",
    slides: [
      {
        icon: "🏅",
        headline: "Ranks are earned daily",
        emphasisWord: "Ranks",
        caption: "Every honest study session quietly shapes your future result.",
      },
      {
        icon: "📈",
        headline: "Progress hides in routines",
        emphasisWord: "Progress",
        caption: "Great ranks are built through ordinary days repeated consistently.",
      },
      {
        icon: "📚",
        headline: "Revision felt surprisingly difficult",
        emphasisWord: "Revision",
        caption: "Topics seemed easy earlier because AI carried the thinking.",
      },
      {
        icon: "🌟",
        headline: "Build tomorrow's rank today",
        emphasisWord: "Build",
        caption: "Protect your learning. Let AI support your effort, never replace it.",
      },
    ],
  },
  {
    day: 29,
    theme: "Integrity becomes identity",
    slides: [
      {
        icon: "🤝",
        headline: "Character grows quietly",
        emphasisWord: "Character",
        caption: "Small honest choices today become your strongest habit tomorrow.",
      },
      {
        icon: "🧠",
        headline: "Integrity strengthens confidence",
        emphasisWord: "Integrity",
        caption: "Knowing you earned your knowledge removes fear during exams.",
      },
      {
        icon: "📄",
        headline: "Copied marks felt empty",
        emphasisWord: "Empty",
        caption: "Good homework scores couldn't replace real understanding during tests.",
      },
      {
        icon: "✨",
        headline: "Be proud of your effort",
        emphasisWord: "Proud",
        caption: "Your pledge isn't about perfection. It's about learning honestly every day.",
      },
    ],
  },
  {
    day: 30,
    theme: "The promise continues",
    slides: [
      {
        icon: "🌅",
        headline: "Thirty days stronger",
        emphasisWord: "Stronger",
        caption: "Every honest choice has quietly built a more capable version of you.",
      },
      {
        icon: "🧠",
        headline: "Learning lasts longer",
        emphasisWord: "Learning",
        caption: "Skills earned through effort stay with you far beyond one exam.",
      },
      {
        icon: "🎓",
        headline: "The exam finally arrived",
        emphasisWord: "Exam",
        caption: "The student who practiced honestly recognized confidence instead of panic.",
      },
      {
        icon: "🤝",
        headline: "Keep the pledge alive",
        emphasisWord: "Pledge",
        caption: "Use AI to understand, never to cheat. Tomorrow's success starts with today's honesty.",
      },
    ],
  },
  {
    day: 31,
    theme: "Your brain wants the answer",
    slides: [
      {
        icon: "🧠",
        headline: "Make your brain search first",
        emphasisWord: "search",
        caption: "Before opening AI, pause for 30 seconds. Your memory is already looking for the answer.",
      },
      {
        icon: "⚡",
        headline: "Searching strengthens neurons",
        emphasisWord: "strengthens",
        caption: "Even unsuccessful recall helps your brain build stronger memory pathways for the next attempt.",
      },
      {
        icon: "📖",
        headline: "Opened AI too quickly",
        emphasisWord: "quickly",
        caption: "The answer appeared instantly, but your brain never got a chance to think.",
      },
      {
        icon: "✅",
        headline: "Pause before every prompt",
        emphasisWord: "Pause",
        caption: "Today's pledge: think first, prompt second. Let your brain take the first shot.",
      },
    ],
  },
  {
    day: 32,
    theme: "Learning under pressure",
    slides: [
      {
        icon: "🔥",
        headline: "Comfort never appears in exams",
        emphasisWord: "Comfort",
        caption: "The exam hall removes hints, internet, and AI. Only preparation stays.",
      },
      {
        icon: "🏋️",
        headline: "Hard practice feels easier later",
        emphasisWord: "Hard",
        caption: "Making practice difficult today makes the real exam surprisingly manageable.",
      },
      {
        icon: "😓",
        headline: "Easy homework shocked me",
        emphasisWord: "Easy",
        caption: "Assignments felt effortless with AI. Timed questions suddenly felt impossible.",
      },
      {
        icon: "🎯",
        headline: "Practice like exam day",
        emphasisWord: "Practice",
        caption: "Solve one full question today without any outside help before checking answers.",
      },
    ],
  },
  {
    day: 33,
    theme: "The illusion of understanding",
    slides: [
      {
        icon: "🎭",
        headline: "Reading isn't mastering",
        emphasisWord: "mastering",
        caption: "Understanding feels real until someone asks you to explain it.",
      },
      {
        icon: "🧠",
        headline: "Explaining reveals knowledge",
        emphasisWord: "Explaining",
        caption: "Teaching a concept exposes missing pieces faster than rereading notes.",
      },
      {
        icon: "🙃",
        headline: "Everything made sense yesterday",
        emphasisWord: "yesterday",
        caption: "Today, even the first step seemed unfamiliar because it wasn't truly learned.",
      },
      {
        icon: "🗣️",
        headline: "Teach an imaginary friend",
        emphasisWord: "Teach",
        caption: "Explain one topic aloud before asking AI anything. Your memory will thank you.",
      },
    ],
  },
  {
    day: 34,
    theme: "Small wins matter",
    slides: [
      {
        icon: "🌱",
        headline: "Tiny victories build champions",
        emphasisWord: "Tiny",
        caption: "One solved problem may seem small, but hundreds of them shape your rank.",
      },
      {
        icon: "📈",
        headline: "Progress hides in repetition",
        emphasisWord: "repetition",
        caption: "The biggest improvements usually happen quietly through daily practice.",
      },
      {
        icon: "😕",
        headline: "Waiting for perfect motivation",
        emphasisWord: "motivation",
        caption: "Hours disappeared while waiting to feel ready instead of simply beginning.",
      },
      {
        icon: "🚀",
        headline: "Win today's first question",
        emphasisWord: "Win",
        caption: "Don't chase perfection. Finish one honest question and let momentum grow.",
      },
    ],
  },
  {
    day: 35,
    theme: "Physics intuition",
    slides: [
      {
        icon: "⚙️",
        headline: "Equations tell stories",
        emphasisWord: "stories",
        caption: "Every Physics equation describes how the real world behaves, not just symbols.",
      },
      {
        icon: "🧲",
        headline: "Visual thinking lasts longer",
        emphasisWord: "Visual",
        caption: "Imagining motion helps memory far more than memorizing formulas alone.",
      },
      {
        icon: "📉",
        headline: "Formula remembered, meaning forgotten",
        emphasisWord: "meaning",
        caption: "Knowing the equation wasn't enough because its purpose was never understood.",
      },
      {
        icon: "🔍",
        headline: "Picture before calculating",
        emphasisWord: "Picture",
        caption: "Visualize the situation first. Then solve. Use AI only to verify your reasoning.",
      },
    ],
  },
  {
    day: 36,
    theme: "Chemistry patterns",
    slides: [
      {
        icon: "⚗️",
        headline: "Chemistry rewards connections",
        emphasisWord: "connections",
        caption: "Reactions become easier when you notice patterns instead of isolated facts.",
      },
      {
        icon: "🔗",
        headline: "Patterns reduce memorizing",
        emphasisWord: "Patterns",
        caption: "Finding similarities helps your brain remember more with less effort.",
      },
      {
        icon: "😵",
        headline: "Every reaction looked different",
        emphasisWord: "different",
        caption: "Without recognizing patterns, revision felt endless and confusing.",
      },
      {
        icon: "📝",
        headline: "Connect before memorizing",
        emphasisWord: "Connect",
        caption: "Ask yourself why reactions behave similarly before checking AI explanations.",
      },
    ],
  },
  {
    day: 37,
    theme: "Math confidence",
    slides: [
      {
        icon: "➕",
        headline: "Confidence comes from solving",
        emphasisWord: "solving",
        caption: "Watching solutions builds comfort. Solving them builds confidence.",
      },
      {
        icon: "🧠",
        headline: "Every attempt counts",
        emphasisWord: "attempt",
        caption: "Even incomplete solutions improve problem-solving speed over time.",
      },
      {
        icon: "📄",
        headline: "Watched every solution video",
        emphasisWord: "Watched",
        caption: "The methods looked easy until the notebook was empty and the timer started.",
      },
      {
        icon: "✍️",
        headline: "Fill the notebook yourself",
        emphasisWord: "Fill",
        caption: "Today's pledge: your pen should solve more problems than your AI prompts.",
      },
    ],
  },
  {
    day: 38,
    theme: "The value of boredom",
    slides: [
      {
        icon: "🌤️",
        headline: "Boredom grows discipline",
        emphasisWord: "Boredom",
        caption: "Not every study session feels exciting. Consistency matters more than excitement.",
      },
      {
        icon: "⏳",
        headline: "Routine beats excitement",
        emphasisWord: "Routine",
        caption: "Successful students continue even when the chapter isn't interesting.",
      },
      {
        icon: "📱",
        headline: "Needed constant stimulation",
        emphasisWord: "constant",
        caption: "Every difficult minute became another reason to reach for AI.",
      },
      {
        icon: "📚",
        headline: "Stay with the chapter",
        emphasisWord: "Stay",
        caption: "Give yourself ten uninterrupted minutes before asking for digital help.",
      },
    ],
  },
  {
    day: 39,
    theme: "Future interviews",
    slides: [
      {
        icon: "💼",
        headline: "Interviews ask why",
        emphasisWord: "why",
        caption: "Employers care less about memorized answers and more about your thinking.",
      },
      {
        icon: "🎓",
        headline: "Understanding travels farther",
        emphasisWord: "Understanding",
        caption: "Concepts learned honestly help in college, jobs, and life beyond exams.",
      },
      {
        icon: "🤐",
        headline: "Could not explain basics",
        emphasisWord: "explain",
        caption: "The answer looked familiar, but the reasoning completely disappeared.",
      },
      {
        icon: "🌟",
        headline: "Learn for life too",
        emphasisWord: "life",
        caption: "Today's pledge protects not just marks, but the skills your future needs.",
      },
    ],
  },
  {
    day: 40,
    theme: "A promise worth keeping",
    slides: [
      {
        icon: "🤝",
        headline: "Promises shape identity",
        emphasisWord: "Promises",
        caption: "Every time you keep your pledge, you become a stronger learner.",
      },
      {
        icon: "🧠",
        headline: "Integrity builds mastery",
        emphasisWord: "Integrity",
        caption: "Honest effort compounds quietly into lasting knowledge and confidence.",
      },
      {
        icon: "🎒",
        headline: "The paper felt familiar",
        emphasisWord: "familiar",
        caption: "This time the questions looked challenging, but your preparation stayed with you.",
      },
      {
        icon: "🌟",
        headline: "Choose learning every day",
        emphasisWord: "learning",
        caption: "Use AI to understand deeper, never to replace your own thinking. That's the Edubite promise.",
      },
    ],
  },
  {
    day: 41,
    theme: "The Productive Struggle",
    slides: [
      {
        icon: "🧗",
        headline: "The answer shouldn't arrive first",
        emphasisWord: "answer",
        caption: "If every question ends in seconds, your brain never learns how to climb.",
      },
      {
        icon: "🧠",
        headline: "Thinking burns stronger memories",
        emphasisWord: "Thinking",
        caption: "The harder your brain searches, the longer the concept stays available during exams.",
      },
      {
        icon: "📄",
        headline: "Everything looked easy online",
        emphasisWord: "easy",
        caption: "The worksheet felt simple until the same concept appeared with different numbers.",
      },
      {
        icon: "🤝",
        headline: "Protect the productive struggle",
        emphasisWord: "productive",
        caption: "Today's pledge: wrestle with the problem before inviting AI into the conversation.",
      },
    ],
  },
  {
    day: 42,
    theme: "Revision Without Illusions",
    slides: [
      {
        icon: "🔄",
        headline: "Recognition can fool you",
        emphasisWord: "Recognition",
        caption: "Seeing an answer and knowing an answer are completely different exam skills.",
      },
      {
        icon: "🎯",
        headline: "Recall exposes weak spots",
        emphasisWord: "Recall",
        caption: "Closing the book reveals exactly what your brain still needs to strengthen.",
      },
      {
        icon: "😶",
        headline: "Notes felt strangely familiar",
        emphasisWord: "familiar",
        caption: "You recognized every page but couldn't recreate a single diagram.",
      },
      {
        icon: "📚",
        headline: "Revise with closed books",
        emphasisWord: "closed",
        caption: "Write first from memory. Open AI only after your own attempt.",
      },
    ],
  },
  {
    day: 43,
    theme: "The Power of Questions",
    slides: [
      {
        icon: "❔",
        headline: "Curiosity beats convenience",
        emphasisWord: "Curiosity",
        caption: "Students who ask why usually remember longer than students who ask for answers.",
      },
      {
        icon: "🔍",
        headline: "Questions unlock understanding",
        emphasisWord: "Questions",
        caption: "A single thoughtful question can replace pages of memorization.",
      },
      {
        icon: "📱",
        headline: "Prompted instead of wondering",
        emphasisWord: "wondering",
        caption: "AI answered everything before curiosity even had a chance.",
      },
      {
        icon: "💡",
        headline: "Question before prompting",
        emphasisWord: "Question",
        caption: "Ask yourself why it works before asking AI how it works.",
      },
    ],
  },
  {
    day: 44,
    theme: "Physics Beyond Formulas",
    slides: [
      {
        icon: "🌍",
        headline: "Nature writes the equations",
        emphasisWord: "Nature",
        caption: "Physics formulas describe reality. They aren't random symbols to memorize.",
      },
      {
        icon: "⚙️",
        headline: "Meaning beats memorizing",
        emphasisWord: "Meaning",
        caption: "Understanding each variable makes unfamiliar questions much less frightening.",
      },
      {
        icon: "📉",
        headline: "Equation remembered, concept missing",
        emphasisWord: "concept",
        caption: "The formula appeared instantly, but knowing when to use it never did.",
      },
      {
        icon: "🔭",
        headline: "Imagine before calculating",
        emphasisWord: "Imagine",
        caption: "Picture the motion first. Numbers make more sense after visualization.",
      },
    ],
  },
  {
    day: 45,
    theme: "Organic Chemistry Logic",
    slides: [
      {
        icon: "🧪",
        headline: "Mechanisms tell the story",
        emphasisWord: "Mechanisms",
        caption: "Organic Chemistry becomes easier when reactions feel like connected stories.",
      },
      {
        icon: "🧬",
        headline: "Logic outlasts memorization",
        emphasisWord: "Logic",
        caption: "Reasoning through reactions helps far more than memorizing every exception.",
      },
      {
        icon: "😵",
        headline: "Named reactions got mixed",
        emphasisWord: "mixed",
        caption: "Every reaction looked similar because the underlying logic was skipped.",
      },
      {
        icon: "📖",
        headline: "Understand every transformation",
        emphasisWord: "Understand",
        caption: "Ask what changes and why before checking AI explanations.",
      },
    ],
  },
  {
    day: 46,
    theme: "Mathematics is Practice",
    slides: [
      {
        icon: "➗",
        headline: "Watching never replaces solving",
        emphasisWord: "solving",
        caption: "Learning happens in your notebook, not only on your screen.",
      },
      {
        icon: "✍️",
        headline: "Hands teach the brain",
        emphasisWord: "Hands",
        caption: "Writing every step strengthens understanding far beyond passive reading.",
      },
      {
        icon: "📄",
        headline: "Videos felt surprisingly simple",
        emphasisWord: "simple",
        caption: "Without writing the steps yourself, confidence disappeared during practice.",
      },
      {
        icon: "🖊️",
        headline: "Let your pen think",
        emphasisWord: "pen",
        caption: "Today's pledge: solve first with paper, then compare with AI.",
      },
    ],
  },
  {
    day: 47,
    theme: "Focus Wins",
    slides: [
      {
        icon: "🎯",
        headline: "Attention creates learning",
        emphasisWord: "Attention",
        caption: "Ten focused minutes usually beat one distracted hour.",
      },
      {
        icon: "📵",
        headline: "Distractions steal memory",
        emphasisWord: "Distractions",
        caption: "Every interruption forces your brain to rebuild concentration.",
      },
      {
        icon: "📲",
        headline: "One notification changed everything",
        emphasisWord: "notification",
        caption: "A quick phone check quietly ended an entire study session.",
      },
      {
        icon: "⏰",
        headline: "Guard your next twenty minutes",
        emphasisWord: "Guard",
        caption: "Silence distractions and give one chapter your complete attention.",
      },
    ],
  },
  {
    day: 48,
    theme: "Building Exam Stamina",
    slides: [
      {
        icon: "🏃",
        headline: "Brains need endurance too",
        emphasisWord: "endurance",
        caption: "Long exams reward students who practice sustained concentration.",
      },
      {
        icon: "⏱️",
        headline: "Stamina grows gradually",
        emphasisWord: "Stamina",
        caption: "Each uninterrupted study session prepares your brain for longer papers.",
      },
      {
        icon: "😴",
        headline: "Energy faded halfway through",
        emphasisWord: "halfway",
        caption: "The last hour became harder because practice sessions always ended too early.",
      },
      {
        icon: "🏁",
        headline: "Finish one full session",
        emphasisWord: "Finish",
        caption: "Stay with today's study block even after it becomes uncomfortable.",
      },
    ],
  },
  {
    day: 49,
    theme: "Learning From Feedback",
    slides: [
      {
        icon: "📊",
        headline: "Feedback beats guessing",
        emphasisWord: "Feedback",
        caption: "Knowing why you missed marks is more valuable than hiding the mistake.",
      },
      {
        icon: "🔍",
        headline: "Review creates improvement",
        emphasisWord: "Review",
        caption: "Every corrected error becomes one less mistake in the final exam.",
      },
      {
        icon: "🙈",
        headline: "Mistakes stayed invisible",
        emphasisWord: "Mistakes",
        caption: "AI fixed everything so quickly that the original error was never understood.",
      },
      {
        icon: "📌",
        headline: "Study your own errors",
        emphasisWord: "errors",
        caption: "Keep a mistake notebook and let AI explain only after you've analyzed it.",
      },
    ],
  },
  {
    day: 50,
    theme: "Halfway to a Habit",
    slides: [
      {
        icon: "🏆",
        headline: "Fifty days of integrity",
        emphasisWord: "Fifty",
        caption: "Small honest choices repeated daily become lifelong learning habits.",
      },
      {
        icon: "🌳",
        headline: "Habits grow quietly",
        emphasisWord: "Habits",
        caption: "Real growth rarely feels dramatic. It accumulates one study session at a time.",
      },
      {
        icon: "🎒",
        headline: "Preparation finally felt natural",
        emphasisWord: "natural",
        caption: "Questions looked challenging, but your own thinking stepped forward first.",
      },
      {
        icon: "✨",
        headline: "Keep choosing honest learning",
        emphasisWord: "honest",
        caption: "Today's pledge continues tomorrow. Use AI as your teacher, never your substitute.",
      },
    ],
  },
  {
    day: 51,
    theme: "Own the First Attempt",
    slides: [
      {
        icon: "🥇",
        headline: "Your first attempt matters",
        emphasisWord: "first",
        caption: "The first solution doesn't need to be perfect. It just needs to be yours.",
      },
      {
        icon: "🧠",
        headline: "Ownership builds confidence",
        emphasisWord: "Ownership",
        caption: "Brains remember ideas they create far better than ideas they simply receive.",
      },
      {
        icon: "📄",
        headline: "Solved after seeing hints",
        emphasisWord: "hints",
        caption: "The question felt easy because the hardest thinking had already been done.",
      },
      {
        icon: "✅",
        headline: "Claim your own attempt",
        emphasisWord: "Claim",
        caption: "Today's pledge: let every chapter begin with your own thinking.",
      },
    ],
  },
  {
    day: 52,
    theme: "The Brain Needs Retrieval",
    slides: [
      {
        icon: "🧩",
        headline: "Memory loves retrieval",
        emphasisWord: "retrieval",
        caption: "Trying to remember strengthens learning, even when you don't recall everything.",
      },
      {
        icon: "⚡",
        headline: "Forgetting isn't failure",
        emphasisWord: "Forgetting",
        caption: "Every forgotten point is an opportunity to build stronger memory.",
      },
      {
        icon: "😕",
        headline: "Read it ten times",
        emphasisWord: "ten",
        caption: "Everything looked familiar until you tried writing it without looking.",
      },
      {
        icon: "✍️",
        headline: "Recall before review",
        emphasisWord: "Recall",
        caption: "Close the notes first. Let your memory do the heavy lifting.",
      },
    ],
  },
  {
    day: 53,
    theme: "Focus Over Speed",
    slides: [
      {
        icon: "🎯",
        headline: "Fast isn't always smart",
        emphasisWord: "Fast",
        caption: "Learning isn't a race. Deep understanding usually moves at a calmer pace.",
      },
      {
        icon: "🌊",
        headline: "Depth beats shortcuts",
        emphasisWord: "Depth",
        caption: "One deeply understood concept can solve many future questions.",
      },
      {
        icon: "📱",
        headline: "Finished quickly, forgot quickly",
        emphasisWord: "forgot",
        caption: "Instant answers disappeared just as quickly during revision.",
      },
      {
        icon: "🚶",
        headline: "Slow down to grow",
        emphasisWord: "grow",
        caption: "Today's pledge: don't rush the learning your future depends on.",
      },
    ],
  },
  {
    day: 54,
    theme: "Questions Build Intelligence",
    slides: [
      {
        icon: "❓",
        headline: "Great students ask better questions",
        emphasisWord: "questions",
        caption: "The quality of your questions often decides the quality of your understanding.",
      },
      {
        icon: "🔍",
        headline: "Curiosity unlocks concepts",
        emphasisWord: "Curiosity",
        caption: "When you ask why, your brain builds connections instead of collecting facts.",
      },
      {
        icon: "😶",
        headline: "Accepted every answer blindly",
        emphasisWord: "blindly",
        caption: "Without questioning, even wrong explanations can feel convincing.",
      },
      {
        icon: "💡",
        headline: "Ask why one more time",
        emphasisWord: "why",
        caption: "Before accepting any answer, challenge it with one thoughtful question.",
      },
    ],
  },
  {
    day: 55,
    theme: "Physics Through Visualization",
    slides: [
      {
        icon: "🌍",
        headline: "See the motion first",
        emphasisWord: "See",
        caption: "Imagine the situation before reaching for equations or calculations.",
      },
      {
        icon: "🎥",
        headline: "Pictures strengthen concepts",
        emphasisWord: "Pictures",
        caption: "Visual thinking helps your brain understand forces, motion, and energy naturally.",
      },
      {
        icon: "📉",
        headline: "Numbers had no meaning",
        emphasisWord: "meaning",
        caption: "Without visualization, formulas became symbols instead of ideas.",
      },
      {
        icon: "🔭",
        headline: "Imagine then calculate",
        emphasisWord: "Imagine",
        caption: "Today's pledge: picture every Physics problem before solving it.",
      },
    ],
  },
  {
    day: 56,
    theme: "Chemistry Through Understanding",
    slides: [
      {
        icon: "⚗️",
        headline: "Atoms follow logic",
        emphasisWord: "logic",
        caption: "Chemical reactions make more sense when you understand why particles behave.",
      },
      {
        icon: "🧪",
        headline: "Concepts beat reaction lists",
        emphasisWord: "Concepts",
        caption: "Learning principles makes remembering reactions much easier.",
      },
      {
        icon: "😵",
        headline: "Every chapter felt separate",
        emphasisWord: "separate",
        caption: "Missing connections made Chemistry seem much harder than it really was.",
      },
      {
        icon: "🧬",
        headline: "Connect every chapter",
        emphasisWord: "Connect",
        caption: "Look for patterns before asking AI to explain the reaction.",
      },
    ],
  },
  {
    day: 57,
    theme: "Math Is Built by Practice",
    slides: [
      {
        icon: "📐",
        headline: "Mathematics rewards persistence",
        emphasisWord: "persistence",
        caption: "Every solved problem quietly prepares you for the next harder one.",
      },
      {
        icon: "🧠",
        headline: "Patterns emerge through repetition",
        emphasisWord: "Patterns",
        caption: "Repeated practice teaches your brain to recognize shortcuts naturally.",
      },
      {
        icon: "📄",
        headline: "Watched instead of solving",
        emphasisWord: "solving",
        caption: "The method looked obvious until the notebook was completely blank.",
      },
      {
        icon: "✏️",
        headline: "Practice before perfection",
        emphasisWord: "Practice",
        caption: "Today's pledge: write every important step yourself.",
      },
    ],
  },
  {
    day: 58,
    theme: "Consistency Beats Motivation",
    slides: [
      {
        icon: "📅",
        headline: "Motivation takes holidays",
        emphasisWord: "Motivation",
        caption: "Successful students study even when they don't feel inspired.",
      },
      {
        icon: "🌱",
        headline: "Consistency compounds daily",
        emphasisWord: "Consistency",
        caption: "Tiny improvements repeated for months become remarkable progress.",
      },
      {
        icon: "😴",
        headline: "Waited for perfect mood",
        emphasisWord: "perfect",
        caption: "The perfect mood never arrived, but the exam date certainly did.",
      },
      {
        icon: "🏁",
        headline: "Begin before feeling ready",
        emphasisWord: "Begin",
        caption: "Today's pledge: start with five focused minutes. Momentum will handle the rest.",
      },
    ],
  },
  {
    day: 59,
    theme: "Mistakes Are Teachers",
    slides: [
      {
        icon: "❌",
        headline: "Mistakes deserve attention",
        emphasisWord: "Mistakes",
        caption: "Every error points directly toward your next improvement.",
      },
      {
        icon: "🔬",
        headline: "Analysis beats embarrassment",
        emphasisWord: "Analysis",
        caption: "Understanding why you were wrong is more valuable than hiding it.",
      },
      {
        icon: "🙈",
        headline: "Corrected too quickly",
        emphasisWord: "quickly",
        caption: "AI fixed the answer before you discovered what actually went wrong.",
      },
      {
        icon: "📓",
        headline: "Keep an error journal",
        emphasisWord: "error",
        caption: "Review today's mistakes before celebrating today's correct answers.",
      },
    ],
  },
  {
    day: 60,
    theme: "Learning That Lasts",
    slides: [
      {
        icon: "🏆",
        headline: "Knowledge outlives exams",
        emphasisWord: "Knowledge",
        caption: "Marks open doors. Understanding helps you walk through them.",
      },
      {
        icon: "🌳",
        headline: "Strong roots grow higher",
        emphasisWord: "roots",
        caption: "Real learning becomes the foundation for college, careers, and future challenges.",
      },
      {
        icon: "🎓",
        headline: "Preparation finally showed",
        emphasisWord: "Preparation",
        caption: "This time the answers came from memory, not from searching.",
      },
      {
        icon: "🤝",
        headline: "Honor the learning journey",
        emphasisWord: "Honor",
        caption: "Keep using AI to learn, never to replace your own effort. That's how lasting success is built.",
      },
    ],
  },
  {
    day: 61,
    theme: "The Exam Has No Undo Button",
    slides: [
      {
        icon: "⏪",
        headline: "Exams don't offer retries",
        emphasisWord: "retries",
        caption: "Practice is where mistakes belong. The exam is where preparation speaks.",
      },
      {
        icon: "🧠",
        headline: "Preparation reduces panic",
        emphasisWord: "Preparation",
        caption: "Brains stay calmer when they've solved similar problems before.",
      },
      {
        icon: "😰",
        headline: "The timer felt louder",
        emphasisWord: "timer",
        caption: "Without enough independent practice, every minute felt shorter than expected.",
      },
      {
        icon: "✅",
        headline: "Practice without safety nets",
        emphasisWord: "Practice",
        caption: "Today's pledge: solve one timed question without AI, then review your work.",
      },
    ],
  },
  {
    day: 62,
    theme: "Build Mental Muscles",
    slides: [
      {
        icon: "🏋️",
        headline: "Brains grow through effort",
        emphasisWord: "effort",
        caption: "Just like muscles, your brain becomes stronger when challenged consistently.",
      },
      {
        icon: "⚡",
        headline: "Easy work changes little",
        emphasisWord: "Easy",
        caption: "Growth begins where answers aren't instantly obvious.",
      },
      {
        icon: "📱",
        headline: "Every challenge got outsourced",
        emphasisWord: "outsourced",
        caption: "Hard questions disappeared from your screen but stayed in your future exam.",
      },
      {
        icon: "💪",
        headline: "Lift one hard problem",
        emphasisWord: "hard",
        caption: "Choose one difficult question today and stay with it before asking AI.",
      },
    ],
  },
  {
    day: 63,
    theme: "Don't Memorize Blindly",
    slides: [
      {
        icon: "👀",
        headline: "Understanding beats memorizing",
        emphasisWord: "Understanding",
        caption: "Memorized facts fade quickly. Connected ideas stay much longer.",
      },
      {
        icon: "🧩",
        headline: "Connections strengthen recall",
        emphasisWord: "Connections",
        caption: "Linking concepts makes revision faster and exams easier.",
      },
      {
        icon: "📚",
        headline: "Facts refused to stay",
        emphasisWord: "Facts",
        caption: "Everything looked familiar yesterday but disappeared during today's quiz.",
      },
      {
        icon: "🔗",
        headline: "Connect before committing",
        emphasisWord: "Connect",
        caption: "Understand the idea first. Memorize only after the concept makes sense.",
      },
    ],
  },
  {
    day: 64,
    theme: "Physics Is Everyday Life",
    slides: [
      {
        icon: "🚲",
        headline: "Physics happens around you",
        emphasisWord: "Physics",
        caption: "From bicycles to cricket shots, Physics explains the world you already know.",
      },
      {
        icon: "🌍",
        headline: "Reality teaches concepts",
        emphasisWord: "Reality",
        caption: "Connecting lessons to daily life makes formulas easier to remember.",
      },
      {
        icon: "🏏",
        headline: "Formula without intuition",
        emphasisWord: "intuition",
        caption: "You remembered equations but couldn't explain a simple cricket catch.",
      },
      {
        icon: "🔭",
        headline: "Find Physics outside class",
        emphasisWord: "Find",
        caption: "Notice one Physics concept in everyday life before opening your textbook.",
      },
    ],
  },
  {
    day: 65,
    theme: "Chemistry Loves Patterns",
    slides: [
      {
        icon: "🧪",
        headline: "Patterns simplify Chemistry",
        emphasisWord: "Patterns",
        caption: "Many reactions become predictable once you spot the common rules.",
      },
      {
        icon: "🔬",
        headline: "Rules reduce memorizing",
        emphasisWord: "Rules",
        caption: "Learning principles saves far more time than memorizing endless exceptions.",
      },
      {
        icon: "📖",
        headline: "Every reaction felt random",
        emphasisWord: "random",
        caption: "Missing the pattern made every new chapter feel unrelated.",
      },
      {
        icon: "🧠",
        headline: "Search for common rules",
        emphasisWord: "common",
        caption: "Before asking AI, identify one pattern connecting today's reactions.",
      },
    ],
  },
  {
    day: 66,
    theme: "Math Rewards Patience",
    slides: [
      {
        icon: "➗",
        headline: "Patience solves equations",
        emphasisWord: "Patience",
        caption: "Many difficult problems become simple when solved one step at a time.",
      },
      {
        icon: "📐",
        headline: "Steps create solutions",
        emphasisWord: "Steps",
        caption: "Missing one line often matters more than missing the final answer.",
      },
      {
        icon: "😖",
        headline: "Quit after one mistake",
        emphasisWord: "Quit",
        caption: "The first error ended the attempt before learning could begin.",
      },
      {
        icon: "✍️",
        headline: "Finish every solution",
        emphasisWord: "Finish",
        caption: "Today's pledge: don't abandon a problem after the first mistake.",
      },
    ],
  },
  {
    day: 67,
    theme: "Distraction Has a Cost",
    slides: [
      {
        icon: "📵",
        headline: "Every interruption costs learning",
        emphasisWord: "interruption",
        caption: "Your brain needs time to rebuild focus after every distraction.",
      },
      {
        icon: "🎯",
        headline: "Attention fuels memory",
        emphasisWord: "Attention",
        caption: "Focused study creates stronger recall than multitasking ever can.",
      },
      {
        icon: "📲",
        headline: "Just one quick scroll",
        emphasisWord: "scroll",
        caption: "Five minutes became thirty, and the study plan quietly disappeared.",
      },
      {
        icon: "⏳",
        headline: "Protect your focus block",
        emphasisWord: "focus",
        caption: "Give yourself twenty distraction-free minutes before checking your phone.",
      },
    ],
  },
  {
    day: 68,
    theme: "The Confidence Loop",
    slides: [
      {
        icon: "🔄",
        headline: "Success builds more success",
        emphasisWord: "Success",
        caption: "Each honest solution makes the next challenge feel a little easier.",
      },
      {
        icon: "🌱",
        headline: "Confidence grows gradually",
        emphasisWord: "Confidence",
        caption: "You don't become confident first. You become confident by practicing.",
      },
      {
        icon: "📉",
        headline: "Waiting to feel confident",
        emphasisWord: "Waiting",
        caption: "Confidence never arrived because practice never truly started.",
      },
      {
        icon: "🚀",
        headline: "Create today's confidence",
        emphasisWord: "Create",
        caption: "Solve one challenging problem honestly. Confidence follows action.",
      },
    ],
  },
  {
    day: 69,
    theme: "The Value of Honest Scores",
    slides: [
      {
        icon: "📊",
        headline: "Honest marks guide improvement",
        emphasisWord: "Honest",
        caption: "A low practice score today can become a high exam score tomorrow.",
      },
      {
        icon: "🧭",
        headline: "Truth shows direction",
        emphasisWord: "Truth",
        caption: "Real results tell you exactly where to improve next.",
      },
      {
        icon: "🙈",
        headline: "Perfect homework fooled me",
        emphasisWord: "Perfect",
        caption: "Copied assignments hid the chapters that actually needed attention.",
      },
      {
        icon: "🎯",
        headline: "Accept today's real score",
        emphasisWord: "Accept",
        caption: "Today's pledge: let practice reveal weaknesses before the exam does.",
      },
    ],
  },
  {
    day: 70,
    theme: "Trust the Process",
    slides: [
      {
        icon: "🌅",
        headline: "Progress hides in ordinary days",
        emphasisWord: "Progress",
        caption: "Most learning happens quietly through small daily efforts.",
      },
      {
        icon: "🏗️",
        headline: "Strong foundations last longer",
        emphasisWord: "foundations",
        caption: "Knowledge built honestly supports every future chapter.",
      },
      {
        icon: "🎒",
        headline: "Today's effort paid off",
        emphasisWord: "effort",
        caption: "The exam felt challenging, but your preparation answered before panic could.",
      },
      {
        icon: "🤝",
        headline: "Keep earning your knowledge",
        emphasisWord: "earning",
        caption: "Use AI to learn deeper, never to skip the thinking that makes you stronger.",
      },
    ],
  },
  {
    day: 71,
    theme: "The Power of Waiting",
    slides: [
      {
        icon: "⏳",
        headline: "Don't rush to the answer",
        emphasisWord: "rush",
        caption: "That uncomfortable pause before solving is where real learning quietly begins.",
      },
      {
        icon: "🧠",
        headline: "Patience grows stronger recall",
        emphasisWord: "Patience",
        caption: "Giving your brain time to think creates memories that survive stressful exams.",
      },
      {
        icon: "📱",
        headline: "Prompted within five seconds",
        emphasisWord: "five",
        caption: "The solution appeared instantly, but your thinking never even started.",
      },
      {
        icon: "🤝",
        headline: "Wait before asking AI",
        emphasisWord: "Wait",
        caption: "Today's pledge: spend one full minute thinking before opening any AI tool.",
      },
    ],
  },
  {
    day: 72,
    theme: "Solve Before You Peek",
    slides: [
      {
        icon: "🙈",
        headline: "First attempts reveal growth",
        emphasisWord: "First",
        caption: "Your first solution shows what you truly know, not what AI knows.",
      },
      {
        icon: "📈",
        headline: "Independent effort compounds",
        emphasisWord: "Independent",
        caption: "Small honest attempts every day become huge improvements by exam season.",
      },
      {
        icon: "📄",
        headline: "Peeked before solving",
        emphasisWord: "Peeked",
        caption: "One glance at the solution quietly stole the chance to discover it yourself.",
      },
      {
        icon: "✍️",
        headline: "Finish your attempt first",
        emphasisWord: "Finish",
        caption: "Write your full solution before comparing it with AI.",
      },
    ],
  },
  {
    day: 73,
    theme: "Learning From Failure",
    slides: [
      {
        icon: "❌",
        headline: "Wrong today, stronger tomorrow",
        emphasisWord: "Wrong",
        caption: "Every mistake is a lesson your future exam score will appreciate.",
      },
      {
        icon: "🔬",
        headline: "Failure sharpens memory",
        emphasisWord: "Failure",
        caption: "Correcting your own mistakes leaves deeper learning than perfect answers.",
      },
      {
        icon: "😶",
        headline: "Avoided difficult questions",
        emphasisWord: "Avoided",
        caption: "The hardest problems waited patiently for the real exam.",
      },
      {
        icon: "💪",
        headline: "Respect today's mistakes",
        emphasisWord: "Respect",
        caption: "Treat every error as practice, not proof that you can't improve.",
      },
    ],
  },
  {
    day: 74,
    theme: "Physics Loves Curiosity",
    slides: [
      {
        icon: "⚡",
        headline: "Ask why things move",
        emphasisWord: "why",
        caption: "Physics begins with curiosity long before equations appear.",
      },
      {
        icon: "🌍",
        headline: "Questions reveal hidden laws",
        emphasisWord: "Questions",
        caption: "Curiosity turns everyday events into unforgettable lessons.",
      },
      {
        icon: "🏀",
        headline: "Ball bounced, concept missed",
        emphasisWord: "concept",
        caption: "You knew the formula but couldn't explain what actually happened.",
      },
      {
        icon: "🔭",
        headline: "Observe before calculating",
        emphasisWord: "Observe",
        caption: "Notice the real-world idea before reaching for formulas or AI.",
      },
    ],
  },
  {
    day: 75,
    theme: "Chemistry Through Logic",
    slides: [
      {
        icon: "🧪",
        headline: "Every reaction has a reason",
        emphasisWord: "reason",
        caption: "Chemistry becomes easier when reactions feel logical instead of magical.",
      },
      {
        icon: "🧠",
        headline: "Logic reduces memorizing",
        emphasisWord: "Logic",
        caption: "Understanding why reactions occur makes revision much lighter.",
      },
      {
        icon: "📚",
        headline: "Memorized without understanding",
        emphasisWord: "understanding",
        caption: "The chapter vanished because only the words were remembered.",
      },
      {
        icon: "🔗",
        headline: "Discover the hidden pattern",
        emphasisWord: "pattern",
        caption: "Today's pledge: explain one reaction before asking AI to explain it.",
      },
    ],
  },
  {
    day: 76,
    theme: "Math Rewards Persistence",
    slides: [
      {
        icon: "➕",
        headline: "Persistence unlocks solutions",
        emphasisWord: "Persistence",
        caption: "Many problems surrender only after your second or third attempt.",
      },
      {
        icon: "🪜",
        headline: "Every step teaches something",
        emphasisWord: "step",
        caption: "Even incorrect steps improve your mathematical instincts.",
      },
      {
        icon: "😓",
        headline: "Stopped too early",
        emphasisWord: "Stopped",
        caption: "Giving up after one mistake prevented the real breakthrough.",
      },
      {
        icon: "📐",
        headline: "Take one more step",
        emphasisWord: "more",
        caption: "Stay with difficult problems just a little longer before asking AI.",
      },
    ],
  },
  {
    day: 77,
    theme: "Protect Your Attention",
    slides: [
      {
        icon: "🎯",
        headline: "Attention is your superpower",
        emphasisWord: "Attention",
        caption: "Focused minds solve problems faster than distracted minds using shortcuts.",
      },
      {
        icon: "🔒",
        headline: "Focus multiplies learning",
        emphasisWord: "Focus",
        caption: "Every uninterrupted minute gives your brain a better chance to remember.",
      },
      {
        icon: "📲",
        headline: "Checked messages mid-problem",
        emphasisWord: "messages",
        caption: "Returning to the question felt like starting from the beginning.",
      },
      {
        icon: "⏰",
        headline: "Defend your study time",
        emphasisWord: "Defend",
        caption: "Today's pledge: protect twenty minutes of distraction-free learning.",
      },
    ],
  },
  {
    day: 78,
    theme: "Practice Creates Speed",
    slides: [
      {
        icon: "🏃",
        headline: "Speed grows from repetition",
        emphasisWord: "Speed",
        caption: "Fast solving is earned through practice, not shortcuts.",
      },
      {
        icon: "⚙️",
        headline: "Automatic comes after effort",
        emphasisWord: "Automatic",
        caption: "Repeated practice teaches your brain to recognize familiar patterns instantly.",
      },
      {
        icon: "⏳",
        headline: "Always running out of time",
        emphasisWord: "time",
        caption: "Slow solving wasn't the problem. Lack of practice was.",
      },
      {
        icon: "🏁",
        headline: "Train for exam speed",
        emphasisWord: "Train",
        caption: "Complete one timed practice set before using AI for review.",
      },
    ],
  },
  {
    day: 79,
    theme: "Honesty Builds Trust",
    slides: [
      {
        icon: "🤝",
        headline: "Trust starts with yourself",
        emphasisWord: "Trust",
        caption: "Honest study builds confidence that no shortcut can provide.",
      },
      {
        icon: "💎",
        headline: "Integrity feels lighter",
        emphasisWord: "Integrity",
        caption: "Knowing you earned your answers removes hidden exam anxiety.",
      },
      {
        icon: "📄",
        headline: "Homework looked impressive",
        emphasisWord: "impressive",
        caption: "The grades smiled, but the understanding never arrived.",
      },
      {
        icon: "✨",
        headline: "Choose honesty again today",
        emphasisWord: "honesty",
        caption: "Keep your pledge by letting your effort speak louder than AI.",
      },
    ],
  },
  {
    day: 80,
    theme: "The Student You're Becoming",
    slides: [
      {
        icon: "🌅",
        headline: "You're building tomorrow's mind",
        emphasisWord: "building",
        caption: "Every honest study session shapes the student you'll become next year.",
      },
      {
        icon: "🌳",
        headline: "Growth hides underground",
        emphasisWord: "Growth",
        caption: "Like roots, real progress often stays invisible until results appear.",
      },
      {
        icon: "🎓",
        headline: "Confidence walked into exams",
        emphasisWord: "Confidence",
        caption: "The paper was tough, but your preparation answered before fear could.",
      },
      {
        icon: "🚀",
        headline: "Continue the promise daily",
        emphasisWord: "promise",
        caption: "Use AI to understand better, never to replace the thinking that makes you extraordinary.",
      },
    ],
  },
  {
    day: 81,
    theme: "Train for Silence",
    slides: [
      {
        icon: "🔕",
        headline: "Silence reveals your knowledge",
        emphasisWord: "Silence",
        caption: "The exam hall is quiet. Practice solving without constant hints or notifications.",
      },
      {
        icon: "🧠",
        headline: "Quiet minds recall better",
        emphasisWord: "Quiet",
        caption: "Fewer distractions mean stronger focus, faster recall, and fewer careless mistakes.",
      },
      {
        icon: "📲",
        headline: "Needed help every minute",
        emphasisWord: "help",
        caption: "Without AI or chats nearby, even familiar questions suddenly felt unfamiliar.",
      },
      {
        icon: "🤝",
        headline: "Study in complete silence",
        emphasisWord: "silence",
        caption: "Today's pledge: spend fifteen distraction-free minutes solving on your own.",
      },
    ],
  },
  {
    day: 82,
    theme: "Comfort Doesn't Score Marks",
    slides: [
      {
        icon: "🛋️",
        headline: "Comfort hides weak spots",
        emphasisWord: "Comfort",
        caption: "Easy answers feel satisfying today but rarely prepare you for difficult papers.",
      },
      {
        icon: "⚡",
        headline: "Challenge creates growth",
        emphasisWord: "Challenge",
        caption: "Your brain grows whenever it struggles through a difficult question.",
      },
      {
        icon: "📄",
        headline: "Only solved easy questions",
        emphasisWord: "easy",
        caption: "The difficult chapters quietly waited for the final exam.",
      },
      {
        icon: "🎯",
        headline: "Choose one hard question",
        emphasisWord: "hard",
        caption: "Today's pledge: don't end your session without tackling one difficult problem.",
      },
    ],
  },
  {
    day: 83,
    theme: "Learn the Language of Mistakes",
    slides: [
      {
        icon: "🔍",
        headline: "Mistakes leave clues",
        emphasisWord: "Mistakes",
        caption: "Every wrong answer points directly to the concept that deserves your attention.",
      },
      {
        icon: "🧠",
        headline: "Reflection locks learning",
        emphasisWord: "Reflection",
        caption: "Thinking about why you were wrong strengthens memory more than getting it right instantly.",
      },
      {
        icon: "😶",
        headline: "Correct answer, same error",
        emphasisWord: "same",
        caption: "AI fixed today's solution, but the same mistake returned tomorrow.",
      },
      {
        icon: "📓",
        headline: "Understand every mistake",
        emphasisWord: "Understand",
        caption: "Today's pledge: explain one error before moving to the next question.",
      },
    ],
  },
  {
    day: 84,
    theme: "Physics Is Prediction",
    slides: [
      {
        icon: "🎯",
        headline: "Predict before calculating",
        emphasisWord: "Predict",
        caption: "Guess what should happen before reaching for equations or AI.",
      },
      {
        icon: "⚙️",
        headline: "Predictions deepen concepts",
        emphasisWord: "Predictions",
        caption: "Testing your intuition helps formulas make much more sense.",
      },
      {
        icon: "🏀",
        headline: "Numbers came before thinking",
        emphasisWord: "thinking",
        caption: "Calculations were correct, but the physical idea remained unclear.",
      },
      {
        icon: "🔭",
        headline: "Trust your intuition first",
        emphasisWord: "intuition",
        caption: "Today's pledge: predict the outcome before solving the Physics problem.",
      },
    ],
  },
  {
    day: 85,
    theme: "Chemistry Is Connected",
    slides: [
      {
        icon: "🧪",
        headline: "Chapters are connected",
        emphasisWord: "connected",
        caption: "Chemistry becomes simpler when you notice links across different topics.",
      },
      {
        icon: "🧩",
        headline: "Connections reduce confusion",
        emphasisWord: "Connections",
        caption: "Seeing relationships helps your brain organize ideas naturally.",
      },
      {
        icon: "📚",
        headline: "Everything felt disconnected",
        emphasisWord: "disconnected",
        caption: "Each chapter seemed new because the common ideas were never explored.",
      },
      {
        icon: "🔗",
        headline: "Link today's chapter",
        emphasisWord: "Link",
        caption: "Find one connection between today's lesson and yesterday's before using AI.",
      },
    ],
  },
  {
    day: 86,
    theme: "Math Loves Patterns",
    slides: [
      {
        icon: "🧩",
        headline: "Every problem has patterns",
        emphasisWord: "patterns",
        caption: "Great problem solvers recognize structures instead of memorizing answers.",
      },
      {
        icon: "📈",
        headline: "Pattern recognition grows naturally",
        emphasisWord: "Pattern",
        caption: "Repeated practice trains your brain to notice familiar mathematical ideas.",
      },
      {
        icon: "😕",
        headline: "Every question looked new",
        emphasisWord: "new",
        caption: "Without enough practice, even familiar patterns felt completely different.",
      },
      {
        icon: "✍️",
        headline: "Find the hidden pattern",
        emphasisWord: "hidden",
        caption: "Today's pledge: identify the pattern before solving the calculation.",
      },
    ],
  },
  {
    day: 87,
    theme: "Your Brain Needs Rest",
    slides: [
      {
        icon: "😴",
        headline: "Rest is productive",
        emphasisWord: "Rest",
        caption: "Sleep helps your brain organize and strengthen everything you studied today.",
      },
      {
        icon: "🌙",
        headline: "Recovery boosts memory",
        emphasisWord: "Recovery",
        caption: "A tired brain remembers less, even after hours of studying.",
      },
      {
        icon: "☕",
        headline: "Studied through exhaustion",
        emphasisWord: "exhaustion",
        caption: "Late-night scrolling replaced quality revision and fresh thinking.",
      },
      {
        icon: "🛌",
        headline: "Protect tonight's sleep",
        emphasisWord: "sleep",
        caption: "Today's pledge: end your study session with a calm, rested mind.",
      },
    ],
  },
  {
    day: 88,
    theme: "Small Steps Win",
    slides: [
      {
        icon: "👣",
        headline: "Progress loves consistency",
        emphasisWord: "consistency",
        caption: "Small efforts repeated daily beat giant bursts followed by long breaks.",
      },
      {
        icon: "🌱",
        headline: "Tiny habits multiply",
        emphasisWord: "Tiny",
        caption: "One honest chapter each day grows into months of solid preparation.",
      },
      {
        icon: "📅",
        headline: "Tomorrow never arrived",
        emphasisWord: "Tomorrow",
        caption: "Postponing today's work quietly increased tomorrow's pressure.",
      },
      {
        icon: "🚶",
        headline: "Move one step today",
        emphasisWord: "step",
        caption: "Today's pledge: finish one task completely instead of starting many.",
      },
    ],
  },
  {
    day: 89,
    theme: "Your Future Self",
    slides: [
      {
        icon: "🪞",
        headline: "Future you is watching",
        emphasisWord: "Future",
        caption: "Every study decision today becomes tomorrow's confidence or tomorrow's regret.",
      },
      {
        icon: "🏗️",
        headline: "Today's choices compound",
        emphasisWord: "compound",
        caption: "The future is built through ordinary decisions repeated every day.",
      },
      {
        icon: "🎓",
        headline: "Revision felt surprisingly easy",
        emphasisWord: "easy",
        caption: "Weeks of honest practice made familiar concepts easier to recall.",
      },
      {
        icon: "🌟",
        headline: "Help tomorrow's you",
        emphasisWord: "tomorrow's",
        caption: "Today's pledge: solve one extra question your future self will appreciate.",
      },
    ],
  },
  {
    day: 90,
    theme: "Ninety Days Strong",
    slides: [
      {
        icon: "🏆",
        headline: "Ninety honest days",
        emphasisWord: "Ninety",
        caption: "Every pledge kept has strengthened both your knowledge and your confidence.",
      },
      {
        icon: "🧠",
        headline: "Thinking became your habit",
        emphasisWord: "Thinking",
        caption: "Real learning begins when your first instinct is to solve, not search.",
      },
      {
        icon: "🎯",
        headline: "The paper felt different",
        emphasisWord: "different",
        caption: "Questions were challenging, but this time your own reasoning took the lead.",
      },
      {
        icon: "🤝",
        headline: "Carry the pledge forward",
        emphasisWord: "pledge",
        caption: "Use AI to explore, question, and learn. Never let it replace your own thinking.",
      },
    ],
  },
  {
    day: 91,
    theme: "The Thinking Advantage",
    slides: [
      {
        icon: "💭",
        headline: "Thinking beats searching",
        emphasisWord: "Thinking",
        caption: "The fastest answer isn't always the strongest one. Your brain deserves the first chance.",
      },
      {
        icon: "🧠",
        headline: "Deep thinking lasts longer",
        emphasisWord: "Deep",
        caption: "Concepts you build yourself stay available long after copied answers disappear.",
      },
      {
        icon: "📄",
        headline: "Recognized but couldn't solve",
        emphasisWord: "solve",
        caption: "The question looked familiar, but the method never came to mind.",
      },
      {
        icon: "🤝",
        headline: "Think before every search",
        emphasisWord: "Think",
        caption: "Today's pledge: let your mind work first, then let AI become your coach.",
      },
    ],
  },
  {
    day: 92,
    theme: "Pressure Tests Preparation",
    slides: [
      {
        icon: "⏱️",
        headline: "Pressure reveals preparation",
        emphasisWord: "Pressure",
        caption: "Stress doesn't erase learning. It reveals how deeply you've learned.",
      },
      {
        icon: "🛡️",
        headline: "Preparation defeats panic",
        emphasisWord: "Preparation",
        caption: "Every honest practice session becomes calm confidence inside the exam hall.",
      },
      {
        icon: "😰",
        headline: "Mind went completely blank",
        emphasisWord: "blank",
        caption: "Depending on shortcuts left too little practice for independent recall.",
      },
      {
        icon: "🎯",
        headline: "Prepare for pressure today",
        emphasisWord: "Prepare",
        caption: "Solve one timed question without AI and review it honestly afterward.",
      },
    ],
  },
  {
    day: 93,
    theme: "Revision Is Active",
    slides: [
      {
        icon: "🔄",
        headline: "Revision needs action",
        emphasisWord: "action",
        caption: "Reading again feels comfortable. Recalling from memory builds lasting learning.",
      },
      {
        icon: "🧠",
        headline: "Active recall wins",
        emphasisWord: "recall",
        caption: "The brain remembers what it retrieves, not what it simply rereads.",
      },
      {
        icon: "📖",
        headline: "Read everything, recalled little",
        emphasisWord: "recalled",
        caption: "Recognition felt strong until the notebook had to stay closed.",
      },
      {
        icon: "✍️",
        headline: "Close the book first",
        emphasisWord: "Close",
        caption: "Today's pledge: answer from memory before checking notes or AI.",
      },
    ],
  },
  {
    day: 94,
    theme: "Physics Rewards Curiosity",
    slides: [
      {
        icon: "🌠",
        headline: "Wonder before formulas",
        emphasisWord: "Wonder",
        caption: "Every great Physics idea began with someone asking why something happened.",
      },
      {
        icon: "⚡",
        headline: "Curiosity powers understanding",
        emphasisWord: "Curiosity",
        caption: "Questions create deeper learning than memorizing equations ever can.",
      },
      {
        icon: "🏏",
        headline: "Calculated without understanding",
        emphasisWord: "understanding",
        caption: "The answer was correct, but explaining the concept felt impossible.",
      },
      {
        icon: "🔭",
        headline: "Ask why first",
        emphasisWord: "why",
        caption: "Today's pledge: understand the idea before reaching for the formula.",
      },
    ],
  },
  {
    day: 95,
    theme: "Chemistry Makes Sense",
    slides: [
      {
        icon: "⚗️",
        headline: "Chemistry follows principles",
        emphasisWord: "principles",
        caption: "Many reactions become predictable once you understand the underlying rules.",
      },
      {
        icon: "🧩",
        headline: "Patterns simplify revision",
        emphasisWord: "Patterns",
        caption: "Finding common ideas makes remembering chapters much easier.",
      },
      {
        icon: "📚",
        headline: "Memories faded after tests",
        emphasisWord: "faded",
        caption: "Facts learned without understanding rarely stay for long.",
      },
      {
        icon: "🧪",
        headline: "Understand every reaction",
        emphasisWord: "Understand",
        caption: "Today's pledge: explain one reaction in your own words before checking AI.",
      },
    ],
  },
  {
    day: 96,
    theme: "Math Is Built Daily",
    slides: [
      {
        icon: "📐",
        headline: "Daily practice compounds",
        emphasisWord: "Daily",
        caption: "Every solved problem quietly prepares you for a tougher one tomorrow.",
      },
      {
        icon: "🧠",
        headline: "Repetition creates intuition",
        emphasisWord: "intuition",
        caption: "Repeated solving teaches your brain to spot patterns without effort.",
      },
      {
        icon: "😕",
        headline: "Methods disappeared under pressure",
        emphasisWord: "pressure",
        caption: "Watching solutions wasn't enough when it was time to solve independently.",
      },
      {
        icon: "✏️",
        headline: "Fill another notebook page",
        emphasisWord: "Fill",
        caption: "Today's pledge: solve with your pen before asking AI to review.",
      },
    ],
  },
  {
    day: 97,
    theme: "Protect Your Focus",
    slides: [
      {
        icon: "🎧",
        headline: "Guard your attention fiercely",
        emphasisWord: "Guard",
        caption: "Your focus is one of your greatest study resources. Protect it carefully.",
      },
      {
        icon: "🔒",
        headline: "Focus multiplies results",
        emphasisWord: "Focus",
        caption: "A fully focused session often beats several distracted study hours.",
      },
      {
        icon: "📲",
        headline: "Notifications stole momentum",
        emphasisWord: "Notifications",
        caption: "Every interruption forced your brain to start thinking all over again.",
      },
      {
        icon: "⏳",
        headline: "Create a focus zone",
        emphasisWord: "focus",
        caption: "Today's pledge: protect thirty uninterrupted minutes for deep learning.",
      },
    ],
  },
  {
    day: 98,
    theme: "Your Score Starts Today",
    slides: [
      {
        icon: "📊",
        headline: "Tomorrow's marks start now",
        emphasisWord: "Tomorrow's",
        caption: "Exam scores are built one honest study session at a time.",
      },
      {
        icon: "🌱",
        headline: "Effort compounds quietly",
        emphasisWord: "Effort",
        caption: "Tiny improvements every day become remarkable results over months.",
      },
      {
        icon: "📅",
        headline: "Kept postponing revision",
        emphasisWord: "postponing",
        caption: "Tomorrow kept moving while the syllabus kept growing.",
      },
      {
        icon: "🚀",
        headline: "Invest in today's effort",
        emphasisWord: "Invest",
        caption: "Today's pledge: finish today's target before planning tomorrow's.",
      },
    ],
  },
  {
    day: 99,
    theme: "Integrity Is a Superpower",
    slides: [
      {
        icon: "💎",
        headline: "Integrity builds fearless confidence",
        emphasisWord: "Integrity",
        caption: "Knowing you earned your knowledge removes doubt when the exam begins.",
      },
      {
        icon: "🧠",
        headline: "Honesty strengthens learning",
        emphasisWord: "Honesty",
        caption: "Real understanding grows only when your brain does the thinking.",
      },
      {
        icon: "📄",
        headline: "Grades improved, skills didn't",
        emphasisWord: "skills",
        caption: "Copied work impressed others, but couldn't help during independent tests.",
      },
      {
        icon: "✨",
        headline: "Protect your integrity always",
        emphasisWord: "Protect",
        caption: "Today's pledge: earn every answer you proudly call your own.",
      },
    ],
  },
  {
    day: 100,
    theme: "One Hundred Days Later",
    slides: [
      {
        icon: "🎉",
        headline: "One hundred honest days",
        emphasisWord: "hundred",
        caption: "You've practiced choosing learning over shortcuts, one day at a time.",
      },
      {
        icon: "🧠",
        headline: "Your mindset has changed",
        emphasisWord: "mindset",
        caption: "Strong students don't fear difficult questions. They know how to approach them.",
      },
      {
        icon: "🏆",
        headline: "Confidence replaced shortcuts",
        emphasisWord: "Confidence",
        caption: "The biggest reward wasn't just better marks. It was trusting your own thinking.",
      },
      {
        icon: "🤝",
        headline: "Keep learning with integrity",
        emphasisWord: "integrity",
        caption: "Use AI to explore ideas, clear doubts, and grow. Never let it replace the learner you have become.",
      },
    ],
  },
  {
    day: 101,
    theme: "The Brain Loves Effort",
    slides: [
      {
        icon: "🧠",
        headline: "Easy isn't always learning",
        emphasisWord: "Easy",
        caption: "If every answer feels effortless, your brain may not be building lasting knowledge.",
      },
      {
        icon: "⚙️",
        headline: "Effort creates stronger pathways",
        emphasisWord: "Effort",
        caption: "Working through confusion strengthens the neural connections you'll need on exam day.",
      },
      {
        icon: "📄",
        headline: "Homework felt strangely perfect",
        emphasisWord: "perfect",
        caption: "Everything scored well until the same chapter appeared in a closed-book test.",
      },
      {
        icon: "🤝",
        headline: "Welcome today's challenge",
        emphasisWord: "challenge",
        caption: "Today's pledge: don't escape difficult questions. Learn from them.",
      },
    ],
  },
  {
    day: 102,
    theme: "Practice Without Permission",
    slides: [
      {
        icon: "🚀",
        headline: "Don't wait to feel ready",
        emphasisWord: "ready",
        caption: "Confidence grows after starting, not before.",
      },
      {
        icon: "🌱",
        headline: "Momentum beats motivation",
        emphasisWord: "Momentum",
        caption: "The first solved question often unlocks an entire study session.",
      },
      {
        icon: "😴",
        headline: "Tomorrow became next week",
        emphasisWord: "Tomorrow",
        caption: "Waiting for motivation quietly increased the syllabus.",
      },
      {
        icon: "✅",
        headline: "Begin with one question",
        emphasisWord: "Begin",
        caption: "Today's pledge: solve something before checking your phone or AI.",
      },
    ],
  },
  {
    day: 103,
    theme: "Confidence Comes Later",
    slides: [
      {
        icon: "💪",
        headline: "Nobody starts confident",
        emphasisWord: "confident",
        caption: "Every topper once struggled with the same concepts you're learning now.",
      },
      {
        icon: "📈",
        headline: "Practice changes belief",
        emphasisWord: "Practice",
        caption: "Every honest attempt quietly teaches your brain that improvement is possible.",
      },
      {
        icon: "😓",
        headline: "Waited to feel confident",
        emphasisWord: "Waited",
        caption: "The first step never happened because confidence was expected first.",
      },
      {
        icon: "🌟",
        headline: "Earn confidence daily",
        emphasisWord: "Earn",
        caption: "Today's pledge: let action create confidence, not the other way around.",
      },
    ],
  },
  {
    day: 104,
    theme: "Physics Begins With Observation",
    slides: [
      {
        icon: "👀",
        headline: "Observe before solving",
        emphasisWord: "Observe",
        caption: "Physics starts with noticing the world, not memorizing equations.",
      },
      {
        icon: "🌍",
        headline: "Reality teaches faster",
        emphasisWord: "Reality",
        caption: "Connecting formulas to real life makes them easier to remember.",
      },
      {
        icon: "🚗",
        headline: "Formula without intuition",
        emphasisWord: "intuition",
        caption: "The calculation worked, but explaining the motion didn't.",
      },
      {
        icon: "🔭",
        headline: "Notice one real example",
        emphasisWord: "Notice",
        caption: "Today's pledge: connect one Physics idea to something you see today.",
      },
    ],
  },
  {
    day: 105,
    theme: "Chemistry Is a Story",
    slides: [
      {
        icon: "📖",
        headline: "Every reaction tells something",
        emphasisWord: "reaction",
        caption: "Atoms aren't memorizing rules. They're following predictable behavior.",
      },
      {
        icon: "🧪",
        headline: "Stories improve memory",
        emphasisWord: "Stories",
        caption: "Understanding why reactions happen beats memorizing endless equations.",
      },
      {
        icon: "🤯",
        headline: "Forgot another mechanism",
        emphasisWord: "mechanism",
        caption: "Without the story behind it, the reaction disappeared after revision.",
      },
      {
        icon: "📚",
        headline: "Learn the reason first",
        emphasisWord: "reason",
        caption: "Today's pledge: ask why every reaction happens before checking AI.",
      },
    ],
  },
  {
    day: 106,
    theme: "Math Builds Pattern Recognition",
    slides: [
      {
        icon: "🧩",
        headline: "Patterns hide everywhere",
        emphasisWord: "Patterns",
        caption: "Strong mathematicians recognize structures before calculations.",
      },
      {
        icon: "🧠",
        headline: "Recognition comes through repetition",
        emphasisWord: "repetition",
        caption: "Every solved problem teaches your brain what to notice next time.",
      },
      {
        icon: "📄",
        headline: "Every problem seemed unique",
        emphasisWord: "unique",
        caption: "Without enough practice, familiar ideas looked completely different.",
      },
      {
        icon: "✍️",
        headline: "Search for similarities",
        emphasisWord: "similarities",
        caption: "Today's pledge: identify the pattern before solving the question.",
      },
    ],
  },
  {
    day: 107,
    theme: "Discipline Outlasts Mood",
    slides: [
      {
        icon: "📅",
        headline: "Mood changes every day",
        emphasisWord: "Mood",
        caption: "Your goals deserve more consistency than your emotions.",
      },
      {
        icon: "🏗️",
        headline: "Discipline builds success",
        emphasisWord: "Discipline",
        caption: "Tiny routines repeated daily outperform occasional motivation.",
      },
      {
        icon: "😴",
        headline: "Skipped because motivation vanished",
        emphasisWord: "Skipped",
        caption: "The chapter stayed exactly where you left it.",
      },
      {
        icon: "🚶",
        headline: "Study anyway today",
        emphasisWord: "Study",
        caption: "Today's pledge: finish your target, even if you're not in the mood.",
      },
    ],
  },
  {
    day: 108,
    theme: "The Exam Doesn't Know Yesterday",
    slides: [
      {
        icon: "📅",
        headline: "Yesterday won't write today",
        emphasisWord: "Yesterday",
        caption: "The exam measures what you remember now, not what you understood last week.",
      },
      {
        icon: "🔄",
        headline: "Revision keeps knowledge alive",
        emphasisWord: "Revision",
        caption: "Revisiting topics regularly prevents them from quietly fading away.",
      },
      {
        icon: "📖",
        headline: "Thought I already knew",
        emphasisWord: "already",
        caption: "Without revision, familiar chapters became unfamiliar questions.",
      },
      {
        icon: "📌",
        headline: "Review before moving on",
        emphasisWord: "Review",
        caption: "Today's pledge: revise one old topic before starting a new one.",
      },
    ],
  },
  {
    day: 109,
    theme: "Learning Is Personal",
    slides: [
      {
        icon: "🪞",
        headline: "Compare less, improve more",
        emphasisWord: "Compare",
        caption: "Someone else's speed doesn't decide your destination.",
      },
      {
        icon: "🌱",
        headline: "Growth follows your pace",
        emphasisWord: "Growth",
        caption: "Consistent effort matters more than constant comparison.",
      },
      {
        icon: "👥",
        headline: "Someone finished before me",
        emphasisWord: "finished",
        caption: "Comparing progress stole time that could have improved your own understanding.",
      },
      {
        icon: "🎯",
        headline: "Compete with yesterday",
        emphasisWord: "yesterday",
        caption: "Today's pledge: become slightly better than the student you were yesterday.",
      },
    ],
  },
  {
    day: 110,
    theme: "Knowledge You Can Trust",
    slides: [
      {
        icon: "🏆",
        headline: "Earn answers with effort",
        emphasisWord: "Earn",
        caption: "The most valuable knowledge is the knowledge you can explain without help.",
      },
      {
        icon: "🧠",
        headline: "Understanding creates freedom",
        emphasisWord: "Understanding",
        caption: "When concepts are truly yours, difficult questions become opportunities.",
      },
      {
        icon: "🎓",
        headline: "This time I explained",
        emphasisWord: "explained",
        caption: "The answer came from your own reasoning, not from remembering someone else's words.",
      },
      {
        icon: "🤝",
        headline: "Keep choosing real learning",
        emphasisWord: "learning",
        caption: "Today's pledge: use AI to expand your mind, never to replace it.",
      },
    ],
  },
  {
    day: 111,
    theme: "The Cost of Shortcuts",
    slides: [
      {
        icon: "🛣️",
        headline: "Shortcuts skip understanding",
        emphasisWord: "Shortcuts",
        caption: "A shortcut may save five minutes today but cost five marks tomorrow.",
      },
      {
        icon: "🧠",
        headline: "Brains remember the journey",
        emphasisWord: "journey",
        caption: "Working through each step builds memories that survive stressful exams.",
      },
      {
        icon: "📄",
        headline: "Solution looked too familiar",
        emphasisWord: "familiar",
        caption: "You recognized every line but couldn't recreate the first one.",
      },
      {
        icon: "🤝",
        headline: "Choose the longer path",
        emphasisWord: "Choose",
        caption: "Today's pledge: earn the answer instead of borrowing it.",
      },
    ],
  },
  {
    day: 112,
    theme: "Questions Shape Intelligence",
    slides: [
      {
        icon: "❓",
        headline: "Ask before accepting",
        emphasisWord: "Ask",
        caption: "Every great learner questions answers instead of collecting them.",
      },
      {
        icon: "🔍",
        headline: "Curiosity builds deeper memory",
        emphasisWord: "Curiosity",
        caption: "The brain remembers discoveries better than instructions.",
      },
      {
        icon: "😶",
        headline: "Never questioned the solution",
        emphasisWord: "questioned",
        caption: "Everything seemed correct until one unexpected exam twist appeared.",
      },
      {
        icon: "💡",
        headline: "Ask one extra why",
        emphasisWord: "why",
        caption: "Today's pledge: challenge one answer before moving to the next.",
      },
    ],
  },
  {
    day: 113,
    theme: "Progress Over Perfection",
    slides: [
      {
        icon: "📈",
        headline: "Done beats perfect",
        emphasisWord: "Done",
        caption: "An honest attempt teaches more than waiting for the perfect solution.",
      },
      {
        icon: "🌱",
        headline: "Small progress compounds",
        emphasisWord: "progress",
        caption: "Tiny improvements repeated daily become extraordinary results.",
      },
      {
        icon: "⏳",
        headline: "Kept chasing perfection",
        emphasisWord: "perfection",
        caption: "One unfinished chapter quietly became three.",
      },
      {
        icon: "🚀",
        headline: "Finish today's target",
        emphasisWord: "Finish",
        caption: "Today's pledge: complete one task before trying to make it perfect.",
      },
    ],
  },
  {
    day: 114,
    theme: "Physics Rewards Prediction",
    slides: [
      {
        icon: "🎯",
        headline: "Guess before calculating",
        emphasisWord: "Guess",
        caption: "Predicting outcomes strengthens intuition before equations take over.",
      },
      {
        icon: "⚙️",
        headline: "Intuition improves accuracy",
        emphasisWord: "Intuition",
        caption: "Thinking first helps you notice impossible answers before submitting.",
      },
      {
        icon: "🏀",
        headline: "Solved without predicting",
        emphasisWord: "predicting",
        caption: "The numbers worked, but the result never felt physically reasonable.",
      },
      {
        icon: "🔭",
        headline: "Predict every outcome",
        emphasisWord: "Predict",
        caption: "Today's pledge: pause and estimate before using formulas.",
      },
    ],
  },
  {
    day: 115,
    theme: "Chemistry Needs Understanding",
    slides: [
      {
        icon: "⚗️",
        headline: "Principles outlive facts",
        emphasisWord: "Principles",
        caption: "Strong concepts make dozens of reactions easier to remember.",
      },
      {
        icon: "🧠",
        headline: "Reasoning simplifies revision",
        emphasisWord: "Reasoning",
        caption: "Understanding one rule often explains many different questions.",
      },
      {
        icon: "📚",
        headline: "Facts vanished after revision",
        emphasisWord: "vanished",
        caption: "Memorized lists faded because the logic behind them never grew.",
      },
      {
        icon: "🧪",
        headline: "Master the underlying rule",
        emphasisWord: "rule",
        caption: "Today's pledge: explain the principle before memorizing the reaction.",
      },
    ],
  },
  {
    day: 116,
    theme: "Math Loves Consistency",
    slides: [
      {
        icon: "📐",
        headline: "Consistency solves complexity",
        emphasisWord: "Consistency",
        caption: "Daily practice turns difficult chapters into familiar territory.",
      },
      {
        icon: "🔄",
        headline: "Repetition creates mastery",
        emphasisWord: "Repetition",
        caption: "Every solved question teaches your brain what success looks like.",
      },
      {
        icon: "😓",
        headline: "Practiced only before exams",
        emphasisWord: "before",
        caption: "Last-minute effort couldn't replace weeks of steady problem solving.",
      },
      {
        icon: "✍️",
        headline: "Solve something every day",
        emphasisWord: "every",
        caption: "Today's pledge: one honest Math problem is better than none.",
      },
    ],
  },
  {
    day: 117,
    theme: "Own Your Attention",
    slides: [
      {
        icon: "🎯",
        headline: "Attention is a choice",
        emphasisWord: "Attention",
        caption: "Where your focus goes, your learning follows.",
      },
      {
        icon: "🔒",
        headline: "Protect your concentration",
        emphasisWord: "Protect",
        caption: "Every distraction interrupts the brain's learning process.",
      },
      {
        icon: "📲",
        headline: "Phone kept winning",
        emphasisWord: "Phone",
        caption: "Short breaks quietly became long distractions.",
      },
      {
        icon: "⏰",
        headline: "Own the next half hour",
        emphasisWord: "Own",
        caption: "Today's pledge: give your full attention to one uninterrupted study block.",
      },
    ],
  },
  {
    day: 118,
    theme: "Knowledge Beats Memory",
    slides: [
      {
        icon: "📚",
        headline: "Knowing beats remembering",
        emphasisWord: "Knowing",
        caption: "Understanding helps even when the exact wording disappears.",
      },
      {
        icon: "🧠",
        headline: "Concepts survive pressure",
        emphasisWord: "Concepts",
        caption: "Deep learning stays calm even when exam stress rises.",
      },
      {
        icon: "😶",
        headline: "Forgot the exact definition",
        emphasisWord: "definition",
        caption: "The words disappeared, but the concept could still have saved the marks.",
      },
      {
        icon: "💡",
        headline: "Understand beyond words",
        emphasisWord: "Understand",
        caption: "Today's pledge: explain one topic without reading your notes.",
      },
    ],
  },
  {
    day: 119,
    theme: "Build Your Own Success",
    slides: [
      {
        icon: "🧱",
        headline: "Every effort is a brick",
        emphasisWord: "brick",
        caption: "Success isn't built overnight. It's built one study session at a time.",
      },
      {
        icon: "🏗️",
        headline: "Foundations support dreams",
        emphasisWord: "Foundations",
        caption: "Strong basics make advanced topics feel less intimidating.",
      },
      {
        icon: "🎒",
        headline: "Skipped the basics first",
        emphasisWord: "basics",
        caption: "Later chapters became difficult because the foundation was never strengthened.",
      },
      {
        icon: "🌟",
        headline: "Lay today's foundation",
        emphasisWord: "foundation",
        caption: "Today's pledge: strengthen one core concept before chasing harder ones.",
      },
    ],
  },
  {
    day: 120,
    theme: "The Promise Continues",
    slides: [
      {
        icon: "🤝",
        headline: "Integrity never graduates",
        emphasisWord: "Integrity",
        caption: "Good learning habits matter in school, college, careers, and beyond.",
      },
      {
        icon: "🧠",
        headline: "Your brain earned this",
        emphasisWord: "earned",
        caption: "Months of honest effort have created skills no shortcut can replace.",
      },
      {
        icon: "🏆",
        headline: "You're ready to grow",
        emphasisWord: "ready",
        caption: "Every challenge ahead is another chance to trust your own thinking.",
      },
      {
        icon: "🚀",
        headline: "Keep the promise alive",
        emphasisWord: "promise",
        caption: "Use AI to explore, practice, and learn. Never let it think instead of you.",
      },
    ],
  },
  {
    day: 121,
    theme: "Learning Happens in the Gap",
    slides: [
      {
        icon: "⏸️",
        headline: "Pause before the answer",
        emphasisWord: "Pause",
        caption: "That short moment of thinking is where your brain begins building real understanding.",
      },
      {
        icon: "🧠",
        headline: "Thinking fills the gap",
        emphasisWord: "Thinking",
        caption: "Struggling to connect ideas strengthens memory far more than instant solutions.",
      },
      {
        icon: "📱",
        headline: "Answered before thinking",
        emphasisWord: "thinking",
        caption: "The AI solved it immediately. Your brain never got the chance.",
      },
      {
        icon: "🤝",
        headline: "Own the thinking first",
        emphasisWord: "Own",
        caption: "Today's pledge: pause, think, attempt, then ask AI if you still need help.",
      },
    ],
  },
  {
    day: 122,
    theme: "Marks Follow Habits",
    slides: [
      {
        icon: "📊",
        headline: "Scores mirror routines",
        emphasisWord: "routines",
        caption: "Your report card often reflects what happened every ordinary study day.",
      },
      {
        icon: "🌱",
        headline: "Habits outperform talent",
        emphasisWord: "Habits",
        caption: "Small daily efforts usually beat occasional bursts of motivation.",
      },
      {
        icon: "📅",
        headline: "Skipped one day again",
        emphasisWord: "Skipped",
        caption: "One missed session quietly became a week of unfinished revision.",
      },
      {
        icon: "✅",
        headline: "Protect today's routine",
        emphasisWord: "Protect",
        caption: "Today's pledge: finish your planned study before ending the day.",
      },
    ],
  },
  {
    day: 123,
    theme: "Curiosity Beats Memory",
    slides: [
      {
        icon: "🤔",
        headline: "Curious minds remember longer",
        emphasisWord: "Curious",
        caption: "Questions make facts meaningful, and meaningful facts stay longer.",
      },
      {
        icon: "🔍",
        headline: "Wonder creates connections",
        emphasisWord: "Wonder",
        caption: "Asking why links new ideas to what you already know.",
      },
      {
        icon: "📖",
        headline: "Memorized without wondering",
        emphasisWord: "wondering",
        caption: "The chapter disappeared because nothing connected it to real understanding.",
      },
      {
        icon: "💡",
        headline: "Ask one deeper question",
        emphasisWord: "deeper",
        caption: "Today's pledge: don't stop at the answer. Ask why it works.",
      },
    ],
  },
  {
    day: 124,
    theme: "Physics Needs Imagination",
    slides: [
      {
        icon: "🌌",
        headline: "Imagine before equations",
        emphasisWord: "Imagine",
        caption: "Visualizing the situation makes every formula easier to understand.",
      },
      {
        icon: "🎥",
        headline: "Pictures strengthen Physics",
        emphasisWord: "Pictures",
        caption: "Mental images help concepts stay long after numbers are forgotten.",
      },
      {
        icon: "🚀",
        headline: "Calculated without visualizing",
        emphasisWord: "visualizing",
        caption: "The equation worked, but the physical meaning stayed hidden.",
      },
      {
        icon: "🔭",
        headline: "Picture every problem",
        emphasisWord: "Picture",
        caption: "Today's pledge: see the motion before solving the motion.",
      },
    ],
  },
  {
    day: 125,
    theme: "Chemistry Explains Change",
    slides: [
      {
        icon: "⚗️",
        headline: "Every change has a cause",
        emphasisWord: "cause",
        caption: "Chemical reactions happen for reasons, not because they were memorized.",
      },
      {
        icon: "🧪",
        headline: "Understanding predicts outcomes",
        emphasisWord: "predicts",
        caption: "Knowing the principles helps you solve unfamiliar reactions confidently.",
      },
      {
        icon: "📚",
        headline: "Reaction looked completely new",
        emphasisWord: "new",
        caption: "It only seemed new because the underlying principle wasn't understood.",
      },
      {
        icon: "🔬",
        headline: "Find the driving force",
        emphasisWord: "driving",
        caption: "Today's pledge: ask what causes today's reaction before memorizing it.",
      },
    ],
  },
  {
    day: 126,
    theme: "Math Is Pattern Hunting",
    slides: [
      {
        icon: "🧩",
        headline: "Become a pattern hunter",
        emphasisWord: "pattern",
        caption: "Most difficult questions are familiar ideas wearing different clothes.",
      },
      {
        icon: "🧠",
        headline: "Patterns reduce confusion",
        emphasisWord: "Patterns",
        caption: "Recognizing similarities makes new problems feel less intimidating.",
      },
      {
        icon: "📄",
        headline: "Looked different, solved similarly",
        emphasisWord: "similarly",
        caption: "The method was already known, but the pattern wasn't recognized.",
      },
      {
        icon: "✍️",
        headline: "Search before solving",
        emphasisWord: "Search",
        caption: "Today's pledge: identify the pattern before writing the first step.",
      },
    ],
  },
  {
    day: 127,
    theme: "Protect Your Momentum",
    slides: [
      {
        icon: "🏃",
        headline: "Momentum loves consistency",
        emphasisWord: "Momentum",
        caption: "Once you begin, the next question always feels easier than the first.",
      },
      {
        icon: "⚡",
        headline: "Stopping wastes energy",
        emphasisWord: "Stopping",
        caption: "Every unnecessary break makes your brain rebuild focus from scratch.",
      },
      {
        icon: "📲",
        headline: "One break became many",
        emphasisWord: "break",
        caption: "A quick distraction quietly ended the most productive study hour.",
      },
      {
        icon: "🚀",
        headline: "Ride today's momentum",
        emphasisWord: "Ride",
        caption: "Today's pledge: finish one full study block without switching tasks.",
      },
    ],
  },
  {
    day: 128,
    theme: "Strong Basics Win",
    slides: [
      {
        icon: "🏗️",
        headline: "Basics build brilliance",
        emphasisWord: "Basics",
        caption: "Advanced questions usually depend on simple ideas learned well.",
      },
      {
        icon: "🧱",
        headline: "Foundations carry everything",
        emphasisWord: "Foundations",
        caption: "Strong fundamentals make revision faster and tougher chapters easier.",
      },
      {
        icon: "📉",
        headline: "Advanced chapter felt impossible",
        emphasisWord: "Advanced",
        caption: "The real problem was yesterday's basics, not today's topic.",
      },
      {
        icon: "📘",
        headline: "Strengthen one foundation",
        emphasisWord: "Strengthen",
        caption: "Today's pledge: revise one core concept before learning something new.",
      },
    ],
  },
  {
    day: 129,
    theme: "Your Mind Is the Tool",
    slides: [
      {
        icon: "🧠",
        headline: "Your brain comes first",
        emphasisWord: "brain",
        caption: "AI is powerful, but your own thinking decides how far you'll go.",
      },
      {
        icon: "🛠️",
        headline: "Tools amplify ability",
        emphasisWord: "Tools",
        caption: "The better you understand, the more useful AI becomes.",
      },
      {
        icon: "📱",
        headline: "Trusted the tool completely",
        emphasisWord: "tool",
        caption: "The answers improved, but your independent problem-solving didn't.",
      },
      {
        icon: "✨",
        headline: "Sharpen your own mind",
        emphasisWord: "Sharpen",
        caption: "Today's pledge: let AI assist your thinking, never replace it.",
      },
    ],
  },
  {
    day: 130,
    theme: "Keep Building Forward",
    slides: [
      {
        icon: "🌅",
        headline: "Every day counts twice",
        emphasisWord: "Every",
        caption: "Today's effort helps tomorrow's confidence and next month's results.",
      },
      {
        icon: "🌳",
        headline: "Growth compounds quietly",
        emphasisWord: "Growth",
        caption: "The biggest improvements often happen before you notice them.",
      },
      {
        icon: "🏆",
        headline: "Prepared minds stay calm",
        emphasisWord: "Prepared",
        caption: "When exams arrive, honest practice speaks louder than last-minute shortcuts.",
      },
      {
        icon: "🤝",
        headline: "Learn honestly every day",
        emphasisWord: "honestly",
        caption: "Today's pledge: use AI to understand more deeply, never to avoid learning.",
      },
    ],
  },
  {
    day: 131,
    theme: "Spacing Beats Cramming",
    slides: [
      {
        icon: "🗓️",
        headline: "Space your learning sessions",
        emphasisWord: "Space",
        caption: "Your brain remembers information better when it's revisited over several days, not one night.",
      },
      {
        icon: "🧠",
        headline: "Forgetting helps remembering",
        emphasisWord: "Forgetting",
        caption: "Each review after a small gap strengthens memory more than rereading immediately.",
      },
      {
        icon: "📚",
        headline: "Crammed everything yesterday",
        emphasisWord: "Crammed",
        caption: "By the quiz, half the chapter had already slipped away.",
      },
      {
        icon: "✅",
        headline: "Review older topics today",
        emphasisWord: "Review",
        caption: "Today's pledge: spend ten minutes revising something you studied earlier this week.",
      },
    ],
  },
  {
    day: 132,
    theme: "Teach to Learn",
    slides: [
      {
        icon: "🎤",
        headline: "Teach it to yourself",
        emphasisWord: "Teach",
        caption: "If you can explain a concept simply, you've probably understood it deeply.",
      },
      {
        icon: "💡",
        headline: "Explaining exposes gaps",
        emphasisWord: "Explaining",
        caption: "Your brain quickly notices what it can't clearly describe.",
      },
      {
        icon: "😶",
        headline: "Stuck after the first sentence",
        emphasisWord: "Stuck",
        caption: "The idea felt clear until you tried explaining it without notes.",
      },
      {
        icon: "🗣️",
        headline: "Become today's teacher",
        emphasisWord: "teacher",
        caption: "Today's pledge: explain one topic aloud before asking AI anything.",
      },
    ],
  },
  {
    day: 133,
    theme: "Interleaving Works",
    slides: [
      {
        icon: "🧩",
        headline: "Mix subjects to learn better",
        emphasisWord: "Mix",
        caption: "Switching between topics helps your brain recognize when each method applies.",
      },
      {
        icon: "🔄",
        headline: "Variety strengthens recall",
        emphasisWord: "Variety",
        caption: "Mixing Physics, Chemistry, and Math improves flexible thinking.",
      },
      {
        icon: "📄",
        headline: "Only practiced one pattern",
        emphasisWord: "Only",
        caption: "A different question style suddenly felt unfamiliar during the test.",
      },
      {
        icon: "🎯",
        headline: "Mix three question types",
        emphasisWord: "Mix",
        caption: "Today's pledge: solve different subjects instead of one long block.",
      },
    ],
  },
  {
    day: 134,
    theme: "Read the Question",
    slides: [
      {
        icon: "👀",
        headline: "Read before solving",
        emphasisWord: "Read",
        caption: "Many lost marks come from missing one important word in the question.",
      },
      {
        icon: "🔍",
        headline: "Keywords guide answers",
        emphasisWord: "Keywords",
        caption: "Words like 'not', 'except', and 'approximately' can change everything.",
      },
      {
        icon: "😬",
        headline: "Missed one tiny word",
        emphasisWord: "tiny",
        caption: "The method was correct, but the question asked something different.",
      },
      {
        icon: "📖",
        headline: "Underline the keywords",
        emphasisWord: "Underline",
        caption: "Today's pledge: pause and identify key words before solving.",
      },
    ],
  },
  {
    day: 135,
    theme: "Guessing Is Not Strategy",
    slides: [
      {
        icon: "🎲",
        headline: "Hope isn't a method",
        emphasisWord: "Hope",
        caption: "Smart guesses come from reasoning, not luck.",
      },
      {
        icon: "🧠",
        headline: "Elimination improves accuracy",
        emphasisWord: "Elimination",
        caption: "Removing impossible options increases your chances dramatically.",
      },
      {
        icon: "🤷",
        headline: "Clicked without thinking",
        emphasisWord: "thinking",
        caption: "A rushed guess cost marks that careful reasoning could have saved.",
      },
      {
        icon: "🎯",
        headline: "Reason before choosing",
        emphasisWord: "Reason",
        caption: "Today's pledge: eliminate wrong options before selecting an answer.",
      },
    ],
  },
  {
    day: 136,
    theme: "Recover From Mistakes",
    slides: [
      {
        icon: "🌊",
        headline: "One mistake changes nothing",
        emphasisWord: "nothing",
        caption: "A single error doesn't decide your paper. Your next decision does.",
      },
      {
        icon: "🧘",
        headline: "Reset after every question",
        emphasisWord: "Reset",
        caption: "Don't let one difficult problem steal marks from the next five.",
      },
      {
        icon: "😣",
        headline: "Couldn't stop thinking about it",
        emphasisWord: "thinking",
        caption: "One missed question distracted you through the rest of the exam.",
      },
      {
        icon: "➡️",
        headline: "Move to the next one",
        emphasisWord: "Move",
        caption: "Today's pledge: leave tough questions calmly and return later.",
      },
    ],
  },
  {
    day: 137,
    theme: "Healthy Competition",
    slides: [
      {
        icon: "🏁",
        headline: "Race against your yesterday",
        emphasisWord: "yesterday",
        caption: "Improving your own score matters more than matching someone else's.",
      },
      {
        icon: "📈",
        headline: "Personal bests motivate",
        emphasisWord: "Personal",
        caption: "Tracking your growth builds lasting confidence.",
      },
      {
        icon: "👥",
        headline: "Someone else's rank distracted me",
        emphasisWord: "rank",
        caption: "Comparing constantly made studying feel heavier than it needed to.",
      },
      {
        icon: "🌟",
        headline: "Beat your previous score",
        emphasisWord: "Beat",
        caption: "Today's pledge: aim for one small improvement over your last attempt.",
      },
    ],
  },
  {
    day: 138,
    theme: "Write to Remember",
    slides: [
      {
        icon: "✍️",
        headline: "Writing strengthens learning",
        emphasisWord: "Writing",
        caption: "Your brain processes ideas more deeply when your hand works too.",
      },
      {
        icon: "📝",
        headline: "Notes create memory anchors",
        emphasisWord: "anchors",
        caption: "Summarizing concepts in your own words improves recall.",
      },
      {
        icon: "📱",
        headline: "Only watched explanations",
        emphasisWord: "watched",
        caption: "Everything seemed clear until it was time to write the answer.",
      },
      {
        icon: "📖",
        headline: "Fill one fresh page",
        emphasisWord: "Fill",
        caption: "Today's pledge: handwrite one summary instead of only reading.",
      },
    ],
  },
  {
    day: 139,
    theme: "Progress Isn't Linear",
    slides: [
      {
        icon: "📉",
        headline: "Bad days still count",
        emphasisWord: "Bad",
        caption: "One difficult study session doesn't erase weeks of consistent effort.",
      },
      {
        icon: "🌤️",
        headline: "Learning has ups and downs",
        emphasisWord: "Learning",
        caption: "Improvement often looks messy before it becomes visible.",
      },
      {
        icon: "😔",
        headline: "One mock hurt my confidence",
        emphasisWord: "confidence",
        caption: "A single score made you forget how much progress you'd already made.",
      },
      {
        icon: "💪",
        headline: "Trust your improvement curve",
        emphasisWord: "Trust",
        caption: "Today's pledge: keep studying even if today's score isn't your best.",
      },
    ],
  },
  {
    day: 140,
    theme: "Become AI-Ready",
    slides: [
      {
        icon: "🤖",
        headline: "Smart learners guide AI",
        emphasisWord: "guide",
        caption: "The better your understanding, the better questions you ask AI.",
      },
      {
        icon: "🧠",
        headline: "Knowledge unlocks better prompts",
        emphasisWord: "Knowledge",
        caption: "AI becomes more powerful when your own thinking leads the conversation.",
      },
      {
        icon: "💬",
        headline: "Copied instead of questioning",
        emphasisWord: "questioning",
        caption: "The answer arrived, but curiosity never did.",
      },
      {
        icon: "🚀",
        headline: "Lead with your mind",
        emphasisWord: "Lead",
        caption: "Today's pledge: use AI to sharpen your ideas, never to replace them.",
      },
    ],
  },
  {
    day: 141,
    theme: "The Power of Retrieval",
    slides: [
      {
        icon: "🧠",
        headline: "Remember before reviewing",
        emphasisWord: "Remember",
        caption: "Your brain grows stronger when it tries to recall before seeing the answer.",
      },
      {
        icon: "🔄",
        headline: "Retrieval beats rereading",
        emphasisWord: "Retrieval",
        caption: "Actively recalling concepts strengthens memory much more than reading them again.",
      },
      {
        icon: "📖",
        headline: "Notes looked strangely familiar",
        emphasisWord: "familiar",
        caption: "Everything seemed known until the notebook closed and the answer disappeared.",
      },
      {
        icon: "✍️",
        headline: "Recall before revealing",
        emphasisWord: "Recall",
        caption: "Today's pledge: answer from memory first, then verify with AI or your notes.",
      },
    ],
  },
  {
    day: 142,
    theme: "Tiny Improvements",
    slides: [
      {
        icon: "📈",
        headline: "Improve just one percent",
        emphasisWord: "percent",
        caption: "Small gains every day become huge improvements over an entire school year.",
      },
      {
        icon: "🌱",
        headline: "Consistency multiplies growth",
        emphasisWord: "Consistency",
        caption: "Success often comes from repeating simple habits, not dramatic efforts.",
      },
      {
        icon: "😓",
        headline: "Expected instant results",
        emphasisWord: "instant",
        caption: "Giving up too early hid the progress already happening beneath the surface.",
      },
      {
        icon: "🚀",
        headline: "Win today's one percent",
        emphasisWord: "Win",
        caption: "Today's pledge: become slightly better than yesterday in one small way.",
      },
    ],
  },
  {
    day: 143,
    theme: "The Feynman Method",
    slides: [
      {
        icon: "👨‍🏫",
        headline: "Explain like a beginner",
        emphasisWord: "Explain",
        caption: "Simple explanations reveal true understanding better than complicated words.",
      },
      {
        icon: "💡",
        headline: "Simple means understood",
        emphasisWord: "Simple",
        caption: "If you can't explain it simply, you're still learning it.",
      },
      {
        icon: "😶",
        headline: "Sounded smart, felt confused",
        emphasisWord: "confused",
        caption: "Big words couldn't hide the missing understanding.",
      },
      {
        icon: "🗣️",
        headline: "Teach a younger student",
        emphasisWord: "Teach",
        caption: "Today's pledge: explain one concept as if teaching a Class 8 student.",
      },
    ],
  },
  {
    day: 144,
    theme: "The Power of Estimation",
    slides: [
      {
        icon: "🎯",
        headline: "Estimate before calculating",
        emphasisWord: "Estimate",
        caption: "A rough prediction helps you catch impossible answers before it's too late.",
      },
      {
        icon: "⚖️",
        headline: "Approximation catches mistakes",
        emphasisWord: "Approximation",
        caption: "Quick estimates help you spot calculation errors in Physics and Math.",
      },
      {
        icon: "📉",
        headline: "Answer looked impossible",
        emphasisWord: "impossible",
        caption: "The math worked, but the result should have raised questions.",
      },
      {
        icon: "📏",
        headline: "Predict the rough answer",
        emphasisWord: "Predict",
        caption: "Today's pledge: estimate first, calculate second, verify last.",
      },
    ],
  },
  {
    day: 145,
    theme: "The Testing Effect",
    slides: [
      {
        icon: "📝",
        headline: "Testing teaches learning",
        emphasisWord: "Testing",
        caption: "Practice quizzes strengthen memory better than another hour of reading.",
      },
      {
        icon: "🧠",
        headline: "Questions create retention",
        emphasisWord: "Questions",
        caption: "Every self-test tells your brain that the information matters.",
      },
      {
        icon: "📚",
        headline: "Studied without self-checking",
        emphasisWord: "self-checking",
        caption: "Confidence stayed high until the first mock test arrived.",
      },
      {
        icon: "✅",
        headline: "Quiz yourself daily",
        emphasisWord: "Quiz",
        caption: "Today's pledge: ask yourself five questions before ending your study session.",
      },
    ],
  },
  {
    day: 146,
    theme: "Learn From Every Mock",
    slides: [
      {
        icon: "📊",
        headline: "Mocks reveal opportunities",
        emphasisWord: "opportunities",
        caption: "A mock test isn't judging you. It's showing you where to improve.",
      },
      {
        icon: "🔍",
        headline: "Review beats repeating",
        emphasisWord: "Review",
        caption: "The biggest gains often come from analyzing mistakes, not solving more questions.",
      },
      {
        icon: "😞",
        headline: "Ignored the wrong answers",
        emphasisWord: "Ignored",
        caption: "The same mistakes quietly followed into the next test.",
      },
      {
        icon: "📓",
        headline: "Study your weakest topics",
        emphasisWord: "weakest",
        caption: "Today's pledge: review every mistake before celebrating every correct answer.",
      },
    ],
  },
  {
    day: 147,
    theme: "Attention Is Limited",
    slides: [
      {
        icon: "🔋",
        headline: "Attention needs recharging",
        emphasisWord: "Attention",
        caption: "Deep focus doesn't last forever. Protect it and use it wisely.",
      },
      {
        icon: "⏱️",
        headline: "Quality beats duration",
        emphasisWord: "Quality",
        caption: "Forty focused minutes can outperform two distracted hours.",
      },
      {
        icon: "📲",
        headline: "Multitasking slowed everything",
        emphasisWord: "Multitasking",
        caption: "Switching between apps quietly drained your concentration.",
      },
      {
        icon: "🎯",
        headline: "Focus on one task",
        emphasisWord: "Focus",
        caption: "Today's pledge: complete one study block with zero app switching.",
      },
    ],
  },
  {
    day: 148,
    theme: "The Value of Sleep",
    slides: [
      {
        icon: "🌙",
        headline: "Sleep completes learning",
        emphasisWord: "Sleep",
        caption: "Your brain organizes and strengthens memories while you rest.",
      },
      {
        icon: "💤",
        headline: "Rest improves recall",
        emphasisWord: "Rest",
        caption: "Better sleep often helps more than one extra hour of tired studying.",
      },
      {
        icon: "☕",
        headline: "Stayed awake too late",
        emphasisWord: "late",
        caption: "Extra study time disappeared because the next day's focus disappeared too.",
      },
      {
        icon: "🛌",
        headline: "Protect tomorrow's memory",
        emphasisWord: "Protect",
        caption: "Today's pledge: finish studying early enough to sleep well.",
      },
    ],
  },
  {
    day: 149,
    theme: "Own the Process",
    slides: [
      {
        icon: "🛤️",
        headline: "Fall in love with practice",
        emphasisWord: "practice",
        caption: "Students who enjoy learning worry less about results.",
      },
      {
        icon: "🌿",
        headline: "Processes create outcomes",
        emphasisWord: "Processes",
        caption: "Daily actions quietly shape tomorrow's report card.",
      },
      {
        icon: "😟",
        headline: "Only thought about marks",
        emphasisWord: "marks",
        caption: "Worry grew while actual learning slowed down.",
      },
      {
        icon: "🏁",
        headline: "Trust your daily system",
        emphasisWord: "Trust",
        caption: "Today's pledge: focus on today's work instead of tomorrow's score.",
      },
    ],
  },
  {
    day: 150,
    theme: "The Next Chapter",
    slides: [
      {
        icon: "📚",
        headline: "Learning never finishes",
        emphasisWord: "Learning",
        caption: "Every chapter mastered opens the door to an even bigger one.",
      },
      {
        icon: "🌅",
        headline: "Growth becomes your habit",
        emphasisWord: "Growth",
        caption: "After many honest study sessions, learning starts to feel natural.",
      },
      {
        icon: "🎓",
        headline: "Hard questions felt familiar",
        emphasisWord: "familiar",
        caption: "Not because they were easy, but because your thinking had become stronger.",
      },
      {
        icon: "🚀",
        headline: "Keep growing every day",
        emphasisWord: "growing",
        caption: "Today's pledge: use AI to explore possibilities while your own mind leads the way.",
      },
    ],
  },
  {
    day: 151,
    theme: "Think Like a Detective",
    slides: [
      {
        icon: "🕵️",
        headline: "Every clue matters",
        emphasisWord: "clue",
        caption: "Great problem solvers notice small details before rushing to solve.",
      },
      {
        icon: "🔎",
        headline: "Evidence guides answers",
        emphasisWord: "Evidence",
        caption: "Your brain makes better decisions when it collects clues instead of guessing.",
      },
      {
        icon: "📄",
        headline: "Skipped the important detail",
        emphasisWord: "important",
        caption: "One overlooked condition completely changed the correct answer.",
      },
      {
        icon: "✅",
        headline: "Collect clues first",
        emphasisWord: "Collect",
        caption: "Today's pledge: identify every given fact before solving.",
      },
    ],
  },
  {
    day: 152,
    theme: "Confidence Through Preparation",
    slides: [
      {
        icon: "🛡️",
        headline: "Preparation quiets fear",
        emphasisWord: "Preparation",
        caption: "Confidence isn't luck. It's the memory of many honest practice sessions.",
      },
      {
        icon: "🧠",
        headline: "Practice rewires confidence",
        emphasisWord: "rewires",
        caption: "Repeated success teaches your brain that difficult problems are manageable.",
      },
      {
        icon: "😟",
        headline: "Expected confidence overnight",
        emphasisWord: "overnight",
        caption: "Without enough preparation, self-belief struggled to appear.",
      },
      {
        icon: "🌟",
        headline: "Prepare with purpose",
        emphasisWord: "purpose",
        caption: "Today's pledge: build confidence through action, not hope.",
      },
    ],
  },
  {
    day: 153,
    theme: "Use Mistakes as Maps",
    slides: [
      {
        icon: "🗺️",
        headline: "Errors show the route",
        emphasisWord: "Errors",
        caption: "Every mistake points toward the next skill your brain needs.",
      },
      {
        icon: "📍",
        headline: "Weaknesses become directions",
        emphasisWord: "Weaknesses",
        caption: "Knowing where you struggle helps you improve faster.",
      },
      {
        icon: "🙈",
        headline: "Ignored repeated errors",
        emphasisWord: "repeated",
        caption: "The same misunderstanding quietly appeared in every mock test.",
      },
      {
        icon: "📒",
        headline: "Follow your mistake map",
        emphasisWord: "map",
        caption: "Today's pledge: revise one topic because of an error, not because it's easy.",
      },
    ],
  },
  {
    day: 154,
    theme: "Physics Loves Units",
    slides: [
      {
        icon: "📏",
        headline: "Units tell hidden stories",
        emphasisWord: "Units",
        caption: "Checking units often reveals mistakes before calculations are finished.",
      },
      {
        icon: "⚖️",
        headline: "Dimensions expose impossible answers",
        emphasisWord: "Dimensions",
        caption: "Unit analysis is one of the quickest ways to verify your reasoning.",
      },
      {
        icon: "📉",
        headline: "Forgot the final unit",
        emphasisWord: "unit",
        caption: "The number looked correct, but the answer still lost marks.",
      },
      {
        icon: "📐",
        headline: "Verify every unit",
        emphasisWord: "Verify",
        caption: "Today's pledge: check dimensions before submitting every Physics answer.",
      },
    ],
  },
  {
    day: 155,
    theme: "Chemistry Starts With Electrons",
    slides: [
      {
        icon: "⚛️",
        headline: "Electrons drive reactions",
        emphasisWord: "Electrons",
        caption: "Following electron movement makes many reactions easier to understand.",
      },
      {
        icon: "🔄",
        headline: "Electron flow explains change",
        emphasisWord: "flow",
        caption: "Many Chemistry chapters connect through simple electron behavior.",
      },
      {
        icon: "😕",
        headline: "Mechanisms felt random again",
        emphasisWord: "random",
        caption: "Without tracking electrons, reactions seemed impossible to predict.",
      },
      {
        icon: "🧪",
        headline: "Trace every electron",
        emphasisWord: "Trace",
        caption: "Today's pledge: follow electron movement before memorizing reactions.",
      },
    ],
  },
  {
    day: 156,
    theme: "Math Needs Verification",
    slides: [
      {
        icon: "✔️",
        headline: "Check before celebrating",
        emphasisWord: "Check",
        caption: "A quick verification can save marks from small calculation mistakes.",
      },
      {
        icon: "🔍",
        headline: "Verification builds accuracy",
        emphasisWord: "Verification",
        caption: "Rechecking one critical step often catches careless errors.",
      },
      {
        icon: "😬",
        headline: "Forgot to verify signs",
        emphasisWord: "signs",
        caption: "One negative sign quietly changed the entire answer.",
      },
      {
        icon: "🧮",
        headline: "Reserve one review minute",
        emphasisWord: "Reserve",
        caption: "Today's pledge: always leave time to verify your final solution.",
      },
    ],
  },
  {
    day: 157,
    theme: "Protect Your Energy",
    slides: [
      {
        icon: "🔋",
        headline: "Energy fuels learning",
        emphasisWord: "Energy",
        caption: "Your brain performs best when your body has enough rest, food, and water.",
      },
      {
        icon: "🥤",
        headline: "Hydration helps focus",
        emphasisWord: "Hydration",
        caption: "Even mild dehydration can make concentration more difficult.",
      },
      {
        icon: "😵",
        headline: "Studied while completely drained",
        emphasisWord: "drained",
        caption: "Hours passed, but very little actually stayed in memory.",
      },
      {
        icon: "💧",
        headline: "Recharge before studying",
        emphasisWord: "Recharge",
        caption: "Today's pledge: take care of your body so your brain can perform.",
      },
    ],
  },
  {
    day: 158,
    theme: "Learn Across Subjects",
    slides: [
      {
        icon: "🌉",
        headline: "Knowledge builds bridges",
        emphasisWord: "bridges",
        caption: "Concepts from one subject often make another subject easier to understand.",
      },
      {
        icon: "🔗",
        headline: "Ideas connect naturally",
        emphasisWord: "connect",
        caption: "Science and Math become stronger when you notice their shared patterns.",
      },
      {
        icon: "📚",
        headline: "Studied everything separately",
        emphasisWord: "separately",
        caption: "Missing connections made learning feel harder than it really was.",
      },
      {
        icon: "🧩",
        headline: "Connect today's lessons",
        emphasisWord: "Connect",
        caption: "Today's pledge: find one idea shared across two different subjects.",
      },
    ],
  },
  {
    day: 159,
    theme: "Review the Review",
    slides: [
      {
        icon: "🔁",
        headline: "Revise your revision",
        emphasisWord: "Revise",
        caption: "Your revision plan also deserves regular improvement.",
      },
      {
        icon: "📋",
        headline: "Track what really works",
        emphasisWord: "Track",
        caption: "Notice which study methods actually improve your scores.",
      },
      {
        icon: "🤷",
        headline: "Repeated ineffective habits",
        emphasisWord: "ineffective",
        caption: "More time didn't help because the study method never changed.",
      },
      {
        icon: "📊",
        headline: "Improve your study system",
        emphasisWord: "Improve",
        caption: "Today's pledge: replace one weak habit with a stronger one.",
      },
    ],
  },
  {
    day: 160,
    theme: "Think Beyond Exams",
    slides: [
      {
        icon: "🌍",
        headline: "Learning outlives school",
        emphasisWord: "Learning",
        caption: "The concepts you master today will help long after the exam ends.",
      },
      {
        icon: "🚀",
        headline: "Skills unlock opportunities",
        emphasisWord: "Skills",
        caption: "Strong thinking prepares you for college, careers, and life's challenges.",
      },
      {
        icon: "🎓",
        headline: "Solved with real understanding",
        emphasisWord: "understanding",
        caption: "This time, the answer came naturally because the concept truly belonged to you.",
      },
      {
        icon: "🤝",
        headline: "Keep growing with purpose",
        emphasisWord: "purpose",
        caption: "Today's pledge: learn for life, and let AI be your guide, not your substitute.",
      },
    ],
  },
  {
    day: 161,
    theme: "Read the Diagram",
    slides: [
      {
        icon: "📊",
        headline: "Pictures hold hidden answers",
        emphasisWord: "Pictures",
        caption: "Graphs, diagrams, and figures often reveal clues that long paragraphs cannot.",
      },
      {
        icon: "👁️",
        headline: "Visuals sharpen understanding",
        emphasisWord: "Visuals",
        caption: "Your brain processes images quickly, helping concepts stay longer.",
      },
      {
        icon: "📈",
        headline: "Ignored the graph completely",
        emphasisWord: "graph",
        caption: "The answer was already there, but the diagram never got your attention.",
      },
      {
        icon: "✅",
        headline: "Study every figure carefully",
        emphasisWord: "figure",
        caption: "Today's pledge: spend a few extra seconds understanding every diagram.",
      },
    ],
  },
  {
    day: 162,
    theme: "The Two-Minute Rule",
    slides: [
      {
        icon: "⏱️",
        headline: "Start for two minutes",
        emphasisWord: "two",
        caption: "Beginning is usually the hardest part. Two focused minutes often become twenty.",
      },
      {
        icon: "🚀",
        headline: "Starting beats delaying",
        emphasisWord: "Starting",
        caption: "Action creates momentum faster than waiting for inspiration.",
      },
      {
        icon: "📅",
        headline: "Kept waiting to begin",
        emphasisWord: "waiting",
        caption: "The perfect time never arrived, but deadlines certainly did.",
      },
      {
        icon: "💪",
        headline: "Start before excuses",
        emphasisWord: "Start",
        caption: "Today's pledge: study for just two minutes. Let momentum handle the rest.",
      },
    ],
  },
  {
    day: 163,
    theme: "Think in Questions",
    slides: [
      {
        icon: "❔",
        headline: "Questions unlock mastery",
        emphasisWord: "Questions",
        caption: "Every powerful concept begins with someone asking something meaningful.",
      },
      {
        icon: "🧠",
        headline: "Inquiry strengthens learning",
        emphasisWord: "Inquiry",
        caption: "The more questions you ask, the stronger your understanding becomes.",
      },
      {
        icon: "😶",
        headline: "Accepted every explanation",
        emphasisWord: "Accepted",
        caption: "Without questioning, weak understanding quietly stayed hidden.",
      },
      {
        icon: "💬",
        headline: "Challenge one concept",
        emphasisWord: "Challenge",
        caption: "Today's pledge: ask one thoughtful question before accepting any explanation.",
      },
    ],
  },
  {
    day: 164,
    theme: "Physics Through Experiments",
    slides: [
      {
        icon: "🧪",
        headline: "Experiments reveal truth",
        emphasisWord: "Experiments",
        caption: "Physics is discovered through observation, not just equations.",
      },
      {
        icon: "🔬",
        headline: "Testing builds intuition",
        emphasisWord: "Testing",
        caption: "Watching real experiments helps formulas become meaningful.",
      },
      {
        icon: "⚽",
        headline: "Never imagined the experiment",
        emphasisWord: "imagined",
        caption: "The theory stayed abstract because the real situation was never visualized.",
      },
      {
        icon: "🎥",
        headline: "Visualize every experiment",
        emphasisWord: "Visualize",
        caption: "Today's pledge: imagine the experiment before solving the numerical.",
      },
    ],
  },
  {
    day: 165,
    theme: "Chemistry Is About Balance",
    slides: [
      {
        icon: "⚖️",
        headline: "Balance creates clarity",
        emphasisWord: "Balance",
        caption: "Balanced equations reveal how matter behaves without disappearing.",
      },
      {
        icon: "⚛️",
        headline: "Conservation explains reactions",
        emphasisWord: "Conservation",
        caption: "Atoms rearrange. They don't magically appear or vanish.",
      },
      {
        icon: "😕",
        headline: "Forgot balancing completely",
        emphasisWord: "balancing",
        caption: "The chemistry made sense only after the equation became balanced.",
      },
      {
        icon: "📝",
        headline: "Balance before memorizing",
        emphasisWord: "Balance",
        caption: "Today's pledge: balance every equation before learning the reaction.",
      },
    ],
  },
  {
    day: 166,
    theme: "Math Is a Language",
    slides: [
      {
        icon: "🔤",
        headline: "Read mathematical language",
        emphasisWord: "language",
        caption: "Symbols communicate ideas just like words communicate stories.",
      },
      {
        icon: "🧩",
        headline: "Notation carries meaning",
        emphasisWord: "Notation",
        caption: "Understanding symbols reduces confusion during complex questions.",
      },
      {
        icon: "📄",
        headline: "Misread the notation",
        emphasisWord: "notation",
        caption: "One misunderstood symbol changed the entire solution.",
      },
      {
        icon: "✏️",
        headline: "Translate every symbol",
        emphasisWord: "Translate",
        caption: "Today's pledge: explain every important symbol in your own words.",
      },
    ],
  },
  {
    day: 167,
    theme: "Finish What You Start",
    slides: [
      {
        icon: "🏁",
        headline: "Completion builds discipline",
        emphasisWord: "Completion",
        caption: "Finished chapters create confidence that unfinished ones never can.",
      },
      {
        icon: "📚",
        headline: "Closing loops saves energy",
        emphasisWord: "Closing",
        caption: "Completing tasks reduces mental clutter and improves focus.",
      },
      {
        icon: "📂",
        headline: "Started five chapters together",
        emphasisWord: "five",
        caption: "None of them reached the finish line.",
      },
      {
        icon: "✅",
        headline: "Complete one unfinished task",
        emphasisWord: "Complete",
        caption: "Today's pledge: finish one pending topic before starting another.",
      },
    ],
  },
  {
    day: 168,
    theme: "Protect Your Morning",
    slides: [
      {
        icon: "🌅",
        headline: "Morning focus is precious",
        emphasisWord: "Morning",
        caption: "Your freshest thinking deserves your most important study work.",
      },
      {
        icon: "☀️",
        headline: "Fresh minds learn faster",
        emphasisWord: "Fresh",
        caption: "Many students solve difficult problems more effectively early in the day.",
      },
      {
        icon: "📱",
        headline: "Scrolled after waking up",
        emphasisWord: "Scrolled",
        caption: "Your best thinking hours quietly disappeared before studying began.",
      },
      {
        icon: "📖",
        headline: "Study before scrolling",
        emphasisWord: "Study",
        caption: "Today's pledge: complete one learning task before opening social media.",
      },
    ],
  },
  {
    day: 169,
    theme: "Build Mental Flexibility",
    slides: [
      {
        icon: "🧩",
        headline: "One method isn't enough",
        emphasisWord: "method",
        caption: "Strong learners know multiple ways to approach the same problem.",
      },
      {
        icon: "🔄",
        headline: "Flexible thinking adapts faster",
        emphasisWord: "Flexible",
        caption: "Different strategies prepare you for unexpected exam twists.",
      },
      {
        icon: "😣",
        headline: "First approach failed immediately",
        emphasisWord: "failed",
        caption: "Without another strategy, the problem stayed unsolved.",
      },
      {
        icon: "🛠️",
        headline: "Try another approach",
        emphasisWord: "another",
        caption: "Today's pledge: find two ways to solve one question.",
      },
    ],
  },
  {
    day: 170,
    theme: "Be the Author",
    slides: [
      {
        icon: "✍️",
        headline: "Write your own understanding",
        emphasisWord: "own",
        caption: "Knowledge becomes stronger when explained in your own words.",
      },
      {
        icon: "📖",
        headline: "Original thinking lasts",
        emphasisWord: "Original",
        caption: "Ideas you build yourself are easier to remember and apply.",
      },
      {
        icon: "📄",
        headline: "Copied every explanation exactly",
        emphasisWord: "Copied",
        caption: "The words stayed on paper, but the understanding never stayed in your mind.",
      },
      {
        icon: "🚀",
        headline: "Create your own notes",
        emphasisWord: "Create",
        caption: "Today's pledge: rewrite one concept using only your own words before checking AI.",
      },
    ],
  },
  {
    day: 171,
    theme: "Think Like an Examiner",
    slides: [
      {
        icon: "📝",
        headline: "What earns the marks",
        emphasisWord: "marks",
        caption: "Every question is designed to test a concept, not just your memory.",
      },
      {
        icon: "🎯",
        headline: "Intent reveals answers",
        emphasisWord: "Intent",
        caption: "Ask yourself what skill the examiner wants before solving.",
      },
      {
        icon: "😕",
        headline: "Answered the wrong thing",
        emphasisWord: "wrong",
        caption: "Your method was correct, but it solved a different question.",
      },
      {
        icon: "✅",
        headline: "Find the examiner's goal",
        emphasisWord: "goal",
        caption: "Today's pledge: identify what every question is really testing.",
      },
    ],
  },
  {
    day: 172,
    theme: "One Concept Many Questions",
    slides: [
      {
        icon: "🌳",
        headline: "One idea grows everywhere",
        emphasisWord: "idea",
        caption: "A single concept can appear in dozens of different question styles.",
      },
      {
        icon: "🔗",
        headline: "Core concepts multiply",
        emphasisWord: "Core",
        caption: "Master the foundation once, and many problems become easier.",
      },
      {
        icon: "📚",
        headline: "Learned examples, missed concepts",
        emphasisWord: "concepts",
        caption: "A new question looked difficult because only the examples were remembered.",
      },
      {
        icon: "🚀",
        headline: "Master one core idea",
        emphasisWord: "Master",
        caption: "Today's pledge: understand the principle before collecting more examples.",
      },
    ],
  },
  {
    day: 173,
    theme: "The Memory Trap",
    slides: [
      {
        icon: "🪤",
        headline: "Familiar isn't remembered",
        emphasisWord: "Familiar",
        caption: "Recognizing a page is different from recalling it during an exam.",
      },
      {
        icon: "🧠",
        headline: "Memory needs retrieval",
        emphasisWord: "retrieval",
        caption: "Trying to remember strengthens learning more than rereading.",
      },
      {
        icon: "📖",
        headline: "Highlighted every paragraph",
        emphasisWord: "Highlighted",
        caption: "The pages became colorful, but the concepts stayed blurry.",
      },
      {
        icon: "✍️",
        headline: "Test memory without hints",
        emphasisWord: "memory",
        caption: "Today's pledge: close the book and write everything you can recall.",
      },
    ],
  },
  {
    day: 174,
    theme: "Physics Through Estimation",
    slides: [
      {
        icon: "📏",
        headline: "Sense-check every result",
        emphasisWord: "Sense-check",
        caption: "Ask whether your final answer makes physical sense before moving on.",
      },
      {
        icon: "⚡",
        headline: "Reality verifies equations",
        emphasisWord: "Reality",
        caption: "Numbers should agree with how the real world behaves.",
      },
      {
        icon: "🚗",
        headline: "Car moved faster than light",
        emphasisWord: "light",
        caption: "The calculation finished, but the answer clearly couldn't be true.",
      },
      {
        icon: "🔍",
        headline: "Question impossible answers",
        emphasisWord: "Question",
        caption: "Today's pledge: ask if your answer is realistic before accepting it.",
      },
    ],
  },
  {
    day: 175,
    theme: "Chemistry Beyond Memorization",
    slides: [
      {
        icon: "🧪",
        headline: "Properties explain behavior",
        emphasisWord: "Properties",
        caption: "Understanding why substances behave differently makes Chemistry much easier.",
      },
      {
        icon: "⚛️",
        headline: "Structure predicts reactions",
        emphasisWord: "Structure",
        caption: "The arrangement of atoms often explains the outcome before memorization does.",
      },
      {
        icon: "📄",
        headline: "Remembered names, forgot reasons",
        emphasisWord: "reasons",
        caption: "The reaction name stayed, but its purpose disappeared.",
      },
      {
        icon: "🧬",
        headline: "Study the molecular structure",
        emphasisWord: "molecular",
        caption: "Today's pledge: understand how structure affects chemical behavior.",
      },
    ],
  },
  {
    day: 176,
    theme: "Math Through Reverse Thinking",
    slides: [
      {
        icon: "↩️",
        headline: "Work backward sometimes",
        emphasisWord: "backward",
        caption: "Starting from the answer can reveal a faster path to the solution.",
      },
      {
        icon: "🧩",
        headline: "Reverse thinking unlocks ideas",
        emphasisWord: "Reverse",
        caption: "Changing your perspective often reveals patterns you missed.",
      },
      {
        icon: "🤯",
        headline: "One direction wasn't enough",
        emphasisWord: "direction",
        caption: "The problem became easier after looking at it differently.",
      },
      {
        icon: "🔄",
        headline: "Flip the problem around",
        emphasisWord: "Flip",
        caption: "Today's pledge: try a reverse approach before asking for help.",
      },
    ],
  },
  {
    day: 177,
    theme: "Build Exam Endurance",
    slides: [
      {
        icon: "🏃",
        headline: "Train your concentration",
        emphasisWord: "concentration",
        caption: "Strong focus for three hours is built through regular practice.",
      },
      {
        icon: "⏳",
        headline: "Endurance grows gradually",
        emphasisWord: "Endurance",
        caption: "Long study sessions become easier when increased step by step.",
      },
      {
        icon: "😩",
        headline: "Energy faded too soon",
        emphasisWord: "Energy",
        caption: "The last section felt hardest because stamina wasn't practiced.",
      },
      {
        icon: "🏁",
        headline: "Finish the full session",
        emphasisWord: "Finish",
        caption: "Today's pledge: complete your planned study block without quitting early.",
      },
    ],
  },
  {
    day: 178,
    theme: "Review Smartly",
    slides: [
      {
        icon: "📂",
        headline: "Sort before revising",
        emphasisWord: "Sort",
        caption: "Divide topics into strong, medium, and weak before starting revision.",
      },
      {
        icon: "📊",
        headline: "Priorities save time",
        emphasisWord: "Priorities",
        caption: "Focusing on weak areas usually improves scores the fastest.",
      },
      {
        icon: "📚",
        headline: "Revised only favorite chapters",
        emphasisWord: "favorite",
        caption: "Comfortable topics improved while difficult ones stayed difficult.",
      },
      {
        icon: "🎯",
        headline: "Attack your weak topics",
        emphasisWord: "Attack",
        caption: "Today's pledge: spend extra time where improvement matters most.",
      },
    ],
  },
  {
    day: 179,
    theme: "The Growth Journal",
    slides: [
      {
        icon: "📔",
        headline: "Record every breakthrough",
        emphasisWord: "Record",
        caption: "Writing your progress helps you notice improvements that are easy to forget.",
      },
      {
        icon: "🌱",
        headline: "Reflection accelerates improvement",
        emphasisWord: "Reflection",
        caption: "Looking back helps you move forward with better strategies.",
      },
      {
        icon: "🤔",
        headline: "Forgot last month's progress",
        emphasisWord: "progress",
        caption: "One difficult day made months of improvement feel invisible.",
      },
      {
        icon: "🖊️",
        headline: "Write today's lesson",
        emphasisWord: "Write",
        caption: "Today's pledge: note one thing you learned and one thing to improve.",
      },
    ],
  },
  {
    day: 180,
    theme: "Become a Lifelong Learner",
    slides: [
      {
        icon: "🌍",
        headline: "Learning never expires",
        emphasisWord: "Learning",
        caption: "Exams end, but curiosity and knowledge continue opening new doors.",
      },
      {
        icon: "🚀",
        headline: "Curiosity drives the future",
        emphasisWord: "Curiosity",
        caption: "The habit of learning will serve you far beyond school.",
      },
      {
        icon: "🎓",
        headline: "Questions became opportunities",
        emphasisWord: "opportunities",
        caption: "Difficult problems stopped feeling like obstacles and started feeling like practice.",
      },
      {
        icon: "🤝",
        headline: "Stay curious forever",
        emphasisWord: "curious",
        caption: "Today's pledge: let AI expand your curiosity while your own thinking leads every journey.",
      },
    ],
  },
];
