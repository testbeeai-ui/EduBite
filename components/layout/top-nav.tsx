"use client";

import { motion } from "framer-motion";
import { NAV_ITEMS } from "@/data/config";
import type { AppView } from "@/lib/types";
import { cn } from "@/lib/utils";

function NavEmoji({
  emoji,
  accent,
  active,
  size = "md",
}: {
  emoji: string;
  accent: string;
  active: boolean;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[7px] leading-none shrink-0",
        "bg-gradient-to-br border shadow-sm transition-all duration-150",
        size === "sm" ? "w-8 h-8 text-[15px]" : "w-[22px] h-[22px] text-[13px]",
        accent,
        active
          ? "border-teal/35 ring-1 ring-teal/20"
          : "border-white/[0.06] opacity-90",
      )}
      aria-hidden
    >
      {emoji === "⌂" ? (
        <span
          className={cn(
            "font-bold leading-none text-teal",
            size === "sm" ? "text-base" : "text-[15px]",
          )}
        >
          ⌂
        </span>
      ) : (
        emoji
      )}
    </span>
  );
}

interface TopNavProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

/** Desktop / large-tablet horizontal nav — labels collapse by breakpoint. */
export function TopNav({ activeView, onNavigate }: TopNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto overscroll-x-contain scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = activeView === item.id;
        const short = item.shortLabel;

        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(item.id as AppView)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full shrink-0 transition-colors duration-150",
              "px-2 py-[7px] lg:px-2.5",
              "text-[11px] lg:text-xs font-semibold",
              active
                ? "text-[var(--text)]"
                : "text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-white/[0.04]",
            )}
          >
            {active ? (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-full bg-[var(--surface-2)] border border-teal/20 shadow-[0_1px_12px_rgba(45,212,191,0.1)]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-1.5">
              <NavEmoji emoji={item.emoji} accent={item.accent} active={active} />
              {/* md–lg: short / terse label; xl+: full label */}
              <span className="relative z-10 hidden lg:inline xl:hidden">
                {short}
              </span>
              <span className="relative z-10 hidden xl:inline">{item.label}</span>
            </span>
            {active ? (
              <span className="absolute bottom-0 left-1/2 z-10 h-[2px] w-3.5 -translate-x-1/2 rounded-full bg-teal" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export { NavEmoji };
