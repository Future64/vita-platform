"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  Wallet,
  Award,
  Activity,
  TrendingUp,
  Vote,
  GitBranch,
  Calendar,
  Mail,
  Plus,
  Globe,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Clock,
  Briefcase,
  Star,
  StarHalf,
  MapPin,
  BadgeCheck,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  Trash2,
  GripVertical,
  Link as LinkIcon,
  X,
  Search,
  Loader2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { StatCard } from "@/components/ui/stat-card";
import { EventTimeline } from "@/components/ui/event-timeline";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { SubTabs, SubTabsList, SubTabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EditableSection } from "@/components/ui/EditableSection";
import { ProfileCompletion } from "@/components/modules/civis/ProfileCompletion";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import { ROLE_METADATA } from "@/lib/permissions";
import { PhotoUpload } from "@/components/modules/civis/PhotoUpload";
import { AvatarGenere } from "@/components/modules/civis/AvatarGenere";
import type { ModeVisibilite, IdentitePublique, IdentiteProfessionnelle } from "@/types/auth";

// ─── Sidebar ───
const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: ShieldCheck, label: "Verification", href: "/civis/verification" },
  { icon: UserCheck, label: "Parrainages", href: "/civis/parrainages" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activite", href: "/civis/activity" },
  { icon: Award, label: "Recompenses", href: "/civis/achievements" },
];

// ─── Constants ───
const recentActivity = [
  { date: "Aujourd'hui", title: "Vote sur proposition ecologique", description: "A vote POUR la reforme des bonus ecologiques", variant: "green" as const },
  { date: "Hier", title: "Contribution au projet Constitution v3", description: "Commit: Add article 47 on AI Ethics", variant: "violet" as const },
  { date: "Il y a 3j", title: "Nouvelle proposition creee", description: "Reforme du systeme de transport public", variant: "orange" as const },
  { date: "Il y a 5j", title: "Recompense recue", description: "+50 Ѵ pour contribution exceptionnelle", variant: "cyan" as const },
];

const SUGGESTED_INTERESTS = [
  "Economie", "Politique", "Ecologie", "Technologie",
  "Education", "Sante", "Culture", "Sciences",
  "Droit", "Philosophie", "Finance", "Art",
];

const COUNTRY_LIST = [
  "France", "Maroc", "Belgique", "Japon", "Suisse", "Allemagne",
  "Espagne", "Italie", "Etats-Unis", "Canada", "Bresil", "Tunisie",
  "Senegal", "Algerie", "Portugal", "Royaume-Uni", "Pays-Bas", "Cameroun",
  "Cote d'Ivoire", "Republique Democratique du Congo",
];

const COUNTRY_FLAGS: Record<string, string> = {
  France: "\u{1F1EB}\u{1F1F7}", Maroc: "\u{1F1F2}\u{1F1E6}",
  Belgique: "\u{1F1E7}\u{1F1EA}", Japon: "\u{1F1EF}\u{1F1F5}",
  Suisse: "\u{1F1E8}\u{1F1ED}", Allemagne: "\u{1F1E9}\u{1F1EA}",
  Espagne: "\u{1F1EA}\u{1F1F8}", Italie: "\u{1F1EE}\u{1F1F9}",
  "Etats-Unis": "\u{1F1FA}\u{1F1F8}", Canada: "\u{1F1E8}\u{1F1E6}",
  Bresil: "\u{1F1E7}\u{1F1F7}", Tunisie: "\u{1F1F9}\u{1F1F3}",
  Senegal: "\u{1F1F8}\u{1F1F3}",
};

const LANGUAGE_LIST = [
  "Francais", "Anglais", "Espagnol", "Arabe", "Allemand",
  "Portugais", "Japonais", "Chinois", "Italien", "Russe",
  "Neerlandais", "Wolof", "Berbere", "Turc", "Hindi",
];

const SKILL_LEVELS = {
  debutant: { label: "Debutant", value: 25, color: "#64748b" },
  intermediaire: { label: "Intermediaire", value: 50, color: "#06b6d4" },
  avance: { label: "Avance", value: 75, color: "#8b5cf6" },
  expert: { label: "Expert", value: 100, color: "#ec4899" },
} as const;

type SkillLevel = keyof typeof SKILL_LEVELS;

const VERIFICATION_STATUS = {
  non_verifie: { label: "Non verifie", color: "#64748b", icon: ShieldX, bg: "rgba(100,116,139,0.1)" },
  en_cours: { label: "En cours", color: "#f59e0b", icon: ShieldAlert, bg: "rgba(245,158,11,0.1)" },
  verifie: { label: "Verifie", color: "#10b981", icon: ShieldCheck, bg: "rgba(16,185,129,0.1)" },
  expire: { label: "Expire", color: "#ef4444", icon: ShieldX, bg: "rgba(239,68,68,0.1)" },
  rejete: { label: "Rejete", color: "#ef4444", icon: ShieldX, bg: "rgba(239,68,68,0.1)" },
};

const MODE_OPTIONS: { value: ModeVisibilite; label: string; description: string; icon: typeof Eye }[] = [
  { value: "complet", label: "Identite complete", description: "Prenom, nom et photo visibles", icon: Eye },
  { value: "pseudonyme", label: "Pseudonyme", description: "Seul votre pseudo est visible", icon: UserCheck },
  { value: "anonyme", label: "Anonyme", description: "Citoyen #ID, aucune info visible", icon: EyeOff },
];

const SECTEURS = [
  "Technologie", "Sante", "Education", "Finance", "Commerce",
  "Artisanat", "Agriculture", "Transport", "Communication", "Droit",
  "Ingenierie", "Art & Culture", "Sciences", "Social", "Autre",
];

const EXPERIENCES = [
  "Debutant (< 2 ans)", "Junior (2-5 ans)", "Confirme (5-10 ans)",
  "Senior (10-15 ans)", "Expert (15+ ans)",
];

