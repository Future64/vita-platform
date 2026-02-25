// Mock toggle — uniquement actif en developpement
export const IS_DEV = process.env.NODE_ENV === "development";

const STORAGE_KEY = "vita_dev_mock";

export type MockModule =
  | "global"
  | "auth"
  | "wallet"
  | "agora"
  | "forge"
  | "codex"
  | "civis"
  | "panorama"
  | "notifications";

export type MockState = Record<MockModule, boolean>;

const DEFAULT_STATE: MockState = {
  global: true,
  auth: true,
  wallet: true,
  agora: true,
  forge: true,
  codex: true,
  civis: true,
  panorama: true,
  notifications: true,
};

export function getMockState(): MockState {
  if (!IS_DEV || typeof window === "undefined") return DEFAULT_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_STATE, ...JSON.parse(stored) } : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

export function setMockModule(module: MockModule, value: boolean): void {
  if (!IS_DEV || typeof window === "undefined") return;
  const state = getMockState();
  if (module === "global") {
    const newState = Object.keys(state).reduce(
      (acc, key) => ({ ...acc, [key]: value }),
      {} as MockState
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } else {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, [module]: value })
    );
  }
  window.dispatchEvent(new CustomEvent("vita:mock-changed"));
}

export function isMocked(module: MockModule): boolean {
  if (!IS_DEV) return false;
  if (typeof window === "undefined") return false;
  const state = getMockState();
  return state.global || state[module];
}

// Determine module from an API path
export function guessModule(path: string): MockModule {
  if (path.includes("/auth")) return "auth";
  if (path.includes("/wallet") || path.includes("/transactions") || path.includes("/emissions") || path.includes("/credit")) return "wallet";
  if (path.includes("/governance") || path.includes("/agora")) return "agora";
  if (path.includes("/forge")) return "forge";
  if (path.includes("/codex")) return "codex";
  if (path.includes("/civis") || path.includes("/accounts")) return "civis";
  if (path.includes("/statistics") || path.includes("/panorama")) return "panorama";
  if (path.includes("/notifications")) return "notifications";
  return "global";
}

// Simulate network delay for mock data
export function mockDelay(): Promise<void> {
  return new Promise((r) => setTimeout(r, Math.random() * 300 + 100));
}
