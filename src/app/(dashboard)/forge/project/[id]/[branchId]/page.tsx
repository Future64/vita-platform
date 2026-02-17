"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Users,
  Shield,
  Plus,
  Minus,
  FileText,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/auth/PermissionGate";
import Link from "next/link";
import {
  getProject,
  getBranch,
  getCommits,
  getMergeRequestsForProject,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Merge Requests", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Commits récents", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

export default function BranchDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const branchId = params.branchId as string;

  const project = getProject(projectId);
  const branch = getBranch(branchId);
  const commits = getCommits(branchId);

  // Find MRs related to this branch
  const relatedMRs = getMergeRequestsForProject(projectId).filter(
    (mr) => branch && mr.sourceBranch === branch.name
  );

  if (!project || !branch) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Branche introuvable
          </p>
          <Link href={`/forge/project/${projectId}`}>
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au projet
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/forge/project/${projectId}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {project.name}
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="h-5 w-5 text-violet-500" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {branch.name}
              </h1>
              {branch.protected && (
                <Badge variant="orange">
                  <Shield className="h-3 w-3" />
                  Protégée
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
              <span>Créée par {branch.author}</span>
              <span>•</span>
              <span>Mise à jour {branch.lastUpdate}</span>
              <span>•</span>
              <span>{branch.commits} commits</span>
              {!branch.protected && (
                <>
                  <span>•</span>
                  <span className="text-green-500">+{branch.aheadMain} ahead</span>
                  {branch.behindMain > 0 && (
                    <span className="text-pink-500">-{branch.behindMain} behind</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <PermissionGate permission="create_commit">
              <Button variant="secondary">
                <GitCommit className="h-4 w-4" />
                Nouveau commit
              </Button>
            </PermissionGate>
            {!branch.protected && relatedMRs.length === 0 && (
              <PermissionGate permission="create_merge_request">
                <Button variant="primary">
                  <GitPullRequest className="h-4 w-4" />
                  Créer une MR
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Commit Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <GitCommit className="h-4 w-4 inline mr-2" />
                Historique des commits ({commits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commits.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Aucun commit sur cette branche
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)]" />

                  <div className="space-y-0">
                    {commits.map((commit, idx) => (
                      <div key={commit.hash} className="relative flex gap-4 pb-6">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              idx === 0
                                ? "bg-gradient-to-br from-violet-500 to-pink-500"
                                : "bg-[var(--bg-elevated)] border border-[var(--border)]"
                            }`}
                          >
                            <GitCommit
                              className={`h-4 w-4 ${
                                idx === 0
                                  ? "text-white"
                                  : "text-[var(--text-muted)]"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Commit content */}
                        <div className="flex-1 rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--bg-elevated)] transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                                {commit.message}
                              </h3>
                              {commit.description && (
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                  {commit.description}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 ml-3 font-mono text-xs text-violet-500 bg-violet-500/10 rounded px-2 py-0.5">
                              {commit.hash}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                                {commit.authorInitials}
                              </div>
                              <span className="text-xs text-[var(--text-muted)]">
                                {commit.author}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                •
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {commit.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-green-500">
                                <Plus className="h-3 w-3" />
                                {commit.additions}
                              </span>
                              <span className="flex items-center gap-1 text-pink-500">
                                <Minus className="h-3 w-3" />
                                {commit.deletions}
                              </span>
                              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                <FileText className="h-3 w-3" />
                                {commit.filesChanged}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Branch Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Auteur</span>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                      {branch.authorInitials}
                    </div>
                    <span className="text-[var(--text-primary)]">
                      {branch.author}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Commits</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {branch.commits}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Dernière maj</span>
                  <span className="text-[var(--text-primary)]">
                    {branch.lastUpdate}
                  </span>
                </div>
                {!branch.protected && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Ahead / Behind</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-semibold">
                          +{branch.aheadMain}
                        </span>
                        <span className="text-[var(--text-muted)]">/</span>
                        <span className="text-pink-500 font-semibold">
                          -{branch.behindMain}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Protection</span>
                  <Badge variant={branch.protected ? "orange" : "green"}>
                    {branch.protected ? "Protégée" : "Non protégée"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Merge Requests */}
          {relatedMRs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Merge Requests liées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedMRs.map((mr) => (
                    <Link
                      key={mr.id}
                      href={`/forge/project/${projectId}/mr/${mr.id}`}
                    >
                      <div className="rounded-lg border border-[var(--border)] p-3 hover:border-violet-500/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <GitPullRequest className="h-4 w-4 text-violet-500" />
                          <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            #{mr.number} {mr.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <Badge
                            variant={
                              mr.status === "voting"
                                ? "orange"
                                : mr.status === "approved"
                                ? "cyan"
                                : mr.status === "merged"
                                ? "green"
                                : "violet"
                            }
                            className="text-xs"
                          >
                            {mr.status === "voting"
                              ? "En vote"
                              : mr.status === "approved"
                              ? "Approuvé"
                              : mr.status === "merged"
                              ? "Merged"
                              : "Ouvert"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">
                              ✓ {mr.votes.approve}
                            </span>
                            <span className="text-pink-500">
                              ✗ {mr.votes.reject}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {commits.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Lignes ajoutées
                      </span>
                      <span className="font-semibold text-green-500">
                        +{commits.reduce((s, c) => s + c.additions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Lignes supprimées
                      </span>
                      <span className="font-semibold text-pink-500">
                        -{commits.reduce((s, c) => s + c.deletions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Fichiers modifiés
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {commits.reduce((s, c) => s + c.filesChanged, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Contributeurs
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {new Set(commits.map((c) => c.author)).size}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
