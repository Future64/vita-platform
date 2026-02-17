"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  Settings,
  Code,
  History,
  Lock,
  Shield,
  Vote,
  Cpu,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SYSTEM_PARAMETERS, CATEGORY_METADATA } from "@/lib/mockParameters";
import { getProposalsForParameter } from "@/lib/mockProposals";
import type { ParameterCategory } from "@/types/parameters";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Settings, label: "Parametres", href: "/codex/parametres-systeme" },
  { icon: Code, label: "Documentation", href: "/codex/technique/emission-quotidienne" },
  { icon: History, label: "Registre", href: "/codex/registre" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

const CATEGORY_ICONS: Record<ParameterCategory, React.ReactNode> = {
  immuable: <Shield className="h-4 w-4" />,
  gouvernance: <Vote className="h-4 w-4" />,
  technique: <Cpu className="h-4 w-4" />,
};

export default function ParameterDetailPage() {
  const params = useParams();
  const paramId = params.id as string;

  const parameter = useMemo(
    () => SYSTEM_PARAMETERS.find((p) => p.id === paramId),
    [paramId]
  );

  if (!parameter) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">Parametre introuvable</div>
          <Link href="/codex/parametres-systeme">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour aux parametres
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const meta = CATEGORY_METADATA[parameter.category];
  const isImmutable = parameter.category === "immuable";
  const sortedHistory = [...parameter.history].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const activeProposals = useMemo(
    () => getProposalsForParameter(parameter.id),
    [parameter.id]
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-6">
        <Link href="/codex/parametres-systeme">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux parametres
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {CATEGORY_ICONS[parameter.category]}
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `${meta.color}15`,
                  color: meta.color,
                }}
              >
                {meta.label}
              </Badge>
              {isImmutable && (
                <Badge className="text-xs bg-red-500/15 text-red-500">
                  <Lock className="h-3 w-3" />
                  Non modifiable
                </Badge>
              )}
            </div>
            <h1
              className="text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {parameter.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-2xl">
              {parameter.description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Current Value */}
          <Card>
            <CardHeader>
              <CardTitle>Valeur actuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <span
                  className="text-4xl font-bold font-mono"
                  style={{ color: meta.color }}
                >
                  {String(parameter.currentValue)}
                </span>
                {parameter.unit && (
                  <span className="text-lg text-[var(--text-muted)]">
                    {parameter.unit}
                  </span>
                )}
              </div>
              {parameter.lastModified && (
                <p className="text-xs text-[var(--text-muted)] mt-3 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Derniere modification : {new Date(parameter.lastModified).toLocaleDateString("fr-FR")}
                  {parameter.lastModifiedByVote && (
                    <span>
                      {" "}via vote{" "}
                      <span className="font-mono text-violet-500">
                        #{parameter.lastModifiedByVote}
                      </span>
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Immutable explanation */}
          {isImmutable && (
            <Card style={{ borderColor: "rgba(239, 68, 68, 0.2)" }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" />
                  <div>
                    <p
                      className="text-sm font-semibold text-[var(--text-primary)] mb-2"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      Parametre constitutionnel immuable
                    </p>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Ce parametre est inscrit dans la Constitution VITA (Titre I) et ne peut etre modifie
                      par aucun vote, amendement ou decision administrative. Il fait partie des principes
                      fondateurs qui garantissent l&apos;egalite et l&apos;equite du systeme. Toute tentative de
                      modification serait rejetee automatiquement par le systeme.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                Historique chronologique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sortedHistory.map((change, idx) => {
                  const isInitial = change.status === "initial";
                  const isLatest = idx === 0;

                  return (
                    <div key={change.id} className="relative pl-6">
                      {/* Timeline line */}
                      {idx < sortedHistory.length - 1 && (
                        <div
                          className="absolute left-[9px] top-6 bottom-0 w-px"
                          style={{ backgroundColor: `${meta.color}30` }}
                        />
                      )}
                      {/* Timeline dot */}
                      <div
                        className="absolute left-0 top-1.5 h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isLatest ? meta.color : "var(--border)",
                          backgroundColor: isLatest ? meta.color : "transparent",
                        }}
                      >
                        {isLatest && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="ml-2">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(change.date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          {isLatest && (
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: `${meta.color}15`,
                                color: meta.color,
                              }}
                            >
                              Actuel
                            </Badge>
                          )}
                          {isInitial && (
                            <Badge variant="outline" className="text-xs">
                              Valeur initiale
                            </Badge>
                          )}
                          {change.status === "adopted" && (
                            <Badge variant="green" className="text-xs">
                              Adopte
                            </Badge>
                          )}
                          {change.status === "rejected" && (
                            <Badge variant="red" className="text-xs">
                              Rejete
                            </Badge>
                          )}
                        </div>

                        {/* Diff */}
                        {!isInitial && (
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <span className="font-mono text-red-400 line-through">
                              {String(change.oldValue)}
                              {parameter.unit && ` ${parameter.unit}`}
                            </span>
                            <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
                            <span className="font-mono text-green-400 font-semibold">
                              {String(change.newValue)}
                              {parameter.unit && ` ${parameter.unit}`}
                            </span>
                          </div>
                        )}

                        {isInitial && (
                          <div className="mb-2 text-sm">
                            <span className="font-mono font-semibold" style={{ color: meta.color }}>
                              {String(change.newValue)}
                              {parameter.unit && ` ${parameter.unit}`}
                            </span>
                          </div>
                        )}

                        {/* Vote result bar */}
                        {change.voteResult && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-green-400">
                                Pour : {change.voteResult.pour}
                              </span>
                              <span className="text-red-400">
                                Contre : {change.voteResult.contre}
                              </span>
                            </div>
                            <div
                              className="h-2 rounded-full overflow-hidden flex"
                              style={{ backgroundColor: "var(--bg-elevated)" }}
                            >
                              <div
                                className="h-full bg-green-500 rounded-l-full"
                                style={{
                                  width: `${(change.voteResult.pour / (change.voteResult.pour + change.voteResult.contre)) * 100}%`,
                                }}
                              />
                              <div
                                className="h-full bg-red-500 rounded-r-full"
                                style={{
                                  width: `${(change.voteResult.contre / (change.voteResult.pour + change.voteResult.contre)) * 100}%`,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs mt-1 text-[var(--text-muted)]">
                              <span>
                                {((change.voteResult.pour / (change.voteResult.pour + change.voteResult.contre)) * 100).toFixed(1)}%
                              </span>
                              <span>
                                Participation : {change.voteResult.participation}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Proposal link */}
                        {change.proposalId && (
                          <Link
                            href={`/agora/${change.proposalId}`}
                            className="inline-flex items-center gap-1 text-xs text-violet-500 hover:text-violet-400 transition-colors mb-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Voir la proposition {change.proposalId}
                          </Link>
                        )}

                        {/* Justification */}
                        <div
                          className="text-xs text-[var(--text-secondary)] italic border-l-2 pl-3 mt-2"
                          style={{ borderColor: `${meta.color}40` }}
                        >
                          {change.justification}
                        </div>

                        {/* Author */}
                        <div className="text-xs text-[var(--text-muted)] mt-2">
                          Propose par : {change.proposedBy}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Categorie</div>
                  <Badge
                    style={{
                      backgroundColor: `${meta.color}15`,
                      color: meta.color,
                    }}
                  >
                    {CATEGORY_ICONS[parameter.category]}
                    {meta.label}
                  </Badge>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Identifiant</div>
                  <div className="font-mono text-xs text-[var(--text-primary)]">
                    {parameter.id}
                  </div>
                </div>
                {parameter.allowedRange && (
                  <div>
                    <div className="text-[var(--text-muted)] mb-1">Plage autorisee</div>
                    <div className="font-mono text-sm text-[var(--text-primary)]">
                      {parameter.allowedRange.min} — {parameter.allowedRange.max}
                      {parameter.unit && ` ${parameter.unit}`}
                    </div>
                  </div>
                )}
                {parameter.requiredQuorum != null && (
                  <div>
                    <div className="text-[var(--text-muted)] mb-1">Quorum requis</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {parameter.requiredQuorum}%
                    </div>
                  </div>
                )}
                {parameter.requiredThreshold != null && (
                  <div>
                    <div className="text-[var(--text-muted)] mb-1">Seuil d&apos;adoption</div>
                    <div className="font-semibold text-[var(--text-primary)]">
                      {parameter.requiredThreshold}%
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Modifications</div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {parameter.history.length - 1}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical doc link */}
          {parameter.technicalDocSection && (
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/codex/technique/${parameter.technicalDocSection}`}
                  className="flex items-center gap-2 text-sm text-violet-500 hover:text-violet-400 transition-colors"
                >
                  <Code className="h-4 w-4" />
                  Voir la documentation technique
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Active proposals */}
          {activeProposals.length > 0 && (
            <Card style={{ borderColor: "rgba(245, 158, 11, 0.2)" }}>
              <CardHeader>
                <CardTitle>
                  <Vote className="h-4 w-4 inline mr-1" />
                  Propositions en cours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeProposals.map((prop) => (
                    <Link key={prop.id} href={`/agora/${prop.id}`}>
                      <div className="group p-2.5 rounded-lg border border-[var(--border)] hover:border-orange-500/50 transition-all">
                        <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                          {prop.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                          <Badge variant={prop.statusColor} className="text-xs py-0">
                            {prop.statusLabel}
                          </Badge>
                          <span>{prop.date}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Propose modification */}
          {!isImmutable && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href="/agora" className="block">
                  <Button variant="primary" className="w-full">
                    <Vote className="h-4 w-4" />
                    Proposer une modification
                  </Button>
                </Link>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Les modifications de ce parametre requierent un quorum de{" "}
                  {parameter.requiredQuorum}% et un seuil de {parameter.requiredThreshold}%.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
