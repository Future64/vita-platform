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

      {/* World Map Card - Inverted Colors */}
      <Card className="mb-6 card-inverted">
        <CardHeader className="border-b" style={{ borderColor: 'var(--border-light)' }}>
          <CardTitle className="card-inverted-title">Activité mondiale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[280px] overflow-hidden rounded-lg md:h-[320px] card-inverted-map">
            {/* Simplified World Map SVG */}
            <svg
              viewBox="0 0 1000 500"
              className="h-full w-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient id="markerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Continents (simplified) */}
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M150,120 Q200,80 280,90 L320,110 Q340,140 320,180 L280,220 Q240,260 180,240 L140,200 Q120,160 150,120 Z"
              />
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M240,280 Q280,260 300,290 L310,350 Q290,400 260,420 L230,400 Q200,350 220,300 Z"
              />
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M480,100 Q520,80 560,90 L580,120 Q570,150 540,160 L500,150 Q470,130 480,100 Z"
              />
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M480,180 Q520,160 560,180 L580,240 Q570,320 530,360 L490,340 Q460,280 480,180 Z"
              />
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M600,80 Q700,60 800,100 L850,150 Q860,200 820,240 L750,260 Q680,240 620,200 L580,150 Q590,100 600,80 Z"
              />
              <path
                className="transition-colors hover:fill-violet-500/20"
                style={{ fill: 'var(--bg-elevated)', stroke: 'var(--border-light)' }}
                strokeWidth="0.5"
                d="M780,320 Q820,300 860,320 L880,360 Q860,400 820,400 L780,380 Q760,350 780,320 Z"
              />

              {/* Animated markers */}
              <circle
                cx="500"
                cy="130"
                r="6"
                fill="url(#markerGradient)"
                className="animate-pulse"
              />
              <circle
                cx="260"
                cy="150"
                r="8"
                fill="url(#markerGradient)"
                className="animate-pulse"
              />
              <circle
                cx="820"
                cy="160"
                r="7"
                fill="url(#markerGradient)"
                className="animate-pulse"
              />
              <circle
                cx="680"
                cy="220"
                r="6"
                fill="url(#markerGradient)"
                className="animate-pulse"
              />
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 rounded-lg border p-3" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-elevated)' }}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[0.6875rem]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="h-2 w-2 rounded-full bg-violet-500" />
                  Europe
                </div>
                <div className="flex items-center gap-2 text-[0.6875rem]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Amériques
                </div>
                <div className="flex items-center gap-2 text-[0.6875rem]" style={{ color: 'var(--text-secondary)' }}>
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  Asie
                </div>
              </div>
            </div>

            {/* Stats overlay */}
            <div className="absolute right-4 top-4">
              <div className="rounded-lg border px-3 py-2 text-right" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--bg-elevated)' }}>
                <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>142</div>
                <div className="text-[0.625rem] uppercase" style={{ color: 'var(--text-muted)' }}>Pays</div>
              </div>
            </div>
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
