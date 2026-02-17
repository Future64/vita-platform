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
import { DiffViewer } from "@/components/modules/forge/DiffViewer";
import Link from "next/link";
import {
  getProject,
  getMergeRequest,
  getDiffs,
  FORGE_COMMITS,
  FORGE_BRANCHES,
} from "@/lib/mockForge";

const sidebarItems: SidebarItem[] = [
  { icon: GitBranch, label: "Projets", href: "/forge" },
  { icon: GitPullRequest, label: "Merge Requests", href: "/forge/merge-requests" },
  { icon: GitCommit, label: "Commits récents", href: "/forge/commits" },
  { icon: Users, label: "Contributeurs", href: "/forge/contributors" },
];

const statusConfig: Record<
  string,
  { label: string; variant: "green" | "orange" | "cyan" | "violet" | "red"; icon: typeof CheckCircle2 }
> = {
  open: { label: "Ouvert", variant: "violet", icon: GitPullRequest },
  voting: { label: "En vote", variant: "orange", icon: ThumbsUp },
  approved: { label: "Approuvé", variant: "cyan", icon: CheckCircle2 },
  merged: { label: "Merged", variant: "green", icon: GitMerge },
  rejected: { label: "Rejeté", variant: "red", icon: XCircle },
  closed: { label: "Fermé", variant: "red", icon: XCircle },
};

export default function MergeRequestPage() {
  const params = useParams();
  const projectId = params.id as string;
  const mrId = params.mrId as string;
  const [commentText, setCommentText] = useState("");

  const project = getProject(projectId);
  const mr = getMergeRequest(mrId);
  const diffs = getDiffs(mrId);

  // Find commits for the source branch
  const sourceBranch = mr
    ? Object.values(FORGE_BRANCHES)
        .flat()
        .find((b) => b.name === mr.sourceBranch && b.projectId === projectId)
    : undefined;
  const branchCommits = sourceBranch ? FORGE_COMMITS[sourceBranch.id] ?? [] : [];

  if (!project || !mr) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            Merge Request introuvable
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

  const status = statusConfig[mr.status] ?? statusConfig.open;
  const StatusIcon = status.icon;
  const approvalPercent =
    mr.totalVotes > 0
      ? Math.round((mr.votes.approve / mr.totalVotes) * 100)
      : 0;
  const quorumPercent = Math.round((mr.totalVotes / mr.quorum) * 100);

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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusIcon className={`h-5 w-5 text-${status.variant}-500`} />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                #{mr.number} {mr.title}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)] flex-wrap">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-semibold">
                  {mr.authorInitials}
                </div>
                <span>{mr.author}</span>
              </div>
              <span>•</span>
              <span>Ouvert {mr.created}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Badge variant="violet" className="text-xs">
                  {mr.sourceBranch}
                </Badge>
                <span>→</span>
                <Badge variant="orange" className="text-xs">
                  {mr.targetBranch}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <PermissionGate permission="approve_merge_request">
              <Button variant="voteFor" size="sm">
                <ThumbsUp className="h-4 w-4" />
                Approuver
              </Button>
              <Button variant="voteAgainst" size="sm">
                <ThumbsDown className="h-4 w-4" />
                Rejeter
              </Button>
            </PermissionGate>
            {mr.status === "approved" && (
              <PermissionGate permission="merge_branch">
                <Button variant="success" size="sm">
                  <GitMerge className="h-4 w-4" />
                  Merger
                </Button>
              </PermissionGate>
            )}
          </div>
        </div>
      </div>

      {/* Voting progress */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Votes</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {mr.totalVotes} / {mr.quorum} (quorum)
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
                {approvalPercent}% (requis: {mr.requiredMajority}%)
              </span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
              <div
                className="h-full bg-green-500 transition-all"
                style={{
                  width: `${
                    mr.totalVotes > 0
                      ? (mr.votes.approve / mr.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-pink-500 transition-all"
                style={{
                  width: `${
                    mr.totalVotes > 0
                      ? (mr.votes.reject / mr.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
              <div
                className="h-full bg-gray-500/30 transition-all"
                style={{
                  width: `${
                    mr.totalVotes > 0
                      ? (mr.votes.abstain / mr.totalVotes) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-3 text-xs">
              <span className="text-green-500">✓ {mr.votes.approve}</span>
              <span className="text-pink-500">✗ {mr.votes.reject}</span>
              <span className="text-[var(--text-muted)]">◯ {mr.votes.abstain}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">Changements</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {mr.filesChanged} fichiers
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-500 font-semibold">
                <Plus className="h-4 w-4" />
                {mr.additions}
              </span>
              <span className="flex items-center gap-1 text-pink-500 font-semibold">
                <Minus className="h-4 w-4" />
                {mr.deletions}
              </span>
            </div>
            {mr.hasConflicts && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
                <AlertTriangle className="h-3 w-3" />
                Conflits détectés
              </p>
            )}
            {!mr.hasConflicts && (
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
            Discussion ({mr.comments.length})
          </SubTabsTrigger>
          <SubTabsTrigger value="commits">
            <GitCommit className="h-4 w-4 mr-1.5" />
            Commits ({branchCommits.length})
          </SubTabsTrigger>
        </SubTabsList>

        {/* Changes Tab */}
        <TabsContent value="changes" className="mt-5">
          {diffs.length > 0 ? (
            <DiffViewer files={diffs} />
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
        <TabsContent value="discussion" className="mt-5">
          <div className="space-y-4">
            {/* Description */}
            <Card>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                    {mr.authorInitials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {mr.author}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {mr.created}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none text-[var(--text-secondary)] whitespace-pre-line">
                      {mr.description}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            {mr.comments.map((comment) => (
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

        {/* Commits Tab */}
        <TabsContent value="commits" className="mt-5">
          <Card>
            <CardContent>
              {branchCommits.length === 0 ? (
                <div className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Aucun commit trouvé
                </div>
              ) : (
                <div className="space-y-3">
                  {branchCommits.map((commit) => (
                    <div
                      key={commit.hash}
                      className="flex items-start gap-3 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                        <GitCommit className="h-4 w-4 text-[var(--text-muted)]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)]">
                          {commit.message}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          <span>{commit.author}</span>
                          <span>•</span>
                          <span className="font-mono">{commit.hash}</span>
                          <span>•</span>
                          <span>{commit.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs shrink-0">
                        <span className="text-green-500">+{commit.additions}</span>
                        <span className="text-pink-500">-{commit.deletions}</span>
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
