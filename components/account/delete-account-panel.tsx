"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STORAGE_KEY } from "@/data/config";
import { useAuth } from "@/lib/auth/auth-provider";
import { LEGAL } from "@/lib/legal/site";
import { supabase } from "@/integrations/supabase/client";

export function DeleteAccountPanel() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const startSignIn = () => {
    window.sessionStorage.setItem("edubite.post-login", "/delete-account");
    void signInWithGoogle();
  };

  const deleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setError(null);
    const userId = user.id;
    const { error: rpcError } = await supabase.rpc("edubite_delete_my_account");
    if (rpcError) {
      setDeleting(false);
      setError(rpcError.message);
      return;
    }
    window.localStorage.removeItem(`${STORAGE_KEY}:user:${userId}`);
    window.localStorage.removeItem(`edubite.braingym.v1:user:${userId}`);
    window.localStorage.removeItem(`edubite.braingym.pending.v1:user:${userId}`);
    await signOut();
    setDone(true);
    setDeleting(false);
    router.replace("/");
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="border-b border-[var(--line)] pb-6">
        <Link
          href="/"
          className="font-display text-lg font-extrabold tracking-tight text-[var(--text)]"
        >
          EduBite
        </Link>
        <p className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-teal">
          {LEGAL.company}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
          Delete your EduBite account
        </h1>
      </header>

      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-[var(--text-muted)]">
        <p>This page deletes the EduBite data stored for the Google account you are signed in with.</p>
        <p>We delete:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Scores, streaks, habits, and RDM</li>
          <li>Brain Gym progress</li>
          <li>Puzzle progress</li>
          <li>Monthly challenge enrollment and entries</li>
          <li>Reward claims</li>
        </ul>
        <p>
          The same Google sign-in is used by Edublast. This does not delete that Edublast login or Edublast progress. If you sign in to EduBite again, EduBite starts empty.
        </p>
        <p>
          If you cannot sign in, email{" "}
          <a className="text-teal hover:underline" href={`mailto:${LEGAL.email}`}>
            {LEGAL.email}
          </a>{" "}
          from the Google account you use on EduBite.
        </p>
      </div>

      <div className="mt-8">
        {done ? (
          <p className="text-sm text-teal">Your EduBite data has been deleted.</p>
        ) : loading ? (
          <p className="text-sm text-[var(--text-dim)]">Checking your sign-in…</p>
        ) : !user ? (
          <button
            type="button"
            onClick={startSignIn}
            className="rounded-xl bg-teal px-4 py-3 text-sm font-bold text-slate-950"
          >
            Sign in to delete EduBite data
          </button>
        ) : !confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300"
          >
            Delete my EduBite data
          </button>
        ) : (
          <div className="space-y-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-sm text-red-100">
              Signed in as {user.email ?? "your Google account"}. This cannot be undone.
            </p>
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => void deleteAccount()}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete permanently"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirming(false)}
                className="rounded-xl px-4 py-2.5 text-sm text-[var(--text-dim)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

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
