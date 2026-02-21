"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldOff,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { StatutParrainage } from "@/types/verification";
import { SponsorActionButton } from "./SponsorActionButton";

// ── Types ────────────────────────────────────────────────────────

export interface SponsorEntry {
  id: string;
  username: string;
  prenom?: string;
  statut: StatutParrainage;
  lien?: string;
  commentaire?: string;
  dateInvitation: string;
  dateReponse?: string;
  dateRevocation?: string;
  motifRevocation?: string;
}

export interface SponsorsListProps {
  sponsors: SponsorEntry[];
  /** If true, show revocation buttons for accepted sponsors */
  canRevoke?: boolean;
  /** If true, show cooldown info */
  cooldownInfo?: {
    canAttest: boolean;
    availableAt: string | null;
    cooldownDays: number;
  } | null;
  onRevoke?: (sponsorId: string) => void;
  onAttester?: (sponsorId: string) => void;
  onRefuser?: (sponsorId: string) => void;
  /** "requester" shows the list from the demandeur's perspective,
   *  "sponsor" shows it from the parrain's perspective */
  perspective?: "requester" | "sponsor";
}

// ── Helpers ──────────────────────────────────────────────────────

function getStatutDisplay(statut: StatutParrainage) {
  switch (statut) {
    case "accepte":
      return {
        icon: CheckCircle2,
        color: "rgb(34, 197, 94)",
        label: "Atteste",
        bgColor: "rgba(34, 197, 94, 0.1)",
      };
    case "refuse":
      return {
        icon: XCircle,
        color: "rgb(239, 68, 68)",
        label: "Refuse",
        bgColor: "rgba(239, 68, 68, 0.1)",
      };
    case "revoque":
      return {
        icon: AlertTriangle,
        color: "rgb(245, 158, 11)",
        label: "Revoque",
        bgColor: "rgba(245, 158, 11, 0.1)",
      };
    default:
      return {
        icon: Clock,
        color: "rgb(59, 130, 246)",
        label: "En attente",
        bgColor: "rgba(59, 130, 246, 0.1)",
      };
  }
}

// ── Component ────────────────────────────────────────────────────

export function SponsorsList({
  sponsors,
  canRevoke = false,
  cooldownInfo,
  onRevoke,
  onAttester,
  onRefuser,
  perspective = "requester",
}: SponsorsListProps) {
  if (sponsors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <span style={{ color: "var(--text-muted)" }}>
            <ShieldOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
          </span>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Aucun parrainage
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--text-muted)" }}
          >
            {perspective === "requester"
              ? "Vous n'avez pas encore invite de parrains."
              : "Aucune demande de parrainage recue."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {perspective === "requester" ? "Parrains" : "Demandes recues"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cooldown banner */}
        {cooldownInfo && !cooldownInfo.canAttest && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "rgb(59, 130, 246)",
            }}
          >
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              Cooldown actif ({cooldownInfo.cooldownDays} jours entre
              attestations).
              {cooldownInfo.availableAt && (
                <>
                  {" "}
                  Prochaine attestation possible le{" "}
                  {new Date(cooldownInfo.availableAt).toLocaleDateString(
                    "fr-FR",
                    { day: "numeric", month: "long" }
                  )}
                  .
                </>
              )}
            </span>
          </div>
        )}

        {/* Sponsor rows */}
        {sponsors.map((sponsor) => {
          const display = getStatutDisplay(sponsor.statut);
          const StatusIcon = display.icon;

          return (
            <div
              key={sponsor.id}
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border-default)",
              }}
            >
              {/* Main row */}
              <div
                className="flex items-center justify-between p-3"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      color: "white",
                    }}
                  >
                    {(sponsor.prenom || sponsor.username)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      @{sponsor.username}
                    </p>
                    {sponsor.lien && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {sponsor.lien}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: display.bgColor,
                      color: display.color,
                    }}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {display.label}
                  </div>

                  {/* Action buttons */}
                  {perspective === "requester" &&
                    canRevoke &&
                    sponsor.statut === "accepte" &&
                    onRevoke && (
                      <SponsorActionButton
                        action="revoke"
                        onClick={() => onRevoke(sponsor.id)}
                        size="sm"
                      />
                    )}
                  {perspective === "sponsor" &&
                    sponsor.statut === "en_attente" && (
                      <div className="flex gap-1">
                        {onAttester && (
                          <SponsorActionButton
                            action="accept"
                            onClick={() => onAttester(sponsor.id)}
                            size="sm"
                            disabled={
                              cooldownInfo
                                ? !cooldownInfo.canAttest
                                : false
                            }
                          />
                        )}
                        {onRefuser && (
                          <SponsorActionButton
                            action="refuse"
                            onClick={() => onRefuser(sponsor.id)}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* Revocation detail */}
              {sponsor.statut === "revoque" && sponsor.motifRevocation && (
                <div
                  className="px-3 py-2 text-xs border-t"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.04)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-muted)",
                  }}
                >
                  <span className="font-medium" style={{ color: "rgb(245, 158, 11)" }}>
                    Motif :
                  </span>{" "}
                  {sponsor.motifRevocation}
                  {sponsor.dateRevocation && (
                    <span className="ml-2">
                      ({new Date(sponsor.dateRevocation).toLocaleDateString("fr-FR")})
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
