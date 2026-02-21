// E2E — Signicat BankID Sweden flow
//
// Mock le callback Signicat avec la methode BankID suedois,
// verifie le badge et le formulaire.

import { test, expect } from "@playwright/test";
import {
  goToRegisterVerified,
  fillVitaForm,
  acceptAndSubmit,
  mockRegisterEndpoint,
} from "../fixtures/mock-providers";

test.describe("Signicat Sweden (BankID) registration flow", () => {
  const SIGNICAT_SE_PARAMS = {
    provider: "signicat",
    nullifierHash: "sig_se_nullifier_1234567890abcdef1234567890abcdef1234567890abcdef12345678",
    country: "SE",
    assuranceLevel: "high",
  };

  test("should show verified badge after Signicat callback", async ({
    page,
  }) => {
    await goToRegisterVerified(page, SIGNICAT_SE_PARAMS);

    const badge = page.locator('[data-testid="verified-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Identite verifiee");
  });

  test("should display provider name as signicat", async ({ page }) => {
    await goToRegisterVerified(page, SIGNICAT_SE_PARAMS);

    await expect(page.getByText("Via signicat")).toBeVisible();
  });

  test("should show country SE in nullifier section", async ({ page }) => {
    await goToRegisterVerified(page, SIGNICAT_SE_PARAMS);

    const hash = page.locator('[data-testid="nullifier-hash"]');
    await expect(hash).toBeVisible();
    await expect(hash).toContainText("sig_se_nullifier");
  });

  test("should complete full Signicat SE registration flow", async ({
    page,
  }) => {
    await mockRegisterEndpoint(page);
    await goToRegisterVerified(page, SIGNICAT_SE_PARAMS);

    // Step 3 → 4
    await page.click('[data-testid="continue-to-form"]');
    await expect(page.locator('[data-testid="step-form"]')).toBeVisible();

    // Fill form
    await fillVitaForm(page, { username: "erik_se_test" });

    // Step 4 → 5
    await page.click('[data-testid="continue-to-confirm"]');
    await expect(page.locator('[data-testid="step-confirm"]')).toBeVisible();

    // Verify summary
    await expect(page.getByText("@erik_se_test")).toBeVisible();
    await expect(page.getByText("signicat")).toBeVisible();

    // Accept and submit
    await acceptAndSubmit(page);

    await page.waitForURL("**/panorama", { timeout: 10_000 });
  });

  test("should allow language selection on form step", async ({ page }) => {
    await goToRegisterVerified(page, SIGNICAT_SE_PARAMS);
    await page.click('[data-testid="continue-to-form"]');

    // Change language to Swedish
    const langSelect = page.locator('[data-testid="select-language"]');
    await expect(langSelect).toBeVisible();
    await langSelect.selectOption("sv");

    // Verify the select value changed
    await expect(langSelect).toHaveValue("sv");
  });
});
