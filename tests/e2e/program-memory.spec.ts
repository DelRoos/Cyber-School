import { expect, test } from "@playwright/test";

test.describe("Program Memory Fundamentals interactive course", () => {
  test("navigates from home, exercises all 5 simulators, checks reduced-motion and assessments", async ({
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

    // 1. Navigate from Home -> Course
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
    await page.getByTestId("home-lesson-link-program-memory-fundamentals").click();
    await expect(page).toHaveURL(/\/lessons\/program-memory-fundamentals/);
    await expect(page.getByTestId("memory-course-experience")).toBeVisible();

    // Verify no desktop horizontal overflow
    const desktopOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(desktopOverflow).toBe(false);

    // 2. VIS-01: Step forward through CPU execution & observe little-endian bytes 78 56 34 12
    const vis01 = page.getByTestId("vis-01-cpu-memory");
    await expect(vis01).toBeVisible();
    await page.getByTestId("vis01-next-step").click();
    await expect(page.getByTestId("vis01-phase-badge")).not.toHaveText("");
    // Step to write completion (total steps ~ 8 in default write preset; press ArrowRight until little-endian 0x1008 updates)
    await vis01.focus();
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowRight");
    }
    await expect(page.getByTestId("vis01-byte-0x1008")).toContainText("78");

    // 3. VIS-02: Trigger SIGSEGV when writing into .text
    await expect(page.getByTestId("vis-02-virtual-memory")).toBeVisible();
    await page.getByTestId("vis02-action-write-text").click();
    await expect(page.getByTestId("vis02-outcome-badge")).toContainText(/SIGSEGV/i);

    // 4. VIS-03: Switch to Dangling Pointer scenario and step until overwrite hazard appears
    await expect(page.getByTestId("vis-03-call-stack")).toBeVisible();
    await page.getByTestId("vis03-tab-dangling-pointer").click();
    for (let i = 0; i < 6; i++) {
      const nextBtn = page.getByTestId("vis03-next-step");
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
      }
    }
    await expect(page.getByTestId("vis03-hazard-badge")).not.toContainText("Fonction :");

    // 5. VIS-04: Load Use-After-Free preset and verify hazard + SVG chart
    await expect(page.getByTestId("vis-04-heap-allocator")).toBeVisible();
    await page.getByTestId("vis04-preset-use-after-free").click();
    await expect(page.getByTestId("vis04-hazard-badge")).toContainText(/Use-After-Free/i);
    await expect(page.getByTestId("vis04-svg-chart")).toBeVisible();

    // 6. VIS-05: Compare use-after-move across C / Rust / GC and inspect Rust compile-blocked
    await expect(page.getByTestId("vis-05-memory-models")).toBeVisible();
    await page.getByTestId("vis05-scenario-use-after-move").click();
    for (let i = 0; i < 4; i++) {
      await page.getByTestId("vis05-next-step").click();
    }
    await expect(page.getByTestId("vis05-status-rust-raii")).toContainText(
      /Refusé à la compilation/i,
    );
    await expect(page.getByTestId("vis05-svg-chart")).toBeVisible();

    // 7. Complete representative exercises (MC, state-prediction, diagram-probe) & check AssessmentRunner
    // EX-01 (multiple-choice)
    const ex01 = page.getByTestId("exercise-card-ex-mem-01");
    await ex01.scrollIntoViewIfNeeded();
    await ex01.getByText(/Pendant la phase Fetch/i).click();
    await ex01.getByRole("button", { name: /Vérifier/i }).click();
    await expect(ex01.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();

    // EX-02 (state-prediction)
    const ex02 = page.getByTestId("exercise-card-ex-mem-02");
    await ex02.getByText(/0x78 à 0x1008/i).click();
    await ex02.getByRole("button", { name: /Vérifier/i }).click();

    // EX-06 (diagram-probe)
    const ex06 = page.getByTestId("exercise-card-ex-mem-06");
    await ex06.getByText(/Segment Data \(\.data\)/i).click();
    await ex06.getByRole("button", { name: /Vérifier/i }).click();
    await expect(ex06.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();

    // Verify AssessmentRunner updates dynamically
    await expect(page.getByTestId("assessment-card-eval-mem-01-execution-segments")).toContainText(
      /3 \/ 6 traités/,
    );

    // 8. Check GDB -O0 vs -O2 card & chapter filter
    await expect(page.getByTestId("gdb-compiler-reality-card")).toBeVisible();
    await page.getByTestId("chapter-filter-step-cpu-bytes").click();
    await expect(page.getByTestId("vis-01-cpu-memory")).toBeVisible();
    await expect(page.getByTestId("vis-02-virtual-memory")).toHaveCount(0);
    await page.getByTestId("chapter-filter-all").click();
    await expect(page.getByTestId("vis-02-virtual-memory")).toBeVisible();

    // 9. Verify 375x812 responsive mobile viewport without horizontal overflow
    await page.setViewportSize({ width: 375, height: 812 });
    const mobileOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(mobileOverflow).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
