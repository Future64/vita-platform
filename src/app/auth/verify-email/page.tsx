"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ResendEmailButton } from "@/components/auth/ResendEmailButton";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    async function verify() {
      const result = await verifyEmail(token);
      if (result === true) {
        setStatus("success");
        setTimeout(() => router.push("/auth/welcome"), 2000);
      } else {
        setStatus("error");
        if (result === "token_expired") {
          setErrorMsg("Ce lien a expire. Demandez un nouveau lien de confirmation.");
        } else if (result === "invalid_token") {
          setErrorMsg("Ce lien est invalide ou a deja ete utilise.");
        } else {
          setErrorMsg(result || "Erreur lors de la verification.");
        }
      }
    }

    verify();
  }, [token, verifyEmail, router]);

  if (!token) {
    return (
      <div className="flex flex-col items-center text-center">
        <XCircle className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          Lien invalide
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Aucun token de verification fourni.
        </p>
        <Link href="/auth/connexion" className="text-sm text-violet-500 hover:underline">
          Retour a la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-violet-500 mb-4" />
          <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Verification en cours...
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Veuillez patienter.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              animation: "scaleIn 0.4s ease-out",
            }}
          >
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Email verifie !
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Redirection en cours...
          </p>

          <style jsx>{`
            @keyframes scaleIn {
              0% { transform: scale(0); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </>
      )}

      {status === "error" && (
        <>
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Verification echouee
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            {errorMsg}
          </p>

          <ResendEmailButton email="" />

          <Link
            href="/auth/connexion"
            className="mt-4 text-xs text-violet-500 hover:underline"
          >
            Retour a la connexion
          </Link>
        </>
      )}
    </div>
  );
}
