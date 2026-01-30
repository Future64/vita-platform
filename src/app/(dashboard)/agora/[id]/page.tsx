"use client";

import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Vote,
  ThumbsUp,
  ThumbsDown,
  Calendar
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { EventTimeline } from "@/components/ui/event-timeline";
import { VoteBar } from "@/components/ui/progress";
import Link from "next/link";

const sidebarItems: SidebarItem[] = [
  { icon: Vote, label: "Propositions", href: "/agora" },
  { icon: Users, label: "Débats", href: "/agora/debates" },
  { icon: Clock, label: "Historique", href: "/agora/history" },
];

// Mock data for the proposal
const proposalData = {
  id: "1",
  title: "Réforme du système de bonus écologiques",
  category: "Économie",
  status: "active",
  author: "Marie Dupont",
  authorId: "user-123",
  createdAt: "2024-01-15",
  votingEndsAt: "2024-02-15",
  description: `Cette proposition vise à réviser le système actuel de bonus écologiques pour mieux encourager les comportements durables et l'innovation verte.

## Objectifs principaux

1. Augmenter les incitations pour les énergies renouvelables
2. Créer un système de points cumulatifs pour les actions écologiques
3. Établir des partenariats avec les entreprises locales

## Impact attendu

- Réduction de 15% des émissions de CO2 sur 2 ans
- Création de 5000 emplois verts
- Amélioration de la qualité de l'air dans les zones urbaines

## Budget nécessaire

- Phase 1 (6 mois) : 2.5M Ѵ
- Phase 2 (1 an) : 5M Ѵ
- Maintenance annuelle : 1M Ѵ`,
  votes: {
    for: 3247,
    against: 1523,
    abstain: 234,
    total: 5004,
  },
  comments: 127,
  supporters: 856,
};

const timelineEvents = [
  {
    date: "15 Jan 2024",
    title: "Proposition créée",
    description: "Marie Dupont a soumis la proposition",
    variant: "violet" as const,
  },
  {
    date: "18 Jan 2024",
    title: "Phase de débat ouverte",
    description: "45 commentaires et suggestions",
    variant: "cyan" as const,
  },
  {
    date: "25 Jan 2024",
    title: "Révision approuvée",
    description: "Modifications intégrées suite aux débats",
    variant: "green" as const,
  },
  {
    date: "1 Fév 2024",
    title: "Vote en cours",
    description: "65% de participation actuelle",
    variant: "orange" as const,
  },
];

export default function ProposalDetailPage() {
  const params = useParams();
  const votePercentage = Math.round((proposalData.votes.for / proposalData.votes.total) * 100);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="/agora">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux propositions
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="orange">{proposalData.category}</Badge>
              <Badge variant="green">En cours</Badge>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {proposalData.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span>Par {proposalData.author}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {proposalData.createdAt}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Fin: {proposalData.votingEndsAt}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-[var(--text-secondary)]">
                {proposalData.description.split('\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('##')) {
                    return (
                      <h2 key={idx} className="text-lg font-semibold text-[var(--text-primary)] mt-6 mb-3">
                        {paragraph.replace('##', '').trim()}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith('-')) {
                    return (
                      <li key={idx} className="ml-4">
                        {paragraph.replace('-', '').trim()}
                      </li>
                    );
                  }
                  if (paragraph.trim()) {
                    return <p key={idx} className="mb-3">{paragraph}</p>;
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>Chronologie</CardTitle>
            </CardHeader>
            <CardContent>
              <EventTimeline events={timelineEvents} />
            </CardContent>
          </Card>

          {/* Comments Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Débat ({proposalData.comments} commentaires)</CardTitle>
              <Button variant="ghost" size="sm" className="text-violet-500">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-violet-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Jean Martin</span>
                    <span className="text-xs text-[var(--text-muted)]">il y a 2h</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Excellente initiative ! Je suggère d'ajouter un volet pour les transports en commun.
                  </p>
                </div>
                <div className="border-l-2 border-cyan-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Sophie Chen</span>
                    <span className="text-xs text-[var(--text-muted)]">il y a 5h</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Le budget me semble un peu élevé. Peut-on avoir plus de détails sur la répartition ?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-5">
          {/* Vote Card */}
          <Card>
            <CardHeader>
              <CardTitle>Voter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <VoteBar percentage={votePercentage} />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-green-500">{formatNumber(proposalData.votes.for)}</div>
                    <div className="text-xs text-[var(--text-muted)]">Pour</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-pink-500">{formatNumber(proposalData.votes.against)}</div>
                    <div className="text-xs text-[var(--text-muted)]">Contre</div>
                  </div>
                </div>

                <VoteButtons
                  onUpvote={() => console.log('Vote pour')}
                  onDownvote={() => console.log('Vote contre')}
                />

                <div className="pt-3 border-t border-[var(--border)] text-center">
                  <div className="text-xs text-[var(--text-muted)] mb-1">Participation</div>
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    {((proposalData.votes.total / 10000) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {formatNumber(proposalData.votes.total)} / 10 000 citoyens
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Users className="h-4 w-4" />
                    Soutiens
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {proposalData.supporters}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Vote className="h-4 w-4" />
                    Total votes
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {formatNumber(proposalData.votes.total)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Clock className="h-4 w-4" />
                    Temps restant
                  </div>
                  <div className="font-semibold text-orange-500">
                    14 jours
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card>
            <CardHeader>
              <CardTitle>Auteur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  MD
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)]">{proposalData.author}</div>
                  <div className="text-xs text-[var(--text-muted)]">Citoyen actif • 23 propositions</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Voir le profil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
