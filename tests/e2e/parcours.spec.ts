import { expect, test } from "@playwright/test";

test("Parcours catalog and detail pages work cleanly without legacy course or listing links", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page
    .locator("section.home-hero")
    .getByRole("link", { name: "Commencer", exact: true })
    .click();

  await expect(page).toHaveURL(/\/parcours$/);
  await expect(page.getByTestId("parcours-catalog")).toBeVisible();
  await page.getByTestId("parcours-foundation-link").click();

  await expect(page).toHaveURL(/\/parcours\/v4-tronc-commun$/);
  await expect(page.getByTestId("parcours-hero-title")).toContainText("Tronc commun");

  // Expand TC-01 module and verify real human chapter titles without placeholder strings
  await page.getByTestId("module-toggle-TC-01").click();
  await expect(page.locator("#module-content-TC-01")).toBeVisible();
  await expect(page.locator("#module-content-TC-01")).not.toContainText(/Unité\s+\d+/i);

  // Confirm no legacy /lessons/ or /curriculum links remain anywhere on the Parcours page
  const legacyLinks = await page.locator('a[href^="/lessons/"], a[href^="/curriculum"]').count();
  expect(legacyLinks).toBe(0);

  await page.screenshot({ path: testInfo.outputPath("parcours-page.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  // Mobile layout check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(150);
  await page.screenshot({ path: testInfo.outputPath("parcours-mobile.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);

  // Navigate to Branche A via switcher
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.locator(".paths-switcher summary").click();
  await page.getByTestId("parcours-nav-tab-v4-branche-a").click();
  await expect(page).toHaveURL(/\/parcours\/v4-branche-a$/);
  await expect(page.getByTestId("parcours-hero-title")).toContainText(
    "Sécurité applicative, Fintech & IA",
  );

  expect(errors).toEqual([]);
});

test("root layout tolerates browser extension attributes on html without hydration errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.addInitScript(() => {
    const patchHtml = () => {
      if (!document.documentElement) return false;
      document.documentElement.setAttribute("data-lt-installed", "true");
      document.documentElement.classList.add("hydrated");
      return true;
    };
    if (!patchHtml()) {
      const observer = new MutationObserver(() => {
        if (patchHtml()) observer.disconnect();
      });
      observer.observe(document, { childList: true });
    }
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Le déclic");
  await expect(page.locator("html")).toHaveAttribute("data-lt-installed", "true");
  expect(errors).toEqual([]);
});
