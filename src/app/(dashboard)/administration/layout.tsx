"use client";

import {
  Shield,
  Users,
  Settings,
  ShieldAlert,
  FileSearch,
  Server,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { PermissionGate } from "@/components/auth/PermissionGate";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: "Vue d'ensemble",
    href: "/administration",
    permission: "access_admin_panel",
  },
  {
    icon: Users,
    label: "Utilisateurs",
    href: "/administration/utilisateurs",
    permission: "manage_users",
  },
  {
    icon: Settings,
    label: "Parametres systeme",
    href: "/administration/parametres-systeme",
    permission: "manage_system_params",
  },
  {
    icon: ShieldAlert,
    label: "Moderation",
    href: "/administration/moderation",
    permission: "moderate_proposal",
  },
  {
    icon: FileSearch,
    label: "Audit",
    href: "/administration/audit",
    permission: "view_audit_logs",
  },
  {
    icon: Server,
    label: "Systeme",
    href: "/administration/systeme",
    permission: "view_system_stats",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PermissionGate
      permission="access_admin_panel"
      fallback={
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <Lock className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">
              Acces restreint
            </div>
            <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
              Le panneau d&apos;administration est reserve aux utilisateurs
              disposant des permissions necessaires.
            </p>
            <Link href="/">
              <Button variant="secondary">Retour au Panorama</Button>
            </Link>
          </div>
        </DashboardLayout>
      }
    >
      <DashboardLayout
        sidebarItems={sidebarItems}
        sidebarTitle="Administration"
      >
        {children}
      </DashboardLayout>
    </PermissionGate>
  );
}
