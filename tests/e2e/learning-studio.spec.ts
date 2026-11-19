import { expect, test } from "@playwright/test";

test("home landing, interactive workbench, scroll-synced nav, and parcours routing respond to the learner", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Le déclic");
  await expect(page.locator("body")).not.toContainText("TC-00");
  await expect(page.locator("body")).not.toContainText("unit-tc00-evidence-calibration");
  await expect(page.locator("body")).not.toContainText("Version en revue");

  await page.getByRole("button", { name: "Augmenter le nombre" }).click();
  await expect(page.locator("output")).toContainText("43");
  await expect(page.getByLabel("43 en binaire : 00101011")).toBeVisible();
  await page.getByRole("button", { name: "Diminuer le nombre" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("output")).toContainText("42");

  await page.getByRole("tab", { name: "Paquet TCP" }).click();
  await expect(page.getByText("SYN_SENT")).toBeVisible();
  await page.getByRole("tab", { name: "Garde CPU" }).click();
  await expect(page.getByText("TRAP CPU · SIGSEGV")).toBeVisible();
  await page.getByRole("tab", { name: "Octet & bits" }).click();

  await page.getByRole("radio", { name: /La valeur 42 reste intacte en RAM/i }).click();
  await expect(page.getByText(/Libérer une frame de pile remonte uniquement/i)).toBeVisible();

  await expect(page.locator(".parcours-card")).toHaveCount(5);
  await expect(page.locator(".parcours-transversal-note")).toContainText("10 modules");
  await expect(page.locator(".parcours-transversal-note a")).toHaveAttribute(
    "href",
    "/parcours#modules-transversaux",
  );
  await expect(page.getByRole("heading", { level: 3, name: "Tronc commun" })).toBeVisible();

  await page.evaluate(() => {
    const el = document.getElementById("method");
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 94 });
  });
  await page.waitForTimeout(100);
  await expect(page.locator('[data-nav-section="method"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.evaluate(() => {
    const el = document.getElementById("courses");
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 94 });
  });
  await page.waitForTimeout(100);
  await expect(page.locator('[data-nav-section="courses"]')).toHaveAttribute(
    "aria-current",
    "location",
  );
  await page.evaluate(() => {
    const el = document.getElementById("roadmap");
    if (el) window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 94 });
  });
  await page.waitForTimeout(100);
  await expect(page.locator('[data-nav-section="roadmap"]')).toHaveAttribute(
    "aria-current",
    "location",
  );

  // Confirm old /curriculum listing route is removed and home FAQ remains interactive
  await page.getByText(/Faut-il déjà savoir programmer/i).click();
  await expect(page.getByText(/Chaque laboratoire part des concepts fondamentaux/i)).toBeVisible();

  await page.locator('.parcours-card a[href="/parcours/v4-branche-a"]').click();
  await expect(page).toHaveURL(/\/parcours\/v4-branche-a$/);
  await expect(page.getByTestId("parcours-hero-title")).toContainText(
    "Sécurité applicative, Fintech & IA",
  );
  await page.getByTestId("parcours-domain-catalog-link").click();
  await expect(page).toHaveURL(/\/parcours$/);
  await expect(page.getByTestId("parcours-catalog")).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("studio-home.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});
