"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  GitMerge,
  Users,
  X,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import {
  getAllDemandesIntegration,
  FORGE_PROJECTS,
  type ForgeDemandeIntegration,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

type StatusFilter = "all" | "open" | "voting" | "approved" | "integrated" | "rejected" | "closed";
type SortOption = "recent" | "votes" | "comments";

const STATUS_CONFIG: Record<ForgeDemandeIntegration["status"], { icon: typeof GitPullRequest; color: string; label: string; badgeVariant: "green" | "orange" | "violet" | "cyan" | "red" | "yellow" }> = {
  open: { icon: GitPullRequest, color: "text-green-500", label: "Ouvert", badgeVariant: "green" },
  voting: { icon: GitPullRequest, color: "text-violet-500", label: "En vote", badgeVariant: "violet" },
  approved: { icon: CheckCircle2, color: "text-cyan-500", label: "Approuvé", badgeVariant: "cyan" },
  integrated: { icon: GitMerge, color: "text-green-500", label: "Intégré", badgeVariant: "green" },
  rejected: { icon: X, color: "text-red-500", label: "Rejeté", badgeVariant: "red" },
  closed: { icon: X, color: "text-[var(--text-muted)]", label: "Fermé", badgeVariant: "yellow" },
};

export default function DemandesIntegrationPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("recent");

  const allDIs = useMemo(() => getAllDemandesIntegration(), []);

  const filteredDIs = useMemo(() => {
    let result = [...allDIs];

    if (statusFilter !== "all") {
      result = result.filter((di) => di.status === statusFilter);
    }
    if (projectFilter !== "all") {
      result = result.filter((di) => di.projectId === projectFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (di) =>
          di.title.toLowerCase().includes(q) ||
          di.author.toLowerCase().includes(q) ||
          di.sourceVersion.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "votes":
        result.sort((a, b) => b.totalVotes - a.totalVotes);
        break;
      case "comments":
        result.sort((a, b) => b.comments.length - a.comments.length);
        break;
      default:
        result.sort((a, b) => new Date(b.createdIso).getTime() - new Date(a.createdIso).getTime());
        break;
    }

    return result;
  }, [allDIs, search, statusFilter, projectFilter, sort]);

  const openCount = allDIs.filter((di) => di.status === "open" || di.status === "voting").length;
  const integratedCount = allDIs.filter((di) => di.status === "integrated").length;
  const approvedCount = allDIs.filter((di) => di.status === "approved").length;
  const avgVotes = allDIs.length > 0
    ? Math.round(allDIs.reduce((acc, di) => acc + di.totalVotes, 0) / allDIs.length)
    : 0;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Demandes d&apos;intégration
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {allDIs.length} demandes d&apos;intégration — {openCount} ouvertes
          </p>
        </div>
        <PermissionGate permission="create_demande_integration">
          <Button variant="primary">
            <GitPullRequest className="h-4 w-4" />
            Nouvelle DI
          </Button>
        </PermissionGate>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard variant="green" label="Ouvertes" value={String(openCount)} />
        <StatCard variant="cyan" label="Approuvées" value={String(approvedCount)} />
        <StatCard variant="violet" label="Intégrées" value={String(integratedCount)} />
        <StatCard variant="orange" label="Votes moyen" value={String(avgVotes)} />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">Tous statuts</option>
          <option value="open">Ouvertes</option>
          <option value="voting">En vote</option>
          <option value="approved">Approuvées</option>
          <option value="integrated">Intégrées</option>
          <option value="rejected">Rejetées</option>
          <option value="closed">Fermées</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="all">Tous projets</option>
          {FORGE_PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="recent">Plus récentes</option>
          <option value="votes">Plus votées</option>
          <option value="comments">Plus commentées</option>
        </select>
      </div>

      {/* Liste des DI */}
      <div className="space-y-4">
        {filteredDIs.map((di) => {
          const config = STATUS_CONFIG[di.status];
          const StatusIcon = config.icon;
          const approvalPct = di.totalVotes > 0 ? Math.round((di.votes.approve / di.totalVotes) * 100) : 0;

          return (
            <Link key={di.id} href={`/forge/project/${di.projectId}/mr/${di.id}`}>
              <Card className="cursor-pointer p-5 transition-all hover:border-[var(--border-light)] mb-4">
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <StatusIcon className={`h-5 w-5 mt-0.5 shrink-0 ${config.color}`} />

                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        {di.title}
                      </h3>
                      <Badge variant={config.badgeVariant} className="text-xs">
                        {config.label}
                      </Badge>
                      {di.hasConflicts && (
                        <Badge className="text-xs bg-red-500/15 text-red-500">
                          <AlertTriangle className="h-3 w-3" />
                          Conflits
                        </Badge>
                      )}
                    </div>

                    {/* Meta */}
                    <p className="text-sm text-[var(--text-muted)] mb-2">
                      #{di.number} · {di.project} · par {di.author} · {di.created}
                    </p>

                    {/* Versions */}
                    <div className="flex items-center gap-2 mb-3 text-xs">
                      <code className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-violet-500">
                        {di.sourceVersion}
                      </code>
                      <span className="text-[var(--text-muted)]">&rarr;</span>
                      <code className="rounded bg-[var(--bg-elevated)] px-2 py-0.5 font-mono text-[var(--text-secondary)]">
                        {di.targetVersion}
                      </code>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {/* Approval indicator */}
                      {(di.status === "open" || di.status === "voting") && (
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-medium">
                            {di.votes.approve} pour
                          </span>
                          <span className="text-red-500 font-medium">
                            {di.votes.reject} contre
                          </span>
                          <span className="text-[var(--text-muted)]">
                            {di.votes.abstain} abst.
                          </span>
                          <span className="text-[var(--text-muted)]">
                            ({approvalPct}%)
                          </span>
                        </div>
                      )}

                      {/* Diff stats */}
                      <span className="flex items-center gap-1 text-green-500">
                        <Plus className="h-3 w-3" />
                        {formatNumber(di.additions)}
                      </span>
                      <span className="flex items-center gap-1 text-red-500">
                        <Minus className="h-3 w-3" />
                        {formatNumber(di.deletions)}
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {di.filesChanged} fichier{di.filesChanged > 1 ? "s" : ""}
                      </span>

                      {/* Comments */}
                      {di.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-[var(--text-muted)]">
                          <MessageCircle className="h-3 w-3" />
                          {di.comments.length}
                        </span>
                      )}

                      {/* Author avatar */}
                      <div className="ml-auto flex items-center gap-2">
                        <Avatar size="sm">
                          <AvatarFallback>{di.authorInitials}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {filteredDIs.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune demande d&apos;intégration ne correspond à votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
