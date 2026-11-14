import { expect, test } from "@playwright/test";

test("catalog discovery and the first byte respond to the learner", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Le déclic");
  await page.getByRole("button", { name: "Augmenter le nombre" }).click();
  await expect(page.locator("output")).toContainText("43");
  await expect(page.getByLabel("43 en binaire : 00101011")).toBeVisible();
  await page.getByRole("button", { name: "Diminuer le nombre" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("output")).toContainText("42");

  const search = page.getByRole("searchbox", { name: "Rechercher un cours" });
  await search.fill("memoire");
  await expect(page.locator(".course-tile")).toHaveCount(1);
  await expect(page.getByTestId("home-lesson-link-program-memory-fundamentals")).toBeVisible();
  await search.fill("inexistant-xyz");
  await expect(
    page.getByRole("heading", { name: "Aucun cours pour cette recherche" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Afficher tous les cours", exact: true }).click();
  await page.getByRole("button", { name: "Réseaux", exact: true }).click();
  await expect(page.locator(".course-tile")).toHaveCount(1);
  await expect(page.getByTestId("home-lesson-link-tcp-three-way-handshake")).toBeVisible();
  await page.getByRole("button", { name: /^Tous/ }).click();
  await expect(page.getByTestId("home-lesson-link-program-memory-fundamentals")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("studio-home.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  expect(errors).toEqual([]);
});

test("guided chapters preserve answers and support keyboard navigation", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lessons/program-memory-fundamentals");
  const first = page.getByTestId("chapter-filter-step-cpu-bytes");
  await expect(first).toHaveAttribute("aria-current", "step");
  await expect(page.getByTestId("vis-02-virtual-memory")).toBeHidden();
  const ex = page.getByTestId("exercise-card-ex-mem-01");
  await ex.getByRole("radio", { name: /Pendant la phase Fetch/ }).focus();
  await page.keyboard.press("Space");
  await expect(ex.getByRole("radio", { name: /Pendant la phase Fetch/ })).toBeChecked();
  await ex.getByRole("button", { name: /Vérifier/ }).click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText("1 / 16");
  await page.getByTestId("chapter-filter-step-virtual-segments").focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Pourquoi chaque programme a son espace" }),
  ).toBeFocused();
  await expect(page.getByTestId("vis-02-virtual-memory")).toBeVisible();
  await first.click();
  await expect(ex.getByRole("radio", { name: /Pendant la phase Fetch/ })).toBeChecked();
  await expect(ex.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();
  await ex.getByText(/Uniquement pendant Execute/).click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText("0 / 16");
  await ex.getByRole("button", { name: /Vérifier/ }).click();
  await expect(ex.getByText(/Ce rôle appartient aux registres généraux/)).toBeVisible();
  await page.getByRole("button", { name: "Chapitre suivant", exact: true }).click();
  await expect(page.getByTestId("chapter-filter-step-virtual-segments")).toHaveAttribute(
    "aria-current",
    "step",
  );
  await page.getByTestId("chapter-filter-all").click();
  await expect(page.getByTestId("vis-01-cpu-memory")).toBeVisible();
  await expect(page.getByTestId("vis-05-memory-models")).toBeVisible();
  await page.getByTestId("chapter-filter-all").click();
  await expect(page.getByTestId("vis-05-memory-models")).toBeHidden();
  await page.getByTestId("chapter-filter-step-models-uaf-reality").click();
  await page
    .getByTestId("assessment-card-eval-mem-01-execution-segments")
    .getByRole("link")
    .first()
    .click();
  await expect(first).toHaveAttribute("aria-current", "step");
  await expect(ex).toBeFocused();
  await page.locator("#lesson-resources > summary").click();
  await expect(page.getByRole("heading", { name: "Les références du cours" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("studio-memory.png"), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  const fontSize = await page
    .locator(".learning-note p")
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeGreaterThanOrEqual(14);
});
