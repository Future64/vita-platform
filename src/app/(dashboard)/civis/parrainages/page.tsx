"use client";

import { useState } from "react";
import {
  User,
  Wallet,
  Activity,
  Award,
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SubTabs, SubTabsList, SubTabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useVerification } from "@/contexts/VerificationContext";
import { useToast } from "@/components/ui/Toast";
import type { AttestationParrain } from "@/types/verification";

// ─── Sidebar ───
const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: ShieldCheck, label: "Verification", href: "/civis/verification" },
  { icon: Users, label: "Parrainages", href: "/civis/parrainages" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activite", href: "/civis/activity" },
  { icon: Award, label: "Recompenses", href: "/civis/achievements" },
];

const CONTEXTE_OPTIONS = [
  "Ami proche",
  "Collegue de travail",
  "Voisin",
  "Membre de la famille",
  "Communaute en ligne",
  "Association / ONG",
  "Autre",
];

const DUREE_OPTIONS = [
  "Moins de 6 mois",
  "6 mois a 1 an",
  "1 a 2 ans",
  "2 a 5 ans",
  "Plus de 5 ans",
];

export default function ParrainagesPage() {
  const { user } = useAuth();
  const {
    getDemandesRecues,
    getDemandesRecuesEnAttente,
    repondreParrainage,
  } = useVerification();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("en_attente");
  const [attestationForms, setAttestationForms] = useState<Record<string, {
    commentaire: string;
    connaitDepuis: string;
    contexte: string;
    engagement: boolean;
  }>>({});

  if (!user) return null;

  const allDemandes = getDemandesRecues(user.id);
  const enAttente = getDemandesRecuesEnAttente(user.id);
  const historique = allDemandes.filter((d) => d.statut !== "en_attente");

  const getFormState = (id: string) => {
    return attestationForms[id] || { commentaire: "", connaitDepuis: "", contexte: "", engagement: false };
  };

  const updateForm = (id: string, field: string, value: string | boolean) => {
    setAttestationForms((prev) => ({
      ...prev,
      [id]: { ...getFormState(id), [field]: value },
    }));
  };

  const handleAccept = (demandeId: string) => {
    const form = getFormState(demandeId);
    if (!form.commentaire.trim() || !form.connaitDepuis || !form.contexte) {
      toast.warning("Veuillez remplir tous les champs de l'attestation.");
      return;
    }
    if (!form.engagement) {
      toast.warning("Vous devez certifier sur l'honneur.");
      return;
    }
    const attestation: AttestationParrain = {
      commentaire: form.commentaire,
      connaitDepuis: form.connaitDepuis,
      contexte: form.contexte,
      engagement: true,
    };
    repondreParrainage(demandeId, true, attestation);
    toast.success("Attestation envoyee avec succes.");
  };

  const handleRefuse = (demandeId: string) => {
    repondreParrainage(demandeId, false);
    toast.info("Demande de parrainage refusee.");
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Parrainages
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Gerez les demandes de parrainage que vous avez recues.
          </p>
        </div>

        <SubTabs value={activeTab} onValueChange={setActiveTab}>
          <SubTabsList>
            <SubTabsTrigger value="en_attente">
              En attente
              {enAttente.length > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    color: "white",
                  }}
                >
                  {enAttente.length}
                </span>
              )}
            </SubTabsTrigger>
            <SubTabsTrigger value="historique">Historique</SubTabsTrigger>
          </SubTabsList>

          {/* En attente tab */}
          <TabsContent value="en_attente">
            {enAttente.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <span style={{ color: "var(--text-muted)" }}>
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  </span>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Aucune demande en attente
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Vous n&apos;avez pas de demande de parrainage en cours.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {enAttente.map((dp) => {
                  const form = getFormState(dp.id);
                  return (
                    <Card key={dp.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-base">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                              color: "white",
                            }}
                          >
                            {dp.demandeurPrenom[0].toUpperCase()}
                          </div>
                          <div>
                            <p>{dp.demandeurPrenom} (@{dp.demandeurUsername})</p>
                            <p className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                              Demande du{" "}
                              {new Date(dp.dateCreation).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Attestation form */}
                        <div className="space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                            Attestation de parrainage
                          </p>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                              Comment connaissez-vous cette personne ?
                            </label>
                            <select
                              value={form.contexte}
                              onChange={(e) => updateForm(dp.id, "contexte", e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm"
                              style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <option value="">Selectionnez...</option>
                              {CONTEXTE_OPTIONS.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                              Depuis combien de temps ?
                            </label>
                            <select
                              value={form.connaitDepuis}
                              onChange={(e) => updateForm(dp.id, "connaitDepuis", e.target.value)}
                              className="w-full rounded-lg px-3 py-2 text-sm"
                              style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <option value="">Selectionnez...</option>
                              {DUREE_OPTIONS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                              Commentaire
                            </label>
                            <textarea
                              value={form.commentaire}
                              onChange={(e) => updateForm(dp.id, "commentaire", e.target.value)}
                              placeholder="Decrivez votre relation avec cette personne..."
                              rows={3}
                              className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                              style={{
                                backgroundColor: "var(--bg-card)",
                                border: "1px solid var(--border-default)",
                                color: "var(--text-primary)",
                              }}
                            />
                          </div>

                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.engagement}
                              onChange={(e) => updateForm(dp.id, "engagement", e.target.checked)}
                              className="mt-0.5 rounded"
                            />
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Je certifie sur l&apos;honneur connaitre cette personne et atteste de son identite. Je comprends que le parrainage frauduleux peut entrainer la suspension de mon compte.
                            </span>
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() => handleAccept(dp.id)}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Attester
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleRefuse(dp.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" />
                            Refuser
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Historique tab */}
          <TabsContent value="historique">
            {historique.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <span style={{ color: "var(--text-muted)" }}>
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  </span>
                  <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Aucun historique
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Vous n&apos;avez pas encore repondu a de demande de parrainage.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {historique.map((dp) => {
                  const isAccepted = dp.statut === "accepte";
                  return (
                    <Card key={dp.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                              color: "white",
                            }}
                          >
                            {dp.demandeurPrenom[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {dp.demandeurPrenom} (@{dp.demandeurUsername})
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {new Date(dp.dateCreation).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span style={{ color: isAccepted ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
                            {isAccepted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: isAccepted ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}
                          >
                            {isAccepted ? "Atteste" : "Refuse"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </SubTabs>
      </div>
    </DashboardLayout>
  );
}
