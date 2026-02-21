// E2E — Country selector providers
//
// Verifie que chaque pays retourne les bons providers
// dans le CountryIdentitySelector.

import { test, expect } from "@playwright/test";
import { goToRegister } from "../fixtures/mock-providers";

test.describe("Country identity selector", () => {
  test("should display the country selector on step 1", async ({ page }) => {
    await goToRegister(page);

    // The identity selector should be visible
    await expect(
      page.getByText("Verification d'identite")
    ).toBeVisible();

    // Should have a country selection area
    await expect(
      page.getByText("Selectionnez votre pays")
    ).toBeVisible();
  });

  test("should show FranceConnect for France", async ({ page }) => {
    await goToRegister(page);

    // Open country dropdown and select France
    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "France");
    await page.click('text=France');

    // FranceConnect should appear
    await expect(page.getByText("FranceConnect")).toBeVisible();
  });

  test("should show BankID for Sweden", async ({ page }) => {
    await goToRegister(page);

    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "Suede");
    await page.click('text=Suede');

    // BankID Sweden should appear
    await expect(page.getByText("BankID")).toBeVisible();
  });

  test("should show Web of Trust for all countries", async ({ page }) => {
    await goToRegister(page);

    // Select France
    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "France");
    await page.click('text=France');

    // Web of Trust should always be present
    await expect(page.getByText("Web of Trust")).toBeVisible();
  });

  test("should show itsme for Belgium", async ({ page }) => {
    await goToRegister(page);

    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "Belgique");
    await page.click('text=Belgique');

    await expect(page.getByText("itsme")).toBeVisible();
  });

  test("should show NemID/MitID for Denmark", async ({ page }) => {
    await goToRegister(page);

    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "Danemark");
    await page.click('text=Danemark');

    await expect(page.getByText("MitID")).toBeVisible();
  });

  test("should show eIDAS badge for eID providers", async ({ page }) => {
    await goToRegister(page);

    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "France");
    await page.click('text=France');

    // eIDAS badge should be visible for FranceConnect
    await expect(page.getByText("eIDAS")).toBeVisible();
  });

  test("should filter countries by search query", async ({ page }) => {
    await goToRegister(page);

    await page.click('[data-testid="country-dropdown"]');
    await page.fill('[data-testid="country-search"]', "Norv");

    // Should show Norway
    await expect(page.getByText("Norvege")).toBeVisible();

    // Should NOT show France (filtered out)
    const franceItem = page.locator('[data-testid="country-dropdown"] >> text=France');
    await expect(franceItem).not.toBeVisible();
  });

  test("should show login link on step 1", async ({ page }) => {
    await goToRegister(page);

    const loginLink = page.locator('a[href="/auth/connexion"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveText("Se connecter");
  });
});
