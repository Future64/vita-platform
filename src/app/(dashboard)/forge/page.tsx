"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  GitPullRequest,
  Search,
  Lock,
  Unlock,
  ChevronRight,
  History,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getForgeDocuments, type ForgeDocumentSummary } from "@/lib/vita-api";

const sidebarItems: SidebarItem[] = [
  { icon: FileText, label: "Documents", href: "/forge" },
  { icon: History, label: "Historique", href: "/forge/commits" },
];

export default function ForgePage() {
  const [documents, setDocuments] = useState<ForgeDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const docs = await getForgeDocuments();
        setDocuments(docs);
      } catch {
        // API not available — show empty state
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return documents;
    const q = search.toLowerCase();
    return documents.filter((d) => d.title.toLowerCase().includes(q));
  }, [documents, search]);

  const lockedCount = documents.filter((d) => d.locked).length;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Forge">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
          Forge Collaborative
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          Proposez des modifications aux textes fondateurs de VITA
        </p>
      </div>

      {/* Stats */}
      <div className="mb-4 md:mb-6 grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3">
        <StatCard
          variant="violet"
          label="Documents"
          value={documents.length}
        />
        <StatCard
          variant="green"
          label="Editables"
          value={documents.length - lockedCount}
        />
        <StatCard
          variant="orange"
          label="Verrouilles"
          value={lockedCount}
        />
      </div>

      {/* Search */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-3.5 md:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <Input
              placeholder="Rechercher un document..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse text-[var(--text-muted)]">
            Chargement des documents...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description={
            search
              ? "Aucun document ne correspond a votre recherche."
              : "Les documents editables du Codex apparaitront ici."
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Link key={doc.id} href={`/forge/${doc.id}`}>
              <div className="group rounded-lg border border-[var(--border)] p-3.5 md:p-4 transition-all hover:border-violet-500/50 hover:bg-[var(--bg-elevated)] cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <FileText className="h-4 w-4 text-violet-500 flex-shrink-0" />
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">
                        {doc.title}
                      </h3>
                      {doc.locked ? (
                        <Badge className="text-xs bg-orange-500/15 text-orange-400">
                          <Lock className="h-3 w-3" />
                          Verrouille
                        </Badge>
                      ) : (
                        <Badge variant="green" className="text-xs">
                          <Unlock className="h-3 w-3" />
                          Editable
                        </Badge>
                      )}
                      <span className="text-xs text-[var(--text-muted)]">
                        v{doc.version}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-1">
                      {doc.codex_ref && (
                        <span className="flex items-center gap-1">
                          <GitPullRequest className="h-3 w-3" />
                          Art. {doc.codex_ref}
                        </span>
                      )}
                      <span>
                        Mis a jour le{" "}
                        {new Date(doc.updated_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
