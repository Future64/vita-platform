"use client";

import { useState, useMemo } from "react";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  Code,
  Users,
  Star,
  GitMerge,
  Search,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListItem } from "@/components/ui/list-item";
import Link from "next/link";
import {
  FORGE_PROJECTS,
  FORGE_DEMANDES_INTEGRATION,
  FORGE_USERS,
  LANGUAGE_COLORS,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

const statusBadge: Record<string, { variant: "green" | "orange" | "violet"; label: string }> = {
  active: { variant: "green", label: "Actif" },
  draft: { variant: "orange", label: "Brouillon" },
  archived: { variant: "violet", label: "Archivé" },
};

export default function ForgePage() {
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return FORGE_PROJECTS;
    const q = search.toLowerCase();
    return FORGE_PROJECTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.language.toLowerCase().includes(q)
    );
  }, [search]);

  const recentDIs = FORGE_DEMANDES_INTEGRATION.slice(0, 3);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
            Forge Collaborative
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)]">
            Projets ouverts et contributions citoyennes
          </p>
        </div>
        <PermissionGate permission="create_version_travail">
          <Button variant="primary">
            <GitBranch className="h-4 w-4" />
            Nouveau projet
          </Button>
        </PermissionGate>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Projets actifs"
          value={String(FORGE_PROJECTS.length)}
          trend={{ value: "+3", direction: "up" }}
        />
        <StatCard
          variant="cyan"
          label="Contributeurs"
          value="342"
          trend={{ value: "+12", direction: "up" }}
        />
        <StatCard
          variant="green"
          label="DI ouvertes"
          value={String(FORGE_DEMANDES_INTEGRATION.filter((di) => di.status === "open" || di.status === "voting").length)}
        />
        <StatCard
          variant="orange"
          label="Révisions (30j)"
          value="1 247"
          trend={{ value: "+15%", direction: "up" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
        {/* Main Content - Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Projets</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  className="h-9 w-full rounded-lg border bg-[var(--bg-elevated)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-64"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects.length === 0 ? (
                  <EmptyState
                    icon={Code}
                    title="Aucun projet trouve"
                    description="La Forge permet de proposer des modifications aux textes fondateurs de VITA."
                  />
                ) : (
                  filteredProjects.map((project) => {
                    const badge = statusBadge[project.status];
                    return (
                      <Link key={project.id} href={`/forge/project/${project.id}`}>
                        <div className="group rounded-lg border border-[var(--border)] p-3 md:p-4 transition-all hover:border-violet-500/50 hover:bg-[var(--bg-elevated)] hover:-translate-y-0.5 hover:shadow-lg cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-violet-500" />
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                  {project.name}
                                </h3>
                                <Badge variant={badge.variant} className="text-xs">
                                  {badge.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] mb-3">
                                {project.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-wrap gap-2 md:gap-4 text-xs text-[var(--text-muted)]">
                              <span
                                className={`flex items-center gap-1 ${
                                  LANGUAGE_COLORS[project.language] || "text-[var(--text-muted)]"
                                }`}
                              >
                                <div className="h-2 w-2 rounded-full bg-current" />
                                {project.language}
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                {project.stars}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {project.versionsTravail}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitPullRequest className="h-3 w-3" />
                                {project.openDIs} DI
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {project.contributors}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                              {project.lastUpdate}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-5">
          {/* Demandes d'intégration récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes d&apos;intégration</CardTitle>
              <Link href="/forge/merge-requests">
                <Button variant="ghost" size="sm" className="text-violet-500">
                  Voir
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDIs.map((di) => (
                  <Link key={di.id} href={`/forge/project/${di.projectId}/mr/${di.id}`}>
                    <div className="group rounded-lg border border-[var(--border)] p-3 transition-all hover:border-violet-500/50 cursor-pointer">
                      <div className="flex items-start gap-2 mb-2">
                        <GitMerge
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                            di.status === "integrated"
                              ? "text-green-500"
                              : di.status === "approved"
                              ? "text-cyan-500"
                              : "text-violet-500"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 truncate">
                            {di.title}
                          </h4>
                          <div className="text-xs text-[var(--text-muted)] mb-2">
                            {di.project}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--text-muted)]">
                              par {di.author}
                            </span>
                            {(di.status === "open" || di.status === "voting") && (
                              <div className="flex items-center gap-2">
                                <span className="text-green-500">
                                  ✓ {di.votes.approve}
                                </span>
                                <span className="text-pink-500">
                                  ✗ {di.votes.reject}
                                </span>
                              </div>
                            )}
                            {di.status === "integrated" && (
                              <Badge variant="green" className="text-xs">
                                Intégré
                              </Badge>
                            )}
                            {di.status === "approved" && (
                              <Badge variant="cyan" className="text-xs">
                                Approuvé
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top contributeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {FORGE_USERS.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                        {user.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">
                          {user.name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {user.revisions} révisions
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-violet-500">
                      {user.projects} projets
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ListItem
                  icon={GitCommit}
                  iconVariant="violet"
                  title="15 révisions"
                  subtitle="Aujourd'hui"
                />
                <ListItem
                  icon={GitPullRequest}
                  iconVariant="green"
                  title="4 DI intégrées"
                  subtitle="Cette semaine"
                />
                <ListItem
                  icon={GitBranch}
                  iconVariant="cyan"
                  title="7 nouvelles versions"
                  subtitle="Ce mois"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