function renderStars(note: number) {
  const stars = [];
  const full = Math.floor(note);
  const half = note % 1 >= 0.5;
  for (let i = 0; i < full; i++) stars.push(<Star key={`f${i}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />);
  if (half) stars.push(<StarHalf key="h" className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />);
  const remaining = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < remaining; i++) stars.push(<Star key={`e${i}`} className="h-3.5 w-3.5 text-[var(--text-muted)]" />);
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

// ─── Unsaved Changes Modal ───
function UnsavedChangesModal({ onDiscard, onStay }: { onDiscard: () => void; onStay: () => void }) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onStay} />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-6 shadow-lg"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Modifications non sauvegardees</h3>
            <p className="text-sm text-[var(--text-muted)]">Vous avez des changements en cours.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onDiscard}>Quitter sans sauvegarder</Button>
          <Button size="sm" onClick={onStay}>Rester et continuer</Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function CivisProfilePage() {
  const {
    user, activeRole,
    updateIdentitePublique, updateIdentiteProfessionnelle,
    setModeVisibilite,
  } = useAuth();
  const { toast } = useToast();
  const roleMeta = ROLE_METADATA[activeRole];

  // ─── Which section is currently editing ───
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);

  // ─── Public Info Edit State ───
  const [editBio, setEditBio] = useState("");
  const [editSiteWeb, setEditSiteWeb] = useState("");
  const [editReseaux, setEditReseaux] = useState<Record<string, string>>({});
  const [editPseudo, setEditPseudo] = useState("");
  const [editPays, setEditPays] = useState("");
  const [editLangues, setEditLangues] = useState<string[]>([]);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [paysSearch, setPaysSearch] = useState("");
  const [langueSearch, setLangueSearch] = useState("");
  const [showPaysDropdown, setShowPaysDropdown] = useState(false);
  const [showLangueDropdown, setShowLangueDropdown] = useState(false);
  const [editDateVisible, setEditDateVisible] = useState(true);

  // ─── Validation errors ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Pro Edit State ───
  const [editProTitre, setEditProTitre] = useState("");
  const [editProSecteur, setEditProSecteur] = useState("");
  const [editProExperience, setEditProExperience] = useState("");
  const [editProDescription, setEditProDescription] = useState("");
  const [editProDisponibilite, setEditProDisponibilite] = useState<"disponible" | "occupe" | "indisponible">("indisponible");
  const [editProZones, setEditProZones] = useState<string[]>([]);
  const [editZoneInput, setEditZoneInput] = useState("");

  // ─── Competences Edit State ───
  const [editCompetences, setEditCompetences] = useState<{ nom: string; niveau: SkillLevel }[]>([]);
  const [newCompetence, setNewCompetence] = useState("");

  // ─── Certifications Edit State ───
  const [editCertifications, setEditCertifications] = useState<{ nom: string; organisme: string; date: string; verifie: boolean }[]>([]);

  // ─── Coefficients Edit State ───
  const [editCoefficients, setEditCoefficients] = useState({ formation: 0, penibilite: 0, responsabilite: 0, rarete: 0 });

  // ─── Portfolio Edit State ───
  const [editRealisations, setEditRealisations] = useState<{ titre: string; description: string; date: string; lien: string }[]>([]);

  // ─── beforeunload warning ───
  useEffect(() => {
    if (!editingSection) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editingSection]);

  if (!user) return null;
  if (!user.identitePublique || !user.identiteVerifiee || !user.identiteProfessionnelle) return null;

  const pub = user.identitePublique;
  const verif = user.identiteVerifiee;
  const pro = user.identiteProfessionnelle;
  const mode = pub.modeVisibilite;
  const verifStatus = VERIFICATION_STATUS[verif.statut];
  const VerifIcon = verifStatus.icon;
  const countryFlag = user.pays ? COUNTRY_FLAGS[user.pays] ?? "\u{1F30D}" : "\u{1F30D}";

  // Display name based on mode
  let displayName: string;
  let initials: string;
  switch (mode) {
    case "complet":
      displayName = `${pub.prenom || ""} ${pub.nom || ""}`.trim() || user.username;
      initials = pub.prenom && pub.nom ? `${pub.prenom.charAt(0)}${pub.nom.charAt(0)}`.toUpperCase() : user.username.slice(0, 2).toUpperCase();
      break;
    case "pseudonyme":
      displayName = pub.pseudonyme || user.username;
      initials = displayName.slice(0, 2).toUpperCase();
      break;
    case "anonyme":
      displayName = `Citoyen #${user.id.slice(-6)}`;
      initials = "??";
      break;
  }

  // ─── Section editing helpers ───
  function tryStartEditing(section: string) {
    if (editingSection && editingSection !== section) {
      setPendingSection(section);
      setShowUnsavedModal(true);
      return;
    }
    startEditingSection(section);
  }

  function startEditingSection(section: string) {
    setErrors({});
    switch (section) {
      case "publicInfo":
        setEditBio(pub.bio ?? "");
        setEditSiteWeb(pub.siteWeb ?? "");
        setEditReseaux({
          twitter: pub.reseauxSociaux?.twitter ?? "",
          github: pub.reseauxSociaux?.github ?? "",
          linkedin: pub.reseauxSociaux?.linkedin ?? "",
        });
        setEditPseudo(pub.pseudonyme ?? "");
        setEditPays(pub.paysAffiche ?? "");
        setEditLangues(pub.langues ?? []);
        setEditInterests(pub.centresInteret ?? []);
        setEditDateVisible(pub.dateInscriptionVisible);
        break;
      case "proInfo":
        setEditProTitre(pro.titre ?? "");
        setEditProSecteur(pro.secteur ?? "");
        setEditProExperience(pro.experience ?? "");
        setEditProDescription(pro.description ?? "");
        setEditProDisponibilite(pro.disponibilite);
        setEditProZones(pro.zonesIntervention ?? []);
        break;
      case "competences":
        setEditCompetences((pro.competences ?? []).map((c) => ({ nom: c.nom, niveau: c.niveau })));
        setNewCompetence("");
        break;
      case "certifications":
        setEditCertifications((pro.certifications ?? []).map((c) => ({ nom: c.nom, organisme: c.organisme ?? "", date: c.date ?? "", verifie: c.verifie })));
        break;
      case "tarification":
        setEditCoefficients(pro.coefficients ?? { formation: 0, penibilite: 0, responsabilite: 0, rarete: 0 });
        break;
      case "portfolio":
        setEditRealisations((pro.realisations ?? []).map((r) => ({ titre: r.titre, description: r.description, date: r.date ?? "", lien: r.lien ?? "" })));
        break;
    }
    setEditingSection(section);
  }

  function cancelEditing() {
    setEditingSection(null);
    setErrors({});
  }

  function handleUnsavedDiscard() {
    setShowUnsavedModal(false);
    setEditingSection(null);
    if (pendingSection) {
      startEditingSection(pendingSection);
      setPendingSection(null);
    }
  }

  function handleUnsavedStay() {
    setShowUnsavedModal(false);
    setPendingSection(null);
  }

  // ─── Validate URL ───
  function isValidUrl(url: string): boolean {
    if (!url) return true;
    try { new URL(url); return true; } catch { return false; }
  }

  // ─── Save functions ───
  async function savePublicInfo() {
    const newErrors: Record<string, string> = {};
    if (editBio.length > 300) newErrors.bio = "La bio ne doit pas depasser 300 caracteres";
    if (editSiteWeb && !isValidUrl(editSiteWeb)) newErrors.siteWeb = "URL invalide";
    if (editLangues.length > 8) newErrors.langues = "Maximum 8 langues";
    if (editInterests.length > 10) newErrors.interests = "Maximum 10 centres d'interet";
    if (mode === "pseudonyme" && !editPseudo.trim()) newErrors.pseudo = "Le pseudonyme est requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSavingSection("publicInfo");
    await new Promise((r) => setTimeout(r, 500));

    const updates: Partial<IdentitePublique> = {
      bio: editBio,
      siteWeb: editSiteWeb || undefined,
      reseauxSociaux: {
        twitter: editReseaux.twitter || undefined,
        github: editReseaux.github || undefined,
        linkedin: editReseaux.linkedin || undefined,
      },
      paysAffiche: editPays || undefined,
      langues: editLangues,
      centresInteret: editInterests,
      dateInscriptionVisible: editDateVisible,
    };
    if (mode === "pseudonyme") {
      updates.pseudonyme = editPseudo;
    }
    updateIdentitePublique(updates);
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Informations publiques mises a jour");
  }

  async function saveProInfo() {
    const newErrors: Record<string, string> = {};
    if (editProDescription.length > 500) newErrors.proDesc = "La description ne doit pas depasser 500 caracteres";
    if (editProZones.length > 5) newErrors.proZones = "Maximum 5 zones d'intervention";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSavingSection("proInfo");
    await new Promise((r) => setTimeout(r, 500));

    updateIdentiteProfessionnelle({
      titre: editProTitre || undefined,
      secteur: editProSecteur || undefined,
      experience: editProExperience || undefined,
      description: editProDescription || undefined,
      disponibilite: editProDisponibilite,
      zonesIntervention: editProZones,
    });
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Informations professionnelles mises a jour");
  }

  async function saveCompetences() {
    if (editCompetences.length > 15) {
      setErrors({ competences: "Maximum 15 competences" });
      return;
    }
    setSavingSection("competences");
    await new Promise((r) => setTimeout(r, 500));
    updateIdentiteProfessionnelle({ competences: editCompetences });
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Competences mises a jour");
  }

  async function saveCertifications() {
    setSavingSection("certifications");
    await new Promise((r) => setTimeout(r, 500));
    updateIdentiteProfessionnelle({ certifications: editCertifications });
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Certifications mises a jour");
  }

  async function saveTarification() {
    setSavingSection("tarification");
    await new Promise((r) => setTimeout(r, 500));
    const baseRate = 1; // 1 Ѵ/h base
    const totalCoeff = 1 + editCoefficients.formation + editCoefficients.penibilite + editCoefficients.responsabilite + editCoefficients.rarete;
    updateIdentiteProfessionnelle({
      coefficients: editCoefficients,
      tarifHoraire: parseFloat((baseRate * totalCoeff).toFixed(2)),
    });
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Tarification mise a jour");
  }

  async function savePortfolio() {
    if (editRealisations.length > 10) {
      setErrors({ portfolio: "Maximum 10 realisations" });
      return;
    }
    setSavingSection("portfolio");
    await new Promise((r) => setTimeout(r, 500));
    updateIdentiteProfessionnelle({ realisations: editRealisations });
    setSavingSection(null);
    setEditingSection(null);
    toast.success("Portfolio mis a jour");
  }

  function handleModeChange(newMode: ModeVisibilite) {
    setModeVisibilite(newMode);
    toast.success(`Mode de visibilite : ${newMode}`);
  }

  function handlePhotoChange(photo: string | null) {
    updateIdentitePublique({ photoProfil: photo ?? undefined });
    toast.success(photo ? "Photo mise a jour" : "Photo supprimee");
  }

  // ─── Avatar renderer ───
  function renderAvatar(size: number, editable = false) {
    if (mode === "complet") {
      if (editable) {
        return <PhotoUpload currentPhoto={pub.photoProfil} initials={initials} onPhotoChange={handlePhotoChange} size={size} />;
      }
      if (pub.photoProfil) {
        return <img src={pub.photoProfil} alt={displayName} className="rounded-full object-cover" style={{ width: size, height: size }} />;
      }
      return (
        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white font-bold" style={{ width: size, height: size, fontSize: size * 0.25 }}>
          {initials}
        </div>
      );
    }
    if (mode === "pseudonyme") return <AvatarGenere pseudo={displayName} size={size} />;
    return (
      <div className="flex items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]" style={{ width: size, height: size }}>
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  }

  // ─── Tarif calculation ───
  const calculatedTarif = (1 + editCoefficients.formation + editCoefficients.penibilite + editCoefficients.responsabilite + editCoefficients.rarete).toFixed(2);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {showUnsavedModal && <UnsavedChangesModal onDiscard={handleUnsavedDiscard} onStay={handleUnsavedStay} />}

      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="shrink-0">{renderAvatar(120, mode === "complet")}</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-1">{displayName}</h1>
              {mode === "complet" && <p className="text-xs md:text-sm text-[var(--text-muted)] mb-2">@{user.username}</p>}
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: `${roleMeta.color}20`, color: roleMeta.color }}>
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: roleMeta.color }} />
                  {roleMeta.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: verifStatus.bg, color: verifStatus.color }}>
                  <VerifIcon className="h-3 w-3" />
                  {verifStatus.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  {mode === "complet" ? <Eye className="h-3 w-3" /> : mode === "pseudonyme" ? <UserCheck className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                {pub.dateInscriptionVisible && (
                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Membre depuis {user.dateInscription}</span>
                )}
                {mode === "complet" && pub.paysAffiche && (
                  <span className="flex items-center gap-1">{countryFlag} {pub.paysAffiche}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solde VITA + Stats */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-1">Solde VITA</p>
              <p className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                {formatNumber(user.soldeVita)} <span className="text-violet-500">Ѵ</span>
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))" }}>
              <Wallet className="h-7 w-7 text-violet-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 md:mb-6 grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
        <StatCard variant="violet" label="Jours actifs" value={user.joursActifs.toString()} />
        <StatCard variant="cyan" label="Propositions" value={user.propositionsCreees.toString()} />
        <StatCard variant="green" label="Votes" value={user.votesEffectues.toString()} />
        <StatCard variant="orange" label="Reputation" value={user.scoreReputation.toString()} trend={{ value: "+5", direction: "up" }} />
      </div>

      {/* Tabs */}
      <SubTabs defaultValue="profil">
        <SubTabsList>
          <SubTabsTrigger value="profil">Profil public</SubTabsTrigger>
          <SubTabsTrigger value="identite">Identite verifiee</SubTabsTrigger>
          <SubTabsTrigger value="pro">Profil professionnel</SubTabsTrigger>
          <SubTabsTrigger value="activite">Activite</SubTabsTrigger>
        </SubTabsList>

        {/* ═══════ TAB: PROFIL PUBLIC ═══════ */}
        <TabsContent value="profil">
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">

              {/* ─── Mode de visibilite ─── */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                    <CardTitle>Mode de visibilite</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {MODE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = mode === opt.value;
                      return (
                        <PermissionGate key={opt.value} permission="edit_own_profile" hide>
                          <button
                            onClick={() => handleModeChange(opt.value)}
                            className="relative rounded-lg border p-4 text-left transition-all"
                            style={{
                              borderColor: isActive ? "#8b5cf6" : "var(--border)",
                              backgroundColor: isActive ? "rgba(139,92,246,0.08)" : "transparent",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4" style={{ color: isActive ? "#8b5cf6" : "var(--text-muted)" }} />
                              <span className="text-sm font-semibold" style={{ color: isActive ? "#8b5cf6" : "var(--text-primary)" }}>{opt.label}</span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)]">{opt.description}</p>
                            {isActive && <div className="absolute right-2 top-2"><BadgeCheck className="h-4 w-4 text-violet-500" /></div>}
                          </button>
                        </PermissionGate>
                      );
                    })}
                  </div>
                  {mode === "anonyme" && (
                    <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          En mode anonyme, votre profil ne sera pas visible par les autres utilisateurs.
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Preview */}
                  <div className="mt-4 rounded-lg border p-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
                    <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Apercu : les autres vous voient ainsi</p>
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">{renderAvatar(48)}</div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{displayName}</p>
                        {mode === "complet" && <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>}
                        {mode === "pseudonyme" && <p className="text-xs text-[var(--text-muted)]">Pseudonyme</p>}
                        {mode === "anonyme" && <p className="text-xs text-[var(--text-muted)]">Identite masquee</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ─── Informations publiques ─── */}
              <EditableSection
                title="Informations publiques"
                icon={User}
                isEditing={editingSection === "publicInfo"}
                saving={savingSection === "publicInfo"}
                onEdit={() => tryStartEditing("publicInfo")}
                onSave={savePublicInfo}
                onCancel={cancelEditing}
                editForm={
                  <div className="space-y-4">
                    {/* Pseudonyme (mode pseudonyme only) */}
                    {mode === "pseudonyme" && (
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Pseudonyme *</label>
                        <Input
                          value={editPseudo}
                          onChange={(e) => setEditPseudo(e.target.value)}
                          placeholder="Votre pseudonyme"
                          style={errors.pseudo ? { borderColor: "#ef4444" } : undefined}
                        />
                        {errors.pseudo && <p className="mt-1 text-xs text-red-500">{errors.pseudo}</p>}
                      </div>
                    )}

                    {/* Bio */}
                    <div>
                      <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                        <span>Bio</span>
                        <span className={editBio.length > 300 ? "text-red-500" : ""}>{editBio.length}/300</span>
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        maxLength={300}
                        rows={3}
                        className="w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:border-violet-500 focus:outline-none placeholder:opacity-60"
                        style={{
                          borderColor: errors.bio ? "#ef4444" : "var(--border)",
                          backgroundColor: "var(--bg-elevated)",
                          color: "var(--text-primary)",
                        }}
                        placeholder="Parlez de vous..."
                      />
                      {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
                    </div>

                    {/* Pays */}
                    <div className="relative">
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Pays</label>
                      <div className="relative">
                        <Input
                          value={paysSearch || editPays}
                          onChange={(e) => { setPaysSearch(e.target.value); setShowPaysDropdown(true); }}
                          onFocus={() => setShowPaysDropdown(true)}
                          placeholder="Rechercher un pays..."
                          icon={<Search className="h-4 w-4" />}
                        />
                        {editPays && !paysSearch && (
                          <button
                            onClick={() => { setEditPays(""); setPaysSearch(""); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {showPaysDropdown && (
                        <div
                          className="absolute left-0 top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                        >
                          {COUNTRY_LIST
                            .filter((c) => c.toLowerCase().includes((paysSearch || "").toLowerCase()))
                            .map((country) => (
                              <button
                                key={country}
                                onClick={() => { setEditPays(country); setPaysSearch(""); setShowPaysDropdown(false); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                              >
                                <span>{COUNTRY_FLAGS[country] ?? "\u{1F30D}"}</span>
                                <span>{country}</span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Langues */}
                    <div>
                      <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                        <span>Langues</span>
                        <span className={editLangues.length > 8 ? "text-red-500" : ""}>{editLangues.length}/8</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editLangues.map((lang) => (
                          <span key={lang} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>
                            {lang}
                            <button onClick={() => setEditLangues(editLangues.filter((l) => l !== lang))}><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                      {editLangues.length < 8 && (
                        <div className="relative">
                          <Input
                            value={langueSearch}
                            onChange={(e) => { setLangueSearch(e.target.value); setShowLangueDropdown(true); }}
                            onFocus={() => setShowLangueDropdown(true)}
                            placeholder="Ajouter une langue..."
                          />
                          {showLangueDropdown && langueSearch && (
                            <div
                              className="absolute left-0 top-full z-50 mt-1 max-h-36 w-full overflow-y-auto rounded-lg border shadow-lg"
                              style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)" }}
                            >
                              {LANGUAGE_LIST
                                .filter((l) => l.toLowerCase().includes(langueSearch.toLowerCase()) && !editLangues.includes(l))
                                .map((l) => (
                                  <button
                                    key={l}
                                    onClick={() => { setEditLangues([...editLangues, l]); setLangueSearch(""); setShowLangueDropdown(false); }}
                                    className="flex w-full px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                                  >
                                    {l}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.langues && <p className="mt-1 text-xs text-red-500">{errors.langues}</p>}
                    </div>

                    {/* Centres d'interet */}
                    <div>
                      <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                        <span>Centres d&apos;interet</span>
                        <span className={editInterests.length > 10 ? "text-red-500" : ""}>{editInterests.length}/10</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editInterests.map((interest) => (
                          <button
                            key={interest}
                            onClick={() => setEditInterests(editInterests.filter((i) => i !== interest))}
                            className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}
                          >
                            {interest} <X className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                      {editInterests.length < 10 && (
                        <div className="flex flex-wrap gap-2">
                          {SUGGESTED_INTERESTS.filter((s) => !editInterests.includes(s)).map((s) => (
                            <button
                              key={s}
                              onClick={() => setEditInterests([...editInterests, s])}
                              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:border-violet-500 hover:text-violet-500"
                              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                            >
                              <Plus className="h-3 w-3" /> {s}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.interests && <p className="mt-1 text-xs text-red-500">{errors.interests}</p>}
                    </div>

                    {/* Site web */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Site web</label>
                      <Input
                        value={editSiteWeb}
                        onChange={(e) => setEditSiteWeb(e.target.value)}
                        placeholder="https://..."
                        style={errors.siteWeb ? { borderColor: "#ef4444" } : undefined}
                      />
                      {errors.siteWeb && <p className="mt-1 text-xs text-red-500">{errors.siteWeb}</p>}
                    </div>

                    {/* Reseaux sociaux */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Twitter / X</label>
                        <Input value={editReseaux.twitter ?? ""} onChange={(e) => setEditReseaux({ ...editReseaux, twitter: e.target.value })} placeholder="@handle" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">GitHub</label>
                        <Input value={editReseaux.github ?? ""} onChange={(e) => setEditReseaux({ ...editReseaux, github: e.target.value })} placeholder="username" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">LinkedIn</label>
                        <Input value={editReseaux.linkedin ?? ""} onChange={(e) => setEditReseaux({ ...editReseaux, linkedin: e.target.value })} placeholder="username" />
                      </div>
                    </div>

                    {/* Privacy toggles */}
                    <div className="rounded-lg border p-3 space-y-3" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)" }}>
                      <p className="text-xs font-medium text-[var(--text-muted)]">Confidentialite</p>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-[var(--text-secondary)]">Afficher la date d&apos;inscription</span>
                        <button
                          onClick={() => setEditDateVisible(!editDateVisible)}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                          style={{ backgroundColor: editDateVisible ? "#8b5cf6" : "var(--border)" }}
                        >
                          <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editDateVisible ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </label>
                    </div>
                  </div>
                }
              >
                {/* Read mode */}
                <div className="space-y-4">
                  {pub.bio && <p className="text-sm text-[var(--text-secondary)]">{pub.bio}</p>}
                  {!pub.bio && <p className="text-sm text-[var(--text-muted)] italic">Aucune bio renseignee</p>}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Mail className="h-4 w-4" /> {user.email}
                    </div>
                    {pub.siteWeb && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Globe className="h-4 w-4" /> {pub.siteWeb}
                      </div>
                    )}
                  </div>
                  {/* Langues */}
                  {pub.langues && pub.langues.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Langues</p>
                      <div className="flex flex-wrap gap-2">
                        {pub.langues.map((lang) => (
                          <span key={lang} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>{lang}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Interests */}
                  {pub.centresInteret && pub.centresInteret.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Centres d&apos;interet</p>
                      <div className="flex flex-wrap gap-2">
                        {pub.centresInteret.map((interest) => (
                          <span key={interest} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: "rgba(139,92,246,0.12)", color: "#8b5cf6" }}>{interest}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Social */}
                  {pub.reseauxSociaux && Object.values(pub.reseauxSociaux).some(Boolean) && (
                    <div>
                      <p className="text-xs font-medium text-[var(--text-muted)] mb-2">Reseaux sociaux</p>
                      <div className="space-y-1.5">
                        {pub.reseauxSociaux.github && <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Globe className="h-4 w-4" /> GitHub: {pub.reseauxSociaux.github}</div>}
                        {pub.reseauxSociaux.twitter && <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Globe className="h-4 w-4" /> Twitter: {pub.reseauxSociaux.twitter}</div>}
                        {pub.reseauxSociaux.linkedin && <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Globe className="h-4 w-4" /> LinkedIn: {pub.reseauxSociaux.linkedin}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </EditableSection>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <ProfileCompletion user={user} />

              {/* Niveau de confiance */}
              <Card>
                <CardHeader><CardTitle>Niveau de confiance</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[var(--text-secondary)]">Score</span>
                    <span className="text-sm font-semibold" style={{ color: verifStatus.color }}>{verif.niveauConfiance}%</span>
                  </div>
                  <Progress value={verif.niveauConfiance} />
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {verif.statut === "verifie" ? "Identite verifiee" : verif.statut === "en_cours" ? "Verification en cours" : "Non verifie"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════ TAB: IDENTITE VERIFIEE ═══════ */}
        <TabsContent value="identite">
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {/* Statut de verification */}
              <Card>
                <CardHeader><CardTitle>Statut de verification</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: verifStatus.bg }}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: `${verifStatus.color}20` }}>
                      <VerifIcon className="h-6 w-6" style={{ color: verifStatus.color }} />
                    </div>
                    <div>
                      <p className="text-base font-semibold" style={{ color: verifStatus.color }}>{verifStatus.label}</p>
                      {verif.methodeVerification && (
                        <p className="text-sm text-[var(--text-muted)]">
                          Methode : {verif.methodeVerification === "zkp" ? "Zero-Knowledge Proof" : verif.methodeVerification === "parrainage" ? "Parrainage" : "Document officiel"}
                        </p>
                      )}
                      {verif.dateVerification && <p className="text-xs text-[var(--text-muted)]">Verifie le {new Date(verif.dateVerification).toLocaleDateString("fr-FR")}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donnees legales */}
              <Card>
                <CardHeader>
                  <CardTitle>Donnees legales</CardTitle>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                    <EyeOff className="h-3 w-3" /> Privees
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Nom legal</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{verif.nomLegal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Prenom legal</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{verif.prenomLegal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Date de naissance</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{verif.dateNaissance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Nationalite</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{verif.nationalite || "Non renseigne"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">Pays de residence</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{verif.paysResidence}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--text-muted)]">
                        Ces donnees sont chiffrees et jamais partagees avec d&apos;autres utilisateurs. Elles servent uniquement a garantir l&apos;unicite de votre identite.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parrains */}
              {verif.methodeVerification === "parrainage" && verif.parrains && (
                <Card>
                  <CardHeader><CardTitle>Parrains ({verif.parrains.length}/3)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {verif.parrains.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                              <UserCheck className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">@{p.username}</p>
                              <p className="text-xs text-[var(--text-muted)]">Atteste le {p.dateAttestation}</p>
                            </div>
                          </div>
                          <BadgeCheck className="h-4 w-4 text-green-500" />
                        </div>
                      ))}
                      {verif.parrains.length < 3 && (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-dashed" style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
                              <Plus className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                            <p className="text-sm text-[var(--text-muted)]">{3 - verif.parrains.length} parrain(s) manquant(s)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Historique */}
              {verif.historiqueVerifications.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Historique des verifications</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {verif.historiqueVerifications.map((h, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{
                            backgroundColor: h.statut === "accepte" ? "rgba(16,185,129,0.1)" : h.statut === "rejete" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)"
                          }}>
                            {h.statut === "accepte" ? <ShieldCheck className="h-4 w-4 text-green-500" /> : h.statut === "rejete" ? <ShieldX className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-amber-500" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{h.methode}</p>
                            <p className="text-xs text-[var(--text-muted)]">{h.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-5">
              <Card>
                <CardHeader><CardTitle>Securite du compte</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">Niveau de confiance</span>
                      <span className="text-sm font-bold" style={{ color: verifStatus.color }}>{verif.niveauConfiance}%</span>
                    </div>
                    <Progress value={verif.niveauConfiance} />
                    {verif.dateExpiration && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Expiration</span>
                        <span className="text-[var(--text-secondary)]">{new Date(verif.dateExpiration).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Email</span>
                      <span className="text-[var(--text-secondary)]">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Identifiant</span>
                      <span className="font-mono text-[var(--text-muted)]">{user.id}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══════ TAB: PROFIL PROFESSIONNEL ═══════ */}
        <TabsContent value="pro">
          {pro.active ? (
            <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-5">

                {/* ─── Informations generales ─── */}
                <EditableSection
                  title="Informations generales"
                  icon={Briefcase}
                  isEditing={editingSection === "proInfo"}
                  saving={savingSection === "proInfo"}
                  onEdit={() => tryStartEditing("proInfo")}
                  onSave={saveProInfo}
                  onCancel={cancelEditing}
                  editForm={
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Titre professionnel</label>
                        <Input value={editProTitre} onChange={(e) => setEditProTitre(e.target.value)} placeholder="Ex: Developpeur Full-Stack" />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Secteur</label>
                          <select
                            value={editProSecteur}
                            onChange={(e) => setEditProSecteur(e.target.value)}
                            className="flex h-10 w-full rounded-lg border px-4 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                          >
                            <option value="">Selectionner...</option>
                            {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Experience</label>
                          <select
                            value={editProExperience}
                            onChange={(e) => setEditProExperience(e.target.value)}
                            className="flex h-10 w-full rounded-lg border px-4 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                          >
                            <option value="">Selectionner...</option>
                            {EXPERIENCES.map((e) => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                          <span>Description</span>
                          <span className={editProDescription.length > 500 ? "text-red-500" : ""}>{editProDescription.length}/500</span>
                        </label>
                        <textarea
                          value={editProDescription}
                          onChange={(e) => setEditProDescription(e.target.value)}
                          maxLength={500}
                          rows={4}
                          className="w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:border-violet-500 focus:outline-none placeholder:opacity-60"
                          style={{
                            borderColor: errors.proDesc ? "#ef4444" : "var(--border)",
                            backgroundColor: "var(--bg-elevated)",
                            color: "var(--text-primary)",
                          }}
                          placeholder="Decrivez votre activite..."
                        />
                        {errors.proDesc && <p className="mt-1 text-xs text-red-500">{errors.proDesc}</p>}
                      </div>

                      {/* Disponibilite */}
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">Disponibilite</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(["disponible", "occupe", "indisponible"] as const).map((d) => {
                            const colors = { disponible: "#10b981", occupe: "#f59e0b", indisponible: "#ef4444" };
                            const labels = { disponible: "Disponible", occupe: "Occupe", indisponible: "Indisponible" };
                            const isActive = editProDisponibilite === d;
                            return (
                              <button
                                key={d}
                                onClick={() => setEditProDisponibilite(d)}
                                className="rounded-lg border p-3 text-center text-sm font-medium transition-all"
                                style={{
                                  borderColor: isActive ? colors[d] : "var(--border)",
                                  backgroundColor: isActive ? `${colors[d]}10` : "transparent",
                                  color: isActive ? colors[d] : "var(--text-secondary)",
                                }}
                              >
                                <span className={`inline-block h-2 w-2 rounded-full mb-1 ${isActive ? "" : "opacity-50"}`} style={{ backgroundColor: colors[d] }} />
                                <br />
                                {labels[d]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Zones d'intervention */}
                      <div>
                        <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                          <span>Zones d&apos;intervention</span>
                          <span className={editProZones.length > 5 ? "text-red-500" : ""}>{editProZones.length}/5</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editProZones.map((z) => (
                            <span key={z} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                              <MapPin className="h-3 w-3" /> {z}
                              <button onClick={() => setEditProZones(editProZones.filter((zz) => zz !== z))}><X className="h-3 w-3" /></button>
                            </span>
                          ))}
                        </div>
                        {editProZones.length < 5 && (
                          <div className="flex gap-2">
                            <Input value={editZoneInput} onChange={(e) => setEditZoneInput(e.target.value)} placeholder="Ajouter une zone..." />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                if (editZoneInput.trim() && !editProZones.includes(editZoneInput.trim())) {
                                  setEditProZones([...editProZones, editZoneInput.trim()]);
                                  setEditZoneInput("");
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {errors.proZones && <p className="mt-1 text-xs text-red-500">{errors.proZones}</p>}
                      </div>
                    </div>
                  }
                >
                  {/* Read mode */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                        <Briefcase className="h-5 w-5 text-violet-500" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[var(--text-primary)]">{pro.titre || "Aucun titre"}</p>
                        <p className="text-sm text-[var(--text-muted)]">{pro.secteur ?? "—"} - {pro.experience ?? "—"}</p>
                      </div>
                    </div>
                    {pro.description && <p className="text-sm text-[var(--text-secondary)]">{pro.description}</p>}
                  </div>
                </EditableSection>

                {/* ─── Competences ─── */}
                <EditableSection
                  title="Competences"
                  icon={Award}
                  isEditing={editingSection === "competences"}
                  saving={savingSection === "competences"}
                  onEdit={() => tryStartEditing("competences")}
                  onSave={saveCompetences}
                  onCancel={cancelEditing}
                  editForm={
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-[var(--text-muted)]">{editCompetences.length}/15 competences</p>
                      </div>
                      {editCompetences.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <GripVertical className="h-4 w-4 text-[var(--text-muted)] shrink-0 cursor-grab" />
                          <span className="text-sm font-medium text-[var(--text-primary)] flex-1">{comp.nom}</span>
                          <div className="flex gap-1">
                            {(Object.keys(SKILL_LEVELS) as SkillLevel[]).map((level) => (
                              <button
                                key={level}
                                onClick={() => {
                                  const updated = [...editCompetences];
                                  updated[idx] = { ...updated[idx], niveau: level };
                                  setEditCompetences(updated);
                                }}
                                className="rounded-md px-2 py-1 text-xs font-medium transition-all"
                                style={{
                                  backgroundColor: comp.niveau === level ? SKILL_LEVELS[level].color : "transparent",
                                  color: comp.niveau === level ? "white" : "var(--text-muted)",
                                  border: comp.niveau === level ? "none" : "1px solid var(--border)",
                                }}
                              >
                                {SKILL_LEVELS[level].label.charAt(0)}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => setEditCompetences(editCompetences.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                      {editCompetences.length < 15 && (
                        <div className="flex gap-2">
                          <Input
                            value={newCompetence}
                            onChange={(e) => setNewCompetence(e.target.value)}
                            placeholder="Nouvelle competence..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && newCompetence.trim()) {
                                setEditCompetences([...editCompetences, { nom: newCompetence.trim(), niveau: "intermediaire" }]);
                                setNewCompetence("");
                              }
                            }}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (newCompetence.trim()) {
                                setEditCompetences([...editCompetences, { nom: newCompetence.trim(), niveau: "intermediaire" }]);
                                setNewCompetence("");
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {errors.competences && <p className="text-xs text-red-500">{errors.competences}</p>}
                    </div>
                  }
                >
                  {/* Read mode */}
                  {pro.competences && pro.competences.length > 0 ? (
                    <div className="space-y-3">
                      {pro.competences.map((c, i) => {
                        const level = SKILL_LEVELS[c.niveau] || SKILL_LEVELS.debutant;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-[var(--text-primary)]">{c.nom}</span>
                              <span className="text-xs font-medium" style={{ color: level.color }}>{level.label}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)]">
                              <div className="h-full rounded-full transition-all" style={{ width: `${level.value}%`, backgroundColor: level.color }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">Aucune competence renseignee</p>
                  )}
                </EditableSection>

                {/* ─── Certifications ─── */}
                <EditableSection
                  title="Certifications"
                  icon={BadgeCheck}
                  isEditing={editingSection === "certifications"}
                  saving={savingSection === "certifications"}
                  onEdit={() => tryStartEditing("certifications")}
                  onSave={saveCertifications}
                  onCancel={cancelEditing}
                  editForm={
                    <div className="space-y-3">
                      {editCertifications.map((cert, idx) => (
                        <div key={idx} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center justify-between">
                            <Input
                              value={cert.nom}
                              onChange={(e) => {
                                const updated = [...editCertifications];
                                updated[idx] = { ...updated[idx], nom: e.target.value };
                                setEditCertifications(updated);
                              }}
                              placeholder="Nom de la certification"
                              className="flex-1"
                            />
                            <button onClick={() => setEditCertifications(editCertifications.filter((_, i) => i !== idx))} className="ml-2">
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={cert.organisme}
                              onChange={(e) => {
                                const updated = [...editCertifications];
                                updated[idx] = { ...updated[idx], organisme: e.target.value };
                                setEditCertifications(updated);
                              }}
                              placeholder="Organisme"
                            />
                            <Input
                              type="date"
                              value={cert.date}
                              onChange={(e) => {
                                const updated = [...editCertifications];
                                updated[idx] = { ...updated[idx], date: e.target.value };
                                setEditCertifications(updated);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditCertifications([...editCertifications, { nom: "", organisme: "", date: "", verifie: false }])}
                      >
                        <Plus className="h-4 w-4" /> Ajouter une certification
                      </Button>
                    </div>
                  }
                >
                  {pro.certifications && pro.certifications.length > 0 ? (
                    <div className="space-y-3">
                      {pro.certifications.map((cert, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <div className="flex items-center gap-3">
                            <Award className="h-5 w-5 text-violet-500" />
                            <div>
                              <p className="text-sm font-medium text-[var(--text-primary)]">{cert.nom}</p>
                              {cert.organisme && <p className="text-xs text-[var(--text-muted)]">{cert.organisme}{cert.date ? ` - ${cert.date}` : ""}</p>}
                            </div>
                          </div>
                          {cert.verifie && <BadgeCheck className="h-4 w-4 text-green-500" />}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">Aucune certification</p>
                  )}
                </EditableSection>

                {/* ─── Portfolio / Realisations ─── */}
                <EditableSection
                  title="Realisations"
                  icon={Star}
                  isEditing={editingSection === "portfolio"}
                  saving={savingSection === "portfolio"}
                  onEdit={() => tryStartEditing("portfolio")}
                  onSave={savePortfolio}
                  onCancel={cancelEditing}
                  editForm={
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-[var(--text-muted)]">{editRealisations.length}/10 realisations</p>
                      {editRealisations.map((r, idx) => (
                        <div key={idx} className="rounded-lg border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
                          <div className="flex items-center justify-between">
                            <Input
                              value={r.titre}
                              onChange={(e) => {
                                const updated = [...editRealisations];
                                updated[idx] = { ...updated[idx], titre: e.target.value };
                                setEditRealisations(updated);
                              }}
                              placeholder="Titre"
                              className="flex-1"
                            />
                            <button onClick={() => setEditRealisations(editRealisations.filter((_, i) => i !== idx))} className="ml-2">
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                            </button>
                          </div>
                          <textarea
                            value={r.description}
                            onChange={(e) => {
                              const updated = [...editRealisations];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              setEditRealisations(updated);
                            }}
                            className="w-full resize-none rounded-lg border px-4 py-2 text-sm focus:border-violet-500 focus:outline-none"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)" }}
                            placeholder="Description..."
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              value={r.date}
                              onChange={(e) => {
                                const updated = [...editRealisations];
                                updated[idx] = { ...updated[idx], date: e.target.value };
                                setEditRealisations(updated);
                              }}
                            />
                            <Input
                              value={r.lien}
                              onChange={(e) => {
                                const updated = [...editRealisations];
                                updated[idx] = { ...updated[idx], lien: e.target.value };
                                setEditRealisations(updated);
                              }}
                              placeholder="https://lien..."
                            />
                          </div>
                        </div>
                      ))}
                      {editRealisations.length < 10 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditRealisations([...editRealisations, { titre: "", description: "", date: "", lien: "" }])}
                        >
                          <Plus className="h-4 w-4" /> Ajouter une realisation
                        </Button>
                      )}
                      {errors.portfolio && <p className="text-xs text-red-500">{errors.portfolio}</p>}
                    </div>
                  }
                >
                  {pro.realisations && pro.realisations.length > 0 ? (
                    <div className="space-y-3">
                      {pro.realisations.map((r, i) => (
                        <div key={i} className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{r.titre}</p>
                            {r.date && <span className="text-xs text-[var(--text-muted)]">{r.date}</span>}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">{r.description}</p>
                          {r.lien && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-violet-500">
                              <LinkIcon className="h-3 w-3" /> {r.lien}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--text-muted)] italic">Aucune realisation</p>
                  )}
                </EditableSection>

                {/* Avis (read only) */}
                {pro.avis && pro.avis.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Avis ({pro.nombreAvis})</CardTitle>
                      {pro.noteMoyenne !== undefined && (
                        <div className="flex items-center gap-2">
                          {renderStars(pro.noteMoyenne)}
                          <span className="text-sm font-semibold text-[var(--text-primary)]">{pro.noteMoyenne.toFixed(1)}</span>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pro.avis.map((a) => (
                          <div key={a.id} className="p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                  {a.auteur.modeVisibilite === "complet" ? `@${a.auteur.username}` : a.auteur.username}
                                </span>
                                {renderStars(a.note)}
                              </div>
                              <span className="text-xs text-[var(--text-muted)]">{a.date}</span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">{a.commentaire}</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">Service : {a.service}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* ─── Tarification ─── */}
                <EditableSection
                  title="Tarification"
                  icon={Wallet}
                  isEditing={editingSection === "tarification"}
                  saving={savingSection === "tarification"}
                  onEdit={() => tryStartEditing("tarification")}
                  onSave={saveTarification}
                  onCancel={cancelEditing}
                  editForm={
                    <div className="space-y-4">
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                        <p className="text-xs text-[var(--text-muted)] mb-1">Tarif calcule</p>
                        <p className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                          {calculatedTarif} <span className="text-violet-500">Ѵ</span><span className="text-sm font-normal text-[var(--text-muted)]">/h</span>
                        </p>
                      </div>
                      {(["formation", "penibilite", "responsabilite", "rarete"] as const).map((key) => {
                        const labels = { formation: "Formation", penibilite: "Penibilite", responsabilite: "Responsabilite", rarete: "Rarete" };
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-[var(--text-muted)]">{labels[key]}</label>
                              <span className="text-xs font-semibold text-violet-500">+{(editCoefficients[key] * 100).toFixed(0)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.05"
                              value={editCoefficients[key]}
                              onChange={(e) => setEditCoefficients({ ...editCoefficients, [key]: parseFloat(e.target.value) })}
                              className="w-full accent-violet-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  }
                >
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                      {pro.tarifHoraire ?? 1} <span className="text-violet-500">Ѵ</span><span className="text-sm font-normal text-[var(--text-muted)]">/h</span>
                    </p>
                  </div>
                  {pro.coefficients && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Formation</span>
                        <span className="text-[var(--text-secondary)]">+{(pro.coefficients.formation * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Penibilite</span>
                        <span className="text-[var(--text-secondary)]">+{(pro.coefficients.penibilite * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Responsabilite</span>
                        <span className="text-[var(--text-secondary)]">+{(pro.coefficients.responsabilite * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Rarete</span>
                        <span className="text-[var(--text-secondary)]">+{(pro.coefficients.rarete * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </EditableSection>

                {/* Disponibilite (read only) */}
                <Card>
                  <CardHeader><CardTitle>Disponibilite</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${pro.disponibilite === "disponible" ? "bg-green-500" : pro.disponibilite === "occupe" ? "bg-amber-500" : "bg-red-500"}`} />
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {pro.disponibilite === "disponible" ? "Disponible" : pro.disponibilite === "occupe" ? "Occupe" : "Indisponible"}
                      </span>
                    </div>
                    {pro.zonesIntervention && pro.zonesIntervention.length > 0 && (
                      <div>
                        <p className="text-xs text-[var(--text-muted)] mb-2">Zones d&apos;intervention</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pro.zonesIntervention.map((z) => (
                            <span key={z} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                              <MapPin className="h-3 w-3" /> {z}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Profil professionnel inactif</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 max-w-md mx-auto">
                  Activez votre profil professionnel pour proposer vos services sur la Bourse VITA et etre trouve par d&apos;autres citoyens.
                </p>
                <PermissionGate permission="edit_own_profile" hide>
                  <Button onClick={() => updateIdentiteProfessionnelle({ active: true })}>
                    <Briefcase className="h-4 w-4" />
                    Activer le profil professionnel
                  </Button>
                </PermissionGate>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══════ TAB: ACTIVITE ═══════ */}
        <TabsContent value="activite">
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Activite recente</CardTitle>
                  <Button variant="ghost" size="sm" className="text-violet-500">Voir tout</Button>
                </CardHeader>
                <CardContent>
                  <EventTimeline events={recentActivity} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-5">
              <Card>
                <CardHeader><CardTitle>Niveau de reputation</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Niveau {Math.floor(user.scoreReputation / 100)}</span>
                      <span className="text-sm font-semibold text-violet-500">{user.scoreReputation} / {(Math.floor(user.scoreReputation / 100) + 1) * 100}</span>
                    </div>
                    <Progress value={user.scoreReputation % 100} />
                    <p className="text-xs text-[var(--text-muted)]">
                      Plus que {(Math.floor(user.scoreReputation / 100) + 1) * 100 - user.scoreReputation} points pour le niveau suivant
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Cette semaine</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Vote className="h-4 w-4" /> Votes</div>
                      <div className="font-semibold text-[var(--text-primary)]">{user.votesEffectues > 0 ? Math.min(user.votesEffectues, 12) : 0}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><GitBranch className="h-4 w-4" /> Contributions</div>
                      <div className="font-semibold text-[var(--text-primary)]">{user.propositionsCreees > 0 ? Math.min(user.propositionsCreees, 5) : 0}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><TrendingUp className="h-4 w-4" /> Ѵ gagnes</div>
                      <div className="font-semibold text-green-500">+{user.joursActifs > 7 ? 7 : user.joursActifs} Ѵ</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </SubTabs>
    </DashboardLayout>
  );
}
