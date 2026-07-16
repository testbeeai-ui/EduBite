import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-[var(--line)] bg-gradient-to-b from-[var(--surface)] to-[rgba(22,26,35,0.6)] p-[22px] transition-[border-color,transform] duration-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
