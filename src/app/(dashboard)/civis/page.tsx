"use client";

import {
  User,
  Wallet,
  Award,
  Activity,
  TrendingUp,
  Vote,
  GitBranch,
  Calendar,
  MapPin,
  Mail,
  Edit
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EventTimeline } from "@/components/ui/event-timeline";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/lib/format";

const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activité", href: "/civis/activity" },
  { icon: Award, label: "Récompenses", href: "/civis/achievements" },
];

const userData = {
  name: "Marie Dupont",
  username: "@mariedupont",
  joinDate: "Septembre 2023",
  location: "Paris, France",
  email: "marie.dupont@example.com",
  bio: "Passionnée par l'écologie et la gouvernance participative. Contributrice active sur les projets environnementaux.",
  avatar: "MD",
  stats: {
    propositions: 23,
    votes: 456,
    contributions: 67,
    reputation: 892,
  },
  wallet: {
    balance: 2847,
    earned: 3254,
    spent: 407,
    pending: 125,
  },
  badges: [
    { id: 1, name: "Éco-Warrior", icon: "🌱", description: "10 propositions écologiques" },
    { id: 2, name: "Contributeur actif", icon: "⭐", description: "50+ contributions" },
    { id: 3, name: "Voteur engagé", icon: "🗳️", description: "100+ votes" },
  ],
};

const recentActivity = [
  {
    date: "Aujourd'hui",
    title: "Vote sur proposition écologique",
    description: "A voté POUR la réforme des bonus écologiques",
    variant: "green" as const,
  },
  {
    date: "Hier",
    title: "Contribution au projet Constitution v3",
    description: "Commit: Add article 47 on AI Ethics",
    variant: "violet" as const,
  },
  {
    date: "Il y a 3j",
    title: "Nouvelle proposition créée",
    description: "Réforme du système de transport public",
    variant: "orange" as const,
  },
  {
    date: "Il y a 5j",
    title: "Récompense reçue",
    description: "+50 Ѵ pour contribution exceptionnelle",
    variant: "cyan" as const,
  },
];

export default function CivisProfilePage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-white text-2xl font-semibold">
              {userData.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {userData.name}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mb-2">{userData.username}</p>
              <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {userData.joinDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {userData.location}
                </span>
              </div>
            </div>
          </div>
          <Button variant="secondary">
            <Edit className="h-4 w-4" />
            Modifier le profil
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Propositions"
          value={userData.stats.propositions.toString()}
        />
        <StatCard
          variant="cyan"
          label="Votes"
          value={userData.stats.votes.toString()}
        />
        <StatCard
          variant="green"
          label="Contributions"
          value={userData.stats.contributions.toString()}
        />
        <StatCard
          variant="orange"
          label="Réputation"
          value={userData.stats.reputation.toString()}
          trend={{ value: "+15", direction: "up" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Bio Card */}
          <Card>
            <CardHeader>
              <CardTitle>À propos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {userData.bio}
              </p>
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Mail className="h-4 w-4" />
                {userData.email}
              </div>
            </CardContent>
          </Card>

          {/* Wallet Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Portefeuille Ѵ</CardTitle>
              <Button variant="ghost" size="sm" className="text-violet-500" href="/civis/wallet">
                Voir détails
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-500 mb-1">
                    {formatNumber(userData.wallet.balance)} Ѵ
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Solde actuel</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500 mb-1">
                    +{formatNumber(userData.wallet.earned)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Revenus totaux</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-500 mb-1">
                    -{formatNumber(userData.wallet.spent)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">Dépenses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500 mb-1">
                    {formatNumber(userData.wallet.pending)}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">En attente</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Revenu de base mensuel</span>
                  <span className="font-semibold text-[var(--text-primary)]">1,000 Ѵ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Bonus écologiques</span>
                  <span className="font-semibold text-green-500">+250 Ѵ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Contributions</span>
                  <span className="font-semibold text-violet-500">+150 Ѵ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <Button variant="ghost" size="sm" className="text-violet-500">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <EventTimeline events={recentActivity} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges ({userData.badges.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {userData.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-lg border border-[var(--border)] hover:border-violet-500 transition-all mb-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                          {badge.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)]">
                          {badge.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reputation Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Niveau de réputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">Niveau 8</span>
                  <span className="text-sm font-semibold text-violet-500">
                    {userData.stats.reputation} / 1000
                  </span>
                </div>
                <Progress value={(userData.stats.reputation / 1000) * 100} />
                <p className="text-xs text-[var(--text-muted)]">
                  Plus que 108 points pour atteindre le niveau 9
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Vote className="h-4 w-4" />
                    Votes
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">12</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <GitBranch className="h-4 w-4" />
                    Contributions
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">5</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <TrendingUp className="h-4 w-4" />
                    Ѵ gagnés
                  </div>
                  <div className="font-semibold text-green-500">+75 Ѵ</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
