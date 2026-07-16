import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-10 px-4",
        className,
      )}
    >
      {icon && <div className="text-3xl mb-3 opacity-80">{icon}</div>}
      <p className="font-display font-bold text-base text-[var(--text)]">
        {title}
      </p>
      {description && (
        <p className="text-[13px] text-[var(--text-dim)] mt-2 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
