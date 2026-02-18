"use client";

import { useParams } from "next/navigation";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  ArrowLeft,
  GitBranch,
  GitPullRequest,
  GitCommit,
  Code,
  Star,
  GitFork,
  Users,
  Calendar,
  FileText,
  Download,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  getProject,
  getVersionsTravail,
  getFileTree,
  getDemandesIntegrationForProject,
  FORGE_REVISIONS,
  FORGE_USERS,
  LANGUAGE_COLORS,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const project = getProject(projectId);
  const versionsTravail = getVersionsTravail(projectId);
  const files = getFileTree(projectId);
  const dis = getDemandesIntegrationForProject(projectId);

  // Collect all revisions from project versions
  const allRevisions = versionsTravail
    .flatMap((b) => FORGE_REVISIONS[b.id] ?? [])
    .sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    .slice(0, 10);

  if (!project) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Projet introuvable
          </p>
          <Link href="/forge">
            <Button variant="ghost" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux projets
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
        <Link href="/forge">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux projets
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Code className="h-5 w-5 text-violet-500" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {project.name}
              </h1>
              <Badge variant="green">Public</Badge>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-3 max-w-2xl">
              {project.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {project.stars} stars
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {project.derivations} dérivations
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {project.contributors} contributeurs
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Mis à jour {project.lastUpdate}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Star className="h-4 w-4" />
              Star
            </Button>
            <Button variant="secondary">
              <GitFork className="h-4 w-4" />
              Fork
            </Button>
            <Button variant="primary">
              <Download className="h-4 w-4" />
              Clone
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="code" className="mb-6">
        <TabsList>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="commits">Révisions</TabsTrigger>
          <TabsTrigger value="branches">Versions de travail</TabsTrigger>
          <TabsTrigger value="mrs">Demandes d&apos;intégration</TabsTrigger>
        </TabsList>

        {/* Code Tab */}
        <TabsContent value="code" className="mt-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      <select className="bg-transparent border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]">
                        {versionsTravail.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {versionsTravail.find((b) => b.protected)?.revisions ?? 0} révisions
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {files.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-[var(--bg-elevated)] cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <FileText
                            className={`h-4 w-4 ${
                              item.type === "dir"
                                ? "text-violet-500"
                                : "text-[var(--text-muted)]"
                            }`}
                          />
                          <span className="text-sm text-[var(--text-primary)]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {item.type === "dir"
                            ? `${item.items} items`
                            : item.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-5">
                <CardHeader>
                  <CardTitle>README.md</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                      {project.name}
                    </h2>
                    <p className="mb-3">{project.description}</p>
                    <h3 className="text-base font-semibold text-[var(--text-primary)] mt-4 mb-2">
                      Comment contribuer
                    </h3>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Dériver le projet</li>
                      <li>Créer une version de travail pour votre contribution</li>
                      <li>Soumettre une demande d&apos;intégration</li>
                      <li>Participer aux discussions</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Langage</div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            LANGUAGE_COLORS[project.language]
                              ? "bg-current"
                              : "bg-gray-500"
                          } ${LANGUAGE_COLORS[project.language] ?? ""}`}
                        />
                        <span className="text-[var(--text-primary)]">
                          {project.language}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Licence</div>
                      <div className="text-[var(--text-primary)]">
                        {project.license}
                      </div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-1">Créé le</div>
                      <div className="text-[var(--text-primary)]">
                        {project.created}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Contributeurs ({project.contributors})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {FORGE_USERS.slice(0, 4).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                            {user.initials}
                          </div>
                          <span className="text-sm text-[var(--text-primary)]">
                            {user.name}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {user.revisions} révisions
                        </span>
                      </div>
                    ))}
                    <Button variant="ghost" className="w-full text-sm">
                      Voir tous les contributeurs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Revisions Tab */}
        <TabsContent value="commits" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Révisions récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allRevisions.map((revision) => (
                  <div
                    key={revision.ref}
                    className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="flex flex-col gap-2 mb-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                          {revision.message}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>{revision.author}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="font-mono">{revision.ref}</span>
                          <span>•</span>
                          <Badge variant="violet" className="text-xs">
                            {revision.versionTravail}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1 text-green-500">
                          <ArrowUpRight className="h-3 w-3" />+{revision.additions}
                        </span>
                        <span className="flex items-center gap-1 text-pink-500">
                          <ArrowDownLeft className="h-3 w-3" />-{revision.deletions}
                        </span>
                        <span>{revision.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Versions de travail Tab */}
        <TabsContent value="branches" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>Versions de travail ({versionsTravail.length})</CardTitle>
              <PermissionGate permission="create_version_travail">
                <Button variant="primary" size="sm">
                  <GitBranch className="h-4 w-4" />
                  Nouvelle version
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {versionsTravail.map((version) => (
                  <Link
                    key={version.id}
                    href={`/forge/project/${projectId}/${version.id}`}
                  >
                    <div className="p-3 rounded-lg border border-[var(--border)] hover:border-violet-500/50 transition-all cursor-pointer hover:bg-[var(--bg-elevated)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-violet-500" />
                          <span className="font-semibold text-sm text-[var(--text-primary)]">
                            {version.name}
                          </span>
                          {version.protected && (
                            <Badge variant="orange" className="text-xs">
                              <Shield className="h-3 w-3" />
                              Protégée
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                          {!version.protected && (
                            <>
                              <span className="text-green-500">
                                +{version.aheadOfficielle} en avance
                              </span>
                              {version.behindOfficielle > 0 && (
                                <span className="text-pink-500">
                                  -{version.behindOfficielle} en retard
                                </span>
                              )}
                            </>
                          )}
                          <span>{version.revisions} révisions</span>
                          <span>•</span>
                          <span>{version.lastUpdate}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demandes d'intégration Tab */}
        <TabsContent value="mrs" className="mt-5">
          <Card>
            <CardHeader>
              <CardTitle>
                Demandes d&apos;intégration ({dis.length})
              </CardTitle>
              <PermissionGate permission="create_demande_integration">
                <Button variant="primary" size="sm">
                  <GitPullRequest className="h-4 w-4" />
                  Nouvelle DI
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dis.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                    Aucune demande d&apos;intégration pour ce projet
                  </div>
                ) : (
                  dis.map((di) => (
                    <Link
                      key={di.id}
                      href={`/forge/project/${projectId}/mr/${di.id}`}
                    >
                      <div className="p-4 rounded-lg border border-[var(--border)] hover:border-violet-500/50 transition-all cursor-pointer hover:bg-[var(--bg-elevated)]">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <GitPullRequest className="h-4 w-4 text-violet-500" />
                              <span className="font-semibold text-[var(--text-primary)]">
                                #{di.number} {di.title}
                              </span>
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
                              >
                                {di.status === "voting"
                                  ? "En vote"
                                  : di.status === "approved"
                                  ? "Approuvé"
                                  : di.status === "integrated"
                                  ? "Intégré"
                                  : di.status === "open"
                                  ? "Ouvert"
                                  : di.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                              <span>par {di.author}</span>
                              <span>•</span>
                              <span>{di.created}</span>
                              <span>•</span>
                              <Badge variant="violet" className="text-xs">
                                {di.sourceVersion}
                              </Badge>
                              <span>→</span>
                              <Badge variant="orange" className="text-xs">
                                {di.targetVersion}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
