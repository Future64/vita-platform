"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  GitPullRequest,
  GitMerge,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Vote,
  MessageSquare,
  FolderGit2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  getForgeMergeRequest,
  type ForgeMergeRequestDetail,
} from "@/lib/vita-api";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: FolderGit2, label: "Projets", href: "/forge" },
];

// ── Diff View ───────────────────────────────────────────────────────

function DiffView({ original, proposed }: { original: string; proposed: string }) {
  const origLines = original.split("\n");
  const newLines = proposed.split("\n");
  const maxLen = Math.max(origLines.length, newLines.length);

  const lines: Array<{ text: string; type: "add" | "remove" | "same" }> = [];

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i];
    const newLine = newLines[i];

    if (origLine === newLine) {
      lines.push({ text: newLine ?? "", type: "same" });
    } else {
      if (origLine !== undefined && origLine !== newLine) {
        lines.push({ text: origLine, type: "remove" });
      }
      if (newLine !== undefined && newLine !== origLine) {
        lines.push({ text: newLine, type: "add" });
      }
    }
  }

  return (
    <div
      className="rounded-lg border overflow-auto text-xs"
      style={{
        borderColor: "var(--border)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          className="px-3 py-0.5"
          style={{
            backgroundColor:
              line.type === "add"
                ? "rgba(34, 197, 94, 0.08)"
                : line.type === "remove"
                  ? "rgba(239, 68, 68, 0.08)"
                  : "transparent",
            borderLeft: `3px solid ${
              line.type === "add"
                ? "#22c55e"
                : line.type === "remove"
                  ? "#ef4444"
                  : "transparent"
            }`,
            color:
              line.type === "add"
                ? "#4ade80"
                : line.type === "remove"
                  ? "#f87171"
                  : "var(--text-muted)",
          }}
        >
          {line.type === "add" ? "+ " : line.type === "remove" ? "- " : "  "}
          {line.text}
        </div>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ForgeMRPage() {
  const params = useParams();
  const mrId = params.mrId as string;
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<ForgeMergeRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const result = await getForgeMergeRequest(mrId);
      setData(result);
    } catch {
      setError("Merge request introuvable");
    }
    setLoading(false);
  }

  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mrId);
    if (!isUuid) {
      setError("ID invalide");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mrId]);

  async function handleVote(choice: "for" | "against") {
    try {
      await api.voteForgeMR(mrId, choice);
      toast.success(choice === "for" ? "Vote pour" : "Vote contre");
      load();
    } catch {
      toast.error("Erreur lors du vote");
    }
  }

  async function handleMerge() {
    try {
      await api.mergeForgeMR(mrId);
      toast.success("Merge request fusionnee");
      load();
    } catch {
      toast.error("Erreur lors de la fusion");
    }
  }

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-[var(--text-muted)]">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">{error ?? "Merge request introuvable"}</div>
          <Link href="/forge">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour a la Forge
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { merge_request: mr, source_content, target_content, comments } = data;
  const isVotable = mr.status === "open" || mr.status === "voting";
  const totalVotes = mr.votes_for + mr.votes_against;
  const forPercent = totalVotes > 0 ? (mr.votes_for / totalVotes) * 100 : 50;

  // Check if user has a privileged role for merging
  const canMerge = user && ["referent", "mandataire", "gardien", "dieu", "super_admin", "admin"].includes(
    (user as unknown as { role?: string }).role ?? ""
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href={`/forge/${mr.project_id}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au projet
          </Button>
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <GitPullRequest className="h-5 w-5 text-violet-500" />
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {mr.title}
            </h1>
            <MRStatusBadge status={mr.status} />
          </div>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span>par {mr.author_name ?? "Anonyme"}</span>
            <span>
              {mr.source_branch_name} → {mr.target_branch_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(mr.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          {mr.description && (
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {mr.description}
            </p>
          )}
        </div>
      </div>

      {/* Vote section */}
      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span className="text-lg font-bold text-green-500">{mr.votes_for}</span>
              <span className="text-xs text-[var(--text-muted)]">pour</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-red-400" />
              <span className="text-lg font-bold text-red-400">{mr.votes_against}</span>
              <span className="text-xs text-[var(--text-muted)]">contre</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden mb-4">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${forPercent}%`,
                background: totalVotes > 0
                  ? "linear-gradient(90deg, #22c55e, #4ade80)"
                  : "var(--border)",
              }}
            />
          </div>

          {/* Vote buttons */}
          {isVotable && isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => handleVote("for")}
                className="text-green-500 hover:bg-green-500/10"
              >
                <ThumbsUp className="h-4 w-4" />
                Voter pour
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleVote("against")}
                className="text-red-400 hover:bg-red-500/10"
              >
                <ThumbsDown className="h-4 w-4" />
                Voter contre
              </Button>
              <div className="flex-1" />
              {canMerge && (
                <Button variant="primary" onClick={handleMerge}>
                  <GitMerge className="h-4 w-4" />
                  Fusionner
                </Button>
              )}
            </div>
          )}

          {mr.status === "merged" && (
            <div className="text-sm text-violet-400 flex items-center gap-2">
              <GitMerge className="h-4 w-4" />
              Fusionnee le {new Date(mr.updated_at).toLocaleDateString("fr-FR")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diff viewer */}
      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Changements proposes</CardTitle>
        </CardHeader>
        <CardContent>
          {source_content && target_content ? (
            <DiffView original={target_content} proposed={source_content} />
          ) : source_content && !target_content ? (
            <div className="rounded-lg border p-4 text-xs" style={{ borderColor: "var(--border)" }}>
              <div className="text-green-400 mb-2">+ Nouveau contenu:</div>
              <pre
                className="whitespace-pre-wrap text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {source_content}
              </pre>
            </div>
          ) : (
            <div className="text-center text-[var(--text-muted)] py-8">
              Impossible de generer le diff.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4" />
            Commentaires ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              Aucun commentaire pour le moment.
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border p-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                      {(comment.author_name ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {comment.author_name ?? "Anonyme"}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(comment.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function MRStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "open":
      return (
        <Badge variant="green" className="text-xs">
          <AlertCircle className="h-3 w-3" />
          Ouverte
        </Badge>
      );
    case "voting":
      return (
        <Badge variant="orange" className="text-xs">
          <Vote className="h-3 w-3" />
          En vote
        </Badge>
      );
    case "approved":
      return (
        <Badge variant="blue" className="text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Approuvee
        </Badge>
      );
    case "merged":
      return (
        <Badge variant="violet" className="text-xs">
          <GitMerge className="h-3 w-3" />
          Fusionnee
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="red" className="text-xs">
          <XCircle className="h-3 w-3" />
          Rejetee
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
}
