"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteBar } from "@/components/ui/progress";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  getArchiveById,
  type ArchivedProposal,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

function mapApiArchive(raw: Record<string, unknown>): ArchivedProposal {
  const resultatMap: Record<string, "adopte" | "rejete"> = {
    adopte: "adopte",
    rejete: "rejete",
    adopted: "adopte",
    rejected: "rejete",
  };

  const domainColorMap: Record<string, ArchivedProposal["domainColor"]> = {
    economie: "orange",
    environnement: "green",
    technique: "cyan",
    gouvernance: "violet",
    social: "pink",
    sante: "red",
    ecologie: "green",
    education: "blue",
  };

  const domain = String(raw.categorie || raw.domain || "autre");

  const votesFor = Number(raw.votes_pour || raw.votesFor || 0);
  const votesAgainst = Number(raw.votes_contre || raw.votesAgainst || 0);
  const votesAbstain = Number(raw.votes_abstention || raw.votesAbstain || 0);
  const totalVotes = Number(raw.total_votes || raw.totalVotes || votesFor + votesAgainst + votesAbstain);

  return {
    id: String(raw.id || ""),
    title: String(raw.titre || raw.title || ""),
    description: String(raw.description || raw.contenu || raw.content || ""),
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    domainColor: domainColorMap[domain.toLowerCase()] || "violet",
    type: (raw.type_proposition || raw.type || undefined) as ArchivedProposal["type"],
    resultat: resultatMap[String(raw.resultat || raw.result || "")] || "rejete",
    votesFor,
    votesAgainst,
    votesAbstain,
    totalVotes,
    participation: Number(raw.participation || (totalVotes > 0 ? 0 : 0)),
    dateFin: String(raw.dateFin || raw.date_fin || raw.closed_at || ""),
    author: {
      name: raw.author_pseudo
        ? String(raw.author_pseudo)
        : `${raw.auteur_prenom || ""} ${raw.auteur_nom || ""}`.trim() || String((raw.author as Record<string, unknown>)?.name || "Anonyme"),
      initials: raw.author_pseudo
        ? String(raw.author_pseudo).substring(0, 2).toUpperCase()
        : `${String(raw.auteur_prenom || "?")[0]}${String(raw.auteur_nom || "")[0]}`,
    },
    applique: raw.applique === true || raw.applied === true,
  };
}

