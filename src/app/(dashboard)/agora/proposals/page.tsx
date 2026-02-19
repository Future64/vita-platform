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
  Settings,
  ArrowRight,
  MessageCircle,
  Clock,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  MOCK_PROPOSALS,
  MOCK_DOLEANCES,
  getProposalsInDiscussion,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: String(MOCK_PROPOSALS.length), badgeVariant: "pink" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: String(MOCK_DOLEANCES.filter(d => d.statut === "ouverte" || d.statut === "seuil_atteint").length), badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

type TypeFilter = "all" | "standard" | "constitutionnel" | "parametre";
type SortOption = "recent" | "comments" | "vote_soon";

export default function PropositionsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");

  const proposals = useMemo(() => {
    let result = getProposalsInDiscussion();

    if (typeFilter === "parametre") {
      result = result.filter((p) => p.type === "modification_parametre");
    } else if (typeFilter === "standard") {
      result = result.filter((p) => !p.type);
    }
    // constitutionnel filter would work if we had that type

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "comments":
        result.sort((a, b) => b.comments - a.comments);
        break;
      case "vote_soon":
        result.sort((a, b) => a.supporters - b.supporters); // rough proxy
        break;
      default:
        break;
    }

    return result;
  }, [search, typeFilter, sort]);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            Propositions en discussion
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)]">
            Ces propositions sont ouvertes aux commentaires avant d&apos;être soumises au vote.
          </p>
        </div>
        <PermissionGate permission="create_proposal">
          <Button>
            <Plus className="h-4 w-4" />
            Nouvelle proposition
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
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500 w-full xs:w-auto"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
        >
          <option value="all">Tous types</option>
          <option value="standard">Standard</option>
          <option value="constitutionnel">Constitutionnel</option>
          <option value="parametre">Paramètre système</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500 w-full xs:w-auto"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="recent">Plus récentes</option>
          <option value="comments">Plus commentées</option>
          <option value="vote_soon">Bientôt en vote</option>
        </select>
      </div>

      {/* Proposals list */}
      <div className="space-y-4">
        {proposals.map((proposal) => (
          <Link key={proposal.id} href={`/agora/${proposal.id}`}>
            <Card className="cursor-pointer p-5 transition-all hover:border-[var(--border-light)] mb-4">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant={proposal.domainColor}>{proposal.domain}</Badge>
                <Badge variant={proposal.statusColor}>{proposal.statusLabel}</Badge>
                {proposal.type === "modification_parametre" && (
                  <Badge className="text-xs bg-orange-500/15 text-orange-500">
                    <Settings className="h-3 w-3" />
                    Paramètre
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                {proposal.title}
              </h3>

              {/* Description */}
              <p className="mb-3 text-sm text-[var(--text-secondary)] line-clamp-2">
                {proposal.description}
              </p>

              {/* Parameter diff */}
              {proposal.type === "modification_parametre" && proposal.parameterProposal && (
                <div
                  className="mb-3 p-2.5 rounded-lg flex items-center gap-3 text-sm"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <span className="text-xs text-[var(--text-muted)]">
                    {proposal.parameterProposal.parameterName}:
                  </span>
                  <span className="font-mono text-red-400 line-through">
                    {String(proposal.parameterProposal.currentValue)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <span className="font-mono text-green-400 font-semibold">
                    {String(proposal.parameterProposal.proposedValue)}
                  </span>
                </div>
              )}

              {/* Phase indicator */}
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <Clock className="h-3 w-3" />
                {proposal.status === "deliberation"
                  ? "En discussion — Passe en vote prochainement"
                  : "En cosignatures — Recherche de soutiens"}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar size="sm" color={proposal.author.color || "primary"}>
                    <AvatarFallback>{proposal.author.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[var(--text-primary)]">
                    {proposal.author.name}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{proposal.date}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {proposal.supporters} soutiens
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <MessageCircle className="h-3 w-3" />
                  {proposal.comments}
                </span>
                <span className="ml-auto text-sm font-medium text-violet-500">
                  Lire et commenter →
                </span>
              </div>
            </Card>
          </Link>
        ))}

        {proposals.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune proposition ne correspond à votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
