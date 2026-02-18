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

export interface CityHotspot {
  ville: string;
  pays: string;
  lat: number;
  lng: number;
  utilisateurs: number;
  delayMs: number; // stagger for pulse animation
}

export interface LiveActivity {
  ville: string;
  type: "transaction" | "vote" | "inscription";
  il_y_a: string;
}

// Utilisateurs par pays (ISO Alpha-3) — aligned with PANORAMA_DATA.topPays
export const COUNTRY_USERS: Record<string, number> = {
  // Top 10 (from Panorama)
  FRA: 187_432,
  BRA: 156_891,
  IND: 142_307,
  DEU: 98_456,
  JPN: 87_234,
  NGA: 76_543,
  USA: 72_189,
  IDN: 65_432,
  MEX: 54_321,
  SEN: 48_765,
  // Europe secondaire
  GBR: 38_900,
  ESP: 31_200,
  ITA: 27_800,
  NLD: 18_400,
  BEL: 12_300,
  PRT: 9_800,
  CHE: 8_200,
  SWE: 7_100,
  POL: 6_400,
  NOR: 4_800,
  // Ameriques secondaire
  CAN: 22_100,
  ARG: 18_700,
  COL: 14_300,
  // Asie secondaire
  KOR: 19_200,
  SGP: 8_400,
  // Afrique secondaire
  ZAF: 21_300,
  KEN: 16_800,
  MAR: 12_500,
  GHA: 9_200,
  // Oceanie
  AUS: 15_600,
  NZL: 5_400,
};

// Villes avec le plus d'activite — points pulsants sur la carte
export const CITY_HOTSPOTS: CityHotspot[] = [
  { ville: "Paris", pays: "France", lat: 48.86, lng: 2.35, utilisateurs: 87_200, delayMs: 0 },
  { ville: "Sao Paulo", pays: "Bresil", lat: -23.55, lng: -46.63, utilisateurs: 72_400, delayMs: 200 },
  { ville: "Mumbai", pays: "Inde", lat: 19.08, lng: 72.88, utilisateurs: 65_100, delayMs: 400 },
  { ville: "Berlin", pays: "Allemagne", lat: 52.52, lng: 13.41, utilisateurs: 51_300, delayMs: 600 },
  { ville: "Tokyo", pays: "Japon", lat: 35.68, lng: 139.69, utilisateurs: 48_900, delayMs: 800 },
  { ville: "Lagos", pays: "Nigeria", lat: 6.52, lng: 3.38, utilisateurs: 42_100, delayMs: 1000 },
  { ville: "New York", pays: "Etats-Unis", lat: 40.71, lng: -74.01, utilisateurs: 38_700, delayMs: 1200 },
  { ville: "Jakarta", pays: "Indonesie", lat: -6.21, lng: 106.85, utilisateurs: 34_200, delayMs: 1400 },
  { ville: "Mexico", pays: "Mexique", lat: 19.43, lng: -99.13, utilisateurs: 28_900, delayMs: 1600 },
  { ville: "Dakar", pays: "Senegal", lat: 14.69, lng: -17.44, utilisateurs: 24_300, delayMs: 1800 },
];

// Activites en direct pour le ticker defilant
export const LIVE_ACTIVITIES: LiveActivity[] = [
  { ville: "Paris", type: "transaction", il_y_a: "2s" },
  { ville: "Tokyo", type: "vote", il_y_a: "5s" },
  { ville: "Sao Paulo", type: "inscription", il_y_a: "8s" },
  { ville: "Lagos", type: "transaction", il_y_a: "12s" },
  { ville: "Berlin", type: "vote", il_y_a: "18s" },
  { ville: "New York", type: "inscription", il_y_a: "23s" },
  { ville: "Mumbai", type: "transaction", il_y_a: "31s" },
  { ville: "Jakarta", type: "vote", il_y_a: "38s" },
  { ville: "Dakar", type: "inscription", il_y_a: "45s" },
  { ville: "Mexico", type: "transaction", il_y_a: "52s" },
];

// Regions agregees pour les marqueurs sur la carte
export const REGIONS: RegionData[] = [
  { name: "Europe", lat: 48.8, lng: 9.0, users: 482_786, color: "#8b5cf6" },
  { name: "Amerique du Nord", lat: 42.0, lng: -100.0, users: 94_289, color: "#ec4899" },
  { name: "Amerique du Sud", lat: -15.0, lng: -55.0, users: 244_212, color: "#f472b6" },
  { name: "Asie", lat: 35.0, lng: 105.0, users: 322_573, color: "#06b6d4" },
  { name: "Afrique", lat: 5.0, lng: 20.0, users: 185_108, color: "#f59e0b" },
  { name: "Oceanie", lat: -28.0, lng: 140.0, users: 21_000, color: "#10b981" },
];

export const TOTAL_USERS = Object.values(COUNTRY_USERS).reduce((a, b) => a + b, 0);
export const TOTAL_COUNTRIES = Object.keys(COUNTRY_USERS).length;
export const TOTAL_ACTIVE_COUNTRIES = 47; // declared total including smaller countries not listed

// Valeur max pour l'echelle de couleur choroplethe
export const MAX_COUNTRY_USERS = Math.max(...Object.values(COUNTRY_USERS));
