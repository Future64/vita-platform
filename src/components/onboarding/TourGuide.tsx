"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { TOUR_STEPS } from "@/lib/onboarding";
import { cn } from "@/lib/utils";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourGuide() {
  const { state, nextTourStep, prevTourStep, endTourGuide } = useOnboarding();
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = TOUR_STEPS[state.tourCurrentStep];
  const isFirst = state.tourCurrentStep === 0;
  const isLast = state.tourCurrentStep === TOUR_STEPS.length - 1;

  // Find target element and compute spotlight position
  const updateSpotlight = useCallback(() => {
    if (!state.tourActive || !currentStep) return;

    const target = document.querySelector(`[data-tour="${currentStep.target}"]`);
    if (target) {
      const rect = target.getBoundingClientRect();
      const padding = 6;
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    } else {
      setSpotlight(null);
    }
  }, [state.tourActive, currentStep]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);
    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [updateSpotlight]);

  // Keyboard navigation
  useEffect(() => {
    if (!state.tourActive) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        endTourGuide();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextTourStep();
      } else if (e.key === "ArrowLeft") {
        prevTourStep();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.tourActive, nextTourStep, prevTourStep, endTourGuide]);

  if (!state.tourActive || !currentStep) return null;

  // Tooltip positioning
  function getTooltipStyle(): React.CSSProperties {
    if (!spotlight) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const gap = 12;
    const style: React.CSSProperties = { position: "fixed" };

    switch (currentStep.position) {
      case "right":
        style.top = spotlight.top + spotlight.height / 2;
        style.left = spotlight.left + spotlight.width + gap;
        style.transform = "translateY(-50%)";
        // Fallback if it goes off-screen right
        if (
          spotlight.left + spotlight.width + gap + 320 >
          window.innerWidth
        ) {
          style.left = undefined;
          style.right = window.innerWidth - spotlight.left + gap;
          delete style.left;
        }
        break;
      case "left":
        style.top = spotlight.top + spotlight.height / 2;
        style.right = window.innerWidth - spotlight.left + gap;
        style.transform = "translateY(-50%)";
        break;
      case "bottom":
        style.top = spotlight.top + spotlight.height + gap;
        style.left = spotlight.left + spotlight.width / 2;
        style.transform = "translateX(-50%)";
        // Keep within viewport
        if (style.left && typeof style.left === "number" && style.left < 160) {
          style.left = 16;
          style.transform = "none";
        }
        if (style.left && typeof style.left === "number" && style.left + 160 > window.innerWidth) {
          style.left = undefined;
          style.right = 16;
          style.transform = "none";
        }
        break;
      case "top":
        style.bottom = window.innerHeight - spotlight.top + gap;
        style.left = spotlight.left + spotlight.width / 2;
        style.transform = "translateX(-50%)";
        break;
    }

    return style;
  }

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Overlay with spotlight cutout using CSS clip-path */}
      <svg
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 100 }}
        onClick={endTourGuide}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="8"
                ry="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {spotlight && (
        <div
          className="fixed rounded-lg pointer-events-none"
          style={{
            zIndex: 101,
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.6), 0 0 20px rgba(139, 92, 246, 0.3)",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[102] w-72 md:w-80"
        style={getTooltipStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-xl border shadow-lg p-4 tour-tooltip-enter"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {currentStep.titre}
              </h3>
            </div>
            <button
              onClick={endTourGuide}
              className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
            {currentStep.description}
          </p>

          {/* Footer: navigation */}
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] text-[var(--text-muted)]">
              {state.tourCurrentStep + 1} / {TOUR_STEPS.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevTourStep}
                disabled={isFirst}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                  isFirst
                    ? "text-[var(--text-muted)] opacity-40 cursor-not-allowed"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={isLast ? endTourGuide : nextTourStep}
                className="flex items-center gap-1 rounded-md bg-gradient-to-r from-violet-500 to-pink-500 px-3 py-1.5 text-xs font-medium text-white transition-transform hover:scale-105"
              >
                {isLast ? (
                  "Terminer"
                ) : (
                  <>
                    Suivant
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === state.tourCurrentStep
                    ? "w-4 bg-gradient-to-r from-violet-500 to-pink-500"
                    : i < state.tourCurrentStep
                    ? "w-1.5 bg-violet-500/40"
                    : "w-1.5 bg-[var(--border)]"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
