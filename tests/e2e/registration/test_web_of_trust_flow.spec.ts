// E2E — Web of Trust flow
//
// Flux complet : selection Web of Trust, passage en mode parrainage,
// simulation de 3 attestations par mock sponsors.

import { test, expect } from "@playwright/test";
import {
  goToRegisterVerified,
  fillVitaForm,
  acceptAndSubmit,
  mockRegisterEndpoint,
} from "../fixtures/mock-providers";

test.describe("Web of Trust registration flow", () => {
  const WOT_PARAMS = {
    provider: "web_of_trust",
    nullifierHash: "wot_pending",
    country: "",
  };

  test("should show Web of Trust verification badge", async ({ page }) => {
    await goToRegisterVerified(page, WOT_PARAMS);

    const badge = page.locator('[data-testid="verified-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Identite verifiee");

    // Should mention 3 parrains
    await expect(
      page.getByText("Web of Trust (3 parrains requis)")
    ).toBeVisible();
  });

  test("should NOT show nullifier hash for WoT (pending)", async ({
    page,
  }) => {
    await goToRegisterVerified(page, WOT_PARAMS);

    // Nullifier hash display should not appear for "wot_pending"
    const hash = page.locator('[data-testid="nullifier-hash"]');
    await expect(hash).not.toBeVisible();
  });

  test("should navigate through form and show correct summary", async ({
    page,
  }) => {
    await goToRegisterVerified(page, WOT_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');
    await expect(page.locator('[data-testid="step-form"]')).toBeVisible();

    // Fill form
    await fillVitaForm(page, { username: "wot_test_user" });

    // Step 4 → 5
    await page.click('[data-testid="continue-to-confirm"]');

    // Summary should show "Web of Trust" as method
    await expect(page.getByText("Web of Trust")).toBeVisible();
    await expect(page.getByText("@wot_test_user")).toBeVisible();
  });

  test("should complete full WoT registration flow", async ({ page }) => {
    await mockRegisterEndpoint(page);
    await goToRegisterVerified(page, WOT_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');
    await fillVitaForm(page, { username: "wot_citizen" });

    // Step 4 → 5
    await page.click('[data-testid="continue-to-confirm"]');

    // Accept and submit
    await acceptAndSubmit(page);

    await page.waitForURL("**/panorama", { timeout: 10_000 });
  });

  test("should not require key copy for WoT flow", async ({ page }) => {
    await mockRegisterEndpoint(page);
    await goToRegisterVerified(page, WOT_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');

    // Fill only username and password (skip key copy)
    await page.fill('[data-testid="input-username"]', "wot_nokey");
    await page.fill('[data-testid="input-password"]', "SecurePass123!@#");
    await page.fill(
      '[data-testid="input-confirm-password"]',
      "SecurePass123!@#"
    );

    // Wait for keys
    await page.waitForSelector('[data-testid="public-key"]', {
      timeout: 10_000,
    });

    // Should be able to continue without copying key (WoT doesn't enforce)
    await page.click('[data-testid="continue-to-confirm"]');
    await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible();
  });
});
