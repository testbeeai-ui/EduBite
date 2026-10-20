import Link from "next/link";

export function PolicyDocument({ lines }: { lines: readonly string[] }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <article className="space-y-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
        {lines.map((line, index) => {
          if (line.length === 0) {
            return <div key={index} className="h-2" aria-hidden />;
          }

          if (line === "EDUBITE") {
            return (
              <p
                key={index}
                className="whitespace-pre-wrap font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal"
              >
                {line}
              </p>
            );
          }

          if (line === "PRIVACY NOTICE" || line === "TERMS OF USE & SERVICE") {
            return (
              <h1
                key={index}
                className="whitespace-pre-wrap font-display text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl"
              >
                {line}
              </h1>
            );
          }

          if (/^\d+\.\s/.test(line) || /^[A-D]\.\s/.test(line)) {
            return (
              <h2
                key={index}
                className="whitespace-pre-wrap pt-4 font-display text-xl font-bold text-[var(--text)]"
              >
                {line}
              </h2>
            );
          }

          return (
            <p key={index} className="whitespace-pre-wrap">
              {line}
            </p>
          );
        })}
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
