"use client";

import { useState, useMemo } from "react";
import {
  FileSearch,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { useToast } from "@/components/ui/Toast";
import {
  AUDIT_LOGS,
  AUDIT_STATS,
  type AuditLog,
  type AuditSeverity,
  type AuditCategory,
} from "@/lib/mockAdmin";
import { formatNumber } from "@/lib/format";

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  info: "rgb(59, 130, 246)",
  warning: "rgb(249, 115, 22)",
  critique: "rgb(239, 68, 68)",
};

const CATEGORY_LABELS: Record<AuditCategory, string> = {
  authentification: "Authentification",
  transaction: "Transaction",
  vote: "Vote",
  administration: "Administration",
  systeme: "Systeme",
};

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | AuditCategory>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditSeverity>("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const filteredLogs = useMemo(() => {
    let result = [...AUDIT_LOGS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (log) =>
          log.action.toLowerCase().includes(q) ||
          log.acteur.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.hashRef.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((log) => log.categorie === categoryFilter);
    }

    if (severityFilter !== "all") {
      result = result.filter((log) => log.severite === severityFilter);
    }

    return result;
  }, [search, categoryFilter, severityFilter]);

  function handleVerifyIntegrity() {
    setIsVerifying(true);
    setTimeout(() => {
      toast.success("Verification d'integrite terminee — Chaine de hachage valide");
      setIsVerifying(false);
    }, 2000);
  }

  function handleExport() {
    toast.info("Export CSV simule");
  }

  return (
    <div>
      {/* Integrity indicator */}
      {AUDIT_STATS.integrite && (
        <Card
          className="mb-6 border-green-500/30"
          style={{ backgroundColor: "rgba(34, 197, 94, 0.05)" }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
              <p className="text-sm text-green-400">
                Chaine de hachage integre — Derniere verification :{" "}
                {AUDIT_STATS.derniereVerification} —{" "}
                {formatNumber(AUDIT_STATS.totalEntrees)} entrees verifiees
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FileSearch className="h-6 w-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Journal d&apos;audit
              </h1>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              {formatNumber(AUDIT_STATS.totalEntrees)} entrees totales &middot;{" "}
              {formatNumber(AUDIT_STATS.totalSemaine)} cette semaine
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${isVerifying ? "animate-spin" : ""}`}
              />
              {isVerifying ? "Verification..." : "Verifier l'integrite"}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Exporter les logs
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <SearchInput
          placeholder="Rechercher dans les logs..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as "all" | AuditCategory)}
        >
          <option value="all">Toutes les categories</option>
          <option value="authentification">Authentification</option>
          <option value="transaction">Transaction</option>
          <option value="vote">Vote</option>
          <option value="administration">Administration</option>
          <option value="systeme">Systeme</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as "all" | AuditSeverity)}
        >
          <option value="all">Toutes les severites</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critique">Critique</option>
        </select>
      </div>

      {/* Log entries */}
      <div className="space-y-2">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLog === log.id;

          return (
            <Card
              key={log.id}
              className="transition-all cursor-pointer hover:border-violet-500/20"
              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
            >
              <CardContent className="p-4">
                {/* Main row */}
                <div className="flex items-center gap-3">
                  {/* Timestamp */}
                  <span
                    className="text-xs font-mono shrink-0 hidden sm:block"
                    style={{ color: "var(--text-muted)", minWidth: "160px" }}
                  >
                    {log.horodatage}
                  </span>

                  {/* Severity dot */}
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SEVERITY_COLORS[log.severite] }}
                    title={log.severite}
                  />

                  {/* Actor */}
                  <span
                    className="text-xs font-medium shrink-0"
                    style={{
                      color:
                        log.acteur === "Systeme"
                          ? "var(--text-muted)"
                          : "var(--text-primary)",
                      minWidth: "100px",
                    }}
                  >
                    {log.acteur}
                  </span>

                  {/* Action */}
                  <span className="text-sm text-[var(--text-primary)] flex-1 min-w-0 truncate">
                    {log.action}
                  </span>

                  {/* Hash ref */}
                  <span
                    className="hidden md:inline-flex text-xs font-mono px-2 py-0.5 rounded shrink-0"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {log.hashRef}
                  </span>

                  {/* Expand icon */}
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    style={{ color: "var(--text-muted)" }}
                  />
                </div>

                {/* Mobile timestamp */}
                <span
                  className="text-xs font-mono sm:hidden mt-1 block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {log.horodatage}
                </span>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    className="mt-4 pt-4 space-y-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Details text */}
                    <p className="text-sm text-[var(--text-secondary)]">
                      {log.details}
                    </p>

                    {/* Before/After diff */}
                    {(log.donneeAvant || log.donneeApres) && (
                      <div className="space-y-1.5">
                        {log.donneeAvant && (
                          <div
                            className="rounded-md px-3 py-2 text-xs font-mono"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              color: "rgb(248, 113, 113)",
                            }}
                          >
                            - {log.donneeAvant}
                          </div>
                        )}
                        {log.donneeApres && (
                          <div
                            className="rounded-md px-3 py-2 text-xs font-mono"
                            style={{
                              backgroundColor: "rgba(34, 197, 94, 0.1)",
                              color: "rgb(74, 222, 128)",
                            }}
                          >
                            + {log.donneeApres}
                          </div>
                        )}
                      </div>
                    )}

                    {/* IP / User Agent */}
                    {(log.ip || log.userAgent) && (
                      <div className="flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                        {log.ip && (
                          <span>
                            <span className="font-medium text-[var(--text-secondary)]">
                              IP :
                            </span>{" "}
                            {log.ip}
                          </span>
                        )}
                        {log.userAgent && (
                          <span>
                            <span className="font-medium text-[var(--text-secondary)]">
                              User Agent :
                            </span>{" "}
                            {log.userAgent}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Hash details */}
                    <div
                      className="rounded-lg p-3 space-y-1.5"
                      style={{ backgroundColor: "var(--bg-elevated)" }}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-[var(--text-secondary)]">
                          Hash complet :
                        </span>
                        <span className="font-mono text-[var(--text-muted)]">
                          {log.hashRef}
                        </span>
                      </div>
                      {log.hashPrecedent && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-[var(--text-secondary)]">
                            Hash precedent :
                          </span>
                          <span className="font-mono text-[var(--text-muted)]">
                            {log.hashPrecedent}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucun log ne correspond aux filtres selectionnes.
          </div>
        )}
      </div>
    </div>
  );
}
