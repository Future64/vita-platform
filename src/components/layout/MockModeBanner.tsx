"use client";

import { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function MockModeBanner() {
  const { isMockMode } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isMockMode && !dismissed) {
      setShow(true);
    }
  }, [isMockMode, dismissed]);

  if (!show) return null;

  return (
    <div className="relative z-40 flex items-center gap-2 border-b px-4 py-2 text-xs"
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.2)",
        color: "rgb(245, 158, 11)",
      }}
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">
        Mode demo — Backend non connecte. Les donnees affichees sont fictives.
      </span>
      <button
        onClick={() => { setDismissed(true); setShow(false); }}
        className="shrink-0 rounded p-0.5 hover:bg-yellow-500/20 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
