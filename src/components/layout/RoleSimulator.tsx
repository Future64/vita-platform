"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ROLE_METADATA, ROLE_PERMISSIONS, ROLES_ORDERED } from "@/lib/permissions";
import type { UserRole } from "@/types/auth";

const ROLE_EMOJIS: Record<UserRole, string> = {
  dieu: "\u{1F451}",
  super_admin: "\u{1F534}",
  admin: "\u{1F7E0}",
  moderateur: "\u{1F7E1}",
  auditeur: "\u{1F535}",
  gardien: "\u{1F3DB}\uFE0F",
  mandataire: "\u{1F91D}",
  referent: "\u{1F465}",
  delegue: "\u{1F7E2}",
  citoyen: "\u{1F7E3}",
  nouveau: "\u{26AA}",
  observateur: "\u{1F441}\uFE0F",
  suspendu: "\u{26D4}",
};

export function RoleSimulator() {
  const { user, simulatedRole, setSimulatedRole } = useAuth();
  const { toast } = useToast();

  // Only visible for real dieu users
  if (!user || user.role !== "dieu") return null;

  const currentValue = simulatedRole ?? "dieu";

  return (
    <div className="hidden md:block">
      <select
        value={currentValue}
        onChange={(e) => {
          const val = e.target.value as UserRole;
          setSimulatedRole(val === "dieu" ? null : val);
          const label = ROLE_METADATA[val].label;
          toast.info(`Simulation : ${label}`);
        }}
        className="h-9 rounded-lg border px-2.5 pr-7 text-xs font-medium transition-colors focus:border-violet-500 focus:outline-none"
        style={{
          borderColor: simulatedRole ? "rgba(245, 158, 11, 0.5)" : "var(--border)",
          backgroundColor: simulatedRole ? "rgba(245, 158, 11, 0.08)" : "var(--bg-elevated)",
          color: "var(--text-primary)",
        }}
      >
        {ROLES_ORDERED.map((role) => {
          const meta = ROLE_METADATA[role];
          const permCount = ROLE_PERMISSIONS[role].length;
          return (
            <option key={role} value={role}>
              {ROLE_EMOJIS[role]} {meta.label} ({permCount})
            </option>
          );
        })}
      </select>
    </div>
  );
}
