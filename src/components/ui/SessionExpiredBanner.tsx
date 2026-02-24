"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";
import Link from "next/link";

export function SessionExpiredBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleUnauthorized() {
      setVisible(true);
    }
    window.addEventListener("vita:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("vita:unauthorized", handleUnauthorized);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 px-4 py-3 text-sm"
      style={{
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderBottom: "1px solid rgba(239, 68, 68, 0.25)",
        backdropFilter: "blur(12px)",
      }}
      role="alert"
    >
      <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
      <span className="text-red-400">
        Votre session a expire.{" "}
        <Link
          href="/auth/connexion"
          className="font-semibold underline underline-offset-2 hover:text-red-300"
        >
          Se reconnecter
        </Link>
      </span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/20"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
