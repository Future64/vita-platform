// E2E — Duplicate identity (409)
//
// Tente une 2e inscription avec le meme nullifier_hash.
// Le backend retourne 409 DUPLICATE_IDENTITY.

import { test, expect } from "@playwright/test";
import {
  goToRegisterVerified,
  fillVitaForm,
  mockVerifyEndpointDuplicate,
} from "../fixtures/mock-providers";

test.describe("Duplicate identity detection", () => {
  const EXISTING_NULLIFIER_PARAMS = {
    provider: "franceconnect",
    nullifierHash: "dup_nullifier_same_person_trying_twice_0123456789abcdef0123456789abcdef",
    country: "FR",
  };

  test("should show error when backend returns 409 for duplicate nullifier", async ({
    page,
  }) => {
    // Mock backend to return 409
    await mockVerifyEndpointDuplicate(page);

    // Mock register to also return 409
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          error: "Un compte avec cet email ou ce nom d'utilisateur existe deja.",
          code: "DUPLICATE_ACCOUNT",
        }),
      });
    });

    await goToRegisterVerified(page, EXISTING_NULLIFIER_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');
    await fillVitaForm(page, { username: "duplicate_user" });

    // Step 4 → 5
    await page.click('[data-testid="continue-to-confirm"]');

    // Accept and submit
    await page.check('[data-testid="checkbox-cgu"]');
    await page.check('[data-testid="checkbox-privacy"]');
    await page.click('[data-testid="submit-registration"]');

    // Should show error — not redirect
    const errorBanner = page.locator(".text-red-400");
    await expect(errorBanner).toBeVisible({ timeout: 5_000 });
  });

  test("should still show verified badge even for duplicate (verification itself succeeded)", async ({
    page,
  }) => {
    await goToRegisterVerified(page, EXISTING_NULLIFIER_PARAMS);

    // The badge should still appear because verification params are in the URL
    const badge = page.locator('[data-testid="verified-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Identite verifiee");
  });

  test("should allow user to go back to step 1 via login link", async ({
    page,
  }) => {
    await goToRegisterVerified(page, EXISTING_NULLIFIER_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');

    // There should be a "Se connecter" link for users who already have an account
    // On step 5:
    await fillVitaForm(page, { username: "dup_user" });
    await page.click('[data-testid="continue-to-confirm"]');

    const loginLink = page.locator('a[href="/auth/connexion"]');
    await expect(loginLink).toBeVisible();
  });
});
