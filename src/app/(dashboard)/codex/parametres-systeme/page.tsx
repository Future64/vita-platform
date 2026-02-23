"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  PenTool,
  Settings,
  Code,
  History,
  Search,
  Lock,
  ChevronDown,
  ChevronRight,
  Shield,
  Vote,
  Cpu,
  Clock,
  ArrowRight,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import {
  SYSTEM_PARAMETERS,
  PARAMETERS_BY_CATEGORY,
  CATEGORY_METADATA,
} from "@/lib/mockParameters";
import type { SystemParameter, ParameterCategory } from "@/types/parameters";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Settings, label: "Parametres en vigueur", href: "/codex/parametres-systeme" },
  { icon: Code, label: "Documentation", href: "/codex/technique/emission-quotidienne" },
  { icon: History, label: "Registre", href: "/codex/registre" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

const CATEGORY_ICONS: Record<ParameterCategory, React.ReactNode> = {
  immuable: <Shield className="h-4 w-4" />,
  gouvernance: <Vote className="h-4 w-4" />,
  technique: <Cpu className="h-4 w-4" />,
};

const FILTER_OPTIONS: { value: ParameterCategory | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "immuable", label: "Immuables" },
  { value: "gouvernance", label: "Gouvernance" },
  { value: "technique", label: "Techniques" },
];

