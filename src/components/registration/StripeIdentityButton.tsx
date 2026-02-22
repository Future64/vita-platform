"use client";

import { useState } from "react";

// ── Stripe Identity verification button ────────────────────────
//
// Bouton de verification payante via Stripe Identity.
// Clic → POST /api/identity/stripe/checkout → redirect vers Stripe Checkout.

interface StripeIdentityButtonProps {
  countryCode: string;
  disabled?: boolean;
  loading?: boolean;
}

export function StripeIdentityButton({
  countryCode,
  disabled = false,
  loading: externalLoading = false,
}: StripeIdentityButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = loading || externalLoading;

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/identity/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          (data as Record<string, string>).error || "Erreur lors de la creation du paiement"
        );
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Bouton principal */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="group relative flex items-center justify-center gap-2.5 rounded-xl px-5 py-3.5 font-semibold text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: disabled
            ? "rgba(255,255,255,0.1)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%)",
        }}
      >
        {isLoading ? (
          <>
            <span className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <span className="text-sm">Redirection...</span>
          </>
        ) : (
          <>
            {/* Icone carte bancaire */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <span className="text-sm">Verifier mon identite</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              2,00 &euro;
            </span>
          </>
        )}
      </button>

      {/* Texte explicatif */}
      <p
        className="text-center text-[0.6875rem] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Paiement securise par Stripe. Scan de document d&apos;identite + selfie.
        <br />
        Remboursement automatique en cas de doublon.
      </p>

      {/* Erreur */}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
