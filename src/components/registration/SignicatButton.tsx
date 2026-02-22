"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProviderLogo } from "@/lib/identity/provider-logos";
import type { AssuranceLevel } from "@/lib/identity/providers/types";

// ── Badge eIDAS ──────────────────────────────────────────────

function AssuranceBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; label: string }> = {
    high: { bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "eIDAS eleve" },
    substantial: { bg: "bg-violet-500/20 text-violet-400 border-violet-500/30", label: "eIDAS substantiel" },
    low: { bg: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "eIDAS faible" },
  };
  const { bg, label } = config[level] || config.low;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[0.5625rem] font-medium leading-tight", bg)}>
      {label}
    </span>
  );
}

// ── Spinner ──────────────────────────────────────────────────

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />;
}

// ── Props ────────────────────────────────────────────────────

interface SignicatButtonProps {
  countryCode: string;
  methodId: string;
  displayName: string;
  description: string;
  assuranceLevel: AssuranceLevel;
  returnTo?: string;
  disabled?: boolean;
  loading?: boolean;
}

// ── Composant ────────────────────────────────────────────────

export function SignicatButton({
  countryCode,
  methodId,
  displayName,
  description,
  assuranceLevel,
  returnTo,
  disabled = false,
  loading: externalLoading = false,
}: SignicatButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading || externalLoading;

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { countryCode, methodId };
      if (returnTo) body.returnTo = returnTo;

      const response = await fetch("/api/auth/authorize/signicat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Impossible d'initier la verification");
      }

      const data = await response.json();
      setSuccess(true);
      window.location.href = data.authorizationUrl;
    } catch {
      setError("Erreur lors de l'initiation. Veuillez reessayer.");
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        success
          ? "border-emerald-500/50 bg-emerald-500/5"
          : "border-[var(--border-subtle)] hover:border-violet-500/30",
      )}
      style={!success ? { backgroundColor: "var(--bg-card)" } : undefined}
    >
      {/* Contenu principal */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={cn(
          "group flex w-full items-center gap-3 text-left",
          "focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {/* Logo */}
        <ProviderLogo
          provider="signicat"
          methodId={methodId}
          countryCode={countryCode}
          className="h-10 w-10 shrink-0 rounded-lg"
        />

        {/* Texte */}
        <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
          <span
            className="text-sm font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {displayName}
          </span>
          <span
            className="text-[0.6875rem] leading-tight truncate max-w-full"
            style={{ color: "var(--text-muted)" }}
          >
            {description}
          </span>
        </div>

        {/* Droite : badge + indicateur */}
        <div className="flex shrink-0 items-center gap-2">
          <AssuranceBadge level={assuranceLevel} />

          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.5625rem] font-bold text-emerald-400">
            Gratuit
          </span>

          {isLoading ? (
            <Spinner />
          ) : success ? (
            <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg
              className={cn(
                "h-4 w-4 transition-transform",
                !disabled && "group-hover:translate-x-0.5"
              )}
              style={{ color: "var(--text-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
        </div>
      </button>

      {/* Texte securite */}
      <p
        className="mt-3 text-[0.6875rem] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Verification securisee via{" "}
        <a
          href="https://www.signicat.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:underline"
        >
          Signicat
        </a>
        , certifie eIDAS.
      </p>

      {/* Erreur */}
      {error && (
        <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
