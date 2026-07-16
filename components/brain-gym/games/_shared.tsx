"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { cn } from "@/lib/utils";

/** Shared interactive styles for all in-game tap/choice controls */
export const gameInteractClass =
  "rounded-xl border border-[var(--line)] bg-[var(--surface-2)] font-display font-bold transition-all duration-150 touch-manipulation select-none cursor-pointer hover:border-teal/45 hover:bg-teal/10 hover:shadow-[0_0_18px_rgba(45,212,191,0.12)] hover:scale-[1.02] active:scale-95 active:border-teal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed";

export const gameTargetClass =
  "touch-manipulation select-none cursor-pointer transition-all duration-150 hover:scale-110 hover:brightness-110 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50";

export function GameBoard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 sm:p-3.5 pb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center text-sm text-[var(--text-dim)] mb-2 font-display font-bold">
      {children}
    </p>
  );
}

export function ChoiceGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-2 sm:gap-3",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function CellButton({
  children,
  onClick,
  className,
  disabled,
  style,
  selected,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={cn(
        gameInteractClass,
        "min-h-[48px]",
        selected && "border-teal bg-teal/15 text-teal shadow-[0_0_16px_rgba(45,212,191,0.2)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChoiceButton({
  children,
  onClick,
  className,
  disabled,
  selected,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        gameInteractClass,
        "min-h-[52px] px-4 py-3 text-sm sm:text-base",
        selected && "border-teal bg-teal/15 text-teal",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Lightweight Three.js canvas — no HDR environment maps */
/** Lightweight Three.js canvas — no HDR environment maps */
export function GameCanvas({
  children,
  className,
  style,
  ...props
}: CanvasProps & { className?: string }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      className={className}
      style={style}
      {...props}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[8, 12, 6]} intensity={1.1} />
      {children}
    </Canvas>
  );
}
