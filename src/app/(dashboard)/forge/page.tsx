"use client";

import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  Code,
  Users,
  Star,
  GitMerge,
  Clock
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { ListItem } from "@/components/ui/list-item";
import { Tabs } from "@/components/ui/tabs";
import Link from "next/link";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Merge Requests", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Commits récents", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

const projects = [
  {
    id: "constitution-v3",
    name: "Constitution v3.0",
    description: "Révision majeure de la constitution avec nouveaux articles sur l'IA",
    language: "Markdown",
    stars: 247,
    forks: 45,
    branches: 12,
    openMRs: 8,
    lastUpdate: "il y a 2h",
    contributors: 34,
    status: "active",
  },
  {
    id: "economic-simulator",
    name: "Simulateur Économique",
    description: "Outil de simulation de l'impact économique des propositions",
    language: "Python",
    stars: 189,
    forks: 28,
    branches: 7,
    openMRs: 4,
    lastUpdate: "il y a 5h",
    contributors: 19,
    status: "active",
  },
  {
    id: "voting-system",
    name: "Système de Vote v2",
    description: "Amélioration du système de vote avec délégation progressive",
    language: "TypeScript",
    stars: 321,
    forks: 67,
    branches: 15,
    openMRs: 12,
    lastUpdate: "il y a 1j",
    contributors: 42,
    status: "active",
  },
  {
    id: "eco-tracker",
    name: "Eco Tracker",
    description: "Application de suivi des actions écologiques",
    language: "React",
    stars: 156,
    forks: 31,
    branches: 9,
    openMRs: 6,
    lastUpdate: "il y a 3j",
    contributors: 23,
    status: "active",
  },
];

const recentMergeRequests = [
  {
    id: "mr-1",
    title: "Ajout article 47 sur l'IA éthique",
    project: "Constitution v3.0",
    author: "Marie Dupont",
    status: "open",
    votes: { approve: 12, reject: 2 },
    created: "il y a 3h",
  },
  {
    id: "mr-2",
    title: "Fix: Calcul des bonus écologiques",
    project: "Eco Tracker",
    author: "Jean Martin",
    status: "open",
    votes: { approve: 8, reject: 0 },
    created: "il y a 1j",
  },
  {
    id: "mr-3",
    title: "Feature: Délégation de vote",
    project: "Système de Vote v2",
    author: "Sophie Chen",
    status: "merged",
    votes: { approve: 15, reject: 1 },
    created: "il y a 2j",
  },
];

const languageColors: Record<string, string> = {
  Markdown: "text-cyan-500",
  Python: "text-blue-500",
  TypeScript: "text-violet-500",
  React: "text-cyan-500",
};

export default function ForgePage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Forge Collaborative
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Projets ouverts et contributions citoyennes
          </p>
        </div>
        <Button variant="primary">
          <GitBranch className="h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Projets actifs"
          value="24"
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
          label="MR ouverts"
          value="47"
        />
        <StatCard
          variant="orange"
          label="Commits (30j)"
          value="1,247"
          trend={{ value: "+15%", direction: "up" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content - Projects */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Projets</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Rechercher..." className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {projects.map((project) => (
                  <Link key={project.id} href={`/forge/project/${project.id}`}>
                    <div className="group p-4 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer hover:bg-[var(--bg-elevated)] mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="h-4 w-4 text-violet-500" />
                            <h3 className="font-semibold text-[var(--text-primary)]">
                              {project.name}
                            </h3>
                            <Badge variant="green" className="text-xs">Actif</Badge>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] mb-3">
                            {project.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                          <span className={`flex items-center gap-1 ${languageColors[project.language]}`}>
                            <div className="h-2 w-2 rounded-full bg-current" />
                            {project.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {project.stars}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            {project.branches} branches
                          </span>
                          <span className="flex items-center gap-1">
                            <GitPullRequest className="h-3 w-3" />
                            {project.openMRs} MR
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Recent Merge Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Merge Requests</CardTitle>
              <Link href="/forge/merge-requests">
                <Button variant="ghost" size="sm" className="text-violet-500">
                  Voir
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {recentMergeRequests.map((mr) => (
                  <Link key={mr.id} href={`/forge/mr/${mr.id}`}>
                    <div className="group p-3 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer mb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <GitMerge className={`h-4 w-4 flex-shrink-0 mt-0.5 ${mr.status === 'merged' ? 'text-green-500' : 'text-violet-500'}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1 truncate">
                            {mr.title}
                          </h4>
                          <div className="text-xs text-[var(--text-muted)] mb-2">
                            {mr.project}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--text-muted)]">
                              par {mr.author}
                            </span>
                            {mr.status === 'open' && (
                              <div className="flex items-center gap-2">
                                <span className="text-green-500">✓ {mr.votes.approve}</span>
                                <span className="text-pink-500">✗ {mr.votes.reject}</span>
                              </div>
                            )}
                            {mr.status === 'merged' && (
                              <Badge variant="green" className="text-xs">Merged</Badge>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
                      MD
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Marie Dupont</div>
                      <div className="text-xs text-[var(--text-muted)]">247 commits</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-violet-500">12 projets</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-cyan flex items-center justify-center text-white text-xs font-semibold">
                      JM
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Jean Martin</div>
                      <div className="text-xs text-[var(--text-muted)]">189 commits</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-cyan-500">8 projets</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-green flex items-center justify-center text-white text-xs font-semibold">
                      SC
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Sophie Chen</div>
                      <div className="text-xs text-[var(--text-muted)]">156 commits</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-green-500">6 projets</div>
                </div>
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
                  title="15 commits"
                  subtitle="Aujourd'hui"
                />
                <ListItem
                  icon={GitPullRequest}
                  iconVariant="green"
                  title="4 MR merged"
                  subtitle="Cette semaine"
                />
                <ListItem
                  icon={GitBranch}
                  iconVariant="cyan"
                  title="7 nouvelles branches"
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
