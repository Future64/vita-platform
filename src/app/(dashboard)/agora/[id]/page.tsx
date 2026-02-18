"use client";

import { useState, useMemo } from "react";
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
  Flame,
  Scroll,
  FileText,
  Archive,
  Sparkles,
  Pin,
  CheckCircle2,
  ThumbsUp,
  Lightbulb,
  ThumbsDown,
  MessageSquare,
  Pencil,
  Rocket,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Tag,
  XCircle,
  Plus,
  Send,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { VoteBar } from "@/components/ui/progress";
import { SubTabs, SubTabsList, SubTabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  getProposalById,
  getDebatsForProposal,
  getHistoriqueForProposal,
  type FilDiscussion,
  type Message,
  type EvenementHistorique,
} from "@/lib/mockProposals";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora" },
  { icon: Scroll, label: "Doléances", href: "/agora/grievances" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

// --- Catégorie configs pour les fils de discussion ---
const CATEGORIE_CONFIG: Record<string, { label: string; color: string; badgeVariant: "green" | "red" | "blue" | "orange" | "violet" | "cyan" }> = {
  argument_pour: { label: "Pour", color: "text-green-500", badgeVariant: "green" },
  argument_contre: { label: "Contre", color: "text-red-500", badgeVariant: "red" },
  question: { label: "Question", color: "text-blue-500", badgeVariant: "blue" },
  proposition_amendement: { label: "Amendement", color: "text-orange-500", badgeVariant: "orange" },
  technique: { label: "Technique", color: "text-[var(--text-muted)]", badgeVariant: "violet" },
  general: { label: "Général", color: "text-violet-500", badgeVariant: "violet" },
};

const CATEGORIE_EMOJI: Record<string, string> = {
  argument_pour: "🟢",
  argument_contre: "🔴",
  question: "❓",
  proposition_amendement: "✏️",
  technique: "🔧",
  general: "💬",
};

// --- Event type configs for historique ---
const EVT_CONFIG: Record<string, { icon: typeof Plus; color: string }> = {
  creation: { icon: Plus, color: "bg-violet-500" },
  passage_discussion: { icon: MessageSquare, color: "bg-blue-500" },
  passage_vote: { icon: Vote, color: "bg-blue-500" },
  modification_texte: { icon: Pencil, color: "bg-orange-500" },
  ajout_document: { icon: FileText, color: "bg-cyan-500" },
  vote_cloture: { icon: Clock, color: "bg-green-500" },
  resultat: { icon: CheckCircle2, color: "bg-green-500" },
  application: { icon: Rocket, color: "bg-green-500" },
  appel: { icon: AlertTriangle, color: "bg-red-500" },
  assignation_relecteur: { icon: UserCheck, color: "bg-blue-400" },
  soutien_seuil: { icon: TrendingUp, color: "bg-violet-500" },
  changement_categorie: { icon: Tag, color: "bg-orange-400" },
  commentaire_clos: { icon: MessageSquare, color: "bg-[var(--text-muted)]" },
  modification: { icon: Pencil, color: "bg-orange-500" },
};

const LIFECYCLE_STEPS = ["creation", "discussion", "vote", "resultat", "application"] as const;
const LIFECYCLE_LABELS: Record<string, string> = {
  creation: "Création",
  discussion: "Discussion",
  vote: "Vote",
  resultat: "Résultat",
  application: "Application",
};

function getInitials(prenom: string, nom: string) {
  return `${prenom[0]}${nom[0]}`.toUpperCase();
}

export default function ProposalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("detail");
  const [expandedFil, setExpandedFil] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<string>("all");
  const [reactions, setReactions] = useState<Record<string, Record<string, boolean>>>({});

  const proposal = useMemo(() => getProposalById(id), [id]);
  const debat = useMemo(() => getDebatsForProposal(id), [id]);
  const historique = useMemo(() => getHistoriqueForProposal(id), [id]);

  const filteredFils = useMemo(() => {
    if (!debat) return [];
    let fils = [...debat.fils];
    if (categorieFilter !== "all") {
      fils = fils.filter((f) => f.categorie === categorieFilter);
    }
    // Pinned first, then by date
    fils.sort((a, b) => {
      if (a.epingle && !b.epingle) return -1;
      if (!a.epingle && b.epingle) return 1;
      return 0;
    });
    return fils;
  }, [debat, categorieFilter]);

  const toggleReaction = (messageId: string, type: string) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: {
        ...prev[messageId],
        [type]: !prev[messageId]?.[type],
      },
    }));
  };

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

  const isParameterProposal = proposal.type === "modification_parametre" && !!proposal.parameterProposal;
  const hasVotes = proposal.votesFor != null && proposal.votesAgainst != null && !!proposal.totalVotes;

  // Find parent message content for reply references
  const findMessage = (messageId: string): Message | undefined => {
    if (!debat) return undefined;
    for (const fil of debat.fils) {
      const found = fil.messages.find((m) => m.id === messageId);
      if (found) return found;
    }
    return undefined;
  };

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
                  Modification de paramètre
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

      {/* Tabs */}
      <SubTabs value={activeTab} onValueChange={setActiveTab}>
        <SubTabsList className="mb-6">
          <SubTabsTrigger value="detail">Détail</SubTabsTrigger>
          <SubTabsTrigger value="debats">
            Débats {debat ? `(${debat.statistiques.totalMessages})` : ""}
          </SubTabsTrigger>
          <SubTabsTrigger value="historique">Historique</SubTabsTrigger>
        </SubTabsList>

        {/* ==================== TAB: DÉTAIL ==================== */}
        <TabsContent value="detail">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {/* Parameter Modification Box */}
              {isParameterProposal && proposal.parameterProposal && (
                <Card style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}>
                  <CardHeader>
                    <CardTitle>
                      <Settings className="h-4 w-4 inline mr-2 text-orange-500" />
                      Modification proposée
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-[var(--text-muted)]">
                        Paramètre : <span className="font-semibold text-[var(--text-primary)]">{proposal.parameterProposal.parameterName}</span>
                      </div>
                      <div className="p-4 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <div className="flex items-center justify-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-[var(--text-muted)] mb-1">Valeur actuelle</div>
                            <div className="text-2xl font-mono font-bold text-red-400 line-through">
                              {String(proposal.parameterProposal.currentValue)}
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                          <div className="text-center">
                            <div className="text-xs text-[var(--text-muted)] mb-1">Valeur proposée</div>
                            <div className="text-2xl font-mono font-bold text-green-400">
                              {String(proposal.parameterProposal.proposedValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {proposal.parameterProposal.allowedRange && (
                        <div className="text-xs text-[var(--text-muted)]">
                          Plage autorisée : {proposal.parameterProposal.allowedRange.min} — {proposal.parameterProposal.allowedRange.max}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <div>
                          <div className="text-xs text-[var(--text-muted)]">Quorum requis</div>
                          <div className="font-semibold text-[var(--text-primary)]">{proposal.parameterProposal.requiredQuorum}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-[var(--text-muted)]">Seuil d&apos;adoption</div>
                          <div className="font-semibold text-[var(--text-primary)]">{proposal.parameterProposal.requiredThreshold}%</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Justification</div>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic border-l-2 border-orange-500/40 pl-3">
                          {proposal.parameterProposal.justification}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Link href={`/codex/parametres-systeme/${proposal.parameterProposal.parameterId}`} className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                          <ExternalLink className="h-3 w-3" />
                          Voir dans le Codex
                        </Link>
                        {proposal.parameterProposal.technicalDocLink && (
                          <Link href={proposal.parameterProposal.technicalDocLink} className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                            <Code className="h-3 w-3" />
                            Documentation technique
                          </Link>
                        )}
                        <Link href="/codex/registre" className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
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
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <SidebarVote proposal={proposal} hasVotes={hasVotes} isParameterProposal={isParameterProposal} toast={toast} />
            </div>
          </div>
        </TabsContent>

        {/* ==================== TAB: DÉBATS ==================== */}
        <TabsContent value="debats">
          {debat ? (
            <div className="space-y-6">
              {/* Header stats */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-[var(--text-muted)]">
                  {debat.statistiques.totalMessages} messages · {debat.statistiques.participants} participants · Dernier message {debat.statistiques.dernierMessage}
                </div>
                <PermissionGate permission="comment_proposal">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4" />
                    Nouveau fil
                  </Button>
                </PermissionGate>
              </div>

              {/* Synthèse des débats */}
              <Card className="border-violet-500/20" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(236,72,153,0.03) 100%)" }}>
                <CardHeader>
                  <CardTitle>
                    <Sparkles className="h-4 w-4 inline mr-2 text-violet-500" />
                    Synthèse des débats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-green-500">
                        <ThumbsUp className="h-4 w-4" />
                        Arguments pour
                      </div>
                      <ul className="space-y-2">
                        {debat.synthese.argumentsPour.map((arg, i) => (
                          <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                            <span className="text-green-500 shrink-0">•</span>
                            {arg}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-red-500">
                        <ThumbsDown className="h-4 w-4" />
                        Arguments contre
                      </div>
                      <ul className="space-y-2">
                        {debat.synthese.argumentsContre.map((arg, i) => (
                          <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                            <span className="text-red-500 shrink-0">•</span>
                            {arg}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {debat.synthese.questionsEnSuspens.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-500">
                        <Lightbulb className="h-4 w-4" />
                        Questions en suspens
                      </div>
                      <ul className="space-y-1">
                        {debat.synthese.questionsEnSuspens.map((q, i) => (
                          <li key={i} className="text-sm text-[var(--text-secondary)] flex gap-2">
                            <span className="text-blue-500 shrink-0">•</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-[var(--text-muted)] mt-4 italic">
                    Cette synthèse est générée automatiquement et mise à jour après chaque nouveau message.
                  </p>
                </CardContent>
              </Card>

              {/* Catégorie filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "all", label: "Tous", emoji: "" },
                  { key: "argument_pour", label: "Pour", emoji: "🟢" },
                  { key: "argument_contre", label: "Contre", emoji: "🔴" },
                  { key: "question", label: "Questions", emoji: "❓" },
                  { key: "proposition_amendement", label: "Amendements", emoji: "✏️" },
                  { key: "technique", label: "Technique", emoji: "🔧" },
                  { key: "general", label: "Général", emoji: "💬" },
                ].map(({ key, label, emoji }) => {
                  const count = key === "all" ? debat.fils.length : debat.fils.filter((f) => f.categorie === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setCategorieFilter(key)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        categorieFilter === key
                          ? "bg-violet-500/15 text-violet-500"
                          : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {emoji && <span>{emoji}</span>}
                      {label}
                      <span className="text-[10px] opacity-70">{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Fils de discussion */}
              <div className="space-y-3">
                {filteredFils.map((fil) => {
                  const config = CATEGORIE_CONFIG[fil.categorie] || CATEGORIE_CONFIG.general;
                  const isExpanded = expandedFil === fil.id;
                  const participantsInFil = new Set(fil.messages.map((m) => m.auteur.id)).size;

                  return (
                    <Card
                      key={fil.id}
                      className={`transition-all ${fil.epingle ? "border-violet-500/30" : ""}`}
                      style={fil.epingle ? { backgroundColor: "rgba(139,92,246,0.03)" } : undefined}
                    >
                      {/* Fil header — clickable */}
                      <button
                        type="button"
                        onClick={() => setExpandedFil(isExpanded ? null : fil.id)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-start gap-3">
                          <Badge variant={config.badgeVariant} className="text-xs shrink-0 mt-0.5">
                            {config.label}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                                {fil.sujet}
                              </h4>
                              {fil.epingle && <Pin className="h-3 w-3 text-violet-500 shrink-0" />}
                              {fil.resolu && (
                                <Badge variant="green" className="text-[10px] shrink-0">
                                  Résolu ✓
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mb-1">
                              par @{fil.auteur.username} · {fil.dateCreation}
                            </p>
                            {!isExpanded && fil.messages[0] && (
                              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                {fil.messages[0].contenu}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-muted)]">
                              <span>{fil.messages.length} messages</span>
                              <span>{participantsInFil} participants</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {/* Expanded: all messages */}
                      {isExpanded && (
                        <div className="border-t border-[var(--border)] px-4 py-3 space-y-4">
                          {fil.messages.map((msg) => {
                            const parentMsg = msg.reponseA ? findMessage(msg.reponseA) : null;
                            const myReactions = reactions[msg.id] || {};

                            return (
                              <div key={msg.id} className="flex gap-3">
                                <Avatar size="sm" className="shrink-0 mt-0.5">
                                  <AvatarFallback>{getInitials(msg.auteur.prenom, msg.auteur.nom)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-[var(--text-primary)]">
                                      {msg.auteur.prenom} {msg.auteur.nom}
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">@{msg.auteur.username}</span>
                                    <span className="text-xs text-[var(--text-muted)]">{msg.date}</span>
                                    {msg.modifie && <span className="text-xs text-[var(--text-muted)] italic">(modifié)</span>}
                                  </div>

                                  {/* Reply reference */}
                                  {parentMsg && (
                                    <div className="mb-2 rounded-md bg-[var(--bg-elevated)] p-2 border-l-2 border-[var(--border)]">
                                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                                        <span className="font-medium">@{parentMsg.auteur.username}</span> : {parentMsg.contenu}
                                      </p>
                                    </div>
                                  )}

                                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
                                    {msg.contenu}
                                  </p>

                                  {/* Reactions + reply button */}
                                  <div className="flex items-center gap-3 mt-2">
                                    <button
                                      onClick={() => toggleReaction(msg.id, "approuve")}
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                                        myReactions.approuve ? "bg-green-500/15 text-green-500" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-green-500"
                                      }`}
                                    >
                                      👍 {msg.reactions.approuve + (myReactions.approuve ? 1 : 0)}
                                    </button>
                                    <button
                                      onClick={() => toggleReaction(msg.id, "pertinent")}
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                                        myReactions.pertinent ? "bg-yellow-500/15 text-yellow-500" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-yellow-500"
                                      }`}
                                    >
                                      💡 {msg.reactions.pertinent + (myReactions.pertinent ? 1 : 0)}
                                    </button>
                                    <button
                                      onClick={() => toggleReaction(msg.id, "desaccord")}
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
                                        myReactions.desaccord ? "bg-red-500/15 text-red-500" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-red-500"
                                      }`}
                                    >
                                      👎 {msg.reactions.desaccord + (myReactions.desaccord ? 1 : 0)}
                                    </button>
                                    <PermissionGate permission="comment_proposal">
                                      <button
                                        onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                                        className="text-xs text-violet-500 hover:text-violet-400 transition-colors"
                                      >
                                        Répondre
                                      </button>
                                    </PermissionGate>
                                  </div>

                                  {/* Inline reply field */}
                                  {replyingTo === msg.id && (
                                    <div className="mt-2 flex gap-2">
                                      <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Votre réponse..."
                                        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none resize-none"
                                        rows={2}
                                      />
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        className="shrink-0 self-end"
                                        onClick={() => {
                                          if (replyText.trim()) {
                                            toast.success("Message envoyé");
                                            setReplyText("");
                                            setReplyingTo(null);
                                          }
                                        }}
                                      >
                                        <Send className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* New message at bottom */}
                          <PermissionGate permission="comment_proposal">
                            <div className="pt-3 border-t border-[var(--border)]">
                              <div className="text-xs text-[var(--text-muted)] mb-2">Ajouter une réponse</div>
                              <div className="flex gap-2">
                                <textarea
                                  placeholder="Votre réponse..."
                                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none resize-none"
                                  rows={2}
                                />
                                <Button variant="primary" size="sm" className="shrink-0 self-end" onClick={() => toast.success("Message envoyé")}>
                                  <Send className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </PermissionGate>
                        </div>
                      )}
                    </Card>
                  );
                })}

                {filteredFils.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
                    Aucun fil de discussion pour cette catégorie.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[var(--text-muted)]">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Aucun débat pour cette proposition.</p>
                <PermissionGate permission="comment_proposal">
                  <Button variant="primary" size="sm" className="mt-4">
                    <Plus className="h-4 w-4" />
                    Ouvrir le premier fil
                  </Button>
                </PermissionGate>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ==================== TAB: HISTORIQUE ==================== */}
        <TabsContent value="historique">
          {historique ? (
            <div className="space-y-6">
              {/* Lifecycle stepper */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    {LIFECYCLE_STEPS.map((step, i) => {
                      const stepIndex = LIFECYCLE_STEPS.indexOf(historique.etapeActuelle);
                      const isCompleted = i < stepIndex;
                      const isCurrent = i === stepIndex;
                      const isFuture = i > stepIndex;
                      const evtForStep = historique.evenements.find((e) =>
                        step === "creation" ? e.type === "creation" :
                        step === "discussion" ? e.type === "passage_discussion" :
                        step === "vote" ? e.type === "passage_vote" :
                        step === "resultat" ? e.type === "resultat" || e.type === "vote_cloture" :
                        e.type === "application"
                      );

                      return (
                        <div key={step} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCompleted
                                  ? "bg-violet-500 text-white"
                                  : isCurrent
                                  ? "bg-violet-500 text-white animate-pulse"
                                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]"
                              }`}
                            >
                              {isCompleted ? "✓" : i + 1}
                            </div>
                            <span className={`text-xs mt-1.5 ${isCurrent ? "text-violet-500 font-semibold" : isFuture ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}`}>
                              {LIFECYCLE_LABELS[step]}
                            </span>
                            {evtForStep && !isFuture && (
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {evtForStep.date.split(",")[0]}
                              </span>
                            )}
                            {isCurrent && (
                              <Badge variant="violet" className="text-[10px] mt-1">
                                En cours
                              </Badge>
                            )}
                          </div>
                          {i < LIFECYCLE_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-violet-500" : "bg-[var(--border)]"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div className="relative space-y-0 pl-6">
                {/* Vertical line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-[var(--border)]" />

                {historique.evenements.map((evt, i) => {
                  const evtConfig = EVT_CONFIG[evt.type] || EVT_CONFIG.creation;
                  const EvtIcon = evtConfig.icon;
                  const isResultAdopte = evt.details?.adopte === true;
                  const isResultRejete = evt.details?.adopte === false;
                  const dotColor = isResultRejete ? "bg-red-500" : evtConfig.color;

                  return (
                    <div key={evt.id} className="relative flex gap-4 pb-6">
                      {/* Timeline dot */}
                      <div className={`absolute left-[-13px] top-1 h-5 w-5 rounded-full ${dotColor} flex items-center justify-center z-10`}>
                        <EvtIcon className="h-3 w-3 text-white" />
                      </div>

                      {/* Content */}
                      <Card className="flex-1 ml-4">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-[var(--text-muted)] mb-1">{evt.date}</div>
                              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                                {evt.titre}
                              </h4>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {evt.description}
                              </p>
                              {evt.acteur && (
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                  par @{evt.acteur.username}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Modification diff */}
                          {evt.details?.avant && evt.details?.apres && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-[var(--border)]">
                              <div className="p-3 bg-red-500/5 border-b border-[var(--border)]">
                                <div className="text-xs text-red-400 mb-1 font-medium">Avant</div>
                                <p className="text-sm text-red-400/80 line-through">{evt.details.avant}</p>
                              </div>
                              <div className="p-3 bg-green-500/5">
                                <div className="text-xs text-green-400 mb-1 font-medium">Après</div>
                                <p className="text-sm text-green-400/80">{evt.details.apres}</p>
                              </div>
                            </div>
                          )}

                          {/* Vote result */}
                          {evt.details?.pour != null && evt.details?.contre != null && (
                            <div className="mt-3 space-y-3">
                              {/* Tricolor bar */}
                              <div className="h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: "var(--bg-elevated)" }}>
                                {(() => {
                                  const total = (evt.details.pour || 0) + (evt.details.contre || 0) + (evt.details.abstention || 0);
                                  const pctPour = total > 0 ? (evt.details.pour! / total) * 100 : 0;
                                  const pctContre = total > 0 ? (evt.details.contre! / total) * 100 : 0;
                                  return (
                                    <>
                                      <div className="bg-green-500 h-full" style={{ width: `${pctPour}%` }} />
                                      <div className="bg-red-500 h-full" style={{ width: `${pctContre}%` }} />
                                    </>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-green-500 font-medium">{formatNumber(evt.details.pour!)} pour ({((evt.details.pour! / ((evt.details.pour || 0) + (evt.details.contre || 0) + (evt.details.abstention || 0))) * 100).toFixed(1)}%)</span>
                                <span className="text-red-500 font-medium">{formatNumber(evt.details.contre!)} contre</span>
                                {evt.details.abstention != null && (
                                  <span className="text-[var(--text-muted)]">{formatNumber(evt.details.abstention)} abstentions</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {isResultAdopte && (
                                  <Badge variant="green" className="text-xs">Adoptée ✓</Badge>
                                )}
                                {isResultRejete && (
                                  <Badge variant="red" className="text-xs">Rejetée ✗</Badge>
                                )}
                                {evt.details.participation != null && (
                                  <span className="text-xs text-[var(--text-muted)]">
                                    Participation : {evt.details.participation}%
                                    {evt.details.quorumRequis != null && (
                                      <> (quorum requis : {evt.details.quorumRequis}% {evt.details.participation >= evt.details.quorumRequis ? "✓" : "✗"})</>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Seuil de soutiens */}
                          {evt.details?.soutiens != null && (
                            <div className="mt-2 text-xs text-[var(--text-secondary)]">
                              {formatNumber(evt.details.soutiens)} cosignatures recueillies
                              {evt.details.seuilAtteint && (
                                <Badge variant="green" className="text-[10px] ml-2">Seuil atteint ✓</Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-[var(--text-muted)] pt-2">
                {historique.etapeActuelle === "vote" && (
                  <span>Prochaine étape : Clôture du vote et proclamation des résultats.</span>
                )}
                {historique.etapeActuelle === "application" && (
                  <span>Proposition terminée et appliquée.</span>
                )}
                {historique.etapeActuelle === "resultat" && (
                  <span>Résultat proclamé. En attente d&apos;application.</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[var(--text-muted)]">
              <div className="text-center">
                <History className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Aucun historique disponible pour cette proposition.</p>
              </div>
            </div>
          )}
        </TabsContent>
      </SubTabs>
    </DashboardLayout>
  );
}

// --- Sidebar component extracted for reuse across tabs ---
function SidebarVote({ proposal, hasVotes, isParameterProposal, toast }: {
  proposal: ReturnType<typeof getProposalById> & {};
  hasVotes: boolean;
  isParameterProposal: boolean;
  toast: { success: (msg: string) => void };
}) {
  return (
    <>
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
                <VoteButtons onVote={(vote) => toast.success(`Vote "${vote}" enregistré`)} />
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
              <div className="font-semibold text-[var(--text-primary)]">{proposal.supporters}</div>
            </div>
            {hasVotes && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <Vote className="h-4 w-4" />
                  Total votes
                </div>
                <div className="font-semibold text-[var(--text-primary)]">{formatNumber(proposal.totalVotes!)}</div>
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

      {isParameterProposal && proposal.parameterProposal && (
        <Card style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
          <CardHeader>
            <CardTitle>
              <Settings className="h-4 w-4 inline mr-1" />
              Paramètre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-[var(--text-muted)] text-xs">Nom</div>
                <div className="font-semibold text-[var(--text-primary)]">{proposal.parameterProposal.parameterName}</div>
              </div>
              <div>
                <div className="text-[var(--text-muted)] text-xs">Identifiant</div>
                <div className="font-mono text-xs text-[var(--text-primary)]">{proposal.parameterProposal.parameterId}</div>
              </div>
              <Link href={`/codex/parametres-systeme/${proposal.parameterProposal.parameterId}`} className="block">
                <Button variant="secondary" size="sm" className="w-full mt-2">
                  <ExternalLink className="h-3 w-3" />
                  Voir dans le Codex
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
