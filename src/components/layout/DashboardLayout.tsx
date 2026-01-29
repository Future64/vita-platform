"use client";

import { TopNav } from "./TopNav";
import { Sidebar, SidebarItem } from "./Sidebar";

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
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <TopNav />
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
