"use client";

import { useState, useCallback, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import {
  COUNTRY_USERS,
  CITY_HOTSPOTS,
  LIVE_ACTIVITIES,
  TOTAL_ACTIVE_COUNTRIES,
  MAX_COUNTRY_USERS,
} from "@/data/mock-regions";
import { formatNumber } from "@/lib/format";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const ACTIVITY_ICONS: Record<string, string> = {
  transaction: "\u{1F504}",
  vote: "\u{1F5F3}\uFE0F",
  inscription: "\u{1F464}",
};

function getUsersForGeo(geo: { properties: { ISO_A3?: string } }): number {
  const iso = geo.properties.ISO_A3;
  if (iso && COUNTRY_USERS[iso]) return COUNTRY_USERS[iso];
  return 0;
}

function getCountryColor(users: number): string {
  if (users === 0) return "rgba(255, 255, 255, 0.06)";
  const intensity = Math.log(users + 1) / Math.log(MAX_COUNTRY_USERS + 1);
  const alpha = 0.2 + intensity * 0.5;
  return `rgba(139, 92, 246, ${alpha.toFixed(2)})`;
}

// Scale city dot radius: min 3px, max 8px based on users
function getCityRadius(city: { utilisateurs: number }): number {
  const maxUsers = CITY_HOTSPOTS[0].utilisateurs;
  const ratio = city.utilisateurs / maxUsers;
  return 3 + ratio * 5;
}

interface TooltipData {
  name: string;
  users: number;
  x: number;
  y: number;
}

const WorldActivityMapInner = memo(function WorldActivityMapInner() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 20]);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.5, 8)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.5, 1)), []);

  return (
    <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
      {/* Map SVG */}
      <ComposableMap
        projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
        width={800}
        height={450}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup
          center={center}
          zoom={zoom}
          onMoveEnd={({ coordinates, zoom: z }) => {
            setCenter(coordinates as [number, number]);
            setZoom(z);
          }}
          minZoom={1}
          maxZoom={8}
        >
          {/* Countries */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const users = getUsersForGeo(geo);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(users)}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: users > 0
                          ? "rgba(139, 92, 246, 0.7)"
                          : "rgba(139, 92, 246, 0.15)",
                        stroke: "rgba(139, 92, 246, 0.4)",
                        strokeWidth: 0.6,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(e) => {
                      setTooltip({
                        name: geo.properties.name || "Inconnu",
                        users,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                      );
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>

          {/* City hotspot markers */}
          {CITY_HOTSPOTS.map((city) => {
            const r = getCityRadius(city);
            return (
              <Marker key={city.ville} coordinates={[city.lng, city.lat]}>
                {/* Hover glow — invisible by default, shown via CSS */}
                <circle
                  className="city-glow"
                  r={r * 2}
                  fill="rgba(139, 92, 246, 0)"
                />
                {/* Core dot */}
                <circle
                  className="city-dot"
                  r={r}
                  fill="url(#cityGradient)"
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth={0.4}
                />
                {/* Label — hidden by default, shown on hover */}
                <text
                  className="city-label"
                  textAnchor="middle"
                  y={-r - 5}
                  style={{
                    fontSize: "7px",
                    fontWeight: 600,
                    fill: "rgba(255, 255, 255, 0)",
                    fontFamily: "system-ui, sans-serif",
                    transition: "fill 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  {city.ville}
                </text>
                {/* Invisible hit area for hover */}
                <circle
                  r={r * 3}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => {
                    const group = (e.target as SVGElement).parentElement;
                    if (!group) return;
                    const glow = group.querySelector(".city-glow") as SVGElement;
                    const dot = group.querySelector(".city-dot") as SVGElement;
                    const label = group.querySelector(".city-label") as SVGElement;
                    if (glow) glow.setAttribute("fill", "rgba(139, 92, 246, 0.15)");
                    if (dot) { dot.setAttribute("stroke", "rgba(255, 255, 255, 0.8)"); dot.setAttribute("stroke-width", "0.8"); }
                    if (label) label.style.fill = "rgba(255, 255, 255, 0.9)";
                    setTooltip({
                      name: `${city.ville}, ${city.pays}`,
                      users: city.utilisateurs,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltip((prev) =>
                      prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                    );
                  }}
                  onMouseLeave={(e) => {
                    const group = (e.target as SVGElement).parentElement;
                    if (!group) return;
                    const glow = group.querySelector(".city-glow") as SVGElement;
                    const dot = group.querySelector(".city-dot") as SVGElement;
                    const label = group.querySelector(".city-label") as SVGElement;
                    if (glow) glow.setAttribute("fill", "rgba(139, 92, 246, 0)");
                    if (dot) { dot.setAttribute("stroke", "rgba(255, 255, 255, 0.4)"); dot.setAttribute("stroke-width", "0.4"); }
                    if (label) label.style.fill = "rgba(255, 255, 255, 0)";
                    setTooltip(null);
                  }}
                />
              </Marker>
            );
          })}

          {/* Gradient defs */}
          <defs>
            <radialGradient id="cityGradient">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </radialGradient>
          </defs>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-lg border px-3 py-2 text-xs shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 40,
            backgroundColor: "var(--bg-card)",
            borderColor: "rgba(139, 92, 246, 0.3)",
            color: "var(--text-primary)",
          }}
        >
          <div className="font-semibold">{tooltip.name}</div>
          <div style={{ color: tooltip.users > 0 ? "#8b5cf6" : "var(--text-muted)" }}>
            {tooltip.users > 0
              ? `${tooltip.users.toLocaleString("fr-FR")} utilisateurs`
              : "Aucun utilisateur"}
          </div>
        </div>
      )}

      {/* Stats overlay top-right */}
      <div className="absolute right-3 top-3">
        <div
          className="rounded-lg border px-3 py-2 text-right"
          style={{
            borderColor: "rgba(139, 92, 246, 0.2)",
            backgroundColor: "rgba(17, 24, 39, 0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="text-base font-bold text-[var(--text-primary)]">
            {TOTAL_ACTIVE_COUNTRIES}
          </div>
          <div className="text-[0.625rem] uppercase text-[var(--text-muted)]">
            Pays actifs
          </div>
        </div>
      </div>

      {/* Zoom controls bottom-right */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {[
          { label: "+", onClick: handleZoomIn },
          { label: "\u2212", onClick: handleZoomOut },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            className="rounded border px-2 py-1 text-xs font-bold transition-colors hover:bg-violet-500/20"
            style={{
              borderColor: "rgba(139, 92, 246, 0.2)",
              backgroundColor: "rgba(17, 24, 39, 0.8)",
              color: "var(--text-primary)",
              backdropFilter: "blur(8px)",
            }}
            aria-label={btn.label === "+" ? "Zoom avant" : "Zoom arriere"}
          >
            {btn.label}
          </button>
        ))}
      </div>

    </div>
  );
});

// Activity ticker component
function ActivityTicker() {
  const items = LIVE_ACTIVITIES;
  // Duplicate for seamless loop
  const tickerContent = [...items, ...items].map((a, i) => {
    const icon = ACTIVITY_ICONS[a.type] || "\u{1F504}";
    const label =
      a.type === "transaction"
        ? "Transaction"
        : a.type === "vote"
        ? "Vote"
        : "Inscription";
    return (
      <span key={i} className="inline-flex items-center gap-1.5 whitespace-nowrap">
        <span>{icon}</span>
        <span className="text-[var(--text-secondary)]">
          {label} a {a.ville}
        </span>
        <span className="text-[var(--text-muted)]">il y a {a.il_y_a}</span>
        <span className="mx-4 text-[var(--text-muted)]">&middot;</span>
      </span>
    );
  });

  return (
    <div className="overflow-hidden border-t" style={{ borderColor: "var(--border)" }}>
      <div className="marquee-track flex items-center py-2.5 px-4 text-xs">
        <div className="marquee-content flex items-center gap-0">
          {tickerContent}
        </div>
      </div>
    </div>
  );
}

export default function WorldActivityMap() {
  return (
    <div>
      <WorldActivityMapInner />
      <ActivityTicker />
    </div>
  );
}
