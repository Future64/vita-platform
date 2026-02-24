"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  Users,
  Search,
  Landmark,
  Handshake,
  UserCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { getDelegates, type DelegateInfo } from "@/lib/vita-api";
import { api } from "@/lib/api";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes" },
  { icon: Users, label: "Delegues", href: "/agora/delegues" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

interface MyDelegation {
  id: string;
  delegate_id: string;
  delegate_name: string | null;
  scope: string;
  created_at: string;
}

const ROLE_DISPLAY: Record<string, { label: string; color: "orange" | "green" | "cyan" | "violet"; icon: typeof Landmark }> = {
  gardien: { label: "Gardien", color: "orange", icon: Landmark },
  mandataire: { label: "Mandataire", color: "green", icon: Handshake },
  referent: { label: "Referent", color: "cyan", icon: UserCheck },
};

export default function DeleguesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [delegates, setDelegates] = useState<DelegateInfo[]>([]);
  const [myDelegations, setMyDelegations] = useState<MyDelegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [dels, mine] = await Promise.all([
          getDelegates(),
          user ? api.getMyDelegations().catch(() => [] as MyDelegation[]) : Promise.resolve([] as MyDelegation[]),
        ]);
        setDelegates(dels);
        setMyDelegations(mine);
      } catch {
        // API not available
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return delegates;
    const q = search.toLowerCase();
    return delegates.filter(
      (d) =>
        (d.display_name || "").toLowerCase().includes(q) ||
        (d.role || "").toLowerCase().includes(q)
    );
  }, [delegates, search]);

  const myDelegateIds = new Set(myDelegations.map((d) => d.delegate_id));

  const gardienCount = delegates.filter((d) => d.role === "gardien").length;
  const mandataireCount = delegates.filter((d) => d.role === "mandataire").length;
  const referentCount = delegates.filter((d) => d.role === "referent").length;

  async function handleDelegate(delegateId: string) {
    setActing(delegateId);
    try {
      await api.createDelegation(delegateId);
      toast.success("Delegation enregistree");
      // Refresh
      const [dels, mine] = await Promise.all([
        getDelegates(),
        api.getMyDelegations().catch(() => [] as MyDelegation[]),
      ]);
      setDelegates(dels);
      setMyDelegations(mine);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
    setActing(null);
  }

  async function handleRevoke(scope: string) {
    setActing("revoke");
    try {
      await api.revokeDelegation(scope);
      toast.success("Delegation revoquee");
      const [dels, mine] = await Promise.all([
        getDelegates(),
        api.getMyDelegations().catch(() => [] as MyDelegation[]),
      ]);
      setDelegates(dels);
      setMyDelegations(mine);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
    setActing(null);
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Delegues
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          Deleguez votre voix a un membre de confiance
        </p>
      </div>

      {/* Stats */}
      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        <StatCard variant="violet" label="Total delegues" value={delegates.length} />
        <StatCard variant="orange" label="Gardiens" value={gardienCount} />
        <StatCard variant="green" label="Mandataires" value={mandataireCount} />
        <StatCard variant="cyan" label="Referents" value={referentCount} />
      </div>

      {/* My Active Delegations */}
      {myDelegations.length > 0 && (
        <Card className="mb-4 md:mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mes delegations actives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myDelegations.map((del) => (
              <div
                key={del.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {(del.delegate_name || "?")[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {del.delegate_name || "Anonyme"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Scope : {del.scope} &middot; Depuis le{" "}
                      {new Date(del.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevoke(del.scope)}
                  disabled={acting === "revoke"}
                  className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                  Revoquer
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3.5 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Rechercher un delegue..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delegates List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun delegue"
          description={
            search
              ? "Aucun delegue ne correspond a votre recherche."
              : "Les membres elus par delegation apparaitront ici."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((del) => {
            const roleInfo = ROLE_DISPLAY[del.role || ""] || {
              label: del.role || "Citoyen",
              color: "violet" as const,
              icon: UserCheck,
            };
            const RoleIcon = roleInfo.icon;
            const isMyDelegate = myDelegateIds.has(del.id);
            const isMe = user?.id === del.id;

            return (
              <div
                key={del.id}
                className="group rounded-lg border border-[var(--border)] p-3.5 md:p-4 transition-all hover:border-violet-500/50 hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar size="md" color={roleInfo.color === "orange" ? "orange" : roleInfo.color === "green" ? "green" : "cyan"}>
                      <AvatarFallback>
                        {(del.display_name || "?")[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">
                          {del.display_name || "Anonyme"}
                        </h3>
                        <Badge variant={roleInfo.color}>
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                        </Badge>
                        {isMyDelegate && (
                          <Badge variant="violet" className="text-xs">
                            Ma delegation
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {del.delegation_count ?? 0} delegation{(del.delegation_count ?? 0) > 1 ? "s" : ""}
                        </span>
                        {del.created_at && (
                          <span>
                            Membre depuis le{" "}
                            {new Date(del.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  {!isMe && !isMyDelegate && (
                    <Button
                      size="sm"
                      onClick={() => handleDelegate(del.id)}
                      disabled={acting === del.id}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      Deleguer
                    </Button>
                  )}
                  {!isMe && isMyDelegate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevoke("all")}
                      disabled={acting === "revoke"}
                      className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                    >
                      <X className="h-3.5 w-3.5" />
                      Revoquer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
