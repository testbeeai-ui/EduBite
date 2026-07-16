import type { GyanCard } from "@/lib/types";

export const GYAN_CARDS: GyanCard[] = [
  {
    id: "velocity-vs-speed",
    title: "Why velocity, not speed?",
    sub: "90-sec bonus concept · unlocked by today's dose",
    unlocked: true,
    body: "Speed is a scalar — it only tells you how fast. Velocity is a vector — it tells you how fast AND in which direction. That direction is exactly why velocity can be zero at the top of a throw even though the ball hasn't stopped moving through time.",
  },
  {
    id: "escape-velocity",
    title: "Escape velocity, explained",
    sub: "Unlocks at Level 5",
    unlocked: false,
    body: "Escape velocity is the minimum speed an object needs to break free from a planet's gravitational pull without further propulsion. For Earth, it's about 11.2 km/s — but reaching orbit is different from escaping entirely.",
  },
  {
    id: "jee-traps",
    title: "JEE trap questions on motion",
    sub: "Unlocks with a 20-day streak",
    unlocked: false,
    body: "Common traps include confusing average speed with average velocity, forgetting sign conventions in 1D motion, and mixing up displacement with distance travelled.",
  },
];
