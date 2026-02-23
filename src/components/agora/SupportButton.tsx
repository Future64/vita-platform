"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface SupportButtonProps {
  doleanceId: string;
  initialCount: number;
  userHasSupported?: boolean;
}

export function SupportButton({
  doleanceId,
  initialCount,
  userHasSupported = false,
}: SupportButtonProps) {
  const { isMockMode } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [supported, setSupported] = useState(userHasSupported);
  const [loading, setLoading] = useState(false);

  const handleSupport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (!isMockMode) {
        await api.soutenirDoleance(doleanceId);
      }
      setSupported((s) => !s);
      setCount((c) => (supported ? c - 1 : c + 1));
    } catch {
      // Silently fail — user may not be connected
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSupport}
      disabled={loading}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        supported
          ? "bg-violet-500/15 border border-violet-500/40 text-violet-400 hover:bg-violet-500/10"
          : "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-500 hover:to-pink-500",
      )}
    >
      <Heart
        className={cn("h-4 w-4", supported && "fill-violet-400")}
      />
      <span>
        {supported ? "Vous soutenez cette doleance" : "Soutenir cette doleance"}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-bold",
          supported ? "bg-violet-500/20" : "bg-white/20",
        )}
      >
        {count}
      </span>
    </button>
  );
}
