"use client";

import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VerificationRequiredProps {
  action?: string; // ex: "voter", "envoyer des Ѵ", "creer une version"
}

export function VerificationRequired({ action = "utiliser cette fonctionnalite" }: VerificationRequiredProps) {
  return (
    <Card className="border-amber-500/30">
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 md:p-6">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}
        >
          <span style={{ color: "rgb(245, 158, 11)" }}>
            <ShieldAlert className="h-5 w-5" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Verification d&apos;identite requise
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Vous devez verifier votre identite pour {action}. Le processus necessite 3 parrains verifies.
          </p>
        </div>
        <Link href="/civis/verification" className="shrink-0">
          <Button variant="secondary" size="sm">
            Verifier mon identite
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