function VoteResult({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: "green" | "red" | "slate";
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors = {
    green: "text-green-400",
    red: "text-red-400",
    slate: "text-[var(--text-muted)]",
  };
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colors[color]}`}>{pct}%</div>
      <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
      <div className="text-xs text-[var(--text-muted)]">{formatNumber(count)} votes</div>
    </div>
  );
}

export default function ArchiveDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { isMockMode } = useAuth();

  const mockArchive = useMemo(() => getArchiveById(id), [id]);
  const [archive, setArchive] = useState<ArchivedProposal | undefined>(mockArchive);

  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isMockMode || !isUuid) return;
    async function load() {
      try {
        // Archives are closed propositions — fetch via getProposition + getResultats
        const raw = (await api.getProposition(id)) as Record<string, unknown>;
        if (raw && raw.id) {
          const mapped = mapApiArchive(raw);
          // Try to get vote results too
          try {
            const results = (await api.getResultats(id)) as Record<string, unknown>;
            if (results) {
              if (results.votes_pour != null) mapped.votesFor = Number(results.votes_pour);
              if (results.votes_contre != null) mapped.votesAgainst = Number(results.votes_contre);
              if (results.votes_abstention != null) mapped.votesAbstain = Number(results.votes_abstention);
              if (results.total_votes != null) mapped.totalVotes = Number(results.total_votes);
              if (results.participation != null) mapped.participation = Number(results.participation);
            }
          } catch {
            // No results endpoint — keep what we have
          }
          setArchive(mapped);
        }
      } catch {
        // Keep mock
      }
    }
    load();
  }, [id, isMockMode]);

  if (!archive) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">Archive introuvable</div>
          <Link href="/agora/archives">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour aux archives
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isAdopte = archive.resultat === "adopte";
  const forPct = archive.totalVotes > 0 ? Math.round((archive.votesFor / archive.totalVotes) * 100) : 0;
  const againstPct = archive.totalVotes > 0 ? Math.round((archive.votesAgainst / archive.totalVotes) * 100) : 0;
  const abstainPct = archive.totalVotes > 0 ? Math.round((archive.votesAbstain / archive.totalVotes) * 100) : 0;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Back + breadcrumb */}
      <div className="mb-4 md:mb-6">
        <Link href="/agora/archives">
          <Button variant="ghost" className="mb-3 md:mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux archives
          </Button>
        </Link>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant={archive.domainColor}>{archive.domain}</Badge>
          <Badge variant={isAdopte ? "green" : "red"}>
            {isAdopte ? (
              <><CheckCircle2 className="h-3 w-3 mr-0.5" /> Adopte</>
            ) : (
              <><XCircle className="h-3 w-3 mr-0.5" /> Rejete</>
            )}
          </Badge>
          {archive.type === "modification_parametre" && (
            <Badge className="text-xs bg-orange-500/15 text-orange-500">
              <Settings className="h-3 w-3" />
              Parametre
            </Badge>
          )}
          {archive.type === "constitutionnel" && (
            <Badge variant="violet">Constitutionnel</Badge>
          )}
          {archive.type === "modification_parametre" && isAdopte && (
            <Badge variant={archive.applique ? "green" : "yellow"} className="text-xs">
              {archive.applique ? "Applique" : "En attente"}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
          {archive.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-[var(--text-muted)]">
          <span>
            Propose par <strong className="text-[var(--text-primary)]">{archive.author.name}</strong>
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Cloture {archive.dateFin}
          </span>
          <span>&middot;</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {formatNumber(archive.totalVotes)} votants
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Vote results card */}
          <Card>
            <CardHeader>
              <CardTitle>Resultats du vote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <VoteResult
                  label="Pour"
                  count={archive.votesFor}
                  total={archive.totalVotes}
                  color="green"
                />
                <VoteResult
                  label="Contre"
                  count={archive.votesAgainst}
                  total={archive.totalVotes}
                  color="red"
                />
                <VoteResult
                  label="Abstention"
                  count={archive.votesAbstain}
                  total={archive.totalVotes}
                  color="slate"
                />
              </div>

              {/* Tricolor bar */}
              <div className="h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden flex mb-3">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${forPct}%` }}
                />
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${againstPct}%` }}
                />
                <div
                  className="transition-all"
                  style={{ width: `${abstainPct}%`, backgroundColor: "rgb(100 116 139)" }}
                />
              </div>

              <div className="text-xs text-[var(--text-muted)] text-center">
                {formatNumber(archive.totalVotes)} votes exprimes
                {archive.participation > 0 && (
                  <> &middot; Participation : {archive.participation}%</>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Texte de la proposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {archive.description}
              </div>
            </CardContent>
          </Card>

          {/* Applied to Codex banner */}
          {isAdopte && archive.applique && (
            <Card style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-green-400 mb-1">
                    Cette decision est inscrite dans la Constitution
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    Elle a ete integree au Codex VITA apres son adoption.
                  </div>
                </div>
                <Link href="/codex">
                  <Button variant="primary" size="sm">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Voir le Codex
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Result summary card */}
          <Card
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: isAdopte ? "#10b981" : "#ef4444",
            }}
          >
            <CardContent className="p-5">
              <div className="text-center mb-3">
                <div className={`text-3xl font-bold ${isAdopte ? "text-green-400" : "text-red-400"}`}>
                  {isAdopte ? "Adoptee" : "Rejetee"}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {forPct}% pour &middot; {againstPct}% contre
                </div>
              </div>
              <VoteBar
                votesFor={archive.votesFor}
                votesAgainst={archive.votesAgainst}
                votesAbstain={archive.votesAbstain}
              />
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Statistiques
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Votes pour</span>
                  <span className="font-semibold text-green-400">{formatNumber(archive.votesFor)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Votes contre</span>
                  <span className="font-semibold text-red-400">{formatNumber(archive.votesAgainst)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Abstentions</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatNumber(archive.votesAbstain)}</span>
                </div>
                <div className="border-t border-[var(--border)] pt-2.5 flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Total</span>
                  <span className="font-bold text-[var(--text-primary)]">{formatNumber(archive.totalVotes)}</span>
                </div>
                {archive.participation > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Participation</span>
                    <span className="font-semibold text-[var(--text-primary)]">{archive.participation}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Auteur
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  {archive.author.initials}
                </div>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-sm">
                    {archive.author.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Citoyen actif</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
