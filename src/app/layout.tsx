import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { VerificationProvider } from "@/contexts/VerificationContext";
import { ToastProvider } from "@/components/ui/Toast";
import { SessionExpiredBanner } from "@/components/ui/SessionExpiredBanner";
import { I18nProvider } from "@/contexts/I18nProvider";
import { MockToggle } from "@/components/dev/MockToggle";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
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
          <WebSocketProvider>
            <I18nProvider>
              <NotificationProvider>
                <VerificationProvider>
                  <OnboardingProvider>
                    <ToastProvider>
                      <SessionExpiredBanner />
                      {children}
                      <MockToggle />
                    </ToastProvider>
                  </OnboardingProvider>
                </VerificationProvider>
              </NotificationProvider>
            </I18nProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
