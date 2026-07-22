"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    accent: "#1D9E75",
    icon: "ti ti-social",
    title: ["Educational", "Social Media"],
    sub: "Post · Learn · Earn RDM",
    iconClass: "bg-[rgba(29,158,117,0.14)] border-[rgba(29,158,117,0.3)] text-[#1D9E75]",
  },
  {
    accent: "#7F77DD",
    icon: "ti ti-help-circle",
    title: ["Gyan++", "DoubtWall"],
    sub: "AI tutor · instant answers",
    iconClass: "bg-[rgba(127,119,221,0.14)] border-[rgba(127,119,221,0.3)] text-[#7F77DD]",
  },
  {
    accent: "#EF9F27",
    icon: "ti ti-coin",
    title: ["Rewards", "for Study"],
    sub: "Earn RDM · streaks · prizes",
    iconClass: "bg-[rgba(239,159,39,0.14)] border-[rgba(239,159,39,0.3)] text-[#EF9F27]",
  },
  {
    accent: "#378ADD",
    icon: "ti ti-users",
    title: ["Learning", "Buddy"],
    sub: "Study together · grow faster",
    iconClass: "bg-[rgba(55,138,221,0.14)] border-[rgba(55,138,221,0.3)] text-[#378ADD]",
  },
  {
    accent: "#D4537E",
    icon: "ti ti-heart",
    title: ["Unlock", "Edufundz"],
    sub: "₹3K–₹50K grants · no test",
    iconClass: "bg-[rgba(212,83,126,0.14)] border-[rgba(212,83,126,0.3)] text-[#D4537E]",
  },
] as const;

function FeatureCard({
  accent,
  icon,
  title,
  sub,
  iconClass,
  className,
}: (typeof FEATURES)[number] & { className?: string }) {
  return (
    <a
      href="https://edublast.in"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "relative flex flex-col justify-center px-3.5 py-4 sm:px-3.5 sm:py-4",
        "border-r border-[#1a2d48] last:border-r-0",
        "transition-colors hover:bg-white/[0.04] block",
        className,
      )}
    >
      <span
        className="absolute inset-x-0 top-0 h-[2.5px]"
        style={{ background: accent }}
        aria-hidden
      />
      <div
        className={cn(
          "mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border",
          iconClass,
        )}
      >
        <i className={cn(icon, "text-lg leading-none")} aria-hidden />
      </div>
      <div className="text-xs font-bold leading-tight text-[#E8EAF0]">
        {title[0]}
        <br />
        {title[1]}
      </div>
      <div className="mt-1 text-[9.5px] uppercase leading-snug tracking-wide text-[#5C6480]">
        {sub}
      </div>
    </a>
  );
}

export function EdublastBanner() {
  return (
    <section
      aria-label="EduBlast banner"
      className="relative mb-4 overflow-hidden rounded-[14px] border border-[#1e3352] bg-gradient-to-br from-[#0b1622] via-[#0e1c2e] to-[#091a18]"
      suppressHydrationWarning
    >
      <div
        className="pointer-events-none absolute -left-10 -top-[60px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(29,158,117,0.12)_0%,transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 right-20 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(127,119,221,0.1)_0%,transparent_65%)]"
        aria-hidden
      />

      <div className="relative z-[1] grid grid-cols-1 lg:grid-cols-[minmax(0,270px)_1fr]">
        <div className="flex flex-col justify-center border-b border-[#1e3352] px-5 py-4 lg:border-b-0 lg:border-r lg:py-0 lg:pl-[22px] lg:pr-5">
          <div className="mb-1.5 flex items-center gap-2">
            <Image
              src="/images/logo-2.png"
              alt="EduBlast"
              width={180}
              height={28}
              className="h-7 max-w-[200px] object-contain object-left"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
          <p className="text-[11.5px] font-bold leading-snug text-[#E8EAF0]">
            Deep study for <span className="text-[#1D9E75]">Class XI &amp; XII</span>
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[rgba(55,138,221,0.35)] bg-[rgba(55,138,221,0.15)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#85B7EB]">
              Physics
            </span>
            <span className="rounded-full border border-[rgba(29,158,117,0.35)] bg-[rgba(29,158,117,0.15)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#9FE1CB]">
              Chemistry
            </span>
            <span className="rounded-full border border-[rgba(239,159,39,0.35)] bg-[rgba(239,159,39,0.15)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#FAC775]">
              Maths
            </span>
            <span className="rounded-full border border-[rgba(127,119,221,0.35)] bg-[rgba(127,119,221,0.15)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#AFA9EC]">
              JEE · KCET · CBSE
            </span>
          </div>
          <p className="mt-1.5 text-[10px] text-[#5C6480]">
            India&apos;s AI-powered learning social —{" "}
            <span className="font-semibold text-[#1D9E75]">edublast.in</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.icon} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
