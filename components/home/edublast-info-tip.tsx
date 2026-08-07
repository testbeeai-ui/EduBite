"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Gyan++",
    body: "Social doubt space — post, get peer/mentor answers, upvote, learn together.",
    tone: "teal",
  },
  {
    title: "Question Bank",
    body: "Past papers, mocks, chapter quizzes, daily challenges, difficulty sets.",
    tone: "blue",
  },
  {
    title: "Smart Practice",
    body: "Instant feedback, explanations, tracking, weak-topic recommendations.",
    tone: "purple",
  },
  {
    title: "Gamified Learning",
    body: "Streaks, badges, leaderboards, and rewards that keep daily momentum.",
    tone: "amber",
  },
  {
    title: "Edufund Unlock",
    body: "Benefits, scholarships, and premium support via consistency & achievements.",
    tone: "pink",
  },
] as const;

const TONE = {
  teal: "bg-teal/15 text-teal ring-teal/25",
  blue: "bg-[#378ADD]/15 text-[#7EB6F0] ring-[#378ADD]/25",
  purple: "bg-[#7F77DD]/15 text-[#A8A1F0] ring-[#7F77DD]/25",
  amber: "bg-[#EF9F27]/15 text-[#F0C06A] ring-[#EF9F27]/25",
  pink: "bg-[#D4537E]/15 text-[#E98AA8] ring-[#D4537E]/25",
} as const;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type Props = {
  className?: string;
  /** `sm` fits beside chips / small labels; default matches CTA button height. */
  size?: "default" | "sm";
};

/**
 * Info control beside edublast.in CTAs.
 * Hover opens a centered panel with a soft professional enter/exit motion.
 */
export function EdublastInfoTip({ className, size = "default" }: Props) {
  const compact = size === "sm";
  const tipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearTimers = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  /** Slight open delay so accidental hovers don’t flash. */
  const requestOpen = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) return;
    if (openTimer.current) return;
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, 120);
  };

  const openNow = () => {
    clearTimers();
    setOpen(true);
  };

  const closeNow = () => {
    clearTimers();
    setOpen(false);
  };

  const scheduleClose = () => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) return;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, 180);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      const panel = document.getElementById(tipId);
      if (panel?.contains(target)) return;
      clearTimers();
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        clearTimers();
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, tipId]);

  useEffect(() => () => clearTimers(), []);

  const panel =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open ? (
          <div
            key="edublast-info"
            className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 pointer-events-none"
            role="presentation"
          >
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-[3px] pointer-events-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              onMouseEnter={openNow}
              onMouseLeave={scheduleClose}
              aria-hidden
            />

            <motion.div
              id={tipId}
              role="tooltip"
              onMouseEnter={openNow}
              onMouseLeave={scheduleClose}
              initial={{ opacity: 0, scale: 0.94, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, y: 8, filter: "blur(4px)" }}
              transition={{
                duration: 0.38,
                ease: EASE_OUT,
                opacity: { duration: 0.3 },
                filter: { duration: 0.32 },
              }}
              className={cn(
                "pointer-events-auto relative z-10 w-full",
                "max-w-[min(92vw,40rem)]",
                "rounded-[22px] border border-white/[0.1]",
                "bg-[linear-gradient(165deg,rgba(29,158,117,0.12)_0%,rgba(16,21,29,0.98)_28%,#0e131a_100%)]",
                "shadow-[0_32px_90px_rgba(0,0,0,0.72),0_0_0_1px_rgba(45,212,191,0.08)]",
                "overflow-hidden will-change-transform",
              )}
            >
              <div
                className="h-[2px] w-full bg-gradient-to-r from-teal via-[#378ADD] to-[#7F77DD]"
                aria-hidden
              />

              <div className="px-5 py-5 sm:px-7 sm:py-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08, duration: 0.35, ease: EASE_OUT }}
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                      "border border-teal/25 bg-teal/10 text-teal",
                      "shadow-[0_0_24px_rgba(45,212,191,0.12)]",
                    )}
                    aria-hidden
                  >
                    <Info className="h-[18px] w-[18px]" strokeWidth={2.4} />
                  </motion.span>

                  <div className="min-w-0 flex-1">
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.32, ease: EASE_OUT }}
                      className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-teal"
                    >
                      About the platform
                    </motion.p>
                    <motion.h4
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14, duration: 0.34, ease: EASE_OUT }}
                      className="mt-1 font-display text-[22px] sm:text-[24px] font-extrabold tracking-tight text-[#F2F5F8]"
                    >
                      Edublast
                    </motion.h4>
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.34, ease: EASE_OUT }}
                      className="mt-2 max-w-[38rem] text-[13px] sm:text-[13.5px] leading-relaxed text-[#93A0B3]"
                    >
                      AI-driven educational social + learning for Class XI
                      &amp; XII — learn consistently, compete confidently, and
                      prepare smarter for boards, KCET, JEE, NEET, and more.
                      Social energy meets structured mastery.
                    </motion.p>
                  </div>

                  <motion.button
                    type="button"
                    aria-label="Close"
                    onClick={closeNow}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.12, duration: 0.3, ease: EASE_OUT }}
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      "border border-white/[0.1] bg-white/[0.04] text-[#8B96A8]",
                      "transition-colors duration-200",
                      "hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50",
                    )}
                  >
                    <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </motion.button>
                </div>

                <div className="mt-5 sm:mt-6">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.22, duration: 0.3 }}
                    className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#C5CEDA]"
                  >
                    Key Features
                  </motion.p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {FEATURES.map((feature, index) => (
                      <motion.li
                        key={feature.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.24 + index * 0.045,
                          duration: 0.34,
                          ease: EASE_OUT,
                        }}
                        className={cn(
                          "flex gap-3 rounded-xl border border-white/[0.06]",
                          "bg-white/[0.025] px-3.5 py-3",
                          "transition-colors hover:border-white/[0.1] hover:bg-white/[0.04]",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ring-1",
                            TONE[feature.tone],
                          )}
                          aria-hidden
                        >
                          {feature.title.slice(0, 1)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold leading-snug text-[#EAEEF3]">
                            {feature.title}
                          </p>
                          <p className="mt-0.5 text-[11.5px] leading-relaxed text-[#7E8B9E]">
                            {feature.body}
                          </p>
                        </div>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.48, duration: 0.35 }}
                  className="mt-5 border-t border-white/[0.06] pt-4 text-[12px] leading-relaxed text-[#667484]"
                >
                  Core promise: make serious learning feel social, rewarding,
                  and habit-forming — so students return every day and improve
                  measurably.
                </motion.p>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <span
      ref={rootRef}
      className={cn("relative inline-flex shrink-0 items-center", className)}
      onMouseEnter={requestOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label="About Edublast"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onFocus={requestOpen}
        onBlur={scheduleClose}
        onClick={() => {
          if (
            typeof window !== "undefined" &&
            window.matchMedia("(hover: none)").matches
          ) {
            clearTimers();
            setOpen((value) => !value);
          }
        }}
        className={cn(
          "flex items-center justify-center rounded-full",
          compact ? "h-7 w-7" : "h-9 w-9",
          "border border-white/[0.1] bg-white/[0.04] text-[#8B96A8]",
          "transition-all duration-200",
          "hover:border-teal/40 hover:bg-teal/10 hover:text-teal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50",
          open && "border-teal/40 bg-teal/10 text-teal",
        )}
      >
        <Info
          className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>
      {panel}
    </span>
  );
}
