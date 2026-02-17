"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Users,
  Vote,
  Calendar,
  Settings,
  ArrowRight,
  ExternalLink,
  Code,
  History,
  Shield,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { EventTimeline } from "@/components/ui/event-timeline";
import { VoteBar } from "@/components/ui/progress";
import Link from "next/link";
import { getProposalById } from "@/lib/mockProposals";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: Vote, label: "Propositions", href: "/agora" },
  { icon: Users, label: "Debats", href: "/agora/debates" },
  { icon: Clock, label: "Historique", href: "/agora/history" },
  { icon: Shield, label: "Administration", href: "/admin", permission: "access_admin_panel" },
];

const timelineEvents = [
  {
    date: "15 Jan 2024",
    title: "Proposition creee",
    description: "Soumise par l'auteur",
    variant: "violet" as const,
  },
  {
    date: "18 Jan 2024",
    title: "Phase de debat ouverte",
    description: "Commentaires et suggestions",
    variant: "cyan" as const,
  },
  {
    date: "25 Jan 2024",
    title: "Revision approuvee",
    description: "Modifications integrees suite aux debats",
    variant: "green" as const,
  },
  {
    date: "1 Fev 2024",
    title: "Vote en cours",
    description: "Participation en hausse",
    variant: "orange" as const,
  },
];

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const proposal = useMemo(() => getProposalById(id), [id]);

  if (!proposal) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">Proposition introuvable</div>
          <Link href="/agora">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour aux propositions
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isParameterProposal = proposal.type === "modification_parametre" && proposal.parameterProposal;
  const hasVotes = proposal.votesFor != null && proposal.votesAgainst != null && proposal.totalVotes;

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
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={proposal.domainColor}>{proposal.domain}</Badge>
              <Badge variant={proposal.statusColor}>{proposal.statusLabel}</Badge>
              {isParameterProposal && (
                <Badge className="text-xs bg-orange-500/15 text-orange-500">
                  <Settings className="h-3 w-3" />
                  Modification de parametre
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {proposal.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
              <span>Par {proposal.author.name}</span>
              <span>&middot;</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {proposal.createdAt}
              </span>
              {proposal.votingEndsAt && (
                <>
                  <span>&middot;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Fin: {proposal.votingEndsAt}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-5">
          {/* Parameter Modification Box */}
          {isParameterProposal && proposal.parameterProposal && (
            <Card style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
              <CardHeader>
                <CardTitle>
                  <Settings className="h-4 w-4 inline mr-2 text-orange-500" />
                  Modification proposee
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Parameter name */}
                  <div className="text-sm text-[var(--text-muted)]">
                    Parametre : <span className="font-semibold text-[var(--text-primary)]">{proposal.parameterProposal.parameterName}</span>
                  </div>

                  {/* Diff display */}
                  <div
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Valeur actuelle</div>
                        <div className="text-2xl font-mono font-bold text-red-400 line-through">
                          {String(proposal.parameterProposal.currentValue)}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                      <div className="text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Valeur proposee</div>
                        <div className="text-2xl font-mono font-bold text-green-400">
                          {String(proposal.parameterProposal.proposedValue)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Range */}
                  {proposal.parameterProposal.allowedRange && (
                    <div className="text-xs text-[var(--text-muted)]">
                      Plage autorisee : {proposal.parameterProposal.allowedRange.min} — {proposal.parameterProposal.allowedRange.max}
                    </div>
                  )}

                  {/* Quorum / Threshold */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">Quorum requis</div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {proposal.parameterProposal.requiredQuorum}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)]">Seuil d&apos;adoption</div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {proposal.parameterProposal.requiredThreshold}%
                      </div>
                    </div>
                  </div>

                  {/* Justification */}
                  <div>
                    <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Justification</div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic border-l-2 border-orange-500/40 pl-3">
                      {proposal.parameterProposal.justification}
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={`/codex/parametres-systeme/${proposal.parameterProposal.parameterId}`}
                      className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir le parametre dans le Codex
                    </Link>
                    {proposal.parameterProposal.technicalDocLink && (
                      <Link
                        href={proposal.parameterProposal.technicalDocLink}
                        className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                      >
                        <Code className="h-3 w-3" />
                        Documentation technique
                      </Link>
                    )}
                    <Link
                      href="/codex/registre"
                      className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                    >
                      <History className="h-3 w-3" />
                      Historique des modifications
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {proposal.description}
              </p>
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
              <CardTitle>Debat ({proposal.comments} commentaires)</CardTitle>
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
                    Excellente initiative ! Je soutiens cette proposition.
                  </p>
                </div>
                <div className="border-l-2 border-cyan-500 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">Sophie Chen</span>
                    <span className="text-xs text-[var(--text-muted)]">il y a 5h</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Peut-on avoir plus de details sur l&apos;impact prevu ?
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-5">
          {/* Vote Card */}
          {hasVotes && (
            <Card>
              <CardHeader>
                <CardTitle>Voter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <VoteBar votesFor={proposal.votesFor!} votesAgainst={proposal.votesAgainst!} />

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-500">{formatNumber(proposal.votesFor!)}</div>
                      <div className="text-xs text-[var(--text-muted)]">Pour</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-pink-500">{formatNumber(proposal.votesAgainst!)}</div>
                      <div className="text-xs text-[var(--text-muted)]">Contre</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-[var(--text-secondary)]">{formatNumber(proposal.votesAbstain || 0)}</div>
                      <div className="text-xs text-[var(--text-muted)]">Abstention</div>
                    </div>
                  </div>

                  <PermissionGate permission="vote_proposal">
                    <VoteButtons
                      onVote={(vote) => toast.success(`Vote "${vote}" enregistre`)}
                    />
                  </PermissionGate>

                  <div className="pt-3 border-t border-[var(--border)] text-center">
                    <div className="text-xs text-[var(--text-muted)] mb-1">Participation</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">
                      {((proposal.totalVotes! / 10000) * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {formatNumber(proposal.totalVotes!)} / 10 000 citoyens
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                    {proposal.supporters}
                  </div>
                </div>
                {hasVotes && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Vote className="h-4 w-4" />
                      Total votes
                    </div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {formatNumber(proposal.totalVotes!)}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Clock className="h-4 w-4" />
                    {proposal.status === "voting" ? "Temps restant" : "Statut"}
                  </div>
                  <div className="font-semibold text-orange-500">
                    {proposal.status === "voting" ? "14 jours" : proposal.statusLabel}
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
                  {proposal.author.initials}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)]">{proposal.author.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">Citoyen actif</div>
                </div>
              </div>
              <Button variant="secondary" className="w-full mt-4">
                Voir le profil
              </Button>
            </CardContent>
          </Card>

          {/* Parameter quick info (for parameter proposals) */}
          {isParameterProposal && proposal.parameterProposal && (
            <Card style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
              <CardHeader>
                <CardTitle>
                  <Settings className="h-4 w-4 inline mr-1" />
                  Parametre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-[var(--text-muted)] text-xs">Nom</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {proposal.parameterProposal.parameterName}
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] text-xs">Identifiant</div>
                    <div className="font-mono text-xs text-[var(--text-primary)]">
                      {proposal.parameterProposal.parameterId}
                    </div>
                  </div>
                  <Link
                    href={`/codex/parametres-systeme/${proposal.parameterProposal.parameterId}`}
                    className="block"
                  >
                    <Button variant="secondary" size="sm" className="w-full mt-2">
                      <ExternalLink className="h-3 w-3" />
                      Voir dans le Codex
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
