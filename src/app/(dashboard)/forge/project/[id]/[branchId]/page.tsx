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
  getVersionTravail,
  getRevisions,
  getDemandesIntegrationForProject,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

export default function BranchDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const branchId = params.branchId as string;

  const project = getProject(projectId);
  const version = getVersionTravail(branchId);
  const revisions = getRevisions(branchId);

  // Find DIs related to this version
  const relatedDIs = getDemandesIntegrationForProject(projectId).filter(
    (di) => version && di.sourceVersion === version.name
  );

  if (!project || !version) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Version de travail introuvable
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
                {version.name}
              </h1>
              {version.protected && (
                <Badge variant="orange">
                  <Shield className="h-3 w-3" />
                  Protégée
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
              <span>Créée par {version.author}</span>
              <span>•</span>
              <span>Mise à jour {version.lastUpdate}</span>
              <span>•</span>
              <span>{version.revisions} révisions</span>
              {!version.protected && (
                <>
                  <span>•</span>
                  <span className="text-green-500">+{version.aheadOfficielle} en avance</span>
                  {version.behindOfficielle > 0 && (
                    <span className="text-pink-500">-{version.behindOfficielle} en retard</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <PermissionGate permission="create_revision">
              <Button variant="secondary">
                <GitCommit className="h-4 w-4" />
                Nouvelle révision
              </Button>
            </PermissionGate>
            {!version.protected && relatedDIs.length === 0 && (
              <PermissionGate permission="create_demande_integration">
                <Button variant="primary">
                  <GitPullRequest className="h-4 w-4" />
                  Créer une DI
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Revision Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <GitCommit className="h-4 w-4 inline mr-2" />
                Historique des révisions ({revisions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revisions.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Aucune révision sur cette version
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)]" />

                  <div className="space-y-0">
                    {revisions.map((revision, idx) => (
                      <div key={revision.ref} className="relative flex gap-4 pb-6">
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

                        {/* Revision content */}
                        <div className="flex-1 rounded-lg border border-[var(--border)] p-4 hover:bg-[var(--bg-elevated)] transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                                {revision.message}
                              </h3>
                              {revision.description && (
                                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                                  {revision.description}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 ml-3 font-mono text-xs text-violet-500 bg-violet-500/10 rounded px-2 py-0.5">
                              {revision.ref}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                                {revision.authorInitials}
                              </div>
                              <span className="text-xs text-[var(--text-muted)]">
                                {revision.author}
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                •
                              </span>
                              <span className="text-xs text-[var(--text-muted)]">
                                {revision.date}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1 text-green-500">
                                <Plus className="h-3 w-3" />
                                {revision.additions}
                              </span>
                              <span className="flex items-center gap-1 text-pink-500">
                                <Minus className="h-3 w-3" />
                                {revision.deletions}
                              </span>
                              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                                <FileText className="h-3 w-3" />
                                {revision.filesChanged}
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
          {/* Version Info */}
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
                      {version.authorInitials}
                    </div>
                    <span className="text-[var(--text-primary)]">
                      {version.author}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Commits</span>
                  <span className="text-[var(--text-primary)] font-semibold">
                    {version.revisions}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Dernière maj</span>
                  <span className="text-[var(--text-primary)]">
                    {version.lastUpdate}
                  </span>
                </div>
                {!version.protected && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Ahead / Behind</span>
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 font-semibold">
                          +{version.aheadOfficielle}
                        </span>
                        <span className="text-[var(--text-muted)]">/</span>
                        <span className="text-pink-500 font-semibold">
                          -{version.behindOfficielle}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Protection</span>
                  <Badge variant={version.protected ? "orange" : "green"}>
                    {version.protected ? "Protégée" : "Non protégée"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Demandes d'intégration */}
          {relatedDIs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Demandes d&apos;intégration liées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedDIs.map((di) => (
                    <Link
                      key={di.id}
                      href={`/forge/project/${projectId}/mr/${di.id}`}
                    >
                      <div className="rounded-lg border border-[var(--border)] p-3 hover:border-violet-500/50 transition-all cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <GitPullRequest className="h-4 w-4 text-violet-500" />
                          <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                            #{di.number} {di.title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <Badge
                            variant={
                              di.status === "voting"
                                ? "orange"
                                : di.status === "approved"
                                ? "cyan"
                                : di.status === "integrated"
                                ? "green"
                                : "violet"
                            }
                            className="text-xs"
                          >
                            {di.status === "voting"
                              ? "En vote"
                              : di.status === "approved"
                              ? "Approuvé"
                              : di.status === "integrated"
                              ? "Intégré"
                              : "Ouvert"}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">
                              ✓ {di.votes.approve}
                            </span>
                            <span className="text-pink-500">
                              ✗ {di.votes.reject}
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
                {revisions.length > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Lignes ajoutées
                      </span>
                      <span className="font-semibold text-green-500">
                        +{revisions.reduce((s, c) => s + c.additions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Lignes supprimées
                      </span>
                      <span className="font-semibold text-pink-500">
                        -{revisions.reduce((s, c) => s + c.deletions, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Fichiers modifiés
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {revisions.reduce((s, c) => s + c.filesChanged, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">
                        Contributeurs
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {new Set(revisions.map((c) => c.author)).size}
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
