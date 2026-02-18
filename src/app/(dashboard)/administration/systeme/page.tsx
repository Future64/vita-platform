"use client";

import { useState } from "react";
import {
  Server,
  Activity,
  Database,
  HardDrive,
  Wifi,
  Cpu,
  Zap,
  AlertTriangle,
  Power,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/Toast";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { SYSTEM_STATUS } from "@/lib/mockAdmin";
import { formatNumber } from "@/lib/format";

function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data, 1);
  const h = 24;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");

  return (
    <svg width={w} height={h} className={className}>
      <polyline
        points={points}
        fill="none"
        stroke="rgba(139, 92, 246, 0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "operationnel" || status === "complete"
      ? "rgb(34, 197, 94)"
      : status === "degrade"
      ? "rgb(249, 115, 22)"
      : "rgb(239, 68, 68)";

  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  );
}

function StatusLabel({ status }: { status: string }) {
  const labels: Record<string, string> = {
    operationnel: "Operationnel",
    complete: "Complete",
    degrade: "Degrade",
    maintenance: "Maintenance",
  };

  return (
    <span className="text-xs text-[var(--text-muted)]">
      {labels[status] || status}
    </span>
  );
}

export default function SystemePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyMotif, setEmergencyMotif] = useState("");
  const { toast } = useToast();

  const globalOk = SYSTEM_STATUS.global === "operationnel";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <Server className="h-6 w-6 text-green-500" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Sante du systeme
          </h1>
          <Badge variant={globalOk ? "green" : "orange"}>
            {globalOk
              ? "Tous les systemes operationnels"
              : "Degradation detectee"}
          </Badge>
        </div>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* API Backend */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  API Backend
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusDot status={SYSTEM_STATUS.api.statut} />
                <StatusLabel status={SYSTEM_STATUS.api.statut} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Temps de reponse</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.api.tempsReponseMoyen}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Requetes/min</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatNumber(SYSTEM_STATUS.api.requetesParMinute)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Erreurs 5xx</span>
                <span className="font-mono text-green-500">
                  {SYSTEM_STATUS.api.erreurs5xx}
                </span>
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <MiniSparkline data={SYSTEM_STATUS.api.sparkline} />
            </div>
          </CardContent>
        </Card>

        {/* Base de donnees */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Base de donnees
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusDot status={SYSTEM_STATUS.baseDeDonnees.statut} />
                <StatusLabel status={SYSTEM_STATUS.baseDeDonnees.statut} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Connexions</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.baseDeDonnees.connexionsActives}/
                  {SYSTEM_STATUS.baseDeDonnees.connexionsMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Taille</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.baseDeDonnees.taille}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Derniere sauvegarde</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.baseDeDonnees.derniereSauvegarde}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File d'emission */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  File d&apos;emission
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusDot status={SYSTEM_STATUS.fileEmission.statut} />
                <StatusLabel status={SYSTEM_STATUS.fileEmission.statut} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Emissions</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatNumber(SYSTEM_STATUS.fileEmission.emissionsAujourdhui)}/
                  {formatNumber(SYSTEM_STATUS.fileEmission.emissionsTotal)} (100%)
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Derniere</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.fileEmission.derniereEmission} (
                  {SYSTEM_STATUS.fileEmission.dureeEmission})
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Prochaine</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.fileEmission.prochaineEmission}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stockage */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-orange-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Stockage
                </h3>
              </div>
              <span className="text-xs font-mono text-[var(--text-primary)]">
                {SYSTEM_STATUS.stockage.utilise}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${SYSTEM_STATUS.stockage.utilise}%`,
                    backgroundColor:
                      SYSTEM_STATUS.stockage.utilise < 80
                        ? "rgb(34, 197, 94)"
                        : "rgb(249, 115, 22)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Total</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.stockage.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Logs</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.stockage.logs}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Transactions</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.stockage.transactions}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Identites</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.stockage.identites}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reseau */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Reseau
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Latence</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.reseau.latenceMoyenne}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Bande passante</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.reseau.bandePassante}/
                  {SYSTEM_STATUS.reseau.bandePassanteMax} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Certificat SSL</span>
                <span className="font-mono text-green-500">
                  {SYSTEM_STATUS.reseau.certificatSSL} (expire dans{" "}
                  {SYSTEM_STATUS.reseau.expirationSSL})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cache */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-pink-500" />
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  Cache
                </h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Hit rate</span>
                <span className="font-mono text-green-500">
                  {SYSTEM_STATUS.cache.hitRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Memoire</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {SYSTEM_STATUS.cache.memoire}/{SYSTEM_STATUS.cache.memoireMax}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Entrees</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {formatNumber(SYSTEM_STATUS.cache.entrees)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uptime section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Disponibilite (30 derniers jours)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bar chart */}
          <div className="flex items-end gap-1 mb-4 h-12">
            {SYSTEM_STATUS.uptime.barres.map((value, i) => {
              const barColor =
                value === 100
                  ? "rgb(34, 197, 94)"
                  : value > 99
                  ? "rgb(34, 197, 94)"
                  : "rgb(239, 68, 68)";

              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm transition-all hover:opacity-80"
                  style={{
                    height: `${(value / 100) * 100}%`,
                    backgroundColor: barColor,
                    minHeight: "4px",
                  }}
                  title={`Jour -${30 - i} : ${value}%`}
                />
              );
            })}
          </div>

          <p className="text-xs text-[var(--text-muted)]">
            Uptime 30j : {SYSTEM_STATUS.uptime.pct30j}% &middot; Dernier incident :{" "}
            {SYSTEM_STATUS.uptime.dernierIncident} ({SYSTEM_STATUS.uptime.raisonIncident},{" "}
            {SYSTEM_STATUS.uptime.dureeIncident})
          </p>
        </CardContent>
      </Card>

      {/* Actions section */}
      <PermissionGate permission="emergency_stop" hide>
        <Card>
          <CardHeader>
            <CardTitle>Actions systeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Maintenance toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Mode maintenance
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {maintenanceMode
                      ? "Le systeme est en mode maintenance. Les utilisateurs ne peuvent pas acceder a la plateforme."
                      : "Le systeme est en mode normal."}
                  </p>
                </div>
                <Button
                  variant={maintenanceMode ? "success" : "secondary"}
                  size="sm"
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    toast.info(
                      maintenanceMode
                        ? "Mode maintenance desactive"
                        : "Mode maintenance active"
                    );
                  }}
                >
                  {maintenanceMode ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Desactiver
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      Activer
                    </>
                  )}
                </Button>
              </div>

              {/* Clear cache */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Vider le cache
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Supprime toutes les donnees en cache.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toast.success("Cache vide")}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Vider le cache
                </Button>
              </div>

              {/* Separator */}
              <div
                className="border-t my-4"
                style={{ borderColor: "var(--border)" }}
              />

              {/* Emergency stop */}
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-xs text-[var(--text-muted)] text-center max-w-md">
                  L&apos;arret d&apos;urgence interrompt toutes les operations du
                  systeme. En production, 3 signatures sur 5 seront requises.
                </p>
                <Button
                  variant="danger"
                  size="lg"
                  className="px-8"
                  onClick={() => setIsEmergencyModalOpen(true)}
                >
                  <Power className="h-5 w-5 mr-2" />
                  Arret d&apos;urgence
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PermissionGate>

      {/* Emergency stop modal */}
      {isEmergencyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                Arret d&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    color: "rgb(248, 113, 113)",
                  }}
                >
                  <p className="font-medium mb-1">Attention</p>
                  <p className="text-xs">
                    Cette action interrompra immediatement toutes les operations du
                    systeme VITA : transactions, emissions, votes. En production,
                    cette action necessite 3 signatures sur 5 SuperAdmins.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    Motif de l&apos;arret
                  </label>
                  <textarea
                    className="w-full rounded-lg border px-4 py-3 text-sm focus:border-red-500 focus:outline-none transition-colors resize-none"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                    }}
                    rows={3}
                    placeholder="Decrivez le motif de l'arret d'urgence..."
                    value={emergencyMotif}
                    onChange={(e) => setEmergencyMotif(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEmergencyModalOpen(false);
                      setEmergencyMotif("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      toast.warning(
                        "Arret d'urgence simule — En production, 3/5 signatures seraient requises"
                      );
                      setIsEmergencyModalOpen(false);
                      setEmergencyMotif("");
                    }}
                  >
                    <Power className="h-3.5 w-3.5 mr-1" />
                    Confirmer l&apos;arret
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
