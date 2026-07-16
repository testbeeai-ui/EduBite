/** Lightweight Web Audio blips — no external assets. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gain = 0.08,
) {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  tap: (on: boolean) => on && tone(520, 0.06, "triangle", 0.05),
  correct: (on: boolean) => {
    if (!on) return;
    tone(660, 0.08, "sine", 0.07);
    setTimeout(() => tone(880, 0.1, "sine", 0.07), 60);
  },
  wrong: (on: boolean) => on && tone(180, 0.15, "sawtooth", 0.05),
  win: (on: boolean) => {
    if (!on) return;
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => tone(f, 0.12, "sine", 0.08), i * 80),
    );
  },
  lose: (on: boolean) => {
    if (!on) return;
    tone(300, 0.12, "triangle", 0.06);
    setTimeout(() => tone(200, 0.2, "triangle", 0.06), 100);
  },
  tick: (on: boolean) => on && tone(900, 0.03, "square", 0.03),
};
