"use client";

import Link from "next/link";
import { Lock, ShieldAlert, ArrowRight } from "lucide-react";
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
  const { hasPermission, activeRole } = useAuth();

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

  // Enhanced fallback for 'nouveau' role: show verification CTA
  if (activeRole === "nouveau") {
    return (
      <div className="relative inline-flex">
        <div className="pointer-events-none select-none opacity-40">
          {children}
        </div>
        <Link
          href="/civis/verification"
          className="absolute -right-1 -top-1 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.15)",
            color: "rgb(245, 158, 11)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
          }}
          title="Verification requise"
        >
          <ShieldAlert className="h-2.5 w-2.5" />
          <span className="hidden sm:inline">Verifier</span>
          <ArrowRight className="h-2 w-2 hidden sm:inline" />
        </Link>
      </div>
    );
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
