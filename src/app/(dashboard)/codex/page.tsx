"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Scale,
  FileText,
  Search,
  Shield,
  PenTool,
  Download,
  ChevronRight,
  Lock,
  Unlock,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import type { CodexTitleWithArticles, CodexAmendment } from "@/types/vita";
import {
  getCodexTitles,
  getCodexAmendments,
  getCodexExportPdfUrl,
} from "@/lib/vita-api";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

export default function CodexPage() {
  const [titles, setTitles] = useState<CodexTitleWithArticles[]>([]);
  const [amendments, setAmendments] = useState<CodexAmendment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [t, a] = await Promise.all([
          getCodexTitles(),
          getCodexAmendments(),
        ]);
        setTitles(t);
        setAmendments(a);
      } catch {
        setError("Impossible de charger la Constitution");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalArticles = useMemo(
    () => titles.reduce((sum, t) => sum + t.articles.length, 0),
    [titles]
  );

  const immutableCount = useMemo(
    () =>
      titles.reduce(
        (sum, t) => sum + t.articles.filter((a) => a.immutable).length,
        0
      ),
    [titles]
  );

  const pendingAmendments = amendments.filter(
    (a) => a.status === "draft" || a.status === "deliberation" || a.status === "voting"
  );

  // Filter articles based on search and selected title
  const filteredTitles = useMemo(() => {
    let result = titles;
    if (selectedTitle) {
      result = result.filter((t) => t.id === selectedTitle);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result
        .map((t) => ({
          ...t,
          articles: t.articles.filter(
            (a) =>
              a.name.toLowerCase().includes(q) ||
              `article ${a.number}`.includes(q)
          ),
        }))
        .filter((t) =>
          t.articles.length > 0 ||
          t.name.toLowerCase().includes(q)
        );
    }
    return result;
  }, [titles, search, selectedTitle]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-[var(--text-muted)]">
            Chargement de la Constitution...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Constitution VITA
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {totalArticles} articles &middot; {titles.length} titres &middot; Texte fondateur du systeme monetaire universel
          </p>
        </div>
        <a href={getCodexExportPdfUrl()} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">
            <Download className="h-4 w-4" />
            Exporter PDF
          </Button>
        </a>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Articles"
          value={totalArticles}
        />
        <StatCard
          variant="cyan"
          label="Titres"
          value={titles.length}
        />
        <StatCard
          variant="green"
          label="Immuables"
          value={immutableCount}
        />
        <StatCard
          variant="orange"
          label="Amendements"
          value={pendingAmendments.length}
          trend={pendingAmendments.length > 0 ? { value: "En cours", direction: "up" } : undefined}
        />
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher un article, un titre..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: Title navigation */}
        <div className="space-y-4">
          {/* Title filter */}
          <Card>
            <CardHeader>
              <CardTitle>Titres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedTitle(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedTitle === null
                      ? "bg-[#c9a84c]/15 text-[#c9a84c] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  Tous les titres
                </button>
                {titles.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTitle(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedTitle === t.id
                        ? "bg-[#c9a84c]/15 text-[#c9a84c] font-semibold"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    <span className="font-mono text-xs opacity-60">
                      {t.number}
                    </span>{" "}
                    {t.name}
                    <span className="ml-1 text-xs text-[var(--text-muted)]">
                      ({t.articles.length})
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending amendments */}
          {pendingAmendments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amendements en cours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingAmendments.slice(0, 5).map((a) => (
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Articles */}
        <div className="lg:col-span-2">
          {filteredTitles.map((title) => (
            <div key={title.id} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-1 w-8 rounded-full"
                  style={{ backgroundColor: "#c9a84c" }}
                />
                <h2
                  className="text-lg font-bold text-[var(--text-primary)]"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  Titre {title.number} &mdash; {title.name}
                </h2>
              </div>
              {title.description && (
                <p className="text-sm text-[var(--text-muted)] mb-3 ml-10">
                  {title.description}
                </p>
              )}
              <div className="space-y-2 ml-10">
                {title.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/codex/article/${article.number}`}
                  >
                    <div className="group p-4 rounded-lg border border-[var(--border)] hover:border-[#c9a84c]/50 transition-all cursor-pointer hover:bg-[var(--bg-elevated)]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-sm font-mono"
                              style={{ color: "#c9a84c" }}
                            >
                              Art. {article.number}
                            </span>
                            {article.immutable ? (
                              <Badge
                                className="text-xs bg-[#c9a84c]/15 text-[#c9a84c]"
                              >
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
                          <h3
                            className="font-semibold text-[var(--text-primary)]"
                            style={{
                              fontFamily:
                                "Georgia, 'Times New Roman', serif",
                            }}
                          >
                            {article.name}
                          </h3>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {filteredTitles.length === 0 && (
            <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
              Aucun article ne correspond a votre recherche.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
