import { expect, test } from "@playwright/test";

test.describe("V4 Curriculum Factory Explorer & TC-00 Pilot Course", () => {
  test("explores /curriculum V4 catalog, filters eligible TC-00 units, opens scientific-reasoning-and-proof, exercises VIS-01/VIS-02 and assessment", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.emulateMedia({ reducedMotion: "reduce" });

    // 1. Navigate from Home -> /curriculum
    const homeRes = await page.goto("/");
    expect(homeRes?.status()).toBe(200);
    await page.getByTestId("nav-curriculum-v4").click();
    await expect(page).toHaveURL(/\/curriculum/);
    await expect(page.getByTestId("v4-catalog-explorer")).toBeVisible();

    await expect(page.getByTestId("v4-kpi-micro")).toHaveText("1122");
    await expect(page.getByTestId("v4-kpi-units")).toHaveText("159");

    // 2. Filter by eligible units first, then search TC00.005 across full catalog
    await page.getByTestId("v4-eligible-toggle").click();
    await expect(page.getByTestId("v4-unit-card-unit-tc00-uncertainty-errors")).toBeVisible();
    await page.getByTestId("v4-eligible-toggle").click();

    await page.getByTestId("v4-search-input").fill("TC00.005");
    await page.getByTestId("v4-expand-unit-tc00-observation-hypotheses").click();
    await expect(page.getByTestId("v4-unit-card-unit-tc00-observation-hypotheses")).toContainText(
      "TC00.005",
    );
    await page.getByTestId("v4-open-lesson-scientific-reasoning-and-proof").click();

    // 3. Verify TC-00 Pilot Course renders & desktop no overflow
    await expect(page).toHaveURL(/\/lessons\/scientific-reasoning-and-proof/);
    await expect(page.getByTestId("reasoning-course-experience")).toBeVisible();
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desktopOverflow).toBe(false);

    // 4. Exercise VIS-01 Causal Graph & Confounding Variable Z (keyboard + buttons)
    const vis01 = page.getByTestId("vis-causal-confounder");
    await expect(vis01).toBeVisible();
    await page.getByTestId("causal-next-btn").click();
    await expect(page.getByTestId("causal-stage-badge")).toContainText("Étape 2 / 4");
    await vis01.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("causal-stage-badge")).toContainText("Étape 3 / 4");
    await expect(page.getByTestId("causal-stage-title")).toContainText("confondante Z");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("causal-stage-title")).toContainText("do(X = OFF)");
    await expect(page.getByTestId("vis01-causal-banner")).toContainText("410 → 408");

    // 5. Exercise VIS-02 Minimal Counterexample Falsifier
    await expect(page.getByTestId("vis02-counterexample-banner")).toBeVisible();
    await page.getByTestId("counterexample-toggle-public-healthz").click();
    await expect(page.getByTestId("counterexample-status-badge")).toContainText(
      "Contre-exemple minimal valide",
    );
    await expect(page.getByTestId("vis02-counterexample-banner")).toContainText(
      "Réfutation minimale",
    );
    await page.getByTestId("counterexample-toggle-firefox-linux").click();
    await expect(page.getByTestId("counterexample-status-badge")).toContainText("non minimale");
    await page.getByTestId("counterexample-toggle-firefox-linux").click();
    await expect(page.getByTestId("counterexample-status-badge")).toContainText(
      "Contre-exemple minimal valide",
    );

    // 6. Solve ex-tc00-01 and verify assessment runner renders
    const ex1 = page.getByTestId("exercise-card-ex-tc00-01");
    await ex1.getByText(/412 échecs d'authentification/i).click();
    await ex1.getByRole("button", { name: /Vérifier/i }).click();
    await expect(page.getByTestId("reasoning-score-badge")).toContainText("1 / 6");
    await expect(page.getByTestId("assessment-runner")).toBeVisible();

    // 7. Mobile 375px check on both /lessons/scientific-reasoning-and-proof and /curriculum
    await page.setViewportSize({ width: 375, height: 812 });
    const mobileLessonOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(mobileLessonOverflow).toBe(false);

    await page.goto("/curriculum");
    await expect(page.getByTestId("v4-catalog-explorer")).toBeVisible();
    const mobileCatalogOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(mobileCatalogOverflow).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
