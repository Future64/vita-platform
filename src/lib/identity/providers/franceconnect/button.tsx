"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Logo FranceConnect (SVG officiel simplifie) ──────────────────

function FranceConnectLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 282 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Marianne tricolore */}
      <rect x="0" y="0" width="80" height="80" rx="4" fill="#000091" />
      <rect x="0" y="0" width="27" height="80" rx="4" fill="#000091" />
      <rect x="27" y="0" width="26" height="80" fill="#FFFFFF" />
      <rect x="53" y="0" width="27" height="80" rx="4" fill="#E1000F" />
      {/* Texte FC */}
      <text x="95" y="35" fontFamily="Marianne, Arial, sans-serif" fontSize="22" fontWeight="700" fill="currentColor">
        FranceConnect
      </text>
      <text x="95" y="58" fontFamily="Marianne, Arial, sans-serif" fontSize="13" fill="currentColor" opacity="0.7">
        S&apos;identifier avec
      </text>
    </svg>
  );
}

// ── Props ────────────────────────────────────────────────────────

interface FranceConnectButtonProps {
  /** URL de callback (defaut: /api/auth/callback/fc) */
  callbackUrl?: string;
  /** Texte du bouton */
  label?: string;
  /** Desactive le bouton */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ── Composant ────────────────────────────────────────────────────

export function FranceConnectButton({
  callbackUrl = "/api/auth/callback/fc",
  label = "S'identifier avec FranceConnect",
  disabled = false,
  className,
}: FranceConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading || disabled) return;

    setLoading(true);

    try {
      // Appel au endpoint qui genere l'URL d'autorisation FC
      const response = await fetch("/api/auth/authorize/fc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callbackUrl }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'initier la connexion FranceConnect");
      }

      const data = await response.json();

      // Redirection vers FranceConnect
      window.location.href = data.authorizationUrl;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-6 py-3",
          "text-sm font-medium transition-all duration-200",
          "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091] focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Style VITA (dark theme compatible)
          "bg-[#000091] text-white border-[#000091]",
          "hover:bg-[#1212ff] hover:-translate-y-0.5",
        )}
        type="button"
        aria-label={label}
      >
        {/* Drapeau francais miniature */}
        <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded" aria-hidden="true">
          <span className="h-full w-1/3 bg-[#000091]" />
          <span className="h-full w-1/3 bg-white" />
          <span className="h-full w-1/3 bg-[#E1000F]" />
        </span>

        <span className="flex flex-col items-start">
          <span className="text-[0.625rem] font-normal opacity-70 leading-tight">
            S&apos;identifier avec
          </span>
          <span className="text-sm font-semibold leading-tight">
            FranceConnect
          </span>
        </span>

        {loading && (
          <span className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        )}
      </button>

      {/* Lien "Qu'est-ce que FranceConnect ?" (requis par la charte) */}
      <a
        href="https://franceconnect.gouv.fr/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[0.6875rem] text-[var(--text-muted)] hover:text-violet-500 transition-colors underline underline-offset-2"
      >
        Qu&apos;est-ce que FranceConnect ?
      </a>
    </div>
  );
}
