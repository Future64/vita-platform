"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface ResendEmailButtonProps {
  email: string;
}

export function ResendEmailButton({ email }: ResendEmailButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "cooldown" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) {
      if (state === "cooldown") setState("idle");
      return;
    }
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown, state]);

  const handleResend = useCallback(async () => {
    setState("loading");
    setErrorMsg(null);
    try {
      await api.resendVerification(email);
      setState("sent");
      setTimeout(() => {
        setState("cooldown");
        setCooldown(60);
      }, 2000);
    } catch {
      setState("error");
      setErrorMsg("Impossible de renvoyer l'email. Reessayez.");
      setTimeout(() => setState("idle"), 3000);
    }
  }, [email]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        disabled={state === "loading" || state === "sent" || state === "cooldown"}
        onClick={handleResend}
        className="text-sm"
      >
        {state === "loading" && (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            Envoi en cours...
          </>
        )}
        {state === "sent" && (
          <>
            <Check className="h-4 w-4 mr-1.5 text-green-500" />
            <span className="text-green-500">Email renvoye !</span>
          </>
        )}
        {state === "cooldown" && (
          <>
            <Mail className="h-4 w-4 mr-1.5" />
            Renvoyer dans {cooldown}s
          </>
        )}
        {(state === "idle" || state === "error") && (
          <>
            <Mail className="h-4 w-4 mr-1.5" />
            Renvoyer l&apos;email de confirmation
          </>
        )}
      </Button>
      {errorMsg && (
        <p className="text-xs text-red-400">{errorMsg}</p>
      )}
    </div>
  );
}
