import Link from "next/link";
import { cn } from "@/lib/utils";

export function LegalLinks({
  className,
  tone = "dim",
}: {
  className?: string;
  tone?: "dim" | "on-dark";
}) {
  const linkClass =
    tone === "on-dark"
      ? "text-slate-400 hover:text-white"
      : "text-[var(--text-dim)] hover:text-teal";

  return (
    <nav aria-label="Legal" className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", className)}>
      <Link href="/privacy" className={linkClass}>
        Privacy notice
      </Link>
      <span aria-hidden className={tone === "on-dark" ? "text-slate-600" : "text-[var(--text-dim)]"}>
        ·
      </span>
      <Link href="/terms" className={linkClass}>
        Terms of use
      </Link>
      <span aria-hidden className={tone === "on-dark" ? "text-slate-600" : "text-[var(--text-dim)]"}>
        ·
      </span>
      <Link href="/delete-account" className={linkClass}>
        Delete account
      </Link>
    </nav>
  );
}
