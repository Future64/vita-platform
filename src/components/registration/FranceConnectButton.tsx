"use client";

import { useState } from "react";
import Image from "next/image";

// ── FranceConnect official button ────────────────────────────
//
// Charte graphique : https://docs.partenaires.franceconnect.gouv.fr/fs/fs-integration/bouton-fc/
//
// Regles obligatoires :
//   - Texte au-dessus : "S'identifier avec"
//   - Lien en-dessous : "Qu'est-ce que FranceConnect ?"
//   - Bouton officiel (SVG) sans modification

interface FranceConnectButtonProps {
  disabled?: boolean;
  loading?: boolean;
}

export function FranceConnectButton({
  disabled = false,
  loading = false,
}: FranceConnectButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (disabled || loading) return;
    window.location.href = "/api/auth/initiate/franceconnect";
  };

  const src = disabled
    ? "/franceconnect/fc-btn-disabled.svg"
    : isHovered
      ? "/franceconnect/fc-btn-hover.svg"
      : "/franceconnect/fc-btn.svg";

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Texte pedagogique */}
      <p
        className="mb-3 text-[0.6875rem] leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        FranceConnect utilise vos comptes existants (impots.gouv.fr, Ameli, La Poste...)
        pour verifier votre identite. Aucun mot de passe supplementaire.
        Vos donnees ne sont pas transmises a VITA.
      </p>

      {/* Bouton officiel centre */}
      <div className="flex flex-col items-center gap-1">
        {/* Texte au-dessus (obligatoire selon la charte) */}
        <p
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          S&apos;identifier avec
        </p>

        {/* Bouton officiel */}
        <button
          type="button"
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={disabled || loading}
          className="relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#000091]/50 focus-visible:ring-offset-2 rounded disabled:cursor-not-allowed"
          aria-label="S'identifier avec FranceConnect"
        >
          <Image
            src={src}
            alt="FranceConnect"
            width={209}
            height={56}
            priority
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#000091]/60 rounded">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </button>

        {/* Lien en-dessous (obligatoire selon la charte) */}
        <a
          href="https://franceconnect.gouv.fr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6875rem] hover:underline"
          style={{ color: "#000091" }}
        >
          Qu&apos;est-ce que FranceConnect ?
        </a>
      </div>

      {/* Badge gratuit + eIDAS */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="inline-flex items-center rounded-full border border-violet-500/30 bg-violet-500/20 px-2 py-0.5 text-[0.5625rem] font-medium leading-tight text-violet-400">
          eIDAS substantiel
        </span>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.5625rem] font-bold text-emerald-400">
          Gratuit
        </span>
      </div>
    </div>
  );
}
