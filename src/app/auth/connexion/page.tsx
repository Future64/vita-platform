"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

export default function ConnexionPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const success = await login(identifier, password);

    if (success) {
      toast.success("Connecte avec succes");
      router.push("/panorama");
    } else {
      toast.error("Identifiants incorrects");
      setError("Identifiants incorrects");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setSubmitting(false);
    }
  }

  function handleForgotPassword() {
    toast.info("Fonctionnalite a venir");
  }

  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-primary)",
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Se connecter
      </h1>
      <p className="mb-4 md:mb-6 text-xs md:text-sm text-[var(--text-muted)]">
        Accedez a votre espace VITA
      </p>

      {error && (
        <div className="mb-3 md:mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 md:p-3 text-xs md:text-sm text-red-400">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-3 md:space-y-4 ${shake ? "animate-shake" : ""}`}
        style={shake ? {
          animation: "shake 0.5s ease-in-out",
        } : undefined}
      >
        {/* Email or username */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Email ou nom d&apos;utilisateur
          </label>
          <Input
            placeholder="jean@example.com ou jean_dupont"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="flex h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border accent-violet-500"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-xs md:text-sm text-[var(--text-secondary)]">
              Se souvenir de moi
            </span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs md:text-sm font-medium text-violet-500 hover:underline"
          >
            Mot de passe oublie ?
          </button>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          disabled={submitting || !identifier || !password}
        >
          {submitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-4 md:my-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
        <span className="text-xs text-[var(--text-muted)]">OU</span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
      </div>

      {/* Demo accounts */}
      <div className="space-y-1.5 md:space-y-2">
        <p className="text-xs font-medium text-[var(--text-muted)]">Comptes de demonstration :</p>
        <div className="grid grid-cols-1 gap-1 md:gap-1.5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#fbbf24" }} />
            <span className="font-mono">maxim@vita.world</span>
            <span className="text-[var(--text-muted)]">— Dieu</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
            <span className="font-mono">amina@vita.world</span>
            <span className="text-[var(--text-muted)]">— Citoyen</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg p-2" style={{ backgroundColor: "var(--bg-elevated)" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: "#6b7280" }} />
            <span className="font-mono">sakura@vita.world</span>
            <span className="text-[var(--text-muted)]">— Nouveau</span>
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Mot de passe : <span className="font-mono">vita2025</span>
        </p>
      </div>

      {/* Link to register */}
      <p className="mt-4 md:mt-6 text-center text-xs md:text-sm text-[var(--text-muted)]">
        Pas encore de compte ?{" "}
        <Link href="/auth/inscription" className="font-medium text-violet-500 hover:underline">
          S&apos;inscrire
        </Link>
      </p>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
