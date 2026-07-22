"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function ModalOverlay({ open, onClose, children, className }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn("w-full my-auto flex justify-center pointer-events-auto", className)}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
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
        "bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-6 sm:p-7 max-w-[420px] w-full mx-auto shadow-[0_25px_60px_rgba(0,0,0,0.55)]",
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
        "inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--gold)] mb-[10px] before:content-[''] before:block before:w-1.5 before:h-1.5 before:rounded-full before:bg-current before:shrink-0",
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
    <header className="text-left">
      <Eyebrow
        className={
          compact
            ? "mb-1.5 text-[10.5px] tracking-[0.16em] text-[var(--amber)]"
            : undefined
        }
      >
        {eyebrow}
      </Eyebrow>
      <h1
        className={cn(
          "font-display font-extrabold tracking-tight text-[var(--text)]",
          compact
            ? "text-[28px] sm:text-[32px] leading-none mb-1.5"
            : "text-[26px] mb-[6px]",
        )}
      >
        {title}
      </h1>
      <p
        className={cn(
          "text-[var(--text-dim)] max-w-[560px]",
          compact
            ? "text-[13.5px] mb-4 leading-snug"
            : "text-[13.5px] mb-7 leading-relaxed",
        )}
      >
        {subtitle}
      </p>
    </header>
  );
}
