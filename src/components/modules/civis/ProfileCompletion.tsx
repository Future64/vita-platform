"use client";

import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { User } from "@/types/auth";

interface ProfileCompletionProps {
  user: User;
}

interface CompletionItem {
  label: string;
  points: number;
  completed: boolean;
  action?: string;
}

function getCompletionItems(user: User): CompletionItem[] {
  const pub = user.identitePublique;
  const pro = user.identiteProfessionnelle;
  const verif = user.identiteVerifiee;

  return [
    { label: "Photo de profil", points: 10, completed: !!pub?.photoProfil, action: "Ajouter une photo" },
    { label: "Bio", points: 10, completed: !!pub?.bio && pub.bio.length > 0, action: "Ecrire votre bio" },
    { label: "Pays", points: 5, completed: !!pub?.paysAffiche, action: "Indiquer votre pays" },
    { label: "Langues", points: 5, completed: !!pub?.langues && pub.langues.length > 0, action: "Ajouter des langues" },
    { label: "Centres d'interet", points: 10, completed: !!pub?.centresInteret && pub.centresInteret.length > 0, action: "Choisir des centres d'interet" },
    { label: "Identite verifiee", points: 20, completed: verif?.statut === "verifie" },
    { label: "Liens / Reseaux", points: 5, completed: !!pub?.siteWeb || !!(pub?.reseauxSociaux && Object.values(pub.reseauxSociaux).some(Boolean)), action: "Ajouter des liens" },
    { label: "Profil pro actif", points: 5, completed: !!pro?.active, action: "Activer le profil pro" },
    { label: "Competences", points: 10, completed: !!pro?.competences && pro.competences.length > 0, action: "Ajouter des competences" },
    { label: "Certifications", points: 5, completed: !!pro?.certifications && pro.certifications.length > 0, action: "Ajouter des certifications" },
    { label: "Tarification", points: 5, completed: !!pro?.tarifHoraire && pro.tarifHoraire > 0, action: "Definir votre tarif" },
    { label: "Portfolio", points: 5, completed: !!pro?.realisations && pro.realisations.length > 0, action: "Ajouter des realisations" },
    { label: "Avis recus", points: 5, completed: !!pro?.avis && pro.avis.length > 0 },
  ];
}

export function ProfileCompletion({ user }: ProfileCompletionProps) {
  const items = getCompletionItems(user);
  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = items.filter((i) => i.completed).reduce((sum, item) => sum + item.points, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  const suggestions = items.filter((i) => !i.completed && i.action).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion du profil</CardTitle>
        <span className="text-sm font-bold" style={{ color: percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#8b5cf6" }}>
          {percentage}%
        </span>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} />
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)]">Suggestions</p>
            {suggestions.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-[var(--bg-elevated)]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
                  >
                    +{item.points}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{item.action}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
