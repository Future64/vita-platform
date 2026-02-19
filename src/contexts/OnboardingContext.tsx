"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ONBOARDING_STEPS, TOUR_STEPS } from "@/lib/onboarding";
import type { OnboardingState } from "@/types/onboarding";

const STORAGE_KEY = "vita_onboarding";

const DEFAULT_STATE: OnboardingState = {
  completedSteps: [],
  dismissed: false,
  tourCompleted: false,
  tourActive: false,
  tourCurrentStep: 0,
  firstLogin: true,
};

interface OnboardingContextType {
  state: OnboardingState;
  completedCount: number;
  totalSteps: number;
  progress: number; // 0–100
  completeStep: (stepId: string) => void;
  resetOnboarding: () => void;
  dismissChecklist: () => void;
  showChecklist: () => void;
  startTourGuide: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTourGuide: () => void;
  isStepCompleted: (stepId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const [state, setState] = useState<OnboardingState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const key = `${STORAGE_KEY}_${user.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingState;
        setState(parsed);
      } else {
        // First time — mark as first login
        setState({ ...DEFAULT_STATE, firstLogin: true });
      }
    } catch {
      setState(DEFAULT_STATE);
    }
    setLoaded(true);
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    if (!user || !loaded) return;
    const key = `${STORAGE_KEY}_${user.id}`;
    localStorage.setItem(key, JSON.stringify(state));
  }, [state, user, loaded]);

  // Auto-complete steps based on page visits
  useEffect(() => {
    if (!loaded || !user) return;

    for (const step of ONBOARDING_STEPS) {
      if (state.completedSteps.includes(step.id)) continue;
      if (!step.lien) continue;

      // Check if current pathname matches the step's link
      if (pathname === step.lien || pathname.startsWith(step.lien + "/")) {
        setState((prev) => {
          if (prev.completedSteps.includes(step.id)) return prev;
          return {
            ...prev,
            completedSteps: [...prev.completedSteps, step.id],
            firstLogin: false,
          };
        });
      }
    }
  }, [pathname, loaded, user, state.completedSteps]);

  const completeStep = useCallback((stepId: string) => {
    setState((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
        firstLogin: false,
      };
    });
  }, []);

  const resetOnboarding = useCallback(() => {
    setState({ ...DEFAULT_STATE, firstLogin: false });
  }, []);

  const dismissChecklist = useCallback(() => {
    setState((prev) => ({ ...prev, dismissed: true }));
  }, []);

  const showChecklist = useCallback(() => {
    setState((prev) => ({ ...prev, dismissed: false }));
  }, []);

  const startTourGuide = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tourActive: true,
      tourCurrentStep: 0,
      firstLogin: false,
    }));
  }, []);

  const nextTourStep = useCallback(() => {
    setState((prev) => {
      const next = prev.tourCurrentStep + 1;
      if (next >= TOUR_STEPS.length) {
        return { ...prev, tourActive: false, tourCompleted: true, tourCurrentStep: 0 };
      }
      return { ...prev, tourCurrentStep: next };
    });
  }, []);

  const prevTourStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tourCurrentStep: Math.max(0, prev.tourCurrentStep - 1),
    }));
  }, []);

  const endTourGuide = useCallback(() => {
    setState((prev) => ({
      ...prev,
      tourActive: false,
      tourCompleted: true,
      tourCurrentStep: 0,
    }));
  }, []);

  const isStepCompleted = useCallback(
    (stepId: string) => state.completedSteps.includes(stepId),
    [state.completedSteps]
  );

  const completedCount = state.completedSteps.length;
  const totalSteps = ONBOARDING_STEPS.length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <OnboardingContext.Provider
      value={{
        state,
        completedCount,
        totalSteps,
        progress,
        completeStep,
        resetOnboarding,
        dismissChecklist,
        showChecklist,
        startTourGuide,
        nextTourStep,
        prevTourStep,
        endTourGuide,
        isStepCompleted,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  }
  return ctx;
}
