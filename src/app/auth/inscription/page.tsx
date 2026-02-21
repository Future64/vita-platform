"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Redirection vers la nouvelle page d'inscription /auth/register
 * qui intègre le CountryIdentitySelector et le flux en 5 étapes.
 */
export default function InscriptionRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/register");
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-sm text-[var(--text-muted)]">Redirection...</p>
    </div>
  );
}
