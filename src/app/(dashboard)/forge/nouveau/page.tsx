"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderGit2,
  BookOpen,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { api } from "@/lib/api";
import { getCodexArticles } from "@/lib/vita-api";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: FolderGit2, label: "Projets", href: "/forge" },
];

interface CodexArticleOption {
  number: number;
  name: string;
  immutable: boolean;
}

export default function ForgeNouveauPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [codexRef, setCodexRef] = useState<number | undefined>(undefined);
  const [articles, setArticles] = useState<CodexArticleOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadArticles() {
      try {
        const data = await getCodexArticles();
        setArticles(
          (data as unknown as CodexArticleOption[]).filter((a) => !a.immutable)
        );
      } catch {
        // API not available
      }
    }
    loadArticles();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const result = await api.createForgeProject({
        title,
        description: description || undefined,
        content,
        codex_ref: codexRef,
      });
      toast.success("Projet cree avec succes");
      router.push(`/forge/${result.project_id}`);
    } catch {
      toast.error("Erreur lors de la creation du projet");
    }
    setSubmitting(false);
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      <div className="mb-4 md:mb-6">
        <Link href="/forge">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour a la Forge
          </Button>
        </Link>

        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Nouveau projet
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          Creez un projet pour collaborer sur un texte fondateur
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-violet-500" />
            Creer un projet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Titre du projet *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reforme de l'article 5 — Modalites de vote"
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
                placeholder="Decrivez l'objectif de ce projet..."
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
                <BookOpen className="h-3 w-3 inline mr-1" />
                Lier a un article du Codex (optionnel)
              </label>
              <select
                value={codexRef ?? ""}
                onChange={(e) =>
                  setCodexRef(e.target.value ? Number(e.target.value) : undefined)
                }
                className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Aucun article lie</option>
                {articles.map((a) => (
                  <option key={a.number} value={a.number}>
                    Article {a.number} — {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                Contenu initial *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Redigez le contenu initial du projet (Markdown supporte)..."
                className="flex w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:border-violet-500 focus:outline-none min-h-[250px]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? "Creation en cours..." : "Creer le projet"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
