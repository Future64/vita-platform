"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ResendEmailButton } from "@/components/auth/ResendEmailButton";

export default function VerifyEmailPendingPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
      >
        <Mail className="h-8 w-8 text-violet-500" />
      </div>

      <h1 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
        Verifiez votre adresse email
      </h1>

      <p className="mb-1 text-sm text-[var(--text-secondary)]">
        Nous avons envoye un lien de confirmation a
      </p>
      <p className="mb-4 text-sm font-semibold text-[var(--text-primary)]">
        {email || "votre adresse email"}
      </p>

      <p className="mb-6 text-xs text-[var(--text-muted)]">
        Cliquez sur le lien dans l&apos;email pour activer votre compte VITA.
      </p>

      <ResendEmailButton email={email} />

      <p className="mt-6 text-xs text-[var(--text-muted)]">
        Le lien expire dans 24 heures.
      </p>

      <Link
        href="/auth/register"
        className="mt-4 text-xs text-violet-500 hover:underline"
      >
        Modifier mon adresse email
      </Link>
    </div>
  );
}
