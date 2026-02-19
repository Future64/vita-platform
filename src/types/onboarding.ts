// Types pour le systeme d'onboarding VITA

export type OnboardingCategory =
  | "identite"
  | "decouverte"
  | "participation"
  | "economie";

export interface OnboardingStep {
  id: string;
  category: OnboardingCategory;
  titre: string;
  description: string;
  lien?: string; // page to visit for auto-completion
  action?: string; // specific action needed (e.g. "voter", "commenter")
  icone: string;
  ordre: number;
}

export interface TourStep {
  id: string;
  target: string; // data-tour attribute selector
  titre: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

export interface OnboardingState {
  completedSteps: string[];
  dismissed: boolean;
  tourCompleted: boolean;
  tourActive: boolean;
  tourCurrentStep: number;
  firstLogin: boolean;
}
