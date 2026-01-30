"use client";

import Link from "next/link";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Plus,
  GitBranch,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoteBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: "12", badgeVariant: "pink" },
  { icon: Scroll, label: "Doléances", href: "/agora/grievances", badge: "8", badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

const proposals = [
  {
    id: "1",
    title: "Révision du coefficient PPA",
    description: "Adapter le coefficient selon les variations régionales.",
    domain: "Économie",
    domainColor: "orange" as const,
    status: "Vote",
    statusColor: "green" as const,
    author: { name: "Marie D.", initials: "MD" },
    votesFor: 67,
    votesAgainst: 23,
    date: "2j",
    hasBranches: false,
  },
  {
    id: "2",
    title: "Fonds urgence climatique",
    description: "Financement collectif pour actions climatiques.",
    domain: "Environnement",
    domainColor: "green" as const,
    status: "Collaboratif",
    statusColor: "cyan" as const,
    author: { name: "Lucas T.", initials: "LT", color: "cyan" as const },
    branches: 3,
    date: "5j",
    hasBranches: true,
  },
];

export default function AgoraPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Propositions
          </h1>
          <p className="text-sm text-[var(--text-muted)]">12 propositions actives</p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Nouvelle
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="max-w-xs flex-1"
        />
        <select className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500">
          <option>Tous domaines</option>
          <option>Économie</option>
          <option>Environnement</option>
          <option>Social</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-5">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="voting">En vote</TabsTrigger>
          <TabsTrigger value="collab">Collaboratif</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Proposals List */}
      <div className="space-y-0">
        {proposals.map((proposal) => (
          <Link key={proposal.id} href={`/agora/${proposal.id}`}>
            <Card className="cursor-pointer p-5 transition-all hover:border-[var(--border-light)] mb-4">
              {/* Badges */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant={proposal.domainColor}>{proposal.domain}</Badge>
                {proposal.hasBranches ? (
                  <Badge variant={proposal.statusColor}>
                    <GitBranch className="h-2.5 w-2.5" />
                    {proposal.branches} branches
                  </Badge>
                ) : (
                  <Badge variant={proposal.statusColor}>{proposal.status}</Badge>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                {proposal.title}
              </h3>
              <p className="mb-4 text-sm text-[var(--text-secondary)]">
                {proposal.description}
              </p>

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

                {/* Vote bar (if voting) */}
                {!proposal.hasBranches && (
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-sm font-semibold text-green-500">
                      {proposal.votesFor}%
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
      </div>
    </DashboardLayout>
  );
}
