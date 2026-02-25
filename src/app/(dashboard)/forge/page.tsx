"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FolderGit2,
  GitPullRequest,
  Search,
  Users,
  Plus,
  ChevronRight,
  GitBranch,
  BookOpen,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getForgeProjects, type ForgeProject } from "@/lib/vita-api";

const sidebarItems: SidebarItem[] = [
  { icon: FolderGit2, label: "Projets", href: "/forge" },
];

export default function ForgePage() {
  const [projects, setProjects] = useState<ForgeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getForgeProjects();
        setProjects(data);
      } catch {
        // API not available
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [projects, search]);

  const totalMRs = projects.reduce((sum, p) => sum + (p.mr_count ?? 0), 0);
  const totalContributors = new Set(
    projects.flatMap(() => [])
  ).size || projects.reduce((sum, p) => sum + (p.contributor_count ?? 0), 0);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            Forge Collaborative
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)]">
            Co-editez les textes fondateurs de VITA avec un workflow Git-like
          </p>
        </div>
        <Link href="/forge/nouveau">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3">
        <StatCard variant="violet" label="Projets" value={projects.length} />
        <StatCard variant="pink" label="Merge Requests" value={totalMRs} />
        <StatCard variant="green" label="Contributeurs" value={totalContributors} />
      </div>

      {/* Search */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3.5 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Rechercher un projet..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Project List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse text-[var(--text-muted)]">
            Chargement des projets...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="Aucun projet"
          description={
            search
              ? "Aucun projet ne correspond a votre recherche."
              : "Les projets de la Forge apparaitront ici."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <Link key={project.id} href={`/forge/${project.id}`}>
              <div className="group rounded-lg border border-[var(--border)] p-3.5 md:p-4 transition-all hover:border-violet-500/50 hover:bg-[var(--bg-elevated)] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <FolderGit2 className="h-4 w-4 text-violet-500 flex-shrink-0" />
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">
                        {project.title}
                      </h3>
                      {project.codex_ref && (
                        <Badge variant="blue" className="text-xs">
                          <BookOpen className="h-3 w-3" />
                          Art. {project.codex_ref}
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-xs text-[var(--text-secondary)] mb-2 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {project.branch_count ?? 0} branche{(project.branch_count ?? 0) > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitPullRequest className="h-3 w-3" />
                        {project.mr_count ?? 0} MR
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.contributor_count ?? 0}
                      </span>
                      <span>
                        Mis a jour le{" "}
                        {new Date(project.updated_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
