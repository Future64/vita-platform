"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Clock,
  Lock,
  FolderGit2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  getForgeProject,
  getForgeBranchCommits,
  type ForgeProjectDetail,
  type ForgeBranch,
  type ForgeCommit,
} from "@/lib/vita-api";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: FolderGit2, label: "Projets", href: "/forge" },
];

export default function ForgeBranchPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const branchId = params.branchId as string;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [projectData, setProjectData] = useState<ForgeProjectDetail | null>(null);
  const [branch, setBranch] = useState<ForgeBranch | null>(null);
  const [commits, setCommits] = useState<ForgeCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [content, setContent] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [committing, setCommitting] = useState(false);

  // MR creation state
  const [showMRForm, setShowMRForm] = useState(false);
  const [mrTitle, setMrTitle] = useState("");
  const [mrDescription, setMrDescription] = useState("");
  const [creatingMR, setCreatingMR] = useState(false);

  async function load() {
    try {
      const [pd, commitsList] = await Promise.all([
        getForgeProject(projectId),
        getForgeBranchCommits(branchId),
      ]);
      setProjectData(pd);
      setCommits(commitsList);

      const currentBranch = pd.branches.find((b) => b.id === branchId);
      setBranch(currentBranch ?? null);

      // Set editor content from head commit
      if (commitsList.length > 0) {
        setContent(commitsList[0].content);
      }
    } catch {
      setError("Branche introuvable");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, branchId]);

  async function handleCommit() {
    if (!commitMessage.trim()) return;
    setCommitting(true);
    try {
      await api.createForgeCommit(branchId, {
        message: commitMessage,
        content,
      });
      toast.success("Commit cree");
      setCommitMessage("");
      load();
    } catch {
      toast.error("Erreur lors du commit");
    }
    setCommitting(false);
  }

  async function handleCreateMR() {
    if (!mrTitle.trim() || !projectData) return;
    setCreatingMR(true);
    try {
      const defaultBranch = projectData.branches.find((b) => b.is_default);
      if (!defaultBranch) {
        toast.error("Aucune branche par defaut trouvee");
        setCreatingMR(false);
        return;
      }
      const result = await api.createForgeMergeRequest({
        project_id: projectId,
        source_branch_id: branchId,
        target_branch_id: defaultBranch.id,
        title: mrTitle,
        description: mrDescription || undefined,
      });
      toast.success("Merge request creee");
      router.push(`/forge/mr/${result.merge_request_id}`);
    } catch {
      toast.error("Erreur lors de la creation de la MR");
    }
    setCreatingMR(false);
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

  if (error || !branch || !projectData) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">{error ?? "Branche introuvable"}</div>
          <Link href={`/forge/${projectId}`}>
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour au projet
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isDefault = branch.is_default;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href={`/forge/${projectId}`}>
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {projectData.project.title}
          </Button>
        </Link>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <GitBranch className="h-5 w-5 text-violet-500" />
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                {branch.name}
              </h1>
              {isDefault && (
                <Badge variant="violet" className="text-xs">
                  defaut
                </Badge>
              )}
              {isDefault && (
                <Badge variant="orange" className="text-xs">
                  <Lock className="h-3 w-3" />
                  Lecture seule
                </Badge>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {commits.length} commit{commits.length > 1 ? "s" : ""}
            </p>
          </div>
          {!isDefault && isAuthenticated && (
            <Button
              variant="primary"
              onClick={() => setShowMRForm(true)}
              disabled={showMRForm}
            >
              <GitPullRequest className="h-4 w-4" />
              Creer une Merge Request
            </Button>
          )}
        </div>
      </div>

      {/* MR creation form */}
      {showMRForm && (
        <Card className="mb-4 md:mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-violet-500" />
              Nouvelle Merge Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Titre *
                </label>
                <Input
                  value={mrTitle}
                  onChange={(e) => setMrTitle(e.target.value)}
                  placeholder="Ex: Ajout des conditions de quorum"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                  Description (optionnel)
                </label>
                <textarea
                  value={mrDescription}
                  onChange={(e) => setMrDescription(e.target.value)}
                  placeholder="Expliquez les changements proposes..."
                  className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none min-h-[80px]"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {branch.name} → {projectData.branches.find((b) => b.is_default)?.name ?? "main"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleCreateMR}
                  disabled={creatingMR || !mrTitle.trim()}
                >
                  {creatingMR ? "Creation..." : "Creer la MR"}
                </Button>
                <Button variant="ghost" onClick={() => setShowMRForm(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Card className="mb-4 md:mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            readOnly={isDefault}
            className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none min-h-[300px]"
            style={{
              borderColor: "var(--border)",
              backgroundColor: isDefault ? "rgba(255,255,255,0.02)" : "var(--bg-elevated)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              opacity: isDefault ? 0.7 : 1,
            }}
          />

          {/* Commit form (only for non-default branches) */}
          {!isDefault && isAuthenticated && (
            <div className="mt-4 flex items-center gap-2">
              <Input
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Message du commit..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commitMessage.trim()) handleCommit();
                }}
              />
              <Button
                variant="primary"
                onClick={handleCommit}
                disabled={committing || !commitMessage.trim()}
              >
                <GitCommit className="h-4 w-4" />
                {committing ? "..." : "Commiter"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commit history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <GitCommit className="h-4 w-4" />
            Historique des commits ({commits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commits.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              Aucun commit.
            </div>
          ) : (
            <div className="space-y-0">
              {commits.map((commit, idx) => (
                <div key={commit.id} className="relative pl-6 pb-4 last:pb-0">
                  {idx < commits.length - 1 && (
                    <div
                      className="absolute left-[9px] top-6 bottom-0 w-px"
                      style={{ backgroundColor: "var(--border)" }}
                    />
                  )}
                  <div
                    className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: idx === 0 ? "#8b5cf6" : "var(--border)",
                      backgroundColor: idx === 0 ? "#8b5cf6" : "transparent",
                    }}
                  >
                    {idx === 0 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="ml-2">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {commit.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                      <span>{commit.author_name ?? "Anonyme"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(commit.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-violet-400 font-mono text-[10px]">
                        {commit.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
