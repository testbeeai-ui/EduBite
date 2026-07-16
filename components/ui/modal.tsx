"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ModalOverlay({ open, onClose, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-[rgba(5,7,11,0.78)] backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn("w-full", className)}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ModalCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: "am" | "pm" | "none";
}

export function ModalCard({ children, className, accent = "none" }: ModalCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-[30px] max-w-[420px] mx-auto shadow-[0_25px_60px_rgba(0,0,0,0.55)]",
        accent === "am" && "border-t-[3px] border-t-amber",
        accent === "pm" && "border-t-[3px] border-t-purple",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "font-display font-bold text-[15px] my-[30px] mb-[14px] flex items-center gap-[9px]",
        className,
      )}
    >
      {children}
      <span className="flex-1 h-px bg-[var(--line)]" />
    </h3>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--gold)] mb-[10px] before:content-['●'] before:text-[7px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ViewHeader({
  eyebrow,
  title,
  subtitle,
  compact,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  compact?: boolean;
}) {
  return (
    <>
      <Eyebrow className={compact ? "mb-1 text-[10px]" : undefined}>{eyebrow}</Eyebrow>
      <h1
        className={cn(
          "font-display font-extrabold tracking-tight",
          compact ? "text-xl sm:text-[22px] mb-0.5" : "text-[26px] mb-[6px]",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "text-[var(--text-dim)] max-w-[560px]",
          compact
            ? "text-[11.5px] mb-2 leading-snug line-clamp-1"
            : "text-[13.5px] mb-7 leading-relaxed",
        )}
      >
        {subtitle}
      </p>
    </>
  );
}
