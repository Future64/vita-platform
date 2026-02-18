"use client";

import { useState, useMemo } from "react";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Plus,
  Shield,
  Heart,
  MessageCircle,
  CheckCircle2,
  X,
  ArrowRight,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import {
  MOCK_DOLEANCES,
  MOCK_PROPOSALS,
  CATEGORIE_COLORS,
  CATEGORIE_LABELS,
  type DoleanceCategorie,
  type Doleance,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: String(MOCK_PROPOSALS.length), badgeVariant: "pink" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: String(MOCK_DOLEANCES.filter(d => d.statut === "ouverte" || d.statut === "seuil_atteint").length), badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
  { icon: Shield, label: "Administration", href: "/admin", permission: "access_admin_panel" },
];

type CategorieFilter = "all" | DoleanceCategorie;
type StatutFilter = "all" | "ouverte" | "seuil_atteint" | "convertie";
type SortOption = "recent" | "soutiens" | "proche_seuil";

function getSupportBarColor(ratio: number): string {
  if (ratio >= 1) return "#10b981";
  if (ratio >= 0.75) return "#8b5cf6";
  if (ratio >= 0.5) return "#a855f7";
  if (ratio >= 0.25) return "#c084fc";
  return "var(--text-muted)";
}

export default function GrievancesPage() {
  const [search, setSearch] = useState("");
  const [categorieFilter, setCategorieFilter] = useState<CategorieFilter>("all");
  const [statutFilter, setStatutFilter] = useState<StatutFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");
  const [supported, setSupported] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const filteredDoleances = useMemo(() => {
    let result = [...MOCK_DOLEANCES];

    if (categorieFilter !== "all") {
      result = result.filter((d) => d.categorie === categorieFilter);
    }
    if (statutFilter !== "all") {
      result = result.filter((d) => d.statut === statutFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) => d.titre.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case "soutiens":
        result.sort((a, b) => b.soutiens - a.soutiens);
        break;
      case "proche_seuil":
        result.sort((a, b) => {
          const rA = a.soutiens / a.seuilProposition;
          const rB = b.soutiens / b.seuilProposition;
          // Closest to threshold first (but not exceeded)
          if (rA >= 1 && rB < 1) return 1;
          if (rB >= 1 && rA < 1) return -1;
          return rB - rA;
        });
        break;
      default:
        break; // keep original order (most recent)
    }

    return result;
  }, [search, categorieFilter, statutFilter, sort]);

  const handleSupport = (id: string) => {
    setSupported((prev) => new Set(prev).add(id));
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doléances citoyennes
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Signalez un problème ou un besoin. Si votre doléance reçoit assez de soutiens, elle deviendra une proposition soumise au vote.
          </p>
        </div>
        <PermissionGate permission="create_proposal">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Signaler un problème
          </Button>
        </PermissionGate>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value as CategorieFilter)}
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORIE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value as StatutFilter)}
        >
          <option value="all">Tous statuts</option>
          <option value="ouverte">Ouvertes</option>
          <option value="seuil_atteint">Seuil atteint</option>
          <option value="convertie">Converties</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
        >
          <option value="recent">Plus récentes</option>
          <option value="soutiens">Plus soutenues</option>
          <option value="proche_seuil">Proches du seuil</option>
        </select>
      </div>

      {/* Doléances list */}
      <div className="space-y-4">
        {filteredDoleances.map((dol) => {
          const ratio = dol.soutiens / dol.seuilProposition;
          const barColor = getSupportBarColor(ratio);
          const isSupported = supported.has(dol.id);
          const effectiveSoutiens = isSupported ? dol.soutiens + 1 : dol.soutiens;
          const isSeuilAtteint = dol.statut === "seuil_atteint" || ratio >= 1;
          const isConvertie = dol.statut === "convertie";
          const isFermee = dol.statut === "fermee";

          return (
            <Card
              key={dol.id}
              className="p-5 transition-all"
              style={
                isSeuilAtteint && !isConvertie
                  ? { borderColor: "rgba(245, 158, 11, 0.4)" }
                  : isFermee
                  ? { opacity: 0.6 }
                  : undefined
              }
            >
              {/* Top row: badge + status */}
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={CATEGORIE_COLORS[dol.categorie]}>
                  {CATEGORIE_LABELS[dol.categorie]}
                </Badge>
                {isSeuilAtteint && !isConvertie && (
                  <Badge variant="orange">
                    <CheckCircle2 className="h-3 w-3" />
                    Seuil atteint — Prête pour proposition
                  </Badge>
                )}
                {isConvertie && (
                  <Link href={`/agora/${dol.propositionId}`}>
                    <Badge variant="green" className="cursor-pointer hover:opacity-80">
                      <ArrowRight className="h-3 w-3" />
                      Convertie en proposition
                    </Badge>
                  </Link>
                )}
                {isFermee && (
                  <Badge variant="red">
                    <X className="h-3 w-3" />
                    Fermée
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h3 className="mb-1 text-base font-semibold text-[var(--text-primary)]">
                {dol.titre}
              </h3>

              {/* Description */}
              <p className="mb-3 text-sm text-[var(--text-secondary)] line-clamp-2">
                {dol.description}
              </p>

              {/* Support bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-muted)]">
                    {effectiveSoutiens} / {dol.seuilProposition} soutiens
                  </span>
                  <span className="text-xs font-mono" style={{ color: barColor }}>
                    {Math.min(Math.round(ratio * 100), 100)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ratio >= 0.75 && ratio < 1 ? "animate-pulse" : ""}`}
                    style={{
                      width: `${Math.min(ratio * 100, 100)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Author */}
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>{dol.auteur.initiales}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[var(--text-primary)]">
                    @{dol.auteur.username}
                  </span>
                </div>

                {/* Date */}
                <span className="text-xs text-[var(--text-muted)]">
                  {dol.dateCreation}
                </span>

                {/* Comments */}
                <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                  <MessageCircle className="h-3 w-3" />
                  {dol.commentaires}
                </span>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                  {/* Support button */}
                  {!isFermee && !isConvertie && (
                    <PermissionGate permission="vote_proposal">
                      <Button
                        variant={isSupported ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleSupport(dol.id)}
                        disabled={isSupported}
                        className={isSupported ? "text-violet-500" : ""}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isSupported ? "fill-violet-500" : ""}`} />
                        {isSupported ? "Soutenu" : "Soutenir"}
                      </Button>
                    </PermissionGate>
                  )}

                  {/* Convert button for threshold-reached */}
                  {isSeuilAtteint && !isConvertie && (
                    <PermissionGate permission="create_proposal">
                      <Button variant="primary" size="sm">
                        Convertir en proposition
                      </Button>
                    </PermissionGate>
                  )}
                </div>
              </div>
            </Card>
          );
        })}

        {filteredDoleances.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune doléance ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* Modal for new doléance */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-lg rounded-xl border p-6 shadow-xl mx-4"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Signaler un problème
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  className="w-full h-10 rounded-lg border px-4 text-sm focus:border-violet-500 focus:outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                  placeholder="Décrivez le problème en quelques mots"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Description * <span className="text-[var(--text-muted)] font-normal">(min. 50 caractères)</span>
                </label>
                <textarea
                  className="w-full rounded-lg border px-4 py-3 text-sm focus:border-violet-500 focus:outline-none resize-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                  rows={4}
                  placeholder="Expliquez le problème en détail : contexte, impact, suggestion..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Catégorie
                </label>
                <select
                  className="w-full h-10 rounded-lg border px-4 text-sm focus:border-violet-500 focus:outline-none"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                >
                  {Object.entries(CATEGORIE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <Button className="w-full">
                Soumettre la doléance
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
