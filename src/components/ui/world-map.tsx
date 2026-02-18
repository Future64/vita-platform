"use client";

import { useState, useCallback, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { COUNTRY_USERS, REGIONS, TOTAL_USERS, TOTAL_COUNTRIES, MAX_COUNTRY_USERS } from "@/data/mock-regions";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

function getUsersForGeo(geo: { properties: { ISO_A3?: string; ISO_A2?: string; name?: string } }): number {
  const iso = geo.properties.ISO_A3;
  if (iso && COUNTRY_USERS[iso]) return COUNTRY_USERS[iso];
  return 0;
}

function getCountryColor(users: number): string {
  if (users === 0) return "var(--border)";
  // Log scale for better visibility
  const intensity = Math.log(users + 1) / Math.log(MAX_COUNTRY_USERS + 1);
  // From dark violet to bright violet
  const alpha = 0.2 + intensity * 0.6;
  return `rgba(139, 92, 246, ${alpha})`;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

interface TooltipData {
  name: string;
  users: number;
  x: number;
  y: number;
}

const WorldMapInner = memo(function WorldMapInner() {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([10, 20]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.5, 8));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.5, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setCenter([10, 20]);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 147,
        }}
        width={800}
        height={400}
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
          {/* Geographies */}
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const users = getUsersForGeo(geo);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getCountryColor(users)}
                    stroke="rgba(139, 92, 246, 0.3)"
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
                      const name = geo.properties.name || "Inconnu";
                      setTooltip({
                        name,
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

          {/* Region markers */}
          {REGIONS.map((region) => (
            <Marker key={region.name} coordinates={[region.lng, region.lat]}>
              <circle
                r={5 + Math.sqrt(region.users / TOTAL_USERS) * 40}
                fill={region.color}
                fillOpacity={0.25}
                stroke={region.color}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
              <circle
                r={3}
                fill={region.color}
                className="animate-pulse"
              />
              <text
                textAnchor="middle"
                y={-12 - Math.sqrt(region.users / TOTAL_USERS) * 20}
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  fill: region.color,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {formatNumber(region.users)}
              </text>
            </Marker>
          ))}
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
            color: "var(--text-primary, #fff)",
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

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 rounded-lg border p-2.5"
        style={{
          borderColor: "var(--border-light)",
          backgroundColor: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="flex flex-col gap-1.5">
          {REGIONS.map((r) => (
            <div
              key={r.name}
              className="flex items-center gap-2 text-[0.625rem]"
              style={{ color: "var(--text-secondary)" }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.name}
            </div>
          ))}
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute right-3 top-3">
        <div
          className="rounded-lg border px-3 py-2 text-right"
          style={{
            borderColor: "var(--border-light)",
            backgroundColor: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="text-base font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {TOTAL_COUNTRIES}
          </div>
          <div
            className="text-[0.625rem] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Pays
          </div>
          <div
            className="text-sm font-bold mt-1"
            style={{ color: "#8b5cf6" }}
          >
            {formatNumber(TOTAL_USERS)}
          </div>
          <div
            className="text-[0.625rem] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Citoyens
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div
        className="absolute bottom-3 right-3 flex flex-col gap-1"
      >
        <button
          onClick={handleZoomIn}
          className="rounded border px-2 py-1 text-xs font-bold transition-colors hover:bg-violet-500/20"
          style={{
            borderColor: "var(--border-light)",
            backgroundColor: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
            color: "var(--text-primary)",
            backdropFilter: "blur(8px)",
          }}
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="rounded border px-2 py-1 text-xs font-bold transition-colors hover:bg-violet-500/20"
          style={{
            borderColor: "var(--border-light)",
            backgroundColor: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
            color: "var(--text-primary)",
            backdropFilter: "blur(8px)",
          }}
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="rounded border px-1.5 py-1 text-[0.6rem] transition-colors hover:bg-violet-500/20"
          style={{
            borderColor: "var(--border-light)",
            backgroundColor: "color-mix(in srgb, var(--bg-card) 90%, transparent)",
            color: "var(--text-muted)",
            backdropFilter: "blur(8px)",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
});

export default function WorldMap() {
  return <WorldMapInner />;
}
