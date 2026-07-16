"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="max-w-md w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
        <p className="text-3xl mb-3" aria-hidden>
          ⚠️
        </p>
        <h1 className="font-display font-bold text-xl text-[var(--text)]">
          Something went wrong
        </h1>
        <p className="text-sm text-[var(--text-dim)] mt-2">
          The app hit an unexpected error. Try again — your progress is saved locally.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 px-5 py-2.5 rounded-full bg-teal text-[#04141c] font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
