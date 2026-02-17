"use client";

import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Permission } from "@/types/auth";

interface PermissionGateProps {
  permission: Permission | Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  hide?: boolean;
  requireAll?: boolean;
}

export function PermissionGate({
  permission,
  children,
  fallback,
  hide = false,
  requireAll = false,
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed = requireAll
    ? permissions.every((p) => hasPermission(p))
    : permissions.some((p) => hasPermission(p));

  if (allowed) {
    return <>{children}</>;
  }

  if (hide) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback: grayed-out version with lock
  return (
    <div className="relative inline-flex">
      <div className="pointer-events-none select-none opacity-40">
        {children}
      </div>
      <div
        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--bg-elevated)" }}
        title="Permission requise"
      >
        <Lock className="h-2.5 w-2.5" style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}
