import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ToastProvider } from "@/components/ui/Toast";
import { I18nProvider } from "@/contexts/I18nProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VITA — Plateforme de Gouvernance Mondiale",
  description: "Système de gouvernance mondiale et monnaie universelle basée sur la valeur humaine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <I18nProvider>
            <NotificationProvider>
              <OnboardingProvider>
                <ToastProvider>{children}</ToastProvider>
              </OnboardingProvider>
            </NotificationProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
