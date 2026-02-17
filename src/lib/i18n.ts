"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { fr, type TranslationKey } from "./translations/fr";
import { en } from "./translations/en";

export type Locale = "fr" | "en";

const translations: Record<Locale, Record<TranslationKey, string>> = { fr, en };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    // Fallback: return French translations without context
    return {
      locale: "fr",
      setLocale: () => {},
      t: (key: TranslationKey) => fr[key] ?? key,
    };
  }
  return context;
}

// Re-export for use in I18nProvider component
export { translations };
export type { TranslationKey };