export default function ParametresSystemePage() {
  const { isMockMode } = useAuth();
  const [parameters, setParameters] = useState<SystemParameter[]>(SYSTEM_PARAMETERS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ParameterCategory | "all">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Fetch parameters from API when available
  useEffect(() => {
    if (isMockMode) return;

    async function loadParameters() {
      try {
        const apiParams = await api.getParametres();
        if (Array.isArray(apiParams) && apiParams.length > 0) {
          // Map API response to SystemParameter type
          const mapped = apiParams.map((p: unknown) => {
            const param = p as Record<string, unknown>;
            const category = String(param.categorie || param.category || "technique") as ParameterCategory;
            return {
              id: String(param.id || param.nom || ""),
              name: String(param.nom || param.name || ""),
              description: String(param.description || ""),
              category,
              currentValue: param.valeur != null ? (typeof param.valeur === "number" || typeof param.valeur === "boolean" ? param.valeur : String(param.valeur)) : (param.currentValue != null ? (typeof param.currentValue === "number" || typeof param.currentValue === "boolean" ? param.currentValue : String(param.currentValue)) : ""),
              unit: param.unite ? String(param.unite) : undefined,
              allowedRange: param.valeur_min != null && param.valeur_max != null
                ? { min: Number(param.valeur_min), max: Number(param.valeur_max) }
                : undefined,
              requiredQuorum: param.quorum_modification != null ? Number(param.quorum_modification) : undefined,
              history: [],
            } as SystemParameter;
          });
          setParameters(mapped);
        }
      } catch {
        // Keep mock data on error
      }
    }

    loadParameters();
  }, [isMockMode]);

  const paramsByCategory = useMemo(() => ({
    immuable: parameters.filter((p) => p.category === "immuable"),
    gouvernance: parameters.filter((p) => p.category === "gouvernance"),
    technique: parameters.filter((p) => p.category === "technique"),
  }), [parameters]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredParams = useMemo(() => {
    let params = parameters;

    if (activeFilter !== "all") {
      params = params.filter((p) => p.category === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      params = params.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    return params;
  }, [parameters, search, activeFilter]);

  const groupedParams = useMemo(() => {
    const groups: Record<ParameterCategory, typeof filteredParams> = {
      immuable: [],
      gouvernance: [],
      technique: [],
    };
    for (const p of filteredParams) {
      groups[p.category].push(p);
    }
    return groups;
  }, [filteredParams]);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1
          className="text-xl md:text-2xl font-bold text-[var(--text-primary)]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Parametres en vigueur
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)] mt-1">
          {parameters.length} parametres &middot; Configuration complete du systeme VITA
        </p>
      </div>

      {/* Stats */}
      <div className="mb-4 md:mb-6 grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-3">
        <StatCard
          variant="pink"
          label="Immuables"
          value={paramsByCategory.immuable.length}
        />
        <StatCard
          variant="violet"
          label="Gouvernance"
          value={paramsByCategory.gouvernance.length}
        />
        <StatCard
          variant="cyan"
          label="Techniques"
          value={paramsByCategory.technique.length}
        />
      </div>

      {/* Search + Filters */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3.5 md:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher un parametre..."
                className="pl-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeFilter === opt.value
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

      {/* Parameter Groups */}
      {(["immuable", "gouvernance", "technique"] as ParameterCategory[]).map((cat) => {
        const params = groupedParams[cat];
        if (params.length === 0) return null;
        const meta = CATEGORY_METADATA[cat];

        return (
          <div key={cat} className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div
                className="h-1 w-6 rounded-full"
                style={{ backgroundColor: meta.color }}
              />
              <span className="flex items-center gap-2">
                {CATEGORY_ICONS[cat]}
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {meta.label}
                </h2>
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                ({params.length})
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-3 ml-8">
              {meta.description}
            </p>

            <div className="space-y-2">
              {params.map((param) => {
                const isExpanded = expandedIds.has(param.id);
                const isImmutable = param.category === "immuable";

                return (
                  <Card
                    key={param.id}
                    style={
                      isImmutable
                        ? {
                            backgroundColor: "rgba(239, 68, 68, 0.03)",
                            borderColor: "rgba(239, 68, 68, 0.15)",
                          }
                        : undefined
                    }
                  >
                    <div
                      className={`p-3.5 md:p-4 ${!isImmutable ? "cursor-pointer" : ""}`}
                      onClick={() => !isImmutable && toggleExpand(param.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {isImmutable && (
                              <Lock className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm text-[var(--text-primary)]">
                              {param.name}
                            </span>
                            <Badge
                              className="text-xs"
                              style={{
                                backgroundColor: `${meta.color}15`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                            {param.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-sm font-mono text-[var(--text-primary)]">
                              {String(param.currentValue)}
                              {param.unit && (
                                <span className="text-xs text-[var(--text-muted)] ml-1 font-sans">
                                  {param.unit}
                                </span>
                              )}
                            </div>
                            {param.lastModified && (
                              <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                {new Date(param.lastModified).toLocaleDateString("fr-FR")}
                              </div>
                            )}
                          </div>
                          {!isImmutable && (
                            isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                            )
                          )}
                        </div>
                      </div>

                      {/* Expanded: history summary */}
                      {isExpanded && !isImmutable && (
                        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                          {param.history.length > 1 ? (
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">
                                Historique ({param.history.length - 1} modification{param.history.length > 2 ? "s" : ""})
                              </div>
                              {param.history
                                .filter((h) => h.status !== "initial")
                                .slice(0, 3)
                                .map((change) => (
                                  <div
                                    key={change.id}
                                    className="flex flex-wrap items-center gap-3 text-xs"
                                  >
                                    <span className="text-[var(--text-muted)] w-20 flex-shrink-0">
                                      {new Date(change.date).toLocaleDateString("fr-FR")}
                                    </span>
                                    <span className="font-mono text-red-400 line-through">
                                      {String(change.oldValue)}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
                                    <span className="font-mono text-green-400">
                                      {String(change.newValue)}
                                    </span>
                                    {change.voteResult && (
                                      <span className="text-[var(--text-muted)]">
                                        ({change.voteResult.pour} pour / {change.voteResult.contre} contre)
                                      </span>
                                    )}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <div className="text-xs text-[var(--text-muted)]">
                              Aucune modification depuis la valeur initiale.
                            </div>
                          )}
                          <Link href={`/codex/parametres-systeme/${param.id}`}>
                            <button className="mt-3 text-xs text-violet-500 hover:text-violet-400 font-medium transition-colors">
                              Voir le detail complet →
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {filteredParams.length === 0 && (
        <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
          Aucun parametre ne correspond a votre recherche.
        </div>
      )}
    </DashboardLayout>
  );
}
