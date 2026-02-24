"use client";

import { useRouter } from "next/navigation";
import { Wallet, Coins, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  {
    icon: Wallet,
    title: "Portefeuille cree",
    desc: "Votre wallet VITA est pret",
  },
  {
    icon: Coins,
    title: "1 Ѵ par jour",
    desc: "Votre emission commence demain",
  },
  {
    icon: Vote,
    title: "Votez sur les regles",
    desc: "Participez a la gouvernance",
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(139, 92, 246, 0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex max-w-md flex-col items-center text-center">
        {/* Block 1: Welcome title */}
        <h1
          className="mb-2 text-3xl font-bold"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fadeInUp 0.6s ease-out both",
          }}
        >
          Bienvenue dans VITA
        </h1>

        {/* Block 2: Username */}
        <p
          className="mb-8 text-lg text-[var(--text-secondary)]"
          style={{
            animation: "fadeInUp 0.6s ease-out 0.15s both",
          }}
        >
          @{user?.username || "utilisateur"}
        </p>

        {/* Block 3: Big Ѵ symbol */}
        <div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
            animation: "fadeInUp 0.6s ease-out 0.3s both",
          }}
        >
          <span
            className="text-7xl font-bold"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "pulse 3s ease-in-out infinite",
              filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))",
            }}
          >
            Ѵ
          </span>
        </div>

        {/* Block 4: Subtitle */}
        <p
          className="mb-8 text-lg font-medium"
          style={{
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "fadeInUp 0.6s ease-out 0.45s both",
          }}
        >
          Votre premier Ѵ vous attend
        </p>

        {/* Block 5: Feature cards */}
        <div className="mb-10 grid w-full gap-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex items-center gap-4 rounded-xl border p-4"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(8px)",
                  animation: `fadeInUp 0.5s ease-out ${0.6 + i * 0.12}s both`,
                }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                  }}
                >
                  <Icon className="h-5 w-5 text-violet-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {feat.title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => router.push("/panorama")}
          style={{
            animation: "fadeInUp 0.5s ease-out 1s both",
          }}
        >
          Decouvrir VITA
        </Button>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
