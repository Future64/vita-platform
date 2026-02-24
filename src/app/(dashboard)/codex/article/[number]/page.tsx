"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  Calendar,
  Lock,
  Unlock,
  Clock,
  Settings,
  Code,
  History,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { CodexArticle, CodexVersion, CodexAmendment } from "@/types/vita";
import {
  getCodexArticle,
  getCodexArticleVersions,
  getCodexAmendments,
} from "@/lib/vita-api";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Settings, label: "Parametres en vigueur", href: "/codex/parametres-systeme" },
  { icon: Code, label: "Documentation", href: "/codex/technique/emission-quotidienne" },
  { icon: History, label: "Registre", href: "/codex/registre" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

export default function ArticleDetailPage() {
  const params = useParams();
  const articleNumber = Number(params.number);

  const [article, setArticle] = useState<CodexArticle | null>(null);
  const [versions, setVersions] = useState<CodexVersion[]>([]);
  const [amendments, setAmendments] = useState<CodexAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(articleNumber)) {
      setError("Numero d'article invalide");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const [art, vers] = await Promise.all([
          getCodexArticle(articleNumber),
          getCodexArticleVersions(articleNumber),
        ]);
        setArticle(art);
        setVersions(vers);

        // Fetch amendments for this article (optional — don't break page if it fails)
        try {
          const allAmendments = await getCodexAmendments();
          setAmendments(
            allAmendments.filter((a) => a.article_id === art.id)
          );
        } catch {
          // Amendments are optional
        }
      } catch (err) {
        console.error("Codex article load error:", err);
        setError("Article introuvable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [articleNumber]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-[var(--text-muted)]">
            Chargement de l&apos;article...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !article) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">{error ?? "Article introuvable"}</div>
          <Link href="/codex">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour a la Constitution
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const pendingAmendments = amendments.filter(
    (a) => a.status !== "adopted" && a.status !== "rejected"
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href="/codex">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour a la Constitution
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className="text-sm font-mono font-bold"
                style={{ color: "#c9a84c" }}
              >
                Article {article.number}
              </span>
              {article.immutable ? (
                <Badge className="text-xs bg-[#c9a84c]/15 text-[#c9a84c]">
                  <Lock className="h-3 w-3" />
                  Immuable
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Unlock className="h-3 w-3" />
                  Modifiable
                </Badge>
              )}
              <span className="text-xs text-[var(--text-muted)]">
                v{article.version}
              </span>
            </div>
            <h1
              className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {article.name}
            </h1>
            <div className="flex items-center gap-4 text-xs md:text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Mis a jour le{" "}
                {new Date(article.updated_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          {!article.immutable && (
            <Link href={`/codex/amendement/nouveau?article=${article.number}`}>
              <Button variant="primary">
                <PenTool className="h-4 w-4" />
                Proposer un amendement
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-5">
          {/* Article Content */}
          <Card>
            <CardHeader>
              <CardTitle
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                Contenu de l&apos;article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {article.content.split("\n\n").map((para, idx) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;
                  return (
                    <p
                      key={idx}
                      className="text-[var(--text-secondary)] leading-relaxed"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Rationale */}
          {article.rationale && (
            <Card>
              <CardHeader>
                <CardTitle
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  Expose des motifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="text-[var(--text-secondary)] italic leading-relaxed border-l-2 pl-4"
                  style={{
                    borderColor: "#c9a84c",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                  }}
                >
                  {article.rationale.split("\n\n").map((para, idx) => (
                    <p key={idx} className="mb-3 last:mb-0">
                      {para.trim()}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Version History */}
          {versions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des versions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.map((v, idx) => (
                    <div
                      key={v.id}
                      className="relative pl-6 pb-4 last:pb-0"
                    >
                      {/* Timeline line */}
                      {idx < versions.length - 1 && (
                        <div
                          className="absolute left-[9px] top-6 bottom-0 w-px"
                          style={{ backgroundColor: "rgba(201, 168, 76, 0.3)" }}
                        />
                      )}
                      {/* Timeline dot */}
                      <div
                        className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: idx === 0 ? "#c9a84c" : "var(--border-subtle, rgba(255,255,255,0.1))",
                          backgroundColor: idx === 0 ? "#c9a84c" : "transparent",
                        }}
                      >
                        {idx === 0 && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="ml-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            Version {v.version}
                          </span>
                          {idx === 0 && (
                            <Badge
                              className="text-xs bg-[#c9a84c]/15 text-[#c9a84c]"
                            >
                              Actuelle
                            </Badge>
                          )}
                        </div>
                        {v.change_summary && (
                          <p className="text-sm text-[var(--text-secondary)] mb-1">
                            {v.change_summary}
                          </p>
                        )}
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(v.created_at).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-5">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Statut</div>
                  {article.immutable ? (
                    <Badge className="bg-[#c9a84c]/15 text-[#c9a84c]">
                      <Lock className="h-3 w-3" />
                      Immuable
                    </Badge>
                  ) : (
                    <Badge variant="green">Actif</Badge>
                  )}
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Version</div>
                  <div className="font-semibold font-mono text-[var(--text-primary)]">
                    {article.version}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Nombre de versions</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {versions.length}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Date de creation</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {new Date(article.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Derniere mise a jour</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {new Date(article.updated_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Amendments */}
          {pendingAmendments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amendements en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingAmendments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-lg border border-[var(--border)] hover:border-[#c9a84c]/50 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="orange" className="text-xs">
                          {a.status}
                        </Badge>
                        <span className="text-xs text-[var(--text-muted)]">
                          {a.co_signatures} co-signatures
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {a.change_summary}
                      </p>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {!article.immutable && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link
                    href={`/codex/amendement/nouveau?article=${article.number}`}
                    className="block"
                  >
                    <Button variant="primary" className="w-full">
                      <PenTool className="h-4 w-4" />
                      Proposer un amendement
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {article.immutable && (
            <Card>
              <CardContent className="p-3.5 md:p-4">
                <div className="flex items-start gap-3">
                  <Lock
                    className="h-5 w-5 mt-0.5 flex-shrink-0"
                    style={{ color: "#c9a84c" }}
                  />
                  <div>
                    <p
                      className="text-sm font-semibold text-[var(--text-primary)] mb-1"
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                      }}
                    >
                      Article immuable
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Cet article est un principe fondateur de VITA et ne peut
                      pas etre amende. Il est grave dans la Constitution de
                      maniere permanente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
