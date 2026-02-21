"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StatutParrainage } from "@/types/verification";
import { PARRAINS_REQUIS, DUREE_VERIFICATION_JOURS } from "@/types/verification";

// ── Types ────────────────────────────────────────────────────────

export interface SponsorInfo {
  id: string;
  username: string;
  prenom?: string;
  statut: StatutParrainage;
  dateInvitation: string;
  dateReponse?: string;
  lien?: string;
}

export interface SponsorshipRequestCardProps {
  requestId: string;
  statut: "en_attente" | "complete" | "expiree" | "annulee";
  dateCreation: string;
  dateExpiration: string;
  sponsors: SponsorInfo[];
  parrainagesRequis?: number;
  niveauConfiance?: number;
  onAnnuler?: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────

function getStatutIcon(statut: StatutParrainage) {
  switch (statut) {
    case "accepte":
      return <CheckCircle2 className="h-4 w-4" />;
    case "refuse":
      return <XCircle className="h-4 w-4" />;
    case "revoque":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function getStatutColor(statut: StatutParrainage): string {
  switch (statut) {
    case "accepte":
      return "rgb(34, 197, 94)";
    case "refuse":
      return "rgb(239, 68, 68)";
    case "revoque":
      return "rgb(245, 158, 11)";
    default:
      return "rgb(59, 130, 246)";
  }
}

function getStatutLabel(statut: StatutParrainage): string {
  switch (statut) {
    case "accepte":
      return "Atteste";
    case "refuse":
      return "Refuse";
    case "revoque":
      return "Revoque";
    default:
      return "En attente";
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDaysRemaining(expirationIso: string): number {
  const diff = new Date(expirationIso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// ── Component ────────────────────────────────────────────────────

export function SponsorshipRequestCard({
  statut,
  dateCreation,
  dateExpiration,
  sponsors,
  parrainagesRequis = PARRAINS_REQUIS,
  niveauConfiance = 0,
  onAnnuler,
}: SponsorshipRequestCardProps) {
  const acceptedCount = sponsors.filter((s) => s.statut === "accepte").length;
  const revokedCount = sponsors.filter((s) => s.statut === "revoque").length;
  const daysRemaining = getDaysRemaining(dateExpiration);
  const progress = (acceptedCount / parrainagesRequis) * 100;

  const isExpired = statut === "expiree" || daysRemaining === 0;
  const isComplete = statut === "complete";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span
            style={{
              color: isComplete
                ? "rgb(34, 197, 94)"
                : isExpired
                ? "rgb(245, 158, 11)"
                : "rgb(59, 130, 246)",
            }}
          >
            <Users className="h-5 w-5" />
          </span>
          <span>
            {isComplete
              ? "Verification complete"
              : isExpired
              ? "Demande expiree"
              : "Verification en cours"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Attestations recues
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {acceptedCount} / {parrainagesRequis}
            </span>
          </div>
          <Progress value={progress} color="violet" />
        </div>

        {/* Confidence level */}
        {niveauConfiance > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Niveau de confiance
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {niveauConfiance}%
              </span>
            </div>
            <Progress value={niveauConfiance} color="cyan" />
          </div>
        )}

        {/* Sponsors list */}
        <div className="space-y-2">
          {sponsors.map((sponsor) => {
            const color = getStatutColor(sponsor.statut);
            return (
              <div
                key={sponsor.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      color: "white",
                    }}
                  >
                    {(sponsor.prenom || sponsor.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      @{sponsor.username}
                    </p>
                    {sponsor.dateReponse && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(sponsor.dateReponse)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span style={{ color }}>{getStatutIcon(sponsor.statut)}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color }}
                  >
                    {getStatutLabel(sponsor.statut)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revocation warning */}
        {revokedCount > 0 && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              color: "rgb(245, 158, 11)",
            }}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {revokedCount} attestation{revokedCount > 1 ? "s" : ""} revoquee
              {revokedCount > 1 ? "s" : ""}. Invitez de nouveaux parrains pour
              maintenir votre verification.
            </span>
          </div>
        )}

        {/* Expiration info */}
        {!isComplete && !isExpired && (
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>
              {daysRemaining} jour{daysRemaining > 1 ? "s" : ""} restant
              {daysRemaining > 1 ? "s" : ""} (expire le{" "}
              {formatDate(dateExpiration)})
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <span>Demande creee le {formatDate(dateCreation)}</span>
        </div>

        {/* Cancel button */}
        {onAnnuler && statut === "en_attente" && (
          <button
            onClick={onAnnuler}
            className="text-xs hover:underline"
            style={{ color: "var(--text-muted)" }}
          >
            Annuler la demande
          </button>
        )}
      </CardContent>
    </Card>
  );
}
