"use client";

import {
  BookOpen,
  Scale,
  FileText,
  Search,
  Calendar,
  Users,
  GitBranch
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListItem } from "@/components/ui/list-item";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Scale, label: "Lois", href: "/codex/laws" },
  { icon: FileText, label: "Historique", href: "/codex/history" },
];

const constitutionArticles = [
  {
    id: "art-1",
    number: "Article 1",
    title: "Principes fondamentaux",
    summary: "Les principes de base de la gouvernance VITA",
    lastModified: "2023-12-01",
    version: "2.1",
    status: "active",
  },
  {
    id: "art-2",
    number: "Article 2",
    title: "Droits des citoyens",
    summary: "Droits et responsabilités de chaque citoyen",
    lastModified: "2024-01-10",
    version: "3.0",
    status: "active",
  },
  {
    id: "art-3",
    number: "Article 3",
    title: "Système économique",
    summary: "Fonctionnement de la monnaie Ѵ et de l'économie",
    lastModified: "2024-01-20",
    version: "2.5",
    status: "active",
  },
  {
    id: "art-9",
    number: "Article 9",
    title: "Protection de l'environnement",
    summary: "Obligations environnementales et durabilité",
    lastModified: "2024-01-25",
    version: "1.8",
    status: "revision",
  },
];

const recentLaws = [
  {
    id: "law-1",
    title: "Loi sur les bonus écologiques",
    category: "Environnement",
    date: "2024-01-15",
    articles: 12,
  },
  {
    id: "law-2",
    title: "Réforme du système de vote",
    category: "Gouvernance",
    date: "2024-01-08",
    articles: 8,
  },
  {
    id: "law-3",
    title: "Protection des données personnelles",
    category: "Numérique",
    date: "2023-12-20",
    articles: 15,
  },
];

export default function CodexPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Constitution VITA
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Version actuelle : 3.2 • Dernière mise à jour : 25 Jan 2024
          </p>
        </div>
        <Button variant="secondary">
          <FileText className="h-4 w-4" />
          Exporter PDF
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Articles"
          value="47"
        />
        <StatCard
          variant="cyan"
          label="Lois actives"
          value="156"
        />
        <StatCard
          variant="green"
          label="Révisions"
          value="8"
          trend={{ value: "En cours", direction: "up" }}
        />
        <StatCard
          variant="orange"
          label="Amendements"
          value="23"
          trend={{ value: "Cette année", direction: "up" }}
        />
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher dans la constitution, les lois, les articles..."
                className="pl-10"
              />
            </div>
            <Button variant="primary">Rechercher</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content - Constitution Articles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Articles de la Constitution</CardTitle>
              <Button variant="ghost" size="sm" className="text-violet-500">
                Voir tout (47)
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {constitutionArticles.map((article) => (
                  <Link key={article.id} href={`/codex/article/${article.id}`}>
                    <div className="group p-4 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer hover:bg-[var(--bg-elevated)]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-violet-500">
                              {article.number}
                            </span>
                            {article.status === "revision" && (
                              <Badge variant="orange" className="text-xs">En révision</Badge>
                            )}
                            <span className="text-xs text-[var(--text-muted)]">
                              v{article.version}
                            </span>
                          </div>
                          <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {article.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.lastModified}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Recent Laws */}
          <Card>
            <CardHeader>
              <CardTitle>Lois récentes</CardTitle>
              <Link href="/codex/laws">
                <Button variant="ghost" size="sm" className="text-violet-500">
                  Voir
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLaws.map((law) => (
                  <Link key={law.id} href={`/codex/law/${law.id}`}>
                    <div className="group p-3 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="cyan" className="text-xs">{law.category}</Badge>
                        <span className="text-xs text-[var(--text-muted)]">
                          {law.articles} articles
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                        {law.title}
                      </h4>
                      <div className="text-xs text-[var(--text-muted)]">
                        {law.date}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Revisions */}
          <Card>
            <CardHeader>
              <CardTitle>Révisions actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <ListItem
                  icon={GitBranch}
                  iconVariant="orange"
                  title="Article 9 - Environnement"
                  subtitle="4 propositions"
                />
                <ListItem
                  icon={GitBranch}
                  iconVariant="violet"
                  title="Article 12 - Numérique"
                  subtitle="2 propositions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Dernière révision</div>
                  <div className="font-semibold text-[var(--text-primary)]">25 Janvier 2024</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Prochaine assemblée</div>
                  <div className="font-semibold text-[var(--text-primary)]">15 Février 2024</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Participation citoyenne</div>
                  <div className="font-semibold text-green-500">Ouverte</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
