// E2E — FranceConnect happy path
//
// Mock le callback FranceConnect, verifie le badge
// "Identite verifiee" et le formulaire VITA complet.

import { test, expect } from "@playwright/test";
import {
  goToRegisterVerified,
  fillVitaForm,
  acceptAndSubmit,
  mockRegisterEndpoint,
} from "../fixtures/mock-providers";

test.describe("FranceConnect registration flow", () => {
  const FC_PARAMS = {
    provider: "franceconnect",
    nullifierHash: "fc_nullifier_abc123def456789012345678901234567890abcdef12345678",
    country: "FR",
    assuranceLevel: "substantial",
  };

  test("should show verified badge after FC callback", async ({ page }) => {
    await goToRegisterVerified(page, FC_PARAMS);

    // Step 3 should be visible with verified badge
    const badge = page.locator('[data-testid="verified-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Identite verifiee");

    // Nullifier hash should be displayed
    const hash = page.locator('[data-testid="nullifier-hash"]');
    await expect(hash).toBeVisible();
    await expect(hash).toContainText("fc_nullifier_abc123");
  });

  test("should display provider name as FranceConnect", async ({ page }) => {
    await goToRegisterVerified(page, FC_PARAMS);

    await expect(page.getByText("Via franceconnect")).toBeVisible();
  });

  test("should navigate from verified to form step", async ({ page }) => {
    await goToRegisterVerified(page, FC_PARAMS);

    await page.click('[data-testid="continue-to-form"]');

    // Step 4 should be visible
    await expect(page.locator('[data-testid="step-form"]')).toBeVisible();

    // Username input should exist
    await expect(page.locator('[data-testid="input-username"]')).toBeVisible();
  });

  test("should generate Ed25519 keypair on form step", async ({ page }) => {
    await goToRegisterVerified(page, FC_PARAMS);
    await page.click('[data-testid="continue-to-form"]');

    // Wait for keys to generate
    const publicKey = page.locator('[data-testid="public-key"]');
    await expect(publicKey).toBeVisible({ timeout: 10_000 });

    // Public key should be 64 hex chars
    const keyText = await publicKey.textContent();
    expect(keyText).toMatch(/^[a-f0-9]{64}$/);

    // Private key should also be visible
    const privateKey = page.locator('[data-testid="private-key"]');
    await expect(privateKey).toBeVisible();
  });

  test("should complete full FC registration flow", async ({ page }) => {
    await mockRegisterEndpoint(page);
    await goToRegisterVerified(page, FC_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');
    await expect(page.locator('[data-testid="step-form"]')).toBeVisible();

    // Fill form
    await fillVitaForm(page, { username: "jean_fc_test" });

    // Step 4 → 5
    await page.click('[data-testid="continue-to-confirm"]');
    await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible();

    // Verify summary shows correct data
    await expect(page.getByText("@jean_fc_test")).toBeVisible();
    await expect(page.getByText("franceconnect")).toBeVisible();

    // Accept and submit
    await acceptAndSubmit(page);

    // Should redirect to /panorama (or mock handles it)
    await page.waitForURL("**/panorama", { timeout: 10_000 });
  });
});
