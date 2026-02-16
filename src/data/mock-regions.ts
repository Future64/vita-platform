// Mock data: nombre d'utilisateurs VITA par pays (ISO_A3)
// Ces donnees seront remplacees par des appels API reels

export interface CountryData {
  iso: string;
  name: string;
  users: number;
}

export interface RegionData {
  name: string;
  lat: number;
  lng: number;
  users: number;
  color: string;
}

// Utilisateurs par pays (ISO Alpha-3)
export const COUNTRY_USERS: Record<string, number> = {
  // Europe
  FRA: 4820,
  DEU: 3150,
  GBR: 2890,
  ESP: 1640,
  ITA: 1420,
  NLD: 890,
  BEL: 720,
  PRT: 510,
  CHE: 480,
  SWE: 390,
  POL: 340,
  NOR: 280,
  // Ameriques
  USA: 3200,
  CAN: 1180,
  BRA: 1650,
  MEX: 720,
  ARG: 480,
  COL: 310,
  // Asie
  JPN: 1420,
  KOR: 890,
  IND: 620,
  SGP: 340,
  IDN: 280,
  // Afrique
  ZAF: 420,
  NGA: 310,
  KEN: 180,
  MAR: 240,
  // Oceanie
  AUS: 680,
  NZL: 210,
};

// Regions agregees pour les marqueurs sur la carte
export const REGIONS: RegionData[] = [
  { name: "Europe", lat: 48.8, lng: 9.0, users: 15540, color: "#8b5cf6" },
  { name: "Amerique du Nord", lat: 42.0, lng: -100.0, users: 4380, color: "#ec4899" },
  { name: "Amerique du Sud", lat: -15.0, lng: -55.0, users: 3160, color: "#f472b6" },
  { name: "Asie", lat: 35.0, lng: 105.0, users: 3550, color: "#06b6d4" },
  { name: "Afrique", lat: 5.0, lng: 20.0, users: 1150, color: "#f59e0b" },
  { name: "Oceanie", lat: -28.0, lng: 140.0, users: 890, color: "#10b981" },
];

export const TOTAL_USERS = Object.values(COUNTRY_USERS).reduce((a, b) => a + b, 0);
export const TOTAL_COUNTRIES = Object.keys(COUNTRY_USERS).length;

// Valeur max pour l'echelle de couleur choroplethe
export const MAX_COUNTRY_USERS = Math.max(...Object.values(COUNTRY_USERS));
