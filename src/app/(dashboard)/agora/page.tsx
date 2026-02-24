"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Users,
  Plus,
  Settings,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useGovernance } from "@/hooks/useGovernance";
import type { AgoraProposal } from "@/lib/mockProposals";

// Map backend proposition shape to AgoraProposal for display
function mapApiProposal(raw: unknown): AgoraProposal {
  const p = raw as Record<string, unknown>;

  const statusMap: Record<string, AgoraProposal["status"]> = {
    cosignature: "cosigning",
    deliberation: "deliberation",
    vote: "voting",
    adopte: "adopted",
    rejete: "rejected",
    applique: "applied",
  };

  const domainColorMap: Record<string, AgoraProposal["domainColor"]> = {
    economie: "orange",
    environnement: "green",
    technique: "cyan",
    gouvernance: "violet",
    social: "pink",
    sante: "red",
    ecologie: "green",
    education: "blue",
  };

  const statusColorMap: Record<string, AgoraProposal["statusColor"]> = {
    cosigning: "violet",
    deliberation: "cyan",
    voting: "green",
    adopted: "green",
    rejected: "red",
    applied: "blue",
  };

  const statusLabelMap: Record<string, string> = {
    cosigning: "Co-signature",
    deliberation: "Deliberation",
    voting: "Vote",
    adopted: "Adopte",
    rejected: "Rejete",
    applied: "Applique",
  };

  const status = statusMap[String(p.statut || "")] || String(p.status || "deliberation") as AgoraProposal["status"];
  const domain = String(p.categorie || p.domain || "autre");
  const auteurPrenom = String(p.auteur_prenom || p.auteur_username || "");
  const auteurNom = String(p.auteur_nom || "");
  const initials = (auteurPrenom[0] || "?") + (auteurNom[0] || "");

  return {
    id: String(p.id || ""),
    title: String(p.titre || p.title || ""),
    description: String(p.description || ""),
    domain: domain.charAt(0).toUpperCase() + domain.slice(1),
    domainColor: domainColorMap[domain.toLowerCase()] || "violet",
    status,
    statusLabel: statusLabelMap[status] || status,
    statusColor: statusColorMap[status] || "cyan",
    author: { name: `${auteurPrenom} ${auteurNom}`.trim() || "Anonyme", initials },
    votesFor: p.votes_pour != null ? Number(p.votes_pour) : (p.votesFor != null ? Number(p.votesFor) : undefined),
    votesAgainst: p.votes_contre != null ? Number(p.votes_contre) : (p.votesAgainst != null ? Number(p.votesAgainst) : undefined),
    votesAbstain: p.votes_abstention != null ? Number(p.votes_abstention) : undefined,
    totalVotes: p.total_votes != null ? Number(p.total_votes) : undefined,
    date: String(p.date || p.date_creation || ""),
    createdAt: String(p.date_creation || p.createdAt || ""),
    votingEndsAt: p.date_fin_vote ? String(p.date_fin_vote) : undefined,
    comments: Number(p.comments || p.commentaires || 0),
    supporters: Number(p.supporters || p.soutiens || 0),
    type: p.type_proposition === "modification_parametre" || p.type === "modification_parametre" ? "modification_parametre" : undefined,
    parameterProposal: p.parameterProposal as AgoraProposal["parameterProposal"],
  };
}

type TabFilter = "all" | "voting" | "deliberation" | "parametre";

