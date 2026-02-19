"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldX, X, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function VerificationBanner() {
  const { user, simulatedRole } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const dismissKey = user ? `vita_banner_dismissed_${user.id}` : null;

  useEffect(() => {
    if (dismissKey) {
      const wasDismissed = localStorage.getItem(dismissKey);
      setDismissed(wasDismissed === "true");
    }
    setLoaded(true);
  }, [dismissKey]);

  if (!loaded || !user || dismissed) return null;

  // Don't show if simulating a role
  if (simulatedRole) return null;

  const statut = user.identiteVerifiee?.statut;
  if (!statut || statut === "verifie") return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (dismissKey) {
      localStorage.setItem(dismissKey, "true");
    }
  };

  const isExpire = statut === "expire";
  const bgColor = isExpire ? "rgba(245, 158, 11, 0.1)" : "rgba(59, 130, 246, 0.1)";
  const borderColor = isExpire ? "rgba(245, 158, 11, 0.3)" : "rgba(59, 130, 246, 0.3)";
  const textColor = isExpire ? "rgb(245, 158, 11)" : "rgb(96, 165, 250)";
  const IconComp = isExpire ? ShieldX : ShieldAlert;

  const message = isExpire
    ? "Votre verification a expire. Renouvelez-la pour maintenir votre acces complet."
    : "Completez votre verification d'identite pour acceder a toutes les fonctionnalites.";

  return (
    <div
      className="sticky top-14 md:top-16 z-30 flex items-center justify-between gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-2.5"
      style={{
        backgroundColor: bgColor,
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <span style={{ color: textColor }}>
          <IconComp className="h-4 w-4 shrink-0" />
        </span>
        <span className="text-xs md:text-sm truncate" style={{ color: textColor }}>
          {message}
        </span>
        <Link
          href="/civis/verification"
          className="shrink-0 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
          style={{
            color: textColor,
            border: `1px solid ${borderColor}`,
          }}
        >
          {isExpire ? "Renouveler" : "Verifier"}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 rounded transition-colors hover:bg-white/10"
        style={{ color: textColor }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
