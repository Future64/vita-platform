"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  PenTool,
  Lock,
  Unlock,
  ThumbsUp,
  ThumbsDown,
  GitMerge,
  Clock,
  History,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  getForgeDocument,
  getForgeDocumentHistory,
  type ForgeDocumentDetail,
  type ForgeDiff,
  type ForgeHistoryEntry,
} from "@/lib/vita-api";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: FileText, label: "Documents", href: "/forge" },
  { icon: History, label: "Historique", href: "/forge/commits" },
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
    <div className="rounded-lg border overflow-auto text-xs" style={{ borderColor: "var(--border)", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
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

// ── Propose Diff Modal ──────────────────────────────────────────────

function ProposeDiffForm({
  documentId,
  currentContent,
  onClose,
  onCreated,
}: {
  documentId: string;
  currentContent: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentNew, setContentNew] = useState(currentContent);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || contentNew === currentContent) return;
    setSubmitting(true);
    try {
      await api.createForgeDiff(documentId, {
        title,
        description: description || undefined,
        content_new: contentNew,
      });
      toast.success("Proposition soumise");
      onCreated();
      onClose();
    } catch {
      toast.error("Erreur lors de la soumission");
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposer une modification</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Annuler
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Titre de la modification
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Preciser les conditions de quorum"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Expliquez la raison de cette modification..."
              className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none min-h-[80px]"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Nouveau contenu
            </label>
            <textarea
              value={contentNew}
              onChange={(e) => setContentNew(e.target.value)}
              className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none min-h-[200px]"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--bg-elevated)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
              required
            />
          </div>
          {contentNew !== currentContent && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Apercu des changements
              </label>
              <DiffView original={currentContent} proposed={contentNew} />
            </div>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={submitting || !title.trim() || contentNew === currentContent}
          >
            {submitting ? "Envoi..." : "Soumettre la proposition"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ForgeDocumentPage() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<ForgeDocumentDetail | null>(null);
  const [history, setHistory] = useState<ForgeHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPropose, setShowPropose] = useState(false);
  const [expandedDiff, setExpandedDiff] = useState<string | null>(null);
  const [tab, setTab] = useState<"content" | "diffs" | "history">("content");

  async function load() {
    try {
      const [doc, hist] = await Promise.all([
        getForgeDocument(id),
        getForgeDocumentHistory(id),
      ]);
      setData(doc);
      setHistory(hist);
    } catch {
      setError("Document introuvable");
    }
    setLoading(false);
  }

  useEffect(() => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      setError("ID invalide");
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleVote(diffId: string, choice: "for" | "against") {
    try {
      await api.voteForgeDiff(diffId, choice);
      toast.success(choice === "for" ? "Vote pour" : "Vote contre");
      load();
    } catch {
      toast.error("Erreur lors du vote");
    }
  }

  async function handleMerge(diffId: string) {
    try {
      await api.mergeForgeDiff(diffId);
      toast.success("Modification fusionnee");
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
          <div className="text-red-400">{error ?? "Document introuvable"}</div>
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

  const { document: doc, diffs } = data;
  const pendingDiffs = diffs.filter((d) => d.status === "pending");
  const mergedDiffs = diffs.filter((d) => d.status === "merged");

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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <FileText className="h-5 w-5 text-violet-500" />
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                {doc.title}
              </h1>
              {doc.locked ? (
                <Badge className="text-xs bg-orange-500/15 text-orange-400">
                  <Lock className="h-3 w-3" />
                  Verrouille
                </Badge>
              ) : (
                <Badge variant="green" className="text-xs">
                  <Unlock className="h-3 w-3" />
                  Editable
                </Badge>
              )}
              <span className="text-xs text-[var(--text-muted)]">v{doc.version}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              {doc.codex_ref && (
                <Link href={`/codex/article/${doc.codex_ref}`} className="text-violet-500 hover:underline">
                  Article {doc.codex_ref} du Codex
                </Link>
              )}
              <span>{pendingDiffs.length} proposition(s) en attente</span>
            </div>
          </div>
          {isAuthenticated && !doc.locked && !showPropose && (
            <Button variant="primary" onClick={() => setShowPropose(true)}>
              <PenTool className="h-4 w-4" />
              Proposer une modification
            </Button>
          )}
        </div>
      </div>

      {/* Propose form */}
      {showPropose && (
        <div className="mb-4 md:mb-6">
          <ProposeDiffForm
            documentId={doc.id}
            currentContent={doc.content}
            onClose={() => setShowPropose(false)}
            onCreated={() => load()}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 md:mb-6 border-b" style={{ borderColor: "var(--border)" }}>
        {(["content", "diffs", "history"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-violet-500 text-violet-500"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {t === "content" && "Contenu"}
            {t === "diffs" && `Propositions (${pendingDiffs.length})`}
            {t === "history" && `Historique (${history.length})`}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {tab === "content" && (
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {doc.content.split("\n\n").map((para, idx) => {
                const trimmed = para.trim();
                if (!trimmed) return null;
                return (
                  <p
                    key={idx}
                    className="text-[var(--text-secondary)] leading-relaxed"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diffs tab */}
      {tab === "diffs" && (
        <div className="space-y-3">
          {diffs.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-12">
              Aucune proposition de modification.
            </div>
          ) : (
            diffs.map((diff) => (
              <Card key={diff.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[var(--text-primary)]">
                          {diff.title}
                        </h3>
                        <DiffStatusBadge status={diff.status} />
                      </div>
                      {diff.description && (
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          {diff.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span>par {diff.author_pseudo ?? "Anonyme"}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(diff.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500 font-medium">{diff.votes_for}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-red-400 font-medium">{diff.votes_against}</span>
                    </div>
                  </div>

                  {/* Toggle diff view */}
                  <button
                    onClick={() => setExpandedDiff(expandedDiff === diff.id ? null : diff.id)}
                    className="text-xs text-violet-500 hover:underline mb-2"
                  >
                    {expandedDiff === diff.id ? "Masquer les changements" : "Voir les changements"}
                  </button>

                  {expandedDiff === diff.id && (
                    <div className="mb-3">
                      <DiffView original={doc.content} proposed={diff.content_new} />
                    </div>
                  )}

                  {/* Actions */}
                  {diff.status === "pending" && isAuthenticated && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(diff.id, "for")}
                        className="text-green-500"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Pour
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(diff.id, "against")}
                        className="text-red-400"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        Contre
                      </Button>
                      <div className="flex-1" />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleMerge(diff.id)}
                      >
                        <GitMerge className="h-3.5 w-3.5" />
                        Fusionner
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* History tab */}
      {tab === "history" && (
        <Card>
          <CardContent className="p-4 md:p-6">
            {history.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-8">
                Pas encore d&apos;historique.
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, idx) => (
                  <div key={entry.id} className="relative pl-6 pb-4 last:pb-0">
                    {idx < history.length - 1 && (
                      <div
                        className="absolute left-[9px] top-6 bottom-0 w-px"
                        style={{ backgroundColor: "rgba(139, 92, 246, 0.3)" }}
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          Version {entry.version}
                        </span>
                        {idx === 0 && (
                          <Badge variant="violet" className="text-xs">
                            Precedente
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}

function DiffStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="orange" className="text-xs">
          En attente
        </Badge>
      );
    case "merged":
      return (
        <Badge variant="green" className="text-xs">
          <CheckCircle2 className="h-3 w-3" />
          Fusionne
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="outline" className="text-xs text-red-400">
          <XCircle className="h-3 w-3" />
          Rejete
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
