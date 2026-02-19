"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  GitPullRequest,
  GitCommit,
  GitMerge,
  Users,
  MessageSquare,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Minus as MinusIcon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SubTabs, SubTabsList, SubTabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ComparaisonViewer } from "@/components/modules/forge/ComparaisonViewer";
import Link from "next/link";
import {
  getProject,
  getDemandeIntegration,
  getComparaisons,
  FORGE_REVISIONS,
  FORGE_VERSIONS_TRAVAIL,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Demandes d'intégration", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Révisions récentes", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

const statusConfig: Record<
  string,
  { label: string; variant: "green" | "orange" | "cyan" | "violet" | "red"; icon: typeof CheckCircle2 }
> = {
  open: { label: "Ouvert", variant: "violet", icon: GitPullRequest },
  voting: { label: "En vote", variant: "orange", icon: ThumbsUp },
  approved: { label: "Approuvé", variant: "cyan", icon: CheckCircle2 },
  integrated: { label: "Intégré", variant: "green", icon: GitMerge },
  rejected: { label: "Rejeté", variant: "red", icon: XCircle },
  closed: { label: "Fermé", variant: "red", icon: XCircle },
};

export default function MergeRequestPage() {
  const params = useParams();
  const projectId = params.id as string;
  const mrId = params.mrId as string;
  const [commentText, setCommentText] = useState("");

  const project = getProject(projectId);
  const di = getDemandeIntegration(mrId);
  const comparaisons = getComparaisons(mrId);

  // Find revisions for the source version
  const sourceVersion = di
    ? Object.values(FORGE_VERSIONS_TRAVAIL)
        .flat()
        .find((b) => b.name === di.sourceVersion && b.projectId === projectId)
    : undefined;
  const branchCommits = sourceVersion ? FORGE_REVISIONS[sourceVersion.id] ?? [] : [];

  if (!project || !di) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Demande d&apos;intégration introuvable
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

  const status = statusConfig[di.status] ?? statusConfig.open;
  const StatusIcon = status.icon;
  const approvalPercent =
    di.totalVotes > 0
      ? Math.round((di.votes.approve / di.totalVotes) * 100)
      : 0;
  const quorumPercent = Math.round((di.totalVotes / di.quorum) * 100);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href={`/forge/project/${projectId}`}>
          <Button variant="ghost" className="mb-3 md:mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {project.name}
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusIcon className={`h-5 w-5 text-${status.variant}-500`} />
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                #{di.number} {di.title}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs md:text-sm text-[var(--text-muted)] flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                  {di.authorInitials}
                </div>
                <span>{di.author}</span>
              </div>
              <span>•</span>
              <span>Ouvert {di.created}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Badge variant="violet" className="text-xs">
                  {di.sourceVersion}
                </Badge>
                <span>→</span>
                <Badge variant="orange" className="text-xs">
                  {di.targetVersion}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <PermissionGate permission="approve_demande_integration">
              <Button variant="voteFor" size="sm">
                <ThumbsUp className="h-4 w-4" />
                Approuver
              </Button>
              <Button variant="voteAgainst" size="sm">
                <ThumbsDown className="h-4 w-4" />
                Rejeter
              </Button>
            </PermissionGate>
            {di.status === "approved" && (
              <PermissionGate permission="integrer_version">
                <Button variant="success" size="sm">
                  <GitMerge className="h-4 w-4" />
                  Intégrer
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      {/* Voting progress */}
      <div className="mb-4 md:mb-6 grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Votes</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {di.totalVotes} / {di.quorum} (quorum)
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                style={{ width: `${Math.min(quorumPercent, 100)}%` }}
              />
            </div>
            {quorumPercent < 100 && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-orange-500">
                <AlertTriangle className="h-3 w-3" />
                Quorum non atteint ({quorumPercent}%)
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Approbation</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {approvalPercent}% (requis: {di.requiredMajority}%)
              </span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${
                    di.totalVotes > 0
                      ? (di.votes.approve / di.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-pink-500 transition-all"
                style={{
                  width: `${
                    di.totalVotes > 0
                      ? (di.votes.reject / di.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-gray-500/30 transition-all"
                style={{
                  width: `${
                    di.totalVotes > 0
                      ? (di.votes.abstain / di.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <span className="text-green-500">✓ {di.votes.approve}</span>
              <span className="text-pink-500">✗ {di.votes.reject}</span>
              <span className="text-[var(--text-muted)]">◯ {di.votes.abstain}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Changements</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {di.filesChanged} fichiers
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-500 font-semibold">
                <Plus className="h-4 w-4" />
                {di.additions}
              </span>
              <span className="flex items-center gap-1 text-pink-500 font-semibold">
                <Minus className="h-4 w-4" />
                {di.deletions}
              </span>
            </div>
            {di.hasConflicts && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Conflits détectés
              </p>
            )}
            {!di.hasConflicts && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-green-500">
                <CheckCircle2 className="h-3 w-3" />
                Pas de conflits
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <SubTabs defaultValue="changes">
        <SubTabsList>
          <SubTabsTrigger value="changes">
            <FileText className="h-4 w-4 mr-1.5" />
            Changements
          </SubTabsTrigger>
          <SubTabsTrigger value="discussion">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Discussion ({di.comments.length})
          </SubTabsTrigger>
          <SubTabsTrigger value="commits">
            <GitCommit className="h-4 w-4 mr-1.5" />
            Révisions ({branchCommits.length})
          </SubTabsTrigger>
        </SubTabsList>

        {/* Changes Tab */}
        <TabsContent value="changes" className="mt-4 md:mt-5">
          {comparaisons.length > 0 ? (
            <ComparaisonViewer files={comparaisons} />
          ) : (
            <Card>
              <CardContent>
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Aucun changement à afficher
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Discussion Tab */}
        <TabsContent value="discussion" className="mt-4 md:mt-5">
          <div className="space-y-4">
            {/* Description */}
            <Card>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                    {di.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {di.author}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {di.created}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-line">
                      {di.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            {di.comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                      {comment.authorInitials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {comment.author}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {comment.date}
                        </span>
                        {comment.replyTo && (
                          <Badge variant="outline" className="text-xs">
                            Réponse
                          </Badge>
                        )}
                        {comment.filePath && (
                          <Badge variant="violet" className="text-xs font-mono">
                            {comment.filePath}
                            {comment.lineRef && `:${comment.lineRef}`}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* New comment form */}
            <Card>
              <CardContent>
                <PermissionGate permission="comment_proposal">
                  <div className="space-y-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      rows={3}
                      className="w-full rounded-lg border bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={!commentText.trim()}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Commenter
                      </Button>
                    </div>
                  </div>
                </PermissionGate>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revisions Tab */}
        <TabsContent value="commits" className="mt-4 md:mt-5">
          <Card>
            <CardContent>
              {branchCommits.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Aucune révision trouvée
                </div>
              ) : (
                <div className="space-y-3">
                  {branchCommits.map((revision) => (
                    <div
                      key={revision.ref}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                        <GitCommit className="h-4 w-4 text-[var(--text-muted)]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)]">
                          {revision.message}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          <span>{revision.author}</span>
                          <span>•</span>
                          <span className="font-mono">{revision.ref}</span>
                          <span>•</span>
                          <span>{revision.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs shrink-0">
                        <span className="text-green-500">+{revision.additions}</span>
                        <span className="text-pink-500">-{revision.deletions}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </SubTabs>
    </DashboardLayout>
  );
}
