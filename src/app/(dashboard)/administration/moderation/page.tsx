"use client";

import { useState, useMemo } from "react";
import {
  ShieldAlert,
  MessageCircle,
  FileText,
  User,
  Eye,
  AlertTriangle,
  X,
  Check,
  Ban,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/Toast";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  SIGNALEMENTS,
  MOTIF_LABELS,
  MODERATION_STATS,
  type Signalement,
  type SignalementMotif,
} from "@/lib/mockAdmin";
import Link from "next/link";

type Tab = "en_attente" | "traites" | "regles";

const TYPE_BADGE_VARIANT: Record<string, "violet" | "blue" | "orange" | "cyan"> = {
  proposition: "violet",
  commentaire: "blue",
  fil_discussion: "orange",
  profil: "cyan",
};

const TYPE_LABELS: Record<string, string> = {
  proposition: "Proposition",
  commentaire: "Commentaire",
  fil_discussion: "Fil de discussion",
  profil: "Profil",
};

const RESULT_CONFIG: Record<string, { variant: "red" | "green" | "orange"; label: string }> = {
  masque: { variant: "red", label: "Masque" },
  rejete: { variant: "green", label: "Rejete (conforme)" },
  averti: { variant: "orange", label: "Averti" },
  suspendu: { variant: "red", label: "Suspendu" },
};

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>("en_attente");
  const [expandedSignalement, setExpandedSignalement] = useState<string | null>(null);
  const { toast } = useToast();

  const enAttente = useMemo(
    () => SIGNALEMENTS.filter((s) => !s.traite),
    []
  );
  const traites = useMemo(
    () => SIGNALEMENTS.filter((s) => s.traite),
    []
  );

  function toggleExpand(id: string) {
    setExpandedSignalement((prev) => (prev === id ? null : id));
  }

  function renderSignalementCard(signalement: Signalement, showResult: boolean) {
    const isExpanded = expandedSignalement === signalement.id;

    return (
      <Card key={signalement.id} className="transition-all">
        <CardContent className="p-4 md:p-5">
          {/* Top row: badge + title */}
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <Badge variant={TYPE_BADGE_VARIANT[signalement.type] || "violet"}>
              {TYPE_LABELS[signalement.type] || signalement.type}
            </Badge>
            {showResult && signalement.resultat && (
              <Badge variant={RESULT_CONFIG[signalement.resultat].variant}>
                {RESULT_CONFIG[signalement.resultat].label}
              </Badge>
            )}
          </div>

          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            {signalement.titre}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] mb-3">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Signale par {signalement.nombreSignalements} citoyens
            </span>
            <span>Premier signalement : {signalement.premierSignalement}</span>
          </div>

          {/* Motif chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {signalement.motifs.map((motif) => (
              <span
                key={motif}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-500/15 text-yellow-500"
              >
                {MOTIF_LABELS[motif]}
              </span>
            ))}
          </div>

          {/* Expandable extract */}
          <button
            onClick={() => toggleExpand(signalement.id)}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors mb-3"
          >
            <Eye className="h-3 w-3" />
            {isExpanded ? "Masquer l'extrait" : "Voir l'extrait"}
          </button>

          {isExpanded && (
            <div
              className="rounded-lg p-3 mb-3 text-xs leading-relaxed"
              style={{
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-secondary)",
              }}
            >
              {signalement.extrait}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 mb-4">
            <Avatar size="sm" color="orange">
              <AvatarFallback>{signalement.auteurContenu.initials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-[var(--text-muted)]">
              @{signalement.auteurContenu.username}
            </span>
          </div>

          {/* Result line for treated */}
          {showResult && signalement.traiteePar && (
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Traite par @{signalement.traiteePar} — {signalement.dateTraitement}
            </p>
          )}

          {/* Action buttons (only for untreated) */}
          {!showResult && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => toast.success("Contenu masque")}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Masquer le contenu
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Signalements rejetes")}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Rejeter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                onClick={() => toast.success("Avertissement envoye")}
              >
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Avertir l&apos;auteur
              </Button>
              <PermissionGate permission="suspend_user" hide>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => toast.success("Utilisateur suspendu")}
                >
                  <Ban className="h-3.5 w-3.5 mr-1" />
                  Suspendre l&apos;auteur
                </Button>
              </PermissionGate>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="h-6 w-6 text-orange-500" />
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            Moderation
          </h1>
        </div>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          {MODERATION_STATS.enAttente} signalements en attente &middot;{" "}
          {MODERATION_STATS.traitesSemaine} traites cette semaine &middot;{" "}
          {MODERATION_STATS.traitesMois} ce mois
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        <button
          onClick={() => setActiveTab("en_attente")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "en_attente"
              ? "bg-violet-500/15 text-violet-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          En attente
          {enAttente.length > 0 && (
            <Badge variant="red" className="text-[10px] px-1.5 py-0">
              {enAttente.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab("traites")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "traites"
              ? "bg-violet-500/15 text-violet-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Traites
        </button>
        <button
          onClick={() => setActiveTab("regles")}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "regles"
              ? "bg-violet-500/15 text-violet-500"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          }`}
        >
          Regles de moderation
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "en_attente" && (
        <div className="space-y-4">
          {enAttente.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
              Aucun signalement en attente.
            </div>
          ) : (
            enAttente.map((s) => renderSignalementCard(s, false))
          )}
        </div>
      )}

      {activeTab === "traites" && (
        <div className="space-y-4">
          {traites.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
              Aucun signalement traite.
            </div>
          ) : (
            traites.map((s) => renderSignalementCard(s, true))
          )}
        </div>
      )}

      {activeTab === "regles" && (
        <Card>
          <CardHeader>
            <CardTitle>Regles de moderation en vigueur</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                Tout contenu comportant des attaques personnelles, du harcelement
                ou des propos discriminatoires sera masque immediatement.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                Le spam et la publicite deguisee sont interdits. Les comptes
                recidivistes seront suspendus.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                La desinformation deliberee, en particulier concernant la securite
                du systeme VITA, entraine un avertissement puis une suspension.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                Les propositions hors sujet doivent etre signalees mais ne
                justifient pas de sanction envers l&apos;auteur sauf recidive.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                Chaque decision de moderation doit etre motivee et consignee dans
                le journal d&apos;audit.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-500 shrink-0" />
                Les moderateurs doivent se recuser si le contenu signale les
                concerne directement.
              </li>
            </ul>

            <div
              className="mt-6 rounded-lg p-4 text-sm"
              style={{ backgroundColor: "var(--bg-elevated)" }}
            >
              <p className="text-[var(--text-primary)] font-medium mb-2">
                Seuil de moderation automatique : 10 signalements
              </p>
              <p className="text-[var(--text-muted)]">
                Procedure : examen sous 24h, droit d&apos;appel sous 7 jours
              </p>
            </div>

            <div className="mt-4">
              <Link
                href="/codex"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Voir les regles completes dans le Codex &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
