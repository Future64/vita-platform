"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.forgotPassword(email);
    } catch {
      // Always show "sent" for security (prevent email enumeration)
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
        >
          <Mail className="h-7 w-7 text-green-400" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
          Email envoye !
        </h1>
        <p className="mb-1 text-sm text-[var(--text-secondary)]">
          Si cet email est associe a un compte VITA, vous recevrez un lien de
          reinitialisation valable <strong className="text-[var(--text-primary)]">1 heure</strong>.
        </p>
        <p className="mb-6 text-xs text-[var(--text-muted)]">
          Pensez a verifier vos spams.
        </p>
        <Link href="/auth/connexion">
          <Button variant="secondary" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Retour a la connexion
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Mot de passe oublie
      </h1>
      <p className="mb-4 md:mb-6 text-xs md:text-sm text-[var(--text-muted)]">
        Saisissez votre email pour recevoir un lien de reinitialisation.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Adresse email
          </label>
          <Input
            type="email"
            required
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          disabled={status === "loading" || !email}
        >
          {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
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
