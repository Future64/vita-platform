"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[VITA] Unhandled error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
        Une erreur est survenue
      </h1>
      <p className="mb-6 max-w-md text-center text-sm text-[var(--text-muted)]">
        Quelque chose s&apos;est mal passe. Vous pouvez reessayer ou retourner au tableau de bord.
      </p>
      {error.digest && (
        <p className="mb-4 rounded-lg bg-[var(--bg-elevated)] px-3 py-1.5 font-mono text-xs text-[var(--text-muted)]">
          Ref : {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <RotateCcw className="h-4 w-4" />
          Reessayer
        </button>
        <Link
          href="/panorama"
          className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)]"
        >
          <Home className="h-4 w-4" />
          Panorama
        </Link>
      </div>
    </div>
  );
}
