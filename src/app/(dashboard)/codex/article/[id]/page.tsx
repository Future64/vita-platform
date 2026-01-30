"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Scale,
  FileText,
  Calendar,
  GitBranch,
  Users,
  History
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventTimeline } from "@/components/ui/event-timeline";
import Link from "next/link";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Scale, label: "Lois", href: "/codex/laws" },
  { icon: FileText, label: "Historique", href: "/codex/history" },
];

const articleData = {
  id: "art-9",
  number: "Article 9",
  title: "Protection de l'environnement",
  version: "1.8",
  status: "revision",
  lastModified: "2024-01-25",
  content: `## Principes fondamentaux

Tout citoyen VITA a le droit de vivre dans un environnement sain et a le devoir de le protéger pour les générations futures.

## Section 1 : Obligations collectives

1. La communauté VITA s'engage à réduire son empreinte carbone de 50% d'ici 2030
2. Toute décision économique majeure doit inclure une évaluation environnementale
3. Les ressources naturelles sont considérées comme un bien commun

## Section 2 : Incitations

Le système VITA encourage les comportements écologiques par :
- Attribution de bonus Ѵ pour les actions durables
- Partenariats avec entreprises éco-responsables
- Projets collectifs de reforestation et d'énergie verte

## Section 3 : Sanctions

Les comportements nuisibles à l'environnement peuvent entraîner :
- Réduction temporaire du revenu de base
- Exclusion de certains programmes
- Dans les cas graves, suspension des droits de vote

## Section 4 : Innovation verte

VITA soutient l'innovation écologique par :
- Financement prioritaire des projets verts
- Création d'incubateurs pour technologies durables
- Partage ouvert des brevets verts`,
  relatedLaws: [
    { id: "law-1", title: "Loi sur les bonus écologiques", date: "2024-01-15" },
    { id: "law-5", title: "Protocole de reforestation", date: "2023-11-10" },
  ],
};

const timelineEvents = [
  {
    date: "10 Mar 2023",
    title: "Article créé",
    description: "Version initiale 1.0",
    variant: "violet" as const,
  },
  {
    date: "15 Jun 2023",
    title: "Amendement adopté",
    description: "Ajout de la section sur l'innovation verte",
    variant: "green" as const,
  },
  {
    date: "20 Sep 2023",
    title: "Révision mineure",
    description: "Clarification des sanctions",
    variant: "cyan" as const,
  },
  {
    date: "25 Jan 2024",
    title: "Révision en cours",
    description: "Proposition d'ajout d'objectifs 2035",
    variant: "orange" as const,
  },
];

export default function ArticleDetailPage() {
  const params = useParams();

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-6">
        <Link href="/codex">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la constitution
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="violet">{articleData.number}</Badge>
              <Badge variant="orange">En révision</Badge>
              <span className="text-sm text-[var(--text-muted)]">v{articleData.version}</span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {articleData.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Dernière modification: {articleData.lastModified}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <History className="h-4 w-4" />
              Historique
            </Button>
            <Button variant="primary">
              <GitBranch className="h-4 w-4" />
              Proposer révision
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Article Content */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu de l'article</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {articleData.content.split('\n').map((line, idx) => {
                  if (line.startsWith('##')) {
                    return (
                      <h2 key={idx} className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
                        {line.replace('##', '').trim()}
                      </h2>
                    );
                  }
                  if (line.match(/^\d+\./)) {
                    return (
                      <li key={idx} className="ml-4 text-[var(--text-secondary)] mb-2">
                        {line.replace(/^\d+\./, '').trim()}
                      </li>
                    );
                  }
                  if (line.startsWith('-')) {
                    return (
                      <li key={idx} className="ml-4 text-[var(--text-secondary)] mb-1">
                        {line.replace('-', '').trim()}
                      </li>
                    );
                  }
                  if (line.trim()) {
                    return (
                      <p key={idx} className="text-[var(--text-secondary)] mb-3">
                        {line}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTimeline events={timelineEvents} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Active Revision */}
          <Card>
            <CardHeader>
              <CardTitle>Révision active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[var(--text-muted)] mb-1">Proposition</div>
                  <div className="font-semibold text-[var(--text-primary)] mb-2">
                    Ajout objectifs 2035
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Extension des objectifs environnementaux jusqu'en 2035 avec jalons intermédiaires.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">12 contributeurs</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <GitBranch className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-[var(--text-secondary)]">3 branches actives</span>
                </div>
                <Button variant="primary" className="w-full">
                  Voir la révision
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Laws */}
          <Card>
            <CardHeader>
              <CardTitle>Lois associées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {articleData.relatedLaws.map((law) => (
                  <Link key={law.id} href={`/codex/law/${law.id}`}>
                    <div className="p-3 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all cursor-pointer">
                      <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                        {law.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Adoptée le {law.date}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Version actuelle</div>
                  <div className="font-semibold font-mono text-[var(--text-primary)]">
                    {articleData.version}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Statut</div>
                  <Badge variant="orange">En révision</Badge>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Nombre de révisions</div>
                  <div className="font-semibold text-[var(--text-primary)]">4</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Contributeurs totaux</div>
                  <div className="font-semibold text-[var(--text-primary)]">23</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
