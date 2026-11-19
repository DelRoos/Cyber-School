import { expect, test, type Page } from "@playwright/test";

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function prepareCapture(page: Page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

test("orientation offers a foundation and searchable specialisations without inventing availability", async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  const response = await page.goto("/parcours");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Une base solide.Votre expertise ensuite.",
  );
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator(".paths-track")).toHaveCount(4);
  await expect(page.getByTestId("parcours-card-v4-approfondissements")).toHaveCount(0);
  await expect(page.locator(".paths-complement-groups a")).toHaveCount(10);
  await expect(page.getByTestId("parcours-foundation-link")).toHaveAttribute(
    "href",
    "/parcours/v4-tronc-commun",
  );
  await expect(page.getByTestId("parcours-foundation")).not.toContainText(/cours.*dès maintenant/);

  const advanced = page.getByRole("button", { name: "Pratique professionnelle", exact: true });
  await advanced.focus();
  await page.keyboard.press("Space");
  await expect(advanced).toHaveAttribute("aria-pressed", "true");
  await expect(advanced).toBeFocused();
  expect(await advanced.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe(
    "solid",
  );
  await expect(page.locator(".paths-track")).toHaveCount(1);
  await page.getByRole("button", { name: "Domaines techniques", exact: true }).click();
  await expect(page.locator(".paths-track")).toHaveCount(3);
  await page.getByRole("button", { name: "Les quatre branches", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Rechercher une branche" });
  await search.fill("forensics");
  await expect(page.getByTestId("parcours-card-v4-branche-c")).toBeVisible();
  await expect(page.locator(".paths-track")).toHaveCount(1);
  await search.fill("rÉseAu");
  await expect(page.getByTestId("parcours-card-v4-branche-b")).toBeVisible();
  await search.fill("zzzz-introuvable");
  await expect(page.getByRole("heading", { name: /Aucune branche/ })).toBeVisible();
  await page.getByRole("button", { name: "Afficher les quatre branches", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(search).toBeFocused();
  await expect(page.locator(".paths-track")).toHaveCount(4);
  await prepareCapture(page);
  await page.screenshot({
    path: testInfo.outputPath("parcours-catalog.png"),
    fullPage: true,
    caret: "initial",
  });
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("programme accordion, search, switcher and module deep links work by keyboard", async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  await page.goto("/parcours");
  await page.getByTestId("parcours-foundation-link").click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tronc commun");
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator(".paths-module")).toHaveCount(8);
  await expect(page.locator(".paths-detail-meta")).toContainText("Programme en construction");
  await expect(page.locator(".paths-detail-meta")).not.toContainText("cours accessibles");
  const memory = page.getByTestId("module-toggle-TC-01");
  await memory.focus();
  await page.keyboard.press("Enter");
  await expect(memory).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#module-content-TC-01")).toContainText(
    "Convertir décimal et binaire sans calculatrice",
  );
  await expect(page.locator("#module-content-TC-01 .paths-chapters li")).toHaveCount(28);
  await expect(page.locator(".paths-detail-meta")).not.toContainText("chapitres");
  await expect(page.locator(".paths-start-card")).not.toContainText("Durée estimée complète");
  await page.keyboard.press("Space");
  await expect(memory).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Tout déplier", exact: true }).click();
  await expect(page.locator('.paths-module button[aria-expanded="true"]')).toHaveCount(8);
  await page.getByRole("button", { name: "Tout replier", exact: true }).click();
  await expect(page.locator('.paths-module button[aria-expanded="true"]')).toHaveCount(0);
  const search = page.getByRole("searchbox", { name: "Rechercher dans le programme" });
  await search.fill("introuvable-zzzz");
  await expect(page.getByRole("heading", { name: "Aucun module trouvé" })).toBeVisible();
  await page.getByRole("button", { name: "Afficher tout le programme" }).click();
  await expect(page.locator(".paths-module")).toHaveCount(8);
  await page.getByTestId("module-toggle-TC-00").click();
  await page.getByRole("link", { name: "Explorer le programme", exact: true }).click();
  await expect(page).toHaveURL(/#programme$/);
  await prepareCapture(page);
  await page.screenshot({
    path: testInfo.outputPath("parcours-programme.png"),
    fullPage: true,
    caret: "initial",
  });
  await expectNoOverflow(page);
  await page.locator(".paths-switcher summary").click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".paths-switcher")).not.toHaveAttribute("open", "");
  await expect(page.locator(".paths-switcher summary")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByTestId("parcours-nav-tab-v4-branche-a").click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Sécurité applicative");
  await expect(page.getByTestId("module-toggle-A-01")).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("link", { name: "Tous les parcours", exact: true }).click();
  await expect(page).toHaveURL(/\/parcours$/);
  await page.goto("/parcours/v4-tronc-commun#noeud-TC-01");
  await expect(page.getByTestId("module-toggle-TC-01")).toHaveAttribute("aria-expanded", "true");
  expect(errors).toEqual([]);
});

test("six programmes reflow at 320px and remain usable with reduced motion", async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 812 });
  for (const slug of [
    "v4-tronc-commun",
    "v4-branche-a",
    "v4-branche-b",
    "v4-branche-c",
    "v4-branche-d",
    "v4-approfondissements",
  ]) {
    const response = await page.goto(`/parcours/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoOverflow(page);
  }
  await prepareCapture(page);
  await page.screenshot({
    path: testInfo.outputPath("parcours-320.png"),
    fullPage: true,
    caret: "initial",
  });
  await page.goto("/parcours");
  const advanced = page.getByRole("button", { name: "Pratique professionnelle", exact: true });
  await advanced.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".paths-track")).toHaveCount(1);
  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("transversal modules are optional topic groups linked to the matching V4 subject", async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  await page.goto("/parcours");
  const investigation = page.getByTestId("complement-link-X-09");
  await investigation.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/v4-approfondissements#noeud-X-09$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Approfondissements transversaux",
  );
  await expect(page.getByTestId("module-toggle-X-09")).toHaveAttribute("aria-expanded", "true");
  expect(
    (await page.locator(".paths-module-number").allTextContents()).every(
      (text) => text.trim() === "",
    ),
  ).toBe(true);
  await expect(page.locator(".paths-start-card")).toContainText("À la carte");
  await expect(page.locator("#module-content-X-09")).toContainText("Liens thématiques proposés");
  await expect(page.locator("#module-content-X-09 .paths-chapters li")).toHaveCount(14);
  if ((page.viewportSize()?.width ?? 1280) <= 600) {
    expect(
      await page
        .locator("#module-content-X-09 .paths-planned-chapter > span")
        .first()
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(14);
  }
  await page.getByRole("button", { name: "Enquête et protection", exact: true }).click();
  await expect(page.locator(".paths-module")).toHaveCount(2);
  const search = page.getByRole("searchbox", { name: "Rechercher dans le programme" });
  await search.fill("deepfake");
  await expect(page.locator(".paths-module")).toHaveCount(1);
  await expect(page.getByTestId("module-toggle-X-08")).toBeVisible();
  await search.fill("");
  await page.getByRole("button", { name: "Tous les thèmes", exact: true }).click();
  await expect(page.locator(".paths-module")).toHaveCount(10);
  await prepareCapture(page);
  await page.screenshot({
    path: testInfo.outputPath("v4-complements.png"),
    fullPage: true,
    caret: "initial",
  });
  await expectNoOverflow(page);
  await page.locator('#module-content-X-09 a[href="/parcours/v4-branche-c#noeud-C-12"]').click();
  await expect(page.getByTestId("module-toggle-C-12")).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".paths-related-complements")).toContainText(
    "Sécurité opérationnelle d’une équipe d’investigation",
  );
  expect(errors).toEqual([]);
});
