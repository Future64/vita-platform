"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye } from "lucide-react";
import { TopNav } from "./TopNav";
import { Sidebar, SidebarItem } from "./Sidebar";
import { SearchModal } from "./SearchModal";
import { OnboardingChecklist, OnboardingCelebration } from "@/components/onboarding/OnboardingChecklist";
import { TourGuide } from "@/components/onboarding/TourGuide";
import { VerificationBanner } from "@/components/verification/VerificationBanner";
import { MobileNav } from "./MobileNav";
import { Footer } from "./Footer";
import { MockModeBanner } from "./MockModeBanner";
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
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const hasSidebar = sidebarItems && sidebarItems.length > 0;

  // Global Ctrl+K / Cmd+K shortcut
  const handleSearchShortcut = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, [handleSearchShortcut]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TopNav
        onOpenMobileSidebar={() => setSidebarMobileOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <OnboardingChecklist />
      <OnboardingCelebration />
      <TourGuide />

      <MockModeBanner />
      <VerificationBanner />

      {/* Simulation banner */}
      {simulatedRole && (
        <div
          className="sticky top-14 md:top-16 z-40 flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
          }}
        >
          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" style={{ color: "rgb(245, 158, 11)" }} />
          <span style={{ color: "rgb(245, 158, 11)" }}>
            Simulation :{" "}
            <span className="font-semibold">
              {ROLE_METADATA[simulatedRole].label}
            </span>
          </span>
          <button
            onClick={() => setSimulatedRole(null)}
            className="ml-1 md:ml-2 rounded-md px-2 md:px-2.5 py-1 text-xs font-medium transition-colors hover:bg-amber-500/20"
            style={{ color: "rgb(245, 158, 11)", border: "1px solid rgba(245, 158, 11, 0.3)" }}
          >
            Reinitialiser
          </button>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-3.5rem)] md:min-h-[calc(100vh-4rem)]">
        {hasSidebar && (
          <Sidebar
            items={sidebarItems}
            title={sidebarTitle}
            mobileOpen={sidebarMobileOpen}
            onMobileClose={() => setSidebarMobileOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          />
        )}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <MobileNav />
    </div>
  );
}
