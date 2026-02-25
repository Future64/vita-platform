"use client";

import { useState, useEffect } from "react";
import {
  IS_DEV,
  getMockState,
  setMockModule,
  type MockModule,
  type MockState,
} from "@/lib/dev/mock-toggle";

const MODULE_LABELS: Record<MockModule, string> = {
  global: "Tout",
  auth: "Auth",
  wallet: "Bourse",
  agora: "Agora",
  forge: "Forge",
  codex: "Codex",
  civis: "Civis",
  panorama: "Panorama",
  notifications: "Notifs",
};

const MODULE_ICONS: Record<MockModule, string> = {
  global: "\u{1F310}",
  auth: "\u{1F510}",
  wallet: "\u{1F4B8}",
  agora: "\u{1F5F3}\uFE0F",
  forge: "\u{270F}\uFE0F",
  codex: "\u{1F4D6}",
  civis: "\u{1F464}",
  panorama: "\u{1F3E0}",
  notifications: "\u{1F514}",
};

export function MockToggle() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<MockState>(getMockState);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setMounted(true);
    setState(getMockState());
  }, []);

  if (!IS_DEV || !mounted) return null;

  const handleToggle = (module: MockModule, value: boolean) => {
    setMockModule(module, value);
    setState(getMockState());
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    setTimeout(() => window.location.reload(), 200);
  };

  const allMocked = Object.values(state).every(Boolean);
  const noneMocked = Object.values(state).every((v) => !v);

  return (
    <>
      {/* Floating button */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "16px",
          zIndex: 9000,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: allMocked
            ? "linear-gradient(135deg, #F59E0B, #EF4444)"
            : noneMocked
              ? "linear-gradient(135deg, #22C55E, #16A34A)"
              : "linear-gradient(135deg, #7C3AED, #EC4899)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: `0 4px 20px rgba(0,0,0,0.4)${pulse ? ", 0 0 0 8px rgba(124,58,237,0.2)" : ""}`,
          transition: "all 0.3s",
          fontSize: "20px",
          userSelect: "none",
        }}
        title="Toggle donnees mock/reel"
      >
        {allMocked ? "\u{1F3AD}" : noneMocked ? "\u{1F50C}" : "\u{26A1}"}
      </div>

      {/* Control panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "140px",
            right: "16px",
            zIndex: 9001,
            width: "260px",
            background: "#0F172A",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#F1F5F9",
                }}
              >
                Mode developpement
              </div>
              <div
                style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}
              >
                {allMocked
                  ? "\u{1F3AD} Tout en mock"
                  : noneMocked
                    ? "\u{1F50C} Tout en reel"
                    : "\u{26A1} Mode mixte"}
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              \u2715
            </button>
          </div>

          {/* Global toggle */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "13px", fontWeight: "600", color: "#C4B5FD" }}
            >
              {MODULE_ICONS.global} Tout basculer
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                onClick={() => handleToggle("global", true)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  background: allMocked ? "#F59E0B" : "rgba(245,158,11,0.15)",
                  color: allMocked ? "#000" : "#F59E0B",
                }}
              >
                Mock
              </button>
              <button
                onClick={() => handleToggle("global", false)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: "600",
                  border: "none",
                  cursor: "pointer",
                  background: noneMocked
                    ? "#22C55E"
                    : "rgba(34,197,94,0.15)",
                  color: noneMocked ? "#000" : "#22C55E",
                }}
              >
                Reel
              </button>
            </div>
          </div>

          {/* Per-module toggles */}
          <div style={{ padding: "8px 0" }}>
            {(Object.keys(MODULE_LABELS) as MockModule[])
              .filter((m) => m !== "global")
              .map((module) => (
                <div
                  key={module}
                  style={{
                    padding: "8px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: state[module]
                      ? "rgba(245,158,11,0.05)"
                      : "transparent",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      color: state[module] ? "#FBBF24" : "#64748B",
                    }}
                  >
                    {MODULE_ICONS[module]} {MODULE_LABELS[module]}
                  </span>

                  {/* Toggle switch */}
                  <div
                    onClick={() => handleToggle(module, !state[module])}
                    style={{
                      width: "40px",
                      height: "22px",
                      borderRadius: "11px",
                      cursor: "pointer",
                      background: state[module]
                        ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                        : "rgba(255,255,255,0.1)",
                      position: "relative",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "white",
                        top: "3px",
                        left: state[module] ? "21px" : "3px",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Legend */}
          <div
            style={{
              padding: "10px 16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "11px",
              color: "#334155",
              display: "flex",
              gap: "12px",
            }}
          >
            <span>{"\u{1F3AD}"} = mock</span>
            <span>{"\u{1F50C}"} = backend reel</span>
          </div>
        </div>
      )}
    </>
  );
}
