"use client";

import { useState, useMemo } from "react";
import {
  Shield,
  Settings,
  Search,
  Vote,
  Cpu,
  Lock,
  ArrowRight,
  ExternalLink,
  X,
  AlertTriangle,
  Check,
  BookOpen,
  Code,
  History,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { PermissionGate } from "@/components/auth/PermissionGate";
import Link from "next/link";
import {
  SYSTEM_PARAMETERS,
  PARAMETERS_BY_CATEGORY,
  CATEGORY_METADATA,
} from "@/lib/mockParameters";
import { getProposalsForParameter } from "@/lib/mockProposals";
import { useToast } from "@/components/ui/Toast";
import type { SystemParameter, ParameterCategory } from "@/types/parameters";

const sidebarItems: SidebarItem[] = [
  { icon: Shield, label: "Parametres systeme", href: "/admin" },
  { icon: BookOpen, label: "Codex", href: "/codex" },
  { icon: Vote, label: "Agora", href: "/agora" },
  { icon: History, label: "Registre", href: "/codex/registre" },
];

const CATEGORY_ICONS: Record<ParameterCategory, React.ReactNode> = {
  immuable: <Lock className="h-4 w-4" />,
  gouvernance: <Vote className="h-4 w-4" />,
  technique: <Cpu className="h-4 w-4" />,
};

export default function AdminPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedParam, setSelectedParam] = useState<SystemParameter | null>(null);
  const [proposedValue, setProposedValue] = useState("");
  const [justification, setJustification] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const modifiableParams = useMemo(() => {
    let params = SYSTEM_PARAMETERS.filter((p) => p.category !== "immuable");
    if (search.trim()) {
      const q = search.toLowerCase();
      params = params.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return params;
  }, [search]);

  const groupedParams = useMemo(() => {
    const groups: Record<string, typeof modifiableParams> = {
      gouvernance: [],
      technique: [],
    };
    for (const p of modifiableParams) {
      if (groups[p.category]) {
        groups[p.category].push(p);
      }
    }
    return groups;
  }, [modifiableParams]);

  const openModal = (param: SystemParameter) => {
    setSelectedParam(param);
    setProposedValue("");
    setJustification("");
    setSubmitted(false);
  };

  const closeModal = () => {
    setSelectedParam(null);
    setProposedValue("");
    setJustification("");
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!selectedParam || !proposedValue || justification.length < 100) return;
    setSubmitted(true);
    toast.success("Proposition soumise a l'Agora");
  };

  const isValueValid = useMemo(() => {
    if (!selectedParam || !proposedValue) return false;
    const numVal = Number(proposedValue);
    if (isNaN(numVal)) return false;
    if (selectedParam.allowedRange) {
      return numVal >= selectedParam.allowedRange.min && numVal <= selectedParam.allowedRange.max;
    }
    return true;
  }, [selectedParam, proposedValue]);

  const impactText = useMemo(() => {
    if (!selectedParam || !proposedValue || !isValueValid) return null;
    const current = Number(selectedParam.currentValue);
    const proposed = Number(proposedValue);
    if (isNaN(current) || isNaN(proposed)) return null;
    const diff = proposed - current;
    const pct = current !== 0 ? ((diff / current) * 100).toFixed(1) : "∞";
    const direction = diff > 0 ? "augmentation" : "diminution";
    return `${direction === "augmentation" ? "+" : ""}${diff} ${selectedParam.unit || ""} (${diff > 0 ? "+" : ""}${pct}% — ${direction})`;
  }, [selectedParam, proposedValue, isValueValid]);

  return (
    <PermissionGate
      permission="manage_system_params"
      fallback={
        <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Administration">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Lock className="h-8 w-8 text-red-400" />
            <div className="text-lg font-semibold text-[var(--text-primary)]">Acces restreint</div>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
              Cette section est reservee aux administrateurs disposant de la permission
              &laquo;manage_system_params&raquo;.
            </p>
            <Link href="/">
              <Button variant="secondary">Retour au Panorama</Button>
            </Link>
          </div>
        </DashboardLayout>
      }
    >
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Administration">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-orange-500" />
            <Badge className="text-xs bg-orange-500/15 text-orange-500">Admin</Badge>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Parametres Systeme
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Proposer des modifications aux parametres modifiables du systeme VITA
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            variant="violet"
            label="Gouvernance"
            value={PARAMETERS_BY_CATEGORY.gouvernance.length}
          />
          <StatCard
            variant="cyan"
            label="Techniques"
            value={PARAMETERS_BY_CATEGORY.technique.length}
          />
          <StatCard
            variant="pink"
            label="Immuables (non modifiables)"
            value={PARAMETERS_BY_CATEGORY.immuable.length}
          />
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher un parametre modifiable..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parameter Groups */}
        {(["gouvernance", "technique"] as ParameterCategory[]).map((cat) => {
          const params = groupedParams[cat];
          if (!params || params.length === 0) return null;
          const meta = CATEGORY_METADATA[cat];

          return (
            <div key={cat} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
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

              <div className="space-y-2">
                {params.map((param) => {
                  const activeProposals = getProposalsForParameter(param.id);
                  return (
                    <Card key={param.id}>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                              {activeProposals.length > 0 && (
                                <Badge variant="orange" className="text-xs">
                                  {activeProposals.length} proposition{activeProposals.length > 1 ? "s" : ""} en cours
                                </Badge>
                              )}
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
                              {param.allowedRange && (
                                <div className="text-xs text-[var(--text-muted)]">
                                  {param.allowedRange.min} — {param.allowedRange.max}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openModal(param)}
                            >
                              <Settings className="h-3.5 w-3.5" />
                              Modifier
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {modifiableParams.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucun parametre ne correspond a votre recherche.
          </div>
        )}

        {/* Modal */}
        {selectedParam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal content */}
            <div
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-6 mx-4"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {submitted ? (
                /* Success state */
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 rounded-full bg-green-500/15 flex items-center justify-center mb-4">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Proposition creee
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-6">
                    Votre proposition de modification a ete soumise a l&apos;Agora pour vote.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/agora">
                      <Button variant="primary">
                        <Vote className="h-4 w-4" />
                        Voir dans l&apos;Agora
                      </Button>
                    </Link>
                    <Button variant="secondary" onClick={closeModal}>
                      Fermer
                    </Button>
                  </div>
                </div>
              ) : (
                /* Form state */
                <>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1 pr-8">
                    Proposer une modification
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-5">
                    {selectedParam.name}
                  </p>

                  {/* Current value */}
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <div className="text-xs text-[var(--text-muted)] mb-1">Valeur actuelle</div>
                    <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
                      {String(selectedParam.currentValue)}
                      {selectedParam.unit && (
                        <span className="text-sm text-[var(--text-muted)] ml-2 font-sans">
                          {selectedParam.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Proposed value */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Nouvelle valeur proposee
                    </label>
                    <Input
                      type="number"
                      placeholder={`Entrez la nouvelle valeur${selectedParam.allowedRange ? ` (${selectedParam.allowedRange.min} — ${selectedParam.allowedRange.max})` : ""}`}
                      value={proposedValue}
                      onChange={(e) => setProposedValue(e.target.value)}
                      min={selectedParam.allowedRange?.min}
                      max={selectedParam.allowedRange?.max}
                    />
                    {selectedParam.allowedRange && (
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        Plage autorisee : {selectedParam.allowedRange.min} — {selectedParam.allowedRange.max}
                        {selectedParam.unit && ` ${selectedParam.unit}`}
                      </div>
                    )}
                    {proposedValue && !isValueValid && (
                      <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Valeur hors de la plage autorisee
                      </div>
                    )}
                  </div>

                  {/* Impact analysis */}
                  {impactText && (
                    <div className="mb-4 p-3 rounded-lg flex items-start gap-3" style={{ backgroundColor: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                      <ArrowRight className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-violet-500 mb-1">Analyse d&apos;impact</div>
                        <div className="text-sm text-[var(--text-secondary)]">{impactText}</div>
                      </div>
                    </div>
                  )}

                  {/* Justification */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Justification
                    </label>
                    <textarea
                      className="w-full h-28 rounded-lg border px-3 py-2 text-sm resize-none outline-none transition-colors focus:border-violet-500"
                      style={{
                        backgroundColor: "var(--bg-elevated)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Expliquez pourquoi cette modification est necessaire (minimum 100 caracteres)..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                    />
                    <div className="flex justify-between text-xs mt-1">
                      <span className={justification.length >= 100 ? "text-green-500" : "text-[var(--text-muted)]"}>
                        {justification.length >= 100 ? (
                          <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Minimum atteint</span>
                        ) : (
                          `Minimum 100 caracteres requis`
                        )}
                      </span>
                      <span className={justification.length < 100 ? "text-orange-500" : "text-[var(--text-muted)]"}>
                        {justification.length}/100
                      </span>
                    </div>
                  </div>

                  {/* Quorum / Seuil info */}
                  <div className="mb-5 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <div className="text-xs font-medium text-[var(--text-muted)] mb-2">Conditions de vote</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-[var(--text-muted)] text-xs">Quorum requis</div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {selectedParam.requiredQuorum}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)] text-xs">Seuil d&apos;adoption</div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {selectedParam.requiredThreshold}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="mb-5 flex flex-wrap gap-2">
                    <Link
                      href={`/codex/parametres-systeme/${selectedParam.id}`}
                      className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir dans le Codex
                    </Link>
                    {selectedParam.technicalDocSection && (
                      <Link
                        href={`/codex/technique/${selectedParam.technicalDocSection}`}
                        className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors"
                      >
                        <Code className="h-3 w-3" />
                        Documentation technique
                      </Link>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleSubmit}
                      disabled={!isValueValid || justification.length < 100}
                    >
                      <Vote className="h-4 w-4" />
                      Soumettre a l&apos;Agora
                    </Button>
                    <Button variant="secondary" onClick={closeModal}>
                      Annuler
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </PermissionGate>
  );
}
