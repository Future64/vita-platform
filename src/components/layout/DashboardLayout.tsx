"use client";

import { Eye, X } from "lucide-react";
import { TopNav } from "./TopNav";
import { Sidebar, SidebarItem } from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_METADATA } from "@/lib/permissions";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems?: SidebarItem[];
  sidebarTitle?: string;
}

export function DashboardLayout({
  children,
  sidebarItems,
  sidebarTitle,
}: DashboardLayoutProps) {
  const { simulatedRole, setSimulatedRole } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TopNav />

      {/* Simulation banner */}
      {simulatedRole && (
        <div
          className="sticky top-16 z-40 flex items-center justify-center gap-3 px-4 py-2 text-sm"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <Eye className="h-4 w-4" style={{ color: "rgb(245, 158, 11)" }} />
          <span style={{ color: "rgb(245, 158, 11)" }}>
            Simulation :{" "}
            <span className="font-semibold">
              {ROLE_METADATA[simulatedRole].label}
            </span>
          </span>
          <button
            onClick={() => setSimulatedRole(null)}
            className="ml-2 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-amber-500/20"
            style={{ color: "rgb(245, 158, 11)", border: "1px solid rgba(245, 158, 11, 0.3)" }}
          >
            Reinitialiser
          </button>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-4rem)]">
        {sidebarItems && sidebarItems.length > 0 && (
          <Sidebar items={sidebarItems} title={sidebarTitle} />
        )}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
