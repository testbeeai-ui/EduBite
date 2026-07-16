import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pink" | "amber";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "font-mono text-[10px] font-bold px-[7px] py-[2px] rounded-full",
        variant === "pink" && "bg-pink text-white",
        variant === "amber" && "text-amber border border-amber/30 bg-[var(--surface)]",
        variant === "default" && "bg-[var(--surface)] border border-[var(--line)] text-[var(--text-dim)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