export default function AgoraPage() {
  const { propositions, loading, isMock } = useGovernance();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  // Map raw propositions to AgoraProposal shape
  const proposals: AgoraProposal[] = useMemo(() => {
    return propositions.map(mapApiProposal);
  }, [propositions]);

  const sidebarItems: SidebarItem[] = [
    { icon: Flame, label: "En cours", href: "/agora", badge: String(proposals.length), badgeVariant: "pink" },
    { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: "8", badgeVariant: "orange" },
    { icon: FileText, label: "Propositions", href: "/agora/proposals" },
    { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
    { icon: Users, label: "Delegues", href: "/agora/delegues" },
    { icon: Archive, label: "Archives", href: "/agora/archives" },
  ];

  const filteredProposals = useMemo(() => {
    let filtered = [...proposals];

    if (activeTab === "voting") {
      filtered = filtered.filter((p) => p.status === "voting");
    } else if (activeTab === "deliberation") {
      filtered = filtered.filter((p) => p.status === "deliberation" || p.status === "cosigning");
    } else if (activeTab === "parametre") {
      filtered = filtered.filter((p) => p.type === "modification_parametre");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [proposals, search, activeTab]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            Propositions
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)]">
            {proposals.length} propositions actives
            {isMock && <span className="ml-2 text-amber-500">(mode demo)</span>}
          </p>
        </div>
        <PermissionGate permission="create_proposal">
          <Button className="self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Nouvelle
          </Button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="mb-4 md:mb-5 flex flex-col xs:flex-row flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="w-full xs:max-w-xs xs:flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500 w-full xs:w-auto">
          <option>Tous domaines</option>
          <option>Economie</option>
          <option>Environnement</option>
          <option>Parametre</option>
          <option>Social</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-5">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setActiveTab("all")}>Toutes</TabsTrigger>
          <TabsTrigger value="voting" onClick={() => setActiveTab("voting")}>En vote</TabsTrigger>
          <TabsTrigger value="deliberation" onClick={() => setActiveTab("deliberation")}>Deliberation</TabsTrigger>
          <TabsTrigger value="parametre" onClick={() => setActiveTab("parametre")}>
            <Settings className="h-3.5 w-3.5" />
            Parametres
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Proposals List */}
      <div className="space-y-0">
        {filteredProposals.map((proposal) => (
          <Link key={proposal.id} href={`/agora/${proposal.id}`}>
            <Card className="cursor-pointer p-3.5 md:p-5 transition-all hover:border-[var(--border-light)] mb-3 md:mb-4">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant={proposal.domainColor}>{proposal.domain}</Badge>
                <Badge variant={proposal.statusColor}>{proposal.statusLabel}</Badge>
                {proposal.type === "modification_parametre" && (
                  <Badge className="text-xs bg-orange-500/15 text-orange-500">
                    <Settings className="h-3 w-3" />
                    Parametre
                  </Badge>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                {proposal.title}
              </h3>
              <p className="mb-3 text-sm text-[var(--text-secondary)]">
                {proposal.description}
              </p>

              {/* Parameter diff */}
              {proposal.type === "modification_parametre" && proposal.parameterProposal && (
                <div
                  className="mb-3 p-2.5 rounded-lg flex flex-wrap items-center gap-2 md:gap-3 text-sm"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <span className="font-mono text-red-400 line-through text-xs md:text-sm">
                    {String(proposal.parameterProposal.currentValue)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="font-mono text-green-400 font-semibold text-xs md:text-sm">
                    {String(proposal.parameterProposal.proposedValue)}
                  </span>
                  {proposal.parameterProposal.requiredQuorum && (
                    <span className="w-full md:w-auto md:ml-auto text-xs text-[var(--text-muted)]">
                      Quorum {proposal.parameterProposal.requiredQuorum}% &middot; Seuil {proposal.parameterProposal.requiredThreshold}%
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <Avatar size="sm" color={proposal.author.color || "primary"}>
                    <AvatarFallback>{proposal.author.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[var(--text-primary)]">
                    {proposal.author.name}
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs text-[var(--text-muted)]">
                  {proposal.date}
                </span>

                {/* Supporters count */}
                <span className="text-xs text-[var(--text-muted)]">
                  {proposal.supporters} soutiens
                </span>

                {/* Vote bar (if voting) */}
                {proposal.status === "voting" && proposal.votesFor != null && proposal.votesAgainst != null && (
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-semibold text-green-500">
                      {((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100).toFixed(0)}%
                    </span>
                    <VoteBar
                      votesFor={proposal.votesFor}
                      votesAgainst={proposal.votesAgainst}
                      className="w-20"
                    />
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}

        {filteredProposals.length === 0 && (
          <EmptyState
            icon={Vote}
            title="Aucune proposition en cours"
            description="Soyez le premier a soumettre une proposition a la communaute VITA."
            action={{ label: "Soumettre une proposition", href: "/agora/proposals" }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
