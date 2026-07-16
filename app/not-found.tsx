import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="max-w-md w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
        <p className="font-mono text-teal text-sm mb-2">404</p>
        <h1 className="font-display font-bold text-xl text-[var(--text)]">
          Page not found
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-2">
          This route doesn&apos;t exist in the Edubite demo.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 px-5 py-2.5 rounded-full bg-teal text-[#04141c] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
