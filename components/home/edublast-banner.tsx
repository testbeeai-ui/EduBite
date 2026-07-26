"use client";

import Image from "next/image";
import { EDUBLAST_LINKS } from "@/data/config";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    tone: "teal" as const,
    icon: "ti ti-social",
    title: "Educational Social Media",
    sub: "Post · Learn · Earn RDM",
    href: EDUBLAST_LINKS.community,
  },
  {
    tone: "purple" as const,
    icon: "ti ti-help-circle",
    title: "Gyan++ DoubtWall",
    sub: "AI Tutor · Instant Answers",
    href: EDUBLAST_LINKS.gyan,
  },
  {
    tone: "amber" as const,
    icon: "ti ti-coin",
    title: "Rewards for Study",
    sub: "Earn · Streaks · Prizes",
    href: EDUBLAST_LINKS.playHub,
  },
  {
    tone: "blue" as const,
    icon: "ti ti-users",
    title: "Learning Buddy",
    sub: "Study Together · Grow Faster",
    href: EDUBLAST_LINKS.learningBuddy,
  },
  {
    tone: "pink" as const,
    icon: "ti ti-heart",
    title: "Unlock Edufundz",
    sub: "₹3K–₹50K Grants · No Test",
    href: EDUBLAST_LINKS.edufundz,
  },
] as const;

const TONE_CLASS = {
  teal: "bg-[rgba(29,158,117,0.14)] text-[#1D9E75]",
  purple: "bg-[rgba(127,119,221,0.14)] text-[#7F77DD]",
  amber: "bg-[rgba(239,159,39,0.14)] text-[#EF9F27]",
  blue: "bg-[rgba(55,138,221,0.14)] text-[#378ADD]",
  pink: "bg-[rgba(212,83,126,0.14)] text-[#D4537E]",
} as const;

export function EdublastBanner({ className }: { className?: string }) {
  return (
    <aside
      aria-label="EduBlast"
      className={cn(
        "relative w-full lg:w-[216px] lg:shrink-0 overflow-hidden rounded-[18px]",
        "border border-white/[0.07] bg-[#141A23]",
        "bg-[linear-gradient(165deg,rgba(29,158,117,0.16)_0%,rgba(22,26,34,0.4)_32%,#141A23_55%)]",
        "px-4 pt-[22px] pb-[18px] lg:sticky lg:top-5",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#1D9E75,#EF9F27,#7F77DD,#378ADD,#D4537E)]"
        aria-hidden
      />

      <a
        href={EDUBLAST_LINKS.community}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-3.5 inline-flex items-center transition-opacity hover:opacity-90"
        aria-label="EduBlast Community"
      >
        <Image
          src="/images/logo-2.png"
          alt="EduBlast"
          width={180}
          height={36}
          className="h-8 w-auto max-w-[180px] object-contain object-left"
          priority
        />
      </a>

      <p className="mb-3 text-[11.5px] leading-relaxed text-[#8B96A8]">
        Deep study for <b className="font-semibold text-[#1D9E75]">Class XI &amp; XII</b>{" "}
        — India&apos;s AI‑powered learning social.
      </p>

      <div className="mb-2.5 flex flex-wrap gap-1.5">
        <span className="rounded-full border border-[rgba(29,158,117,0.3)] px-2 py-1 text-[9.5px] font-bold tracking-wide text-[#1D9E75]">
          PHYSICS
        </span>
        <span className="rounded-full border border-[rgba(239,159,39,0.3)] px-2 py-1 text-[9.5px] font-bold tracking-wide text-[#EF9F27]">
          CHEMISTRY
        </span>
        <span className="rounded-full border border-[rgba(55,138,221,0.3)] px-2 py-1 text-[9.5px] font-bold tracking-wide text-[#378ADD]">
          MATHS
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[10.5px] text-[#5C6577]">
        <span className="font-bold text-[#7F77DD]">JEE</span>
        <span className="h-0.5 w-0.5 rounded-full bg-[#5C6577]" aria-hidden />
        <span className="font-bold text-[#7F77DD]">KCET</span>
        <span className="h-0.5 w-0.5 rounded-full bg-[#5C6577]" aria-hidden />
        <span className="font-bold text-[#7F77DD]">CBSE</span>
      </div>

      <div className="my-3.5 h-px bg-white/[0.045]" aria-hidden />

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
        {FEATURES.map((f) => (
          <a
            key={f.title}
            href={f.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2.5 rounded-[11px] border border-white/[0.045] bg-white/[0.015] px-2.5 py-2 transition-transform hover:translate-x-0.5 hover:border-white/[0.07] sm:flex-1 sm:basis-[45%] lg:basis-auto"
          >
            <span
              className={cn(
                "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] text-xs",
                TONE_CLASS[f.tone],
              )}
            >
              <i className={cn(f.icon, "text-[12px] leading-none")} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[11.5px] font-bold leading-snug text-[#EAEEF3]">
                {f.title}
              </span>
              <span className="mt-0.5 block text-[9px] uppercase tracking-[0.03em] text-[#5C6577]">
                {f.sub}
              </span>
            </span>
          </a>
        ))}
      </div>

      <p className="mt-4 border-t border-white/[0.045] pt-3 text-center text-[9.5px] text-[#5C6577]">
        <a
          href={EDUBLAST_LINKS.community}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#8B96A8] hover:text-[#1D9E75]"
        >
          edublast.in
        </a>{" "}
        · your daily study circle
      </p>
    </aside>
  );
}
