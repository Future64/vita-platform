"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Plus,
  GitBranch,
  Settings,
  ArrowRight,
  Shield,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { MOCK_PROPOSALS } from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: String(MOCK_PROPOSALS.length), badgeVariant: "pink" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: "8", badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
  { icon: Shield, label: "Administration", href: "/admin", permission: "access_admin_panel" },
];

type TabFilter = "all" | "voting" | "deliberation" | "parametre";

export default function AgoraPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  const filteredProposals = useMemo(() => {
    let proposals = [...MOCK_PROPOSALS];

    if (activeTab === "voting") {
      proposals = proposals.filter((p) => p.status === "voting");
    } else if (activeTab === "deliberation") {
      proposals = proposals.filter((p) => p.status === "deliberation" || p.status === "cosigning");
    } else if (activeTab === "parametre") {
      proposals = proposals.filter((p) => p.type === "modification_parametre");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      proposals = proposals.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return proposals;
  }, [search, activeTab]);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Propositions
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {MOCK_PROPOSALS.length} propositions actives
          </p>
        </div>
        <PermissionGate permission="create_proposal">
          <Button>
            <Plus className="h-4 w-4" />
            Nouvelle
          </Button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500">
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
            <Card className="cursor-pointer p-5 transition-all hover:border-[var(--border-light)] mb-4">
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
                  className="mb-3 p-2.5 rounded-lg flex items-center gap-3 text-sm"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <span className="font-mono text-red-400 line-through">
                    {String(proposal.parameterProposal.currentValue)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="font-mono text-green-400 font-semibold">
                    {String(proposal.parameterProposal.proposedValue)}
                  </span>
                  {proposal.parameterProposal.requiredQuorum && (
                    <span className="ml-auto text-xs text-[var(--text-muted)]">
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
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune proposition ne correspond a votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
