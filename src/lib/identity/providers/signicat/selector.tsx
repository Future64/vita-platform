"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  getMethodsForCountry,
  getSupportedCountries,
  COUNTRY_NAMES,
} from "./methods";
import type { SignicatMethod } from "./methods";

// ── Drapeaux emoji par pays ──────────────────────────────────────

function countryFlag(code: string): string {
  // Convertit un code ISO en emoji drapeau (Unicode Regional Indicator)
  const offset = 0x1f1e6 - 65; // 'A' = 65
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

// ── Badge niveau eIDAS ──────────────────────────────────────────

function AssuranceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    high: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    substantial: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    low: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  const labels: Record<string, string> = {
    high: "eIDAS eleve",
    substantial: "eIDAS substantiel",
    low: "eIDAS faible",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-medium",
        colors[level] || colors.low
      )}
    >
      {labels[level] || level}
    </span>
  );
}

// ── Props ────────────────────────────────────────────────────────

interface SignicatSelectorProps {
  /** Callback quand l'utilisateur selectionne une methode */
  onSelect?: (countryCode: string, method: SignicatMethod) => void;
  /** Desactive le composant */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ── Composant ────────────────────────────────────────────────────

export function SignicatSelector({
  onSelect,
  disabled = false,
  className,
}: SignicatSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const countries = useMemo(() => getSupportedCountries(), []);
  const methods = useMemo(
    () => (selectedCountry ? getMethodsForCountry(selectedCountry) : []),
    [selectedCountry]
  );

  async function handleMethodSelect(method: SignicatMethod) {
    if (loading || disabled) return;

    setLoading(true);

    try {
      // Appel au endpoint qui genere l'URL d'autorisation Signicat
      const response = await fetch("/api/auth/authorize/signicat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: selectedCountry,
          methodId: method.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'initier la connexion Signicat");
      }

      const data = await response.json();

      onSelect?.(selectedCountry, method);

      // Redirection vers Signicat
      window.location.href = data.authorizationUrl;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Titre */}
      <div className="text-center">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Verification d&apos;identite europeenne
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Selectionnez votre pays pour afficher les methodes disponibles
        </p>
      </div>

      {/* Selection du pays */}
      <div className="relative">
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          disabled={disabled || loading}
          className={cn(
            "w-full appearance-none rounded-xl border px-4 py-3 text-sm",
            "bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)]",
            "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200"
          )}
        >
          <option value="">Choisir un pays...</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {countryFlag(code)} {COUNTRY_NAMES[code] || code}
            </option>
          ))}
        </select>
        {/* Chevron */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Methodes eID disponibles */}
      {selectedCountry && methods.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-[var(--text-secondary)]">
            Methodes disponibles pour{" "}
            {COUNTRY_NAMES[selectedCountry] || selectedCountry} :
          </p>

          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method)}
              disabled={loading || disabled}
              type="button"
              className={cn(
                "group flex items-center justify-between rounded-xl border px-4 py-3",
                "bg-[var(--bg-card)] border-[var(--border-subtle)]",
                "hover:bg-[var(--bg-card-hover)] hover:border-violet-500/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "transition-all duration-200"
              )}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {method.displayName}
                </span>
                <span className="text-[0.6875rem] text-[var(--text-muted)]">
                  {method.description}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AssuranceBadge level={method.assuranceLevel} />
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
                ) : (
                  <svg
                    className="h-4 w-4 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si pas de methode */}
      {selectedCountry && methods.length === 0 && (
        <p className="text-center text-xs text-[var(--text-muted)]">
          Aucune methode eID disponible pour ce pays.
          Essayez la verification par parrainage (Web of Trust).
        </p>
      )}

      {/* Lien Signicat */}
      <a
        href="https://www.signicat.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-center text-[0.6875rem] text-[var(--text-muted)] hover:text-violet-500 transition-colors underline underline-offset-2"
      >
        Powered by Signicat
      </a>
    </div>
  );
}
