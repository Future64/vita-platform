"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  Send,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { CodexArticle } from "@/types/vita";
import {
  getCodexArticles,
  getCodexArticle,
  createCodexAmendment,
  ApiError,
} from "@/lib/vita-api";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

export default function NewAmendmentPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-[var(--text-muted)]">
              Chargement...
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <NewAmendmentContent />
    </Suspense>
  );
}

function NewAmendmentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedArticle = searchParams.get("article");

  const [articles, setArticles] = useState<CodexArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<CodexArticle | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [proposedContent, setProposedContent] = useState("");
  const [proposedRationale, setProposedRationale] = useState("");
  const [changeSummary, setChangeSummary] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const allArticles = await getCodexArticles();
        setArticles(allArticles);

        if (preselectedArticle) {
          const num = Number(preselectedArticle);
          if (!isNaN(num)) {
            const art = await getCodexArticle(num);
            if (!art.immutable) {
              setSelectedArticle(art);
              setProposedContent(art.content);
            }
          }
        }
      } catch {
        setError("Impossible de charger les articles");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [preselectedArticle]);

  function handleArticleSelect(articleId: string) {
    const art = articles.find((a) => a.id === articleId);
    if (art && !art.immutable) {
      setSelectedArticle(art);
      setProposedContent(art.content);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedArticle) {
      setError("Veuillez selectionner un article");
      return;
    }
    if (!changeSummary.trim()) {
      setError("Veuillez decrire votre modification");
      return;
    }
    if (!proposedContent.trim()) {
      setError("Le contenu propose ne peut pas etre vide");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // For prototype: use a placeholder author_id
      await createCodexAmendment({
        article_id: selectedArticle.id,
        author_id: "00000000-0000-0000-0000-000000000001",
        proposed_content: proposedContent,
        proposed_rationale: proposedRationale || undefined,
        change_summary: changeSummary,
      });
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Erreur lors de la soumission");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-[var(--text-muted)]">
            Chargement...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(201, 168, 76, 0.15)" }}
          >
            <PenTool className="h-8 w-8" style={{ color: "#c9a84c" }} />
          </div>
          <h2
            className="text-xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Amendement soumis
          </h2>
          <p className="text-[var(--text-muted)] text-center max-w-md">
            Votre proposition d&apos;amendement a ete enregistree. Elle sera
            soumise a deliberation puis au vote de la communaute.
          </p>
          <div className="flex gap-3">
            <Link href="/codex">
              <Button variant="secondary">Retour au Codex</Button>
            </Link>
            {selectedArticle && (
              <Link href={`/codex/article/${selectedArticle.number}`}>
                <Button variant="primary">Voir l&apos;article</Button>
              </Link>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const modifiableArticles = articles.filter((a) => !a.immutable);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-6">
        <Link href="/codex">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour a la Constitution
          </Button>
        </Link>

        <h1
          className="text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Proposer un amendement
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Proposez une modification a un article de la Constitution VITA.
          Votre proposition sera soumise a deliberation puis au vote.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Article selection */}
            <Card>
              <CardHeader>
                <CardTitle>Article a amender</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] p-3 text-sm focus:outline-none focus:border-[#c9a84c]"
                  value={selectedArticle?.id ?? ""}
                  onChange={(e) => handleArticleSelect(e.target.value)}
                >
                  <option value="">Selectionnez un article...</option>
                  {modifiableArticles.map((art) => (
                    <option key={art.id} value={art.id}>
                      Article {art.number} — {art.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            {/* Change summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resume de la modification</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Decrivez brievement votre modification..."
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  {changeSummary.length}/200 caracteres
                </p>
              </CardContent>
            </Card>

            {/* Proposed content */}
            <Card>
              <CardHeader>
                <CardTitle>Contenu propose</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedArticle ? (
                  <textarea
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 text-sm focus:outline-none focus:border-[#c9a84c] min-h-[300px] resize-y"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      lineHeight: "1.8",
                    }}
                    value={proposedContent}
                    onChange={(e) => setProposedContent(e.target.value)}
                    placeholder="Redigez le nouveau contenu de l'article..."
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-[var(--text-muted)] text-sm">
                    Selectionnez un article pour commencer la redaction.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rationale */}
            <Card>
              <CardHeader>
                <CardTitle>Expose des motifs (optionnel)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] p-4 text-sm focus:outline-none focus:border-[#c9a84c] min-h-[150px] resize-y"
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    lineHeight: "1.8",
                  }}
                  value={proposedRationale}
                  onChange={(e) => setProposedRationale(e.target.value)}
                  placeholder="Expliquez les raisons de votre proposition..."
                />
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Link href="/codex">
                <Button variant="secondary" type="button">
                  Annuler
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting || !selectedArticle}
              >
                {submitting ? (
                  "Envoi en cours..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Soumettre l&apos;amendement
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Current article content */}
            {selectedArticle && (
              <Card>
                <CardHeader>
                  <CardTitle>Contenu actuel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-sm font-mono"
                      style={{ color: "#c9a84c" }}
                    >
                      Art. {selectedArticle.number}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      v{selectedArticle.version}
                    </span>
                  </div>
                  <div
                    className="text-sm text-[var(--text-secondary)] leading-relaxed max-h-[400px] overflow-y-auto"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    {selectedArticle.content
                      .split("\n\n")
                      .map((para, idx) => (
                        <p key={idx} className="mb-3 last:mb-0">
                          {para.trim()}
                        </p>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Processus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(201, 168, 76, 0.15)",
                        color: "#c9a84c",
                      }}
                    >
                      1
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Soumission
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Votre proposition est enregistree
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(201, 168, 76, 0.15)",
                        color: "#c9a84c",
                      }}
                    >
                      2
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Deliberation
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        La communaute discute la proposition
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(201, 168, 76, 0.15)",
                        color: "#c9a84c",
                      }}
                    >
                      3
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Vote
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        1 personne = 1 voix, majorite requise
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: "rgba(201, 168, 76, 0.15)",
                        color: "#c9a84c",
                      }}
                    >
                      4
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Application
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        L&apos;article est mis a jour si adopte
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Warning about immutable articles */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lock
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: "#c9a84c" }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                      Articles immuables
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Les articles fondateurs (1 a 3) ne peuvent pas etre
                      amendes. Ils sont graves de maniere permanente dans la
                      Constitution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
