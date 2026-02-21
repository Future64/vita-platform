// Shared mock helpers for identity provider E2E tests.
//
// These helpers use Playwright's page.route() to intercept
// API calls and simulate OAuth provider responses.

import type { Page } from "@playwright/test";

// ── Types ────────────────────────────────────────────────────────

export interface MockCallbackParams {
  provider: string;
  nullifierHash: string;
  country?: string;
  assuranceLevel?: string;
}

// ── Mock OAuth authorize endpoint ────────────────────────────────

/**
 * Intercepts the authorize POST and immediately redirects
 * to the register page with verification params (skipping
 * the real OAuth redirect).
 */
export async function mockAuthorizeEndpoint(
  page: Page,
  provider: "fc" | "signicat",
  callback: MockCallbackParams
) {
  const endpoint =
    provider === "fc"
      ? "**/api/auth/authorize/fc"
      : "**/api/auth/authorize/signicat";

  await page.route(endpoint, async (route) => {
    // Return a mock authorization URL that points back to our register page
    const params = new URLSearchParams({
      verified: "true",
      provider: callback.provider,
      nullifier_hash: callback.nullifierHash,
      country: callback.country || "",
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        authorizationUrl: `/auth/register?${params.toString()}`,
      }),
    });
  });
}

// ── Mock backend verify endpoint ─────────────────────────────────

/**
 * Intercepts the backend /identity/verify call and returns
 * a mock verification response.
 */
export async function mockVerifyEndpoint(
  page: Page,
  params: MockCallbackParams & { accountId?: string }
) {
  await page.route("**/api/v1/identity/verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        verified: true,
        nullifier_hash: params.nullifierHash,
        account_id: params.accountId || "00000000-0000-0000-0000-000000000001",
        provider: params.provider,
        country_code: params.country || null,
        assurance_level: params.assuranceLevel || "substantial",
        verified_at: new Date().toISOString(),
      }),
    });
  });
}

/**
 * Intercepts the backend /identity/verify call and returns 409.
 */
export async function mockVerifyEndpointDuplicate(page: Page) {
  await page.route("**/api/v1/identity/verify", async (route) => {
    await route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Duplicate identity: this identity is already associated with an account",
        code: "DUPLICATE_IDENTITY",
      }),
    });
  });
}

// ── Mock auth register endpoint ──────────────────────────────────

/**
 * Intercepts the auth registration and returns success.
 */
export async function mockRegisterEndpoint(page: Page) {
  await page.route("**/api/v1/auth/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        token: "mock_jwt_token_for_tests",
        refresh_token: "mock_refresh_token",
        user: {
          id: "00000000-0000-0000-0000-000000000001",
          username: "test_user",
          role: "citoyen",
        },
      }),
    });
  });
}

// ── Navigate to register page ────────────────────────────────────

export async function goToRegister(page: Page) {
  await page.goto("/auth/register");
  await page.waitForSelector('[data-testid="step-identity"]', {
    timeout: 10_000,
  });
}

// ── Navigate to register page with verification params ───────────

export async function goToRegisterVerified(
  page: Page,
  params: MockCallbackParams
) {
  const searchParams = new URLSearchParams({
    verified: "true",
    provider: params.provider,
    nullifier_hash: params.nullifierHash,
    country: params.country || "",
  });

  await page.goto(`/auth/register?${searchParams.toString()}`);
  await page.waitForSelector('[data-testid="step-verified"]', {
    timeout: 10_000,
  });
}

// ── Fill the VITA form (step 4) ──────────────────────────────────

export async function fillVitaForm(
  page: Page,
  options: {
    username?: string;
    password?: string;
    language?: string;
  } = {}
) {
  const username = options.username || "test_user_e2e";
  const password = options.password || "SecurePass123!@#";

  // Username
  await page.fill('[data-testid="input-username"]', username);

  // Password
  await page.fill('[data-testid="input-password"]', password);
  await page.fill('[data-testid="input-confirm-password"]', password);

  // Wait for key generation
  await page.waitForSelector('[data-testid="public-key"]', {
    timeout: 10_000,
  });

  // Copy private key (required before proceeding)
  await page.click('[data-testid="copy-private-key"]');
}

// ── Accept CGU and submit (step 5) ───────────────────────────────

export async function acceptAndSubmit(page: Page) {
  await page.check('[data-testid="checkbox-cgu"]');
  await page.check('[data-testid="checkbox-privacy"]');
  await page.click('[data-testid="submit-registration"]');
}
