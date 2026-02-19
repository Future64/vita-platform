"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/panorama");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="animate-pulse text-[var(--text-muted)]">Chargement...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 py-6 md:py-8">
      {/* Subtle radial gradient background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Logo */}
        <div className="mb-6 md:mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 text-lg md:text-xl font-extrabold text-white">
              Ѵ
            </div>
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-2xl md:text-3xl font-bold text-transparent">
              VITA
            </span>
          </Link>
          <p className="mt-2 md:mt-3 text-xs md:text-sm text-[var(--text-muted)]">
            Plateforme de gouvernance mondiale
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-xl border p-6 shadow-md md:p-8"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
