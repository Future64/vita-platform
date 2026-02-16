"use client";

import {
  Globe,
  Coins,
  Users,
  Vote,
  GitBranch,
  GitPullRequest,
  Layers,
  Download,
  TrendingUp
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { ListItem } from "@/components/ui/list-item";
import { VoteBar } from "@/components/ui/progress";
import WorldMap from "@/components/ui/world-map";

const sidebarItems: SidebarItem[] = [
  { icon: Globe, label: "Dashboard", href: "/panorama" },
  { icon: Coins, label: "Économie", href: "/panorama/economy" },
  { icon: Users, label: "Citoyens", href: "/panorama/citizens" },
  { icon: Vote, label: "Votes", href: "/panorama/votes" },
  { icon: GitBranch, label: "Projets", href: "/forge" },
];

export default function PanoramaPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Panorama">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard Global
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Temps réel</p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* World Map Card - Interactive */}
      <Card className="mb-6 card-inverted">
        <CardHeader className="border-b" style={{ borderColor: 'var(--border-light)' }}>
          <CardTitle className="card-inverted-title">Activité mondiale</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[320px] overflow-hidden rounded-b-lg md:h-[400px]">
            <WorldMap />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Citoyens"
          value="27,324"
          trend={{ value: "+3.2%", direction: "up" }}
        />
        <StatCard
          variant="pink"
          label="Masse Ѵ"
          value="2.4M"
          trend={{ value: "+1.8%", direction: "up" }}
        />
        <StatCard
          variant="cyan"
          label="Tx/jour"
          value="12,847"
          trend={{ value: "+5.4%", direction: "up" }}
        />
        <StatCard
          variant="green"
          label="Projets"
          value="8"
          trend={{ value: "+2", direction: "up" }}
        />
      </div>

      {/* Two columns: Votes + Projects */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Active Votes */}
        <Card>
          <CardHeader>
            <CardTitle>Votes actifs</CardTitle>
            <Button variant="ghost" size="sm" className="text-violet-500">
              Voir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ListItem
                icon={GitPullRequest}
                iconVariant="orange"
                title="Révision PPA"
                subtitle="67% • 2j"
              />
              <ListItem
                icon={Vote}
                iconVariant="green"
                title="Fonds climatique"
                subtitle="45% • 5j"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projets récents</CardTitle>
            <Button variant="ghost" size="sm" className="text-violet-500">
              Voir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ListItem
                icon={GitBranch}
                iconVariant="violet"
                title="Révision Art. 9"
                subtitle="4 branches"
              />
              <ListItem
                icon={Layers}
                iconVariant="cyan"
                title="Bonus écologiques"
                subtitle="Révision"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
