"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/types/auth";

export function usePermission() {
  const { hasPermission, activeRole, simulatedRole, user } = useAuth();

  return {
    hasPermission: (permission: Permission) => hasPermission(permission),
    activeRole,
    isGodMode: user?.role === "dieu",
    isSimulating: simulatedRole !== null,
  };
}
