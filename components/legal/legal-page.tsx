import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal/site";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="border-b border-[var(--line)] pb-6">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tight text-[var(--text)]"
        >
          {LEGAL.product}
        </Link>
        <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
          {LEGAL.company}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-dim)]">
          Effective {LEGAL.effectiveDate}
          <span aria-hidden> · </span>
          Last updated {LEGAL.effectiveDate}
        </p>
      </header>

      <article className="mt-8 space-y-8 text-[15px] leading-relaxed text-[var(--text-muted)]">
        {children}
      </article>

      <footer className="mt-12 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--line)] pt-6 text-sm">
        <Link href="/privacy" className="text-teal hover:underline">
          Privacy notice
        </Link>
        <Link href="/terms" className="text-teal hover:underline">
          Terms of use
        </Link>
        <Link href="/" className="text-[var(--text-dim)] hover:text-[var(--text)]">
          Back to EduBite
        </Link>
      </footer>
    </div>
  );
}

export function LegalSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8 space-y-3">
      <h2 className="font-display text-xl font-bold text-[var(--text)]">{heading}</h2>
      {children}
    </section>
  );
}
