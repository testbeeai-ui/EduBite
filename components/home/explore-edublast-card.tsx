"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { EDUBLAST_URL } from "@/data/config";
import { cn } from "@/lib/utils";

export function ExploreEdublastCard({ className }: { className?: string }) {
  return (
    <motion.a
      href={EDUBLAST_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-xl sm:ml-auto",
        "border border-teal/20 bg-[var(--surface)]/90",
        "hover:border-teal/40 hover:bg-teal/[0.06]",
        "transition-colors duration-200",
        className,
      )}
    >
      <div className="relative flex items-center gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-teal/90 leading-none">
            Explore More
          </p>
          <p className="font-display font-extrabold text-[15px] tracking-tight leading-tight mt-1">
            <span className="text-[var(--text)]">Edu</span>
            <span className="bg-gradient-to-r from-teal to-blue bg-clip-text text-transparent">
              Blast.in
            </span>
          </p>
          <p className="text-[10px] text-[var(--text-dim)] mt-1 leading-snug hidden sm:block">
            Lessons &amp; exam prep →
          </p>
        </div>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-teal/20 bg-teal/[0.08] text-teal group-hover:bg-teal/15 transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      </div>
    </motion.a>
  );
}
