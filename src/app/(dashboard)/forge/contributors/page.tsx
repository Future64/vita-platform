"use client";

import { useState, useMemo } from "react";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  Users,
  Trophy,
  MessageCircle,
  Plus,
  Minus,
  Code,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/lib/format";
import { getContributors, type ForgeContributor } from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Merge Requests", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Commits récents", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

type SortOption = "commits" | "mrs" | "lignes" | "recent";

function getMedalEmoji(rank: number): string | null {
  if (rank === 0) return "\u{1F947}";
  if (rank === 1) return "\u{1F948}";
  if (rank === 2) return "\u{1F949}";
  return null;
}

function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  const h = 20;
  const w = 56;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");

  return (
    <svg width={w} height={h} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke="rgba(139, 92, 246, 0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={h - (v / max) * h}
          r={v > 0 ? 2 : 0}
          fill="#8b5cf6"
        />
      ))}
    </svg>
  );
}

export default function ContributorsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("commits");

  const contributors = useMemo(() => getContributors(), []);

  const sorted = useMemo(() => {
    let result = [...contributors];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "mrs":
        result.sort((a, b) => b.mergeRequests - a.mergeRequests);
        break;
      case "lignes":
        result.sort((a, b) => (b.lignesAjoutees + b.lignesSupprimees) - (a.lignesAjoutees + a.lignesSupprimees));
        break;
      case "recent":
        // Keep original order as a proxy (already sorted by activity)
        break;
      default:
        result.sort((a, b) => b.commits - a.commits);
        break;
    }

    return result;
  }, [contributors, search, sort]);

  // Global stats
  const totalCommits = contributors.reduce((acc, c) => acc + c.commits, 0);
  const totalMRs = contributors.reduce((acc, c) => acc + c.mergeRequests, 0);
  const totalLignes = contributors.reduce((acc, c) => acc + c.lignesAjoutees + c.lignesSupprimees, 0);
  const totalComments = contributors.reduce((acc, c) => acc + c.commentaires, 0);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Contributeurs
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {contributors.length} contributeurs actifs sur la Forge
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard variant="violet" label="Total commits" value={formatNumber(totalCommits)} />
        <StatCard variant="cyan" label="Merge Requests" value={String(totalMRs)} />
        <StatCard variant="green" label="Lignes modifiées" value={formatNumber(totalLignes)} />
        <StatCard variant="orange" label="Commentaires" value={formatNumber(totalComments)} />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher un contributeur..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="commits">Par commits</option>
          <option value="mrs">Par merge requests</option>
          <option value="lignes">Par lignes modifiées</option>
          <option value="recent">Activité récente</option>
        </select>
      </div>

      {/* Contributors list */}
      <div className="space-y-3">
        {sorted.map((contributor, index) => {
          const medal = getMedalEmoji(index);
          const totalLines = contributor.lignesAjoutees + contributor.lignesSupprimees;

          return (
            <Card key={contributor.id} className="p-4 transition-all hover:border-violet-500/30">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {medal ? (
                    <span className="text-lg">{medal}</span>
                  ) : (
                    <span className="text-sm font-mono text-[var(--text-muted)]">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar size="md" color={contributor.color}>
                  <AvatarFallback>{contributor.initials}</AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {contributor.name}
                    </h3>
                    <span className="text-xs text-[var(--text-muted)]">
                      @{contributor.username}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <GitCommit className="h-3 w-3" />
                      {contributor.commits} commits
                    </span>
                    <span className="flex items-center gap-1">
                      <GitPullRequest className="h-3 w-3" />
                      {contributor.mergeRequests} MR
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {contributor.commentaires}
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <Plus className="h-3 w-3" />
                      {formatNumber(contributor.lignesAjoutees)}
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <Minus className="h-3 w-3" />
                      {formatNumber(contributor.lignesSupprimees)}
                    </span>
                  </div>
                  {/* Projects */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {contributor.projets.map((p) => (
                      <Badge key={p} variant="violet" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Sparkline + last activity */}
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <MiniSparkline data={contributor.activiteRecente} />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {contributor.derniereActivite}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}

        {sorted.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucun contributeur ne correspond à votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
