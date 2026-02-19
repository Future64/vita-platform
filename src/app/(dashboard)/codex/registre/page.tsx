"use client";

import { useState, useMemo } from "react";
import {
  BookOpen,
  PenTool,
  Settings,
  Code,
  History,
  Search,
  Shield,
  FileText,
  Cpu,
  ChevronDown,
  ChevronRight,
  Vote,
  Calendar,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import { REGISTER_ENTRIES } from "@/lib/mockCodex";
import type { RegisterEntry } from "@/types/codex";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Settings, label: "Parametres en vigueur", href: "/codex/parametres-systeme" },
  { icon: Code, label: "Documentation", href: "/codex/technique/emission-quotidienne" },
  { icon: History, label: "Registre", href: "/codex/registre" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

const TYPE_CONFIG: Record<
  RegisterEntry["type"],
  { label: string; color: string; icon: React.ReactNode }
> = {
  constitutionnel: {
    label: "Constitutionnel",
    color: "#ef4444",
    icon: <Shield className="h-3.5 w-3.5" />,
  },
  legislatif: {
    label: "Legislatif",
    color: "#f59e0b",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  parametre: {
    label: "Parametre",
    color: "#8b5cf6",
    icon: <Settings className="h-3.5 w-3.5" />,
  },
  technique: {
    label: "Technique",
    color: "#06b6d4",
    icon: <Cpu className="h-3.5 w-3.5" />,
  },
};

const STATUS_CONFIG: Record<
  RegisterEntry["status"],
  { label: string; variant: "green" | "orange" | "red" | "violet" | "cyan" }
> = {
  proposed: { label: "Propose", variant: "orange" },
  adopted: { label: "Adopte", variant: "green" },
  rejected: { label: "Rejete", variant: "red" },
  applied: { label: "Applique", variant: "violet" },
  appeal: { label: "Conteste", variant: "cyan" },
};

type TypeFilter = RegisterEntry["type"] | "all";

const FILTER_OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "constitutionnel", label: "Constitutionnel" },
  { value: "legislatif", label: "Legislatif" },
  { value: "parametre", label: "Parametre" },
  { value: "technique", label: "Technique" },
];

export default function RegistrePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredEntries = useMemo(() => {
    let entries = [...REGISTER_ENTRIES].sort(
      (a, b) => b.date.localeCompare(a.date)
    );

    if (typeFilter !== "all") {
      entries = entries.filter((e) => e.type === typeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.author.toLowerCase().includes(q)
      );
    }

    return entries;
  }, [search, typeFilter]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of REGISTER_ENTRIES) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1
          className="text-xl md:text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Registre des Modifications
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
          {REGISTER_ENTRIES.length} entrees &middot; Journal chronologique de toutes les modifications du systeme VITA
        </p>
      </div>

      {/* Stats */}
      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        <StatCard
          variant="pink"
          label="Constitutionnel"
          value={typeCounts["constitutionnel"] || 0}
        />
        <StatCard
          variant="orange"
          label="Legislatif"
          value={typeCounts["legislatif"] || 0}
        />
        <StatCard
          variant="violet"
          label="Parametre"
          value={typeCounts["parametre"] || 0}
        />
        <StatCard
          variant="cyan"
          label="Technique"
          value={typeCounts["technique"] || 0}
        />
      </div>

      {/* Search + Filters */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3.5 md:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher dans le registre..."
                className="pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    typeFilter === opt.value
                      ? "bg-violet-500/15 text-violet-500"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const typeConf = TYPE_CONFIG[entry.type];
          const statusConf = STATUS_CONFIG[entry.status];
          const isExpanded = expandedIds.has(entry.id);

          return (
            <Card
              key={entry.id}
              className="cursor-pointer hover:border-[var(--border-light)] transition-all"
              onClick={() => toggleExpand(entry.id)}
            >
              <div className="p-3.5 md:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: `${typeConf.color}15`,
                          color: typeConf.color,
                        }}
                      >
                        {typeConf.icon}
                        {typeConf.label}
                      </Badge>
                      <Badge variant={statusConf.variant} className="text-xs">
                        {statusConf.label}
                      </Badge>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(entry.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                      {entry.title}
                    </h3>

                    {/* Mini vote bar */}
                    {entry.voteResult && (
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="h-1.5 flex-1 max-w-[200px] rounded-full overflow-hidden flex"
                          style={{ backgroundColor: "var(--bg-elevated)" }}
                        >
                          <div
                            className="h-full bg-green-500"
                            style={{
                              width: `${(entry.voteResult.pour / (entry.voteResult.pour + entry.voteResult.contre)) * 100}%`,
                            }}
                          />
                          <div
                            className="h-full bg-red-500"
                            style={{
                              width: `${(entry.voteResult.contre / (entry.voteResult.pour + entry.voteResult.contre)) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          {((entry.voteResult.pour / (entry.voteResult.pour + entry.voteResult.contre)) * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                    <span className="text-xs text-[var(--text-muted)]">
                      {entry.author}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      {entry.description}
                    </p>

                    {/* Vote details */}
                    {entry.voteResult && (
                      <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                          <div>
                            <div className="font-semibold text-green-400">
                              {entry.voteResult.pour.toLocaleString("fr-FR")}
                            </div>
                            <div className="text-[var(--text-muted)]">Pour</div>
                          </div>
                          <div>
                            <div className="font-semibold text-red-400">
                              {entry.voteResult.contre.toLocaleString("fr-FR")}
                            </div>
                            <div className="text-[var(--text-muted)]">Contre</div>
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--text-primary)]">
                              {entry.voteResult.participation}%
                            </div>
                            <div className="text-[var(--text-muted)]">Participation</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Diff */}
                    {entry.diff && (
                      <div className="p-3 rounded-lg font-mono text-xs" style={{ backgroundColor: "var(--bg-code)" }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-red-400">- {entry.diff.before}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">+ {entry.diff.after}</span>
                        </div>
                      </div>
                    )}

                    {/* Proposal link */}
                    {entry.proposalId && (
                      <div className="mt-3 text-xs text-[var(--text-muted)]">
                        Proposition :{" "}
                        <Link
                          href={`/agora/${entry.proposalId}`}
                          className="font-mono text-violet-500 hover:text-violet-400 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entry.proposalId}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune entree ne correspond a votre recherche.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
