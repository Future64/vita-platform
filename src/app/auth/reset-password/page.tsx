"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

function PasswordStrengthBar({ password }: { password: string }) {
  const strength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;

  const labels = ["", "Faible", "Moyen", "Fort"];
  const colors = ["", "#ef4444", "#f59e0b", "#22c55e"];
  const widths = ["0%", "33%", "66%", "100%"];

  if (!password) return null;

  return (
    <div className="mt-2 flex items-center gap-2.5">
      <div
        className="h-1 flex-1 rounded-full"
        style={{ backgroundColor: "var(--bg-elevated)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: widths[strength],
            backgroundColor: colors[strength],
          }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const mismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setErrorMsg("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Minimum 8 caracteres");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      await api.resetPassword(token, password);
      setStatus("success");
      setTimeout(() => router.push("/auth/connexion?reset=success"), 2000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Lien invalide ou expire.";
      setErrorMsg(message);
      setStatus("error");
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
        >
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
          Lien invalide
        </h1>
        <p className="mb-4 text-sm text-[var(--text-muted)]">
          Ce lien de reinitialisation est invalide ou a expire.
        </p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" className="w-full">
            Recommencer
          </Button>
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
        >
          <CheckCircle2 className="h-7 w-7 text-green-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
          Mot de passe modifie !
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Redirection vers la connexion...
        </p>
      </div>
    );
  }

  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-primary)",
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Nouveau mot de passe
      </h1>
      <p className="mb-4 md:mb-6 text-xs md:text-sm text-[var(--text-muted)]">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      {errorMsg && (
        <div className="mb-3 md:mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-2.5 md:p-3 text-xs md:text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* New password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Minimum 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>

        {/* Confirm password */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              required
              placeholder="Repetez le mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="flex h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none"
              style={{
                ...inputStyle,
                borderColor: mismatch
                  ? "rgba(239, 68, 68, 0.5)"
                  : inputStyle.borderColor,
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              tabIndex={-1}
            >
              {showConfirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {mismatch && (
            <p className="mt-1.5 text-xs text-red-400">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          disabled={status === "loading" || !password || !confirm}
        >
          {status === "loading"
            ? "Modification..."
            : "Modifier le mot de passe"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link
          href="/auth/connexion"
          className="text-xs md:text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <ArrowLeft className="mr-1 inline h-3 w-3" />
          Retour a la connexion
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-[var(--text-muted)]">Chargement...</div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
