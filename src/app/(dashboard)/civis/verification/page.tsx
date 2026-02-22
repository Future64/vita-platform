"use client";

import { useState } from "react";
import {
  User,
  Wallet,
  Activity,
  Award,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Users,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useVerification } from "@/contexts/VerificationContext";
import { useToast } from "@/components/ui/Toast";
import { PARRAINS_REQUIS } from "@/types/verification";

// ─── Sidebar ───
const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: ShieldCheck, label: "Verification", href: "/civis/verification" },
  { icon: Users, label: "Parrainages", href: "/civis/parrainages" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activite", href: "/civis/activity" },
  { icon: Award, label: "Recompenses", href: "/civis/achievements" },
];

export default function VerificationPage() {
  const { user } = useAuth();
  const {
    demarrerVerification,
    getDemandeForUser,
    getParrainagesPourDemande,
    renouvelerVerification,
  } = useVerification();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParrains, setSelectedParrains] = useState<string[]>([]);

  if (!user) return null;

  const statut = user.identiteVerifiee?.statut || "non_verifie";
  const demande = getDemandeForUser(user.id);
  const parrainagesList = demande ? getParrainagesPourDemande(demande.id) : [];
  const acceptedCount = parrainagesList.filter((p) => p.statut === "accepte").length;

  const handleAddParrain = () => {
    if (!searchQuery.trim()) return;
    if (selectedParrains.includes(searchQuery.trim())) {
      toast.warning("Ce parrain est deja selectionne.");
      return;
    }
    if (searchQuery.trim() === user.username) {
      toast.warning("Vous ne pouvez pas vous parrainer vous-meme.");
      return;
    }
    if (selectedParrains.length >= PARRAINS_REQUIS) {
      toast.warning(`Maximum ${PARRAINS_REQUIS} parrains.`);
      return;
    }
    setSelectedParrains([...selectedParrains, searchQuery.trim()]);
    setSearchQuery("");
  };

  const handleRemoveParrain = (username: string) => {
    setSelectedParrains(selectedParrains.filter((p) => p !== username));
  };

  const handleStartVerification = () => {
    if (selectedParrains.length < PARRAINS_REQUIS) {
      toast.warning(`Selectionnez ${PARRAINS_REQUIS} parrains pour demarrer.`);
      return;
    }
    demarrerVerification(selectedParrains);
    toast.success("Demande de verification envoyee !");
  };

  const handleRenew = () => {
    renouvelerVerification();
    toast.info("Verification reinitialisee. Vous pouvez relancer le processus.");
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Verification d&apos;identite
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Prouvez votre identite via le parrainage de 3 citoyens verifies.
          </p>
        </div>

        {/* ─── ETAT: NON VERIFIE ─── */}
        {statut === "non_verifie" && !demande && (
          <>
            {/* Explanation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span style={{ color: "rgb(59, 130, 246)" }}>
                    <ShieldAlert className="h-5 w-5" />
                  </span>
                  Comment ca marche ?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      step: "1",
                      title: "Choisissez 3 parrains",
                      desc: "Selectionnez 3 citoyens verifies qui vous connaissent personnellement.",
                    },
                    {
                      step: "2",
                      title: "Ils attestent",
                      desc: "Chaque parrain remplit une attestation confirmant votre identite.",
                    },
                    {
                      step: "3",
                      title: "Verification complete",
                      desc: "Une fois 3 attestations recues, vous devenez citoyen verifie.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex flex-col items-center text-center p-4 rounded-xl"
                      style={{ backgroundColor: "var(--bg-card)" }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold mb-3"
                        style={{
                          background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                          color: "white",
                        }}
                      >
                        {item.step}
                      </div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Select sponsors */}
            <Card>
              <CardHeader>
                <CardTitle>Selectionnez vos parrains</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <Input
                      value={searchQuery}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom d'utilisateur..."
                      className="pl-9"
                      onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleAddParrain()}
                    />
                  </div>
                  <Button variant="secondary" onClick={handleAddParrain} disabled={!searchQuery.trim()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                {/* Selected sponsors */}
                {selectedParrains.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      Parrains selectionnes ({selectedParrains.length}/{PARRAINS_REQUIS})
                    </p>
                    {selectedParrains.map((username) => (
                      <div
                        key={username}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{
                          backgroundColor: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
                            style={{
                              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                              color: "white",
                            }}
                          >
                            {username[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            @{username}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveParrain(username)}
                          className="p-1 rounded hover:bg-white/10 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Progress
                  value={(selectedParrains.length / PARRAINS_REQUIS) * 100}
                  color="violet"
                />

                <Button
                  variant="primary"
                  onClick={handleStartVerification}
                  disabled={selectedParrains.length < PARRAINS_REQUIS}
                  className="w-full"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Demarrer la verification
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── ETAT: EN COURS ─── */}
        {(statut === "en_cours" || (statut === "non_verifie" && demande?.statut === "en_cours")) && demande && (
          <>
            {/* Progress overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span style={{ color: "rgb(59, 130, 246)" }}>
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </span>
                  Verification en cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Attestations recues
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {acceptedCount} / {PARRAINS_REQUIS}
                  </span>
                </div>
                <Progress value={(acceptedCount / PARRAINS_REQUIS) * 100} color="violet" />

                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Niveau de confiance
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {demande.niveauConfiance}%
                  </span>
                </div>
                <Progress value={demande.niveauConfiance} color="cyan" />

                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Expire le{" "}
                    {new Date(demande.dateExpiration).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sponsors list */}
            <Card>
              <CardHeader>
                <CardTitle>Parrains</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {parrainagesList.map((p) => {
                  const StatusIcon =
                    p.statut === "accepte"
                      ? CheckCircle2
                      : p.statut === "refuse"
                      ? XCircle
                      : Clock;
                  const statusColor =
                    p.statut === "accepte"
                      ? "rgb(34, 197, 94)"
                      : p.statut === "refuse"
                      ? "rgb(239, 68, 68)"
                      : "rgb(245, 158, 11)";
                  const statusLabel =
                    p.statut === "accepte"
                      ? "Atteste"
                      : p.statut === "refuse"
                      ? "Refuse"
                      : "En attente";

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg"
                      style={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-default)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold"
                          style={{
                            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                            color: "white",
                          }}
                        >
                          {p.parrainUsername[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                            @{p.parrainUsername}
                          </p>
                          {p.dateReponse && (
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(p.dateReponse).toLocaleDateString("fr-FR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: statusColor }}>
                          <StatusIcon className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-medium" style={{ color: statusColor }}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}

        {/* ─── ETAT: VERIFIE ─── */}
        {statut === "verifie" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: "rgb(34, 197, 94)" }}>
                  <ShieldCheck className="h-5 w-5" />
                </span>
                Identite verifiee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "rgb(34, 197, 94)" }}>
                  Votre identite est verifiee. Vous avez acces a toutes les fonctionnalites.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Methode</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {user.identiteVerifiee.methodeVerification === "stripe_identity"
                      ? "Stripe Identity"
                      : user.identiteVerifiee.methodeVerification === "zkp"
                      ? "Zero-Knowledge Proof"
                      : "Document officiel"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Niveau de confiance</p>
                  <div className="flex items-center gap-2">
                    <Progress value={user.identiteVerifiee.niveauConfiance} color="green" />
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {user.identiteVerifiee.niveauConfiance}%
                    </span>
                  </div>
                </div>
                {user.identiteVerifiee.dateVerification && (
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Date de verification</p>
                    <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.identiteVerifiee.dateVerification).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {user.identiteVerifiee.dateExpiration && (
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Expire le</p>
                    <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(user.identiteVerifiee.dateExpiration).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Sponsors */}
              {user.identiteVerifiee.parrains && user.identiteVerifiee.parrains.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Parrains
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.identiteVerifiee.parrains.map((p) => (
                      <div
                        key={p.username}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: "rgba(34, 197, 94, 0.1)",
                          color: "rgb(34, 197, 94)",
                        }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        @{p.username}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              {user.identiteVerifiee.historiqueVerifications.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    Historique
                  </p>
                  {user.identiteVerifiee.historiqueVerifications.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs p-2 rounded"
                      style={{
                        backgroundColor: "var(--bg-card)",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>{h.methode}</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {new Date(h.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── ETAT: EXPIRE ─── */}
        {statut === "expire" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: "rgb(245, 158, 11)" }}>
                  <ShieldX className="h-5 w-5" />
                </span>
                Verification expiree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <p className="text-sm" style={{ color: "rgb(245, 158, 11)" }}>
                  Votre verification a expire. Renouvelez-la pour conserver votre acces complet aux fonctionnalites.
                </p>
              </div>

              {user.identiteVerifiee.dateExpiration && (
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Expiree le</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {new Date(user.identiteVerifiee.dateExpiration).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              {user.identiteVerifiee.dateVerification && (
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Derniere verification</p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {new Date(user.identiteVerifiee.dateVerification).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}

              <Button variant="primary" onClick={handleRenew} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Renouveler ma verification
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ─── ETAT: REJETE ─── */}
        {statut === "rejete" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: "rgb(239, 68, 68)" }}>
                  <ShieldX className="h-5 w-5" />
                </span>
                Verification rejetee
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <p className="text-sm" style={{ color: "rgb(239, 68, 68)" }}>
                  Votre demande de verification a ete rejetee. Vous pouvez soumettre une nouvelle demande.
                </p>
              </div>

              <Button variant="primary" onClick={handleRenew} className="w-full">
                <ArrowRight className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
