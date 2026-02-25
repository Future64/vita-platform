"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FolderGit2,
  GitBranch,
  GitPullRequest,
  Users,
  Plus,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  GitMerge,
  AlertCircle,
  Vote,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import {
  getForgeProject,
  getForgeProjectMRs,
  getForgeProjectContributors,
  type ForgeProjectDetail,
  type ForgeMergeRequest,
  type ForgeContributor,
} from "@/lib/vita-api";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: FolderGit2, label: "Projets", href: "/forge" },
];

export default function ForgeProjectPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<ForgeProjectDetail | null>(null);
  const [mrs, setMrs] = useState<ForgeMergeRequest[]>([]);
  const [contributors, setContributors] = useState<ForgeContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"branches" | "mr" | "contributors">("branches");
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    try {
      const [projectData, mrsData, contribData] = await Promise.all([
        getForgeProject(id),
        getForgeProjectMRs(id),
        getForgeProjectContributors(id),
      ]);
      setData(projectData);
      setMrs(mrsData);
      setContributors(contribData);
    } catch {
      setError("Projet introuvable");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleCreateBranch() {
    if (!newBranchName.trim()) return;
    setCreating(true);
    try {
      await api.createForgeBranch(id, { name: newBranchName.trim() });
      toast.success("Branche creee");
      setShowNewBranch(false);
      setNewBranchName("");
      load();
    } catch {
      toast.error("Erreur lors de la creation de la branche");
    }
    setCreating(false);
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
          <div className="text-red-400">{error ?? "Projet introuvable"}</div>
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

  const { project, branches } = data;
  const openMRs = mrs.filter((m) => m.status === "open" || m.status === "voting");

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href="/forge">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour a la Forge
          </Button>
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <FolderGit2 className="h-5 w-5 text-violet-500" />
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {project.title}
            </h1>
            {project.codex_ref && (
              <Link href={`/codex/article/${project.codex_ref}`}>
                <Badge variant="blue" className="text-xs cursor-pointer hover:opacity-80">
                  <BookOpen className="h-3 w-3" />
                  Article {project.codex_ref}
                </Badge>
              </Link>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-[var(--text-secondary)]">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span>{branches.length} branche{branches.length > 1 ? "s" : ""}</span>
            <span>{openMRs.length} MR ouverte{openMRs.length > 1 ? "s" : ""}</span>
            <span>{contributors.length} contributeur{contributors.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 md:mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {([
          { key: "branches" as const, label: `Branches (${branches.length})`, icon: GitBranch },
          { key: "mr" as const, label: `Merge Requests (${mrs.length})`, icon: GitPullRequest },
          { key: "contributors" as const, label: `Contributeurs (${contributors.length})`, icon: Users },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? "border-violet-500 text-violet-500"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Branches tab */}
      {tab === "branches" && (
        <div className="space-y-3">
          {isAuthenticated && (
            <div className="flex justify-end mb-2">
              {showNewBranch ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="nom-de-branche"
                    className="w-64"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateBranch();
                      if (e.key === "Escape") {
                        setShowNewBranch(false);
                        setNewBranchName("");
                      }
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreateBranch}
                    disabled={creating || !newBranchName.trim()}
                  >
                    {creating ? "..." : "Creer"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowNewBranch(false);
                      setNewBranchName("");
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button variant="primary" size="sm" onClick={() => setShowNewBranch(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Nouvelle branche
                </Button>
              )}
            </div>
          )}

          {branches.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="Aucune branche"
              description="Ce projet n'a pas encore de branche."
            />
          ) : (
            branches.map((branch) => (
              <Link key={branch.id} href={`/forge/${id}/${branch.id}`}>
                <Card className="hover:border-violet-500/50 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-violet-500" />
                        <span className="font-semibold text-[var(--text-primary)]">
                          {branch.name}
                        </span>
                        {branch.is_default && (
                          <Badge variant="violet" className="text-xs">
                            defaut
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(branch.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Merge Requests tab */}
      {tab === "mr" && (
        <div className="space-y-3">
          {mrs.length === 0 ? (
            <EmptyState
              icon={GitPullRequest}
              title="Aucune merge request"
              description="Creez une branche, faites vos modifications, puis ouvrez une merge request."
            />
          ) : (
            mrs.map((mr) => (
              <Link key={mr.id} href={`/forge/mr/${mr.id}`}>
                <Card className="hover:border-violet-500/50 transition-all cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <GitPullRequest className="h-4 w-4 text-violet-500" />
                          <h3 className="font-semibold text-[var(--text-primary)] truncate">
                            {mr.title}
                          </h3>
                          <MRStatusBadge status={mr.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                          <span>par {mr.author_name ?? "Anonyme"}</span>
                          <span>
                            {mr.source_branch_name} → {mr.target_branch_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(mr.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm ml-3">
                        <span className="text-green-500 font-medium">{mr.votes_for}</span>
                        <span className="text-[var(--text-muted)]">/</span>
                        <span className="text-red-400 font-medium">{mr.votes_against}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Contributors tab */}
      {tab === "contributors" && (
        <Card>
          <CardContent className="p-4 md:p-6">
            {contributors.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">
                Aucun contributeur pour le moment.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                      <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">
                        Contributeur
                      </th>
                      <th className="text-right py-2 px-3 text-[var(--text-muted)] font-medium">
                        Commits
                      </th>
                      <th className="text-right py-2 px-3 text-[var(--text-muted)] font-medium">
                        MRs
                      </th>
                      <th className="text-right py-2 px-3 text-[var(--text-muted)] font-medium">
                        Derniere activite
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributors.map((c) => (
                      <tr
                        key={c.author_id}
                        className="border-b last:border-0"
                        style={{ borderColor: "var(--border)" }}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                              {(c.display_name ?? "?")[0].toUpperCase()}
                            </div>
                            <span className="text-[var(--text-primary)] font-medium">
                              {c.display_name ?? "Anonyme"}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-3 text-[var(--text-secondary)]">
                          {c.commit_count ?? 0}
                        </td>
                        <td className="text-right py-2.5 px-3 text-[var(--text-secondary)]">
                          {c.mr_count ?? 0}
                        </td>
                        <td className="text-right py-2.5 px-3 text-[var(--text-muted)] text-xs">
                          {c.last_active
                            ? new Date(c.last_active).toLocaleDateString("fr-FR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
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
