"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SupportButton } from "@/components/agora/SupportButton";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  getDoleanceById,
  CATEGORIE_COLORS,
  CATEGORIE_LABELS,
  type Doleance,
  type DoleanceCategorie,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

function getSupportBarColor(ratio: number): string {
  if (ratio >= 1) return "#10b981";
  if (ratio >= 0.75) return "#8b5cf6";
  if (ratio >= 0.5) return "#a855f7";
  if (ratio >= 0.25) return "#c084fc";
  return "var(--text-muted)";
}

function getStatutBadge(statut: Doleance["statut"]) {
  switch (statut) {
    case "ouverte":
      return <Badge variant="green">Ouverte</Badge>;
    case "seuil_atteint":
      return <Badge variant="orange">Seuil atteint</Badge>;
    case "convertie":
      return <Badge variant="violet">Convertie en proposition</Badge>;
    case "fermee":
      return <Badge variant="red">Fermee</Badge>;
  }
}

function mapApiDoleance(raw: Record<string, unknown>): Doleance {
  const statutMap: Record<string, Doleance["statut"]> = {
    ouverte: "ouverte",
    seuil_atteint: "seuil_atteint",
    convertie: "convertie",
    fermee: "fermee",
  };
  return {
    id: String(raw.id || ""),
    titre: String(raw.titre || raw.title || ""),
    description: String(raw.description || raw.contenu || ""),
    auteur: {
      id: String((raw.auteur as Record<string, unknown>)?.id || raw.auteur_id || ""),
      username: String((raw.auteur as Record<string, unknown>)?.username || raw.auteur_username || raw.author_pseudo || ""),
      prenom: String((raw.auteur as Record<string, unknown>)?.prenom || raw.auteur_prenom || ""),
      nom: String((raw.auteur as Record<string, unknown>)?.nom || raw.auteur_nom || ""),
      initiales: "",
    },
    dateCreation: String(raw.dateCreation || raw.date_creation || raw.created_at || ""),
    categorie: (String(raw.categorie || raw.category || "autre")) as DoleanceCategorie,
    soutiens: Number(raw.soutiens || raw.support_count || 0),
    seuilProposition: Number(raw.seuilProposition || raw.seuil_proposition || 100),
    statut: statutMap[String(raw.statut || raw.status || "")] || "ouverte",
    propositionId: raw.propositionId ? String(raw.propositionId) : (raw.promoted_to_proposal_id ? String(raw.promoted_to_proposal_id) : undefined),
    commentaires: Number(raw.commentaires || raw.comments || 0),
  };
}

export default function DoleanceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isMockMode } = useAuth();

  const mockDoleance = useMemo(() => getDoleanceById(id), [id]);
  const [doleance, setDoleance] = useState<Doleance | undefined>(mockDoleance);

  useEffect(() => {
    if (isMockMode) return;
    async function load() {
      try {
        const raw = (await api.getDoleance(id)) as Record<string, unknown>;
        if (raw && raw.id) {
          const mapped = mapApiDoleance(raw);
          // Fill initials from prenom/nom
          mapped.auteur.initiales =
            (mapped.auteur.prenom[0] || "?") + (mapped.auteur.nom[0] || "");
          setDoleance(mapped);
        }
      } catch {
        // Keep mock
      }
    }
    load();
  }, [id, isMockMode]);

  if (!doleance) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">Doleance introuvable</div>
          <Link href="/agora/grievances">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour aux doleances
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const ratio = doleance.soutiens / doleance.seuilProposition;
  const barColor = getSupportBarColor(ratio);
  const isOuverte = doleance.statut === "ouverte" || doleance.statut === "seuil_atteint";

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Breadcrumb + back */}
      <div className="mb-4 md:mb-6">
        <Link href="/agora/grievances">
          <Button variant="ghost" className="mb-3 md:mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux doleances
          </Button>
        </Link>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="orange">Doleance</Badge>
          <Badge variant={CATEGORIE_COLORS[doleance.categorie]}>
            {CATEGORIE_LABELS[doleance.categorie]}
          </Badge>
          {getStatutBadge(doleance.statut)}
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
          {doleance.titre}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>{doleance.auteur.initiales}</AvatarFallback>
            </Avatar>
            <span>
              Par <strong className="text-[var(--text-primary)]">@{doleance.auteur.username}</strong>
            </span>
          </div>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {doleance.dateCreation}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {doleance.commentaires} commentaires
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {doleance.description}
              </div>
            </CardContent>
          </Card>

          {/* Promoted banner */}
          {doleance.statut === "convertie" && doleance.propositionId && (
            <Card style={{ borderColor: "rgba(139, 92, 246, 0.3)" }}>
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-violet-400 mb-1">
                    Cette doleance a ete convertie en proposition
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Elle a ete transformee en proposition formelle soumise au vote.
                  </div>
                </div>
                <Link href={`/agora/${doleance.propositionId}`}>
                  <Button variant="primary" size="sm">
                    Voir la proposition
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Support button */}
          {isOuverte && (
            <SupportButton
              doleanceId={doleance.id}
              initialCount={doleance.soutiens}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Support progress */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Progression des soutiens
              </h3>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-muted)]">
                    {doleance.soutiens} / {doleance.seuilProposition} soutiens
                  </span>
                  <span className="text-sm font-mono font-bold" style={{ color: barColor }}>
                    {Math.min(Math.round(ratio * 100), 100)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ratio >= 0.75 && ratio < 1 ? "animate-pulse" : ""}`}
                    style={{
                      width: `${Math.min(ratio * 100, 100)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
              {ratio >= 1 ? (
                <p className="text-xs text-emerald-400 font-medium mt-2">
                  Seuil atteint — Cette doleance peut etre convertie en proposition
                </p>
              ) : (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Encore {doleance.seuilProposition - doleance.soutiens} soutiens necessaires
                </p>
              )}
            </CardContent>
          </Card>

          {/* Author card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Auteur
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  {doleance.auteur.initiales}
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-sm">
                    {doleance.auteur.prenom} {doleance.auteur.nom}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    @{doleance.auteur.username}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Informations
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Categorie</span>
                  <Badge variant={CATEGORIE_COLORS[doleance.categorie]}>
                    {CATEGORIE_LABELS[doleance.categorie]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Statut</span>
                  {getStatutBadge(doleance.statut)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Date</span>
                  <span className="text-[var(--text-primary)]">{doleance.dateCreation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Commentaires</span>
                  <span className="text-[var(--text-primary)]">{doleance.commentaires}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
