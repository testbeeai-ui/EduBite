"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  className,
  barClassName,
  animated = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "h-2 rounded-[5px] bg-[var(--line)] overflow-hidden",
        className,
      )}
    >
      {animated ? (
        <motion.div
          className={cn(
            "h-full bg-gradient-to-r from-teal to-blue",
            barClassName,
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      ) : (
        <div
          className={cn(
            "h-full bg-gradient-to-r from-teal to-blue",
            barClassName,
          )}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}
