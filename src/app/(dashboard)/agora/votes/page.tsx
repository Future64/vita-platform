"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Shield,
  Clock,
  CheckCircle2,
  Settings,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteBar } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";
import {
  MOCK_PROPOSALS,
  MOCK_DOLEANCES,
  getProposalsVoting,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: String(MOCK_PROPOSALS.length), badgeVariant: "pink" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: String(MOCK_DOLEANCES.filter(d => d.statut === "ouverte" || d.statut === "seuil_atteint").length), badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
  { icon: Shield, label: "Administration", href: "/admin", permission: "access_admin_panel" },
];

type SortOption = "deadline" | "participation" | "type";

const QUORUM_THRESHOLD = 10_000; // 10 000 citoyens minimum

export default function VotesActifsPage() {
  const [sort, setSort] = useState<SortOption>("deadline");
  const [votedOn, setVotedOn] = useState<Record<string, "for" | "against" | "abstain">>({});
  const { toast } = useToast();

  const votingProposals = useMemo(() => {
    const result = getProposalsVoting();

    switch (sort) {
      case "participation":
        result.sort((a, b) => (b.totalVotes ?? 0) - (a.totalVotes ?? 0));
        break;
      case "type":
        result.sort((a, b) => {
          if (a.type === "modification_parametre" && !b.type) return -1;
          if (!a.type && b.type === "modification_parametre") return 1;
          return 0;
        });
        break;
      default:
        break; // deadline — keep original order
    }

    return result;
  }, [sort]);

  const avgParticipation = votingProposals.length > 0
    ? Math.round(
        votingProposals.reduce((acc, p) => acc + ((p.totalVotes ?? 0) / QUORUM_THRESHOLD) * 100, 0) / votingProposals.length
      )
    : 0;

  const handleVote = (proposalId: string, vote: "for" | "against" | "abstain") => {
    setVotedOn((prev) => ({ ...prev, [proposalId]: vote }));
    const label = vote === "for" ? "Pour" : vote === "against" ? "Contre" : "Abstention";
    toast.success(`Vote "${label}" enregistré`);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Votes en cours
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {votingProposals.length} votes actifs — Participation moyenne : {avgParticipation}%
        </p>
      </div>

      {/* Sort */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="deadline">Bientôt clos</option>
          <option value="participation">Participation</option>
          <option value="type">Type</option>
        </select>
      </div>

      {/* Votes list */}
      <div className="space-y-5">
        {votingProposals.map((proposal) => {
          const total = (proposal.votesFor ?? 0) + (proposal.votesAgainst ?? 0) + (proposal.votesAbstain ?? 0);
          const forPct = total > 0 ? ((proposal.votesFor ?? 0) / total) * 100 : 0;
          const againstPct = total > 0 ? ((proposal.votesAgainst ?? 0) / total) * 100 : 0;
          const abstainPct = total > 0 ? ((proposal.votesAbstain ?? 0) / total) * 100 : 0;
          const participationPct = ((proposal.totalVotes ?? 0) / QUORUM_THRESHOLD) * 100;
          const quorumAtteint = participationPct >= 50; // 50% quorum
          const userVote = votedOn[proposal.id];

          // Parse countdown urgency
          const isUrgent = proposal.votingEndsAt ? false : false; // mock: use date field
          const dateMatch = proposal.date?.match(/^(\d+)/);
          const daysLeft = dateMatch ? parseInt(dateMatch[1]) : 7;
          const countdownColor = daysLeft <= 0.25 ? "text-red-500" : daysLeft <= 1 ? "text-orange-500" : "text-[var(--text-muted)]";

          return (
            <Card key={proposal.id} className="overflow-hidden">
              <div className="p-5">
                {/* Title + badges + countdown */}
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={proposal.domainColor}>{proposal.domain}</Badge>
                      {proposal.type === "modification_parametre" && (
                        <Badge className="text-xs bg-orange-500/15 text-orange-500">
                          <Settings className="h-3 w-3" />
                          Paramètre
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {proposal.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {proposal.description}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-sm font-medium shrink-0 ${countdownColor}`}>
                    <Clock className="h-4 w-4" />
                    Se termine dans {proposal.date}
                  </span>
                </div>

                {/* Parameter diff */}
                {proposal.type === "modification_parametre" && proposal.parameterProposal && (
                  <div
                    className="mb-3 p-2.5 rounded-lg flex items-center gap-3 text-sm"
                    style={{ backgroundColor: "var(--bg-elevated)" }}
                  >
                    <span className="text-xs text-[var(--text-muted)]">
                      {proposal.parameterProposal.parameterName}:
                    </span>
                    <span className="font-mono text-red-400 line-through">
                      {String(proposal.parameterProposal.currentValue)}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="font-mono text-green-400 font-semibold">
                      {String(proposal.parameterProposal.proposedValue)}
                    </span>
                  </div>
                )}

                {/* Tricolor vote bar */}
                <div className="mb-2">
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div className="h-full bg-green-500" style={{ width: `${forPct}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${againstPct}%` }} />
                    <div className="h-full" style={{ width: `${abstainPct}%`, backgroundColor: "var(--text-muted)" }} />
                  </div>
                </div>

                {/* Vote percentages */}
                <div className="flex items-center gap-4 text-xs mb-3">
                  <span className="text-green-500 font-medium">
                    {Math.round(forPct)}% pour ({formatNumber(proposal.votesFor ?? 0)})
                  </span>
                  <span className="text-red-500 font-medium">
                    {Math.round(againstPct)}% contre ({formatNumber(proposal.votesAgainst ?? 0)})
                  </span>
                  <span className="text-[var(--text-muted)]">
                    {Math.round(abstainPct)}% abstention ({formatNumber(proposal.votesAbstain ?? 0)})
                  </span>
                </div>

                {/* Quorum indicator */}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)]">
                    Participation : {Math.round(participationPct)}% / 50% requis
                  </span>
                  <div className="relative flex-1 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden max-w-xs">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(participationPct, 100)}%`,
                        backgroundColor: quorumAtteint ? "#10b981" : "#f59e0b",
                      }}
                    />
                    {/* Quorum line at 50% */}
                    <div
                      className="absolute top-0 h-full w-0.5"
                      style={{ left: "50%", backgroundColor: "var(--text-muted)" }}
                    />
                  </div>
                  {quorumAtteint ? (
                    <Badge variant="green" className="text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Quorum atteint
                    </Badge>
                  ) : (
                    <span className="text-xs text-orange-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Quorum non atteint
                    </span>
                  )}
                </div>

                {/* Vote buttons + link */}
                <div className="flex flex-wrap items-center gap-3">
                  <PermissionGate permission="vote_proposal">
                    {userVote ? (
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-violet-500" />
                        <span className="text-violet-500 font-medium">
                          Vous avez voté : {userVote === "for" ? "Pour" : userVote === "against" ? "Contre" : "Abstention"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="voteFor"
                          size="sm"
                          onClick={() => handleVote(proposal.id, "for")}
                        >
                          Pour
                        </Button>
                        <Button
                          variant="voteAgainst"
                          size="sm"
                          onClick={() => handleVote(proposal.id, "against")}
                        >
                          Contre
                        </Button>
                        <Button
                          variant="voteAbstain"
                          size="sm"
                          onClick={() => handleVote(proposal.id, "abstain")}
                        >
                          Abstention
                        </Button>
                      </div>
                    )}
                  </PermissionGate>

                  <Link href={`/agora/${proposal.id}`} className="ml-auto">
                    <Button variant="ghost" size="sm" className="text-violet-500">
                      Voir le détail →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}

        {votingProposals.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucun vote actif pour le moment.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
