"use client";

import Link from "next/link";
import {
  Shield,
  Users,
  Settings,
  ShieldAlert,
  FileSearch,
  Server,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_METADATA } from "@/lib/permissions";
import {
  USER_STATS,
  MODERATION_STATS,
  AUDIT_STATS,
  SYSTEM_STATUS,
  RECENT_ADMIN_ACTIONS,
} from "@/lib/mockAdmin";
import { formatNumber } from "@/lib/format";

const ACTION_TYPE_COLORS: Record<string, string> = {
  verification: "rgb(34, 197, 94)",
  moderation: "rgb(249, 115, 22)",
  parametre: "rgb(139, 92, 246)",
  role: "rgb(6, 182, 212)",
  systeme: "rgb(59, 130, 246)",
};

export default function AdministrationPage() {
  const { activeRole } = useAuth();
  const roleMeta = ROLE_METADATA[activeRole];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-6 w-6 text-violet-500" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Administration
          </h1>
          <Badge
            className="text-xs"
            style={{
              backgroundColor: `${roleMeta.color}20`,
              color: roleMeta.color,
            }}
          >
            {roleMeta.label}
          </Badge>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Panneau de gestion de la plateforme VITA
        </p>
      </div>

      {/* Navigation cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Utilisateurs */}
        <PermissionGate permission="manage_users" hide>
          <Link href="/administration/utilisateurs" className="group">
            <Card className="h-full transition-all hover:border-violet-500/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(139, 92, 246, 0.1)" }}
                  >
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Utilisateurs
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatNumber(USER_STATS.total)} citoyens &middot;{" "}
                  {formatNumber(USER_STATS.enAttente)} en attente &middot;{" "}
                  {USER_STATS.suspendus} suspendus
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGate>

        {/* Parametres systeme */}
        <PermissionGate permission="manage_system_params" hide>
          <Link href="/administration/parametres-systeme" className="group">
            <Card className="h-full transition-all hover:border-violet-500/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
                  >
                    <Settings className="h-5 w-5 text-cyan-500" />
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Parametres systeme
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  18 parametres actifs &middot; 2 propositions en cours
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGate>

        {/* Moderation */}
        <PermissionGate permission="moderate_proposal" hide>
          <Link href="/administration/moderation" className="group">
            <Card className="h-full transition-all hover:border-violet-500/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "rgba(249, 115, 22, 0.1)" }}
                    >
                      <ShieldAlert className="h-5 w-5 text-orange-500" />
                    </div>
                    {MODERATION_STATS.enAttente > 0 && (
                      <Badge variant="red" className="text-xs">
                        {MODERATION_STATS.enAttente}
                      </Badge>
                    )}
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Moderation
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {MODERATION_STATS.enAttente} signalements en attente &middot;{" "}
                  {MODERATION_STATS.traitesSemaine} traites cette semaine
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGate>

        {/* Audit */}
        <PermissionGate permission="view_audit_logs" hide>
          <Link href="/administration/audit" className="group">
            <Card className="h-full transition-all hover:border-violet-500/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                  >
                    <FileSearch className="h-5 w-5 text-blue-500" />
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Audit
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {formatNumber(AUDIT_STATS.totalSemaine)} entrees cette semaine
                  &middot; Integrite : verifiee
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGate>

        {/* Systeme */}
        <PermissionGate permission="view_system_stats" hide>
          <Link href="/administration/systeme" className="group">
            <Card className="h-full transition-all hover:border-violet-500/30">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                  >
                    <Server className="h-5 w-5 text-green-500" />
                  </div>
                  <ArrowRight
                    className="h-4 w-4 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1"
                  />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  Systeme
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  API : {SYSTEM_STATUS.api.tempsReponseMoyen}ms &middot; Uptime
                  : {SYSTEM_STATUS.uptime.pct30j}% &middot; DB :
                  operationnelle
                </p>
              </CardContent>
            </Card>
          </Link>
        </PermissionGate>
      </div>

      {/* Recent admin actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RECENT_ADMIN_ACTIONS.map((action) => (
              <div key={action.id} className="flex items-start gap-3">
                <div className="mt-1.5 flex-shrink-0">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        ACTION_TYPE_COLORS[action.type] || "rgb(107, 114, 128)",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--text-primary)]">
                    <span className="font-semibold">{action.acteur}</span>{" "}
                    {action.action}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {action.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
