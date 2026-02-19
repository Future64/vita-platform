"use client";

import { useState, useMemo } from "react";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  Users,
  Plus,
  Minus,
  FileText,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatNumber } from "@/lib/format";
import {
  getAllRevisions,
  groupRevisionsByDay,
  ACTIVITY_HEATMAP,
  type ForgeRevision,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

type SortOption = "recent" | "additions" | "author";

function getHeatmapColor(count: number): string {
  if (count === 0) return "var(--bg-elevated)";
  if (count === 1) return "rgba(139, 92, 246, 0.2)";
  if (count === 2) return "rgba(139, 92, 246, 0.4)";
  if (count === 3) return "rgba(139, 92, 246, 0.6)";
  if (count === 4) return "rgba(139, 92, 246, 0.8)";
  return "rgba(139, 92, 246, 1)";
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export default function RevisionsPage() {
  const [search, setSearch] = useState("");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("recent");

  const allRevisions = useMemo(() => getAllRevisions(), []);

  // Extract unique versions de travail
  const versions = useMemo(() => {
    const set = new Set(allRevisions.map((c) => c.versionTravail));
    return Array.from(set).sort();
  }, [allRevisions]);

  const filteredRevisions = useMemo(() => {
    let result = [...allRevisions];

    if (versionFilter !== "all") {
      result = result.filter((c) => c.versionTravail === versionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.message.toLowerCase().includes(q) ||
          c.author.toLowerCase().includes(q) ||
          c.ref.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "additions":
        result.sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions));
        break;
      case "author":
        result.sort((a, b) => a.author.localeCompare(b.author));
        break;
      default:
        result.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime());
        break;
    }

    return result;
  }, [allRevisions, search, versionFilter, sort]);

  const grouped = useMemo(() => groupRevisionsByDay(filteredRevisions), [filteredRevisions]);

  const totalAdditions = allRevisions.reduce((acc, c) => acc + c.additions, 0);
  const totalDeletions = allRevisions.reduce((acc, c) => acc + c.deletions, 0);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Révisions récentes
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          {allRevisions.length} révisions — {formatNumber(totalAdditions)} ajouts, {formatNumber(totalDeletions)} suppressions
        </p>
      </div>

      {/* Activity Heatmap */}
      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle>Activité (12 dernières semaines)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 overflow-x-auto">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-2 pt-0">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="h-3 w-3 flex items-center justify-center text-[9px] text-[var(--text-muted)]">
                  {i % 2 === 0 ? label : ""}
                </div>
              ))}
            </div>
            {/* Heatmap grid */}
            {ACTIVITY_HEATMAP.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((count, di) => (
                  <div
                    key={di}
                    className="h-3 w-3 rounded-sm transition-colors"
                    style={{ backgroundColor: getHeatmapColor(count) }}
                    title={`${count} révision${count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Moins</span>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: getHeatmapColor(n) }}
              />
            ))}
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-4 md:mb-5 flex flex-col xs:flex-row flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="w-full xs:max-w-xs xs:flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 w-full xs:w-auto rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={versionFilter}
          onChange={(e) => setVersionFilter(e.target.value)}
        >
          <option value="all">Toutes versions</option>
          {versions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          className="h-10 w-full xs:w-auto rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="recent">Plus récents</option>
          <option value="additions">Plus de changements</option>
          <option value="author">Par auteur</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.dateIso}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-sm font-semibold text-[var(--text-secondary)] shrink-0">
                {group.day}
              </span>
              <Badge variant="violet" className="text-xs shrink-0">
                {group.revisions.length} révision{group.revisions.length > 1 ? "s" : ""}
              </Badge>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Révisions du jour */}
            <div className="space-y-2 pl-4 border-l-2 border-[var(--border)] ml-2">
              {group.revisions.map((revision) => (
                <div
                  key={revision.ref}
                  className="relative pl-5 py-2"
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[-9px] top-4 h-3 w-3 rounded-full border-2"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-card)",
                    }}
                  />

                  <div className="rounded-lg border border-[var(--border)] p-2.5 md:p-3 bg-[var(--bg-card)] hover:border-violet-500/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Message */}
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-xs font-mono text-violet-500 bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded shrink-0">
                            {revision.ref}
                          </code>
                          <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {revision.message}
                          </h4>
                        </div>

                        {/* Description */}
                        {revision.description && (
                          <p className="text-xs text-[var(--text-muted)] mb-1 line-clamp-1">
                            {revision.description}
                          </p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5">
                            <Avatar size="sm">
                              <AvatarFallback>{revision.authorInitials}</AvatarFallback>
                            </Avatar>
                            <span>{revision.author}</span>
                          </div>
                          <code className="font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                            {revision.versionTravail}
                          </code>
                          <span className="flex items-center gap-1 text-green-500">
                            <Plus className="h-3 w-3" />
                            {revision.additions}
                          </span>
                          <span className="flex items-center gap-1 text-red-500">
                            <Minus className="h-3 w-3" />
                            {revision.deletions}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {revision.filesChanged}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs text-[var(--text-muted)] shrink-0">
                        {revision.date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune révision ne correspond à votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
