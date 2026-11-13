import { expect, test } from "@playwright/test";
import fs from "node:fs";
import { LessonManifestSchema } from "@cyber-school/lesson-runtime";

const lesson = LessonManifestSchema.parse(
  JSON.parse(
    fs.readFileSync(
      new URL("../../lessons/tcp-three-way-handshake/lesson.json", import.meta.url),
      "utf8",
    ),
  ),
);
const firstExercise = lesson.exercises.find((exercise) => exercise.id === "ex-tcp-ack-number");
if (!firstExercise || firstExercise.kind === "sequence-order")
  throw new Error("Expected the ACK prediction fixture.");
const wrongOption = firstExercise.options.find(
  (option) => option.id !== firstExercise.correctOptionId,
);
if (!wrongOption) throw new Error("The ACK prediction must have a distractor.");
const wrongOptionLabel = wrongOption.label;

test.describe("TCP Three-Way Handshake interactive demonstrator", () => {
  test("renders nominal, auto-play, SYN-ACK loss and four exercises with keyboard controls", async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    // 1. Load home page and verify HTTP 200 + primary heading
    const homeResponse = await page.goto("/");
    expect(homeResponse?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Comprendre les systèmes et réseaux/i,
      }),
    ).toBeVisible();

    // 2. Navigate to TCP Three-Way Handshake demonstrator
    await page.getByRole("link", { name: /Lancer le démonstrateur/i }).click();
    await expect(page).toHaveURL(/\/lessons\/tcp-three-way-handshake/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Le protocole TCP et le Three-Way Handshake/i,
      }),
    ).toBeVisible();

    // 3. Verify initial states: CLOSED / LISTEN
    const clientBadge = page.getByTestId("client-tcp-state");
    const serverBadge = page.getByTestId("server-tcp-state");
    await expect(clientBadge).toHaveText("CLOSED");
    await expect(serverBadge).toHaveText("LISTEN");

    // 4. Nominal step progression & SVG sequence visibility
    const nextButton = page.getByRole("button", { name: "Suivant" });
    await nextButton.click();
    await expect(clientBadge).toHaveText("SYN_SENT");
    await expect(serverBadge).toHaveText("LISTEN");
    await expect(page.getByTestId("diagram-row-syn")).toBeVisible();

    await nextButton.click();
    await expect(clientBadge).toHaveText("SYN_SENT");
    await expect(serverBadge).toHaveText("SYN_RCVD");
    await expect(page.getByTestId("diagram-row-syn-ack")).toBeVisible();

    await nextButton.click();
    await expect(clientBadge).toHaveText("ESTABLISHED");
    await expect(serverBadge).toHaveText("SYN_RCVD");
    await expect(page.getByTestId("diagram-row-ack")).toBeVisible();

    // 5. Keyboard navigation on simulator region
    const simulatorRegion = page.getByRole("region", {
      name: /Simulateur interactif du Three-Way Handshake TCP/i,
    });
    await simulatorRegion.focus();
    await page.keyboard.press("ArrowRight");
    await expect(clientBadge).toHaveText("ESTABLISHED");
    await expect(serverBadge).toHaveText("ESTABLISHED");

    await page.keyboard.press("ArrowLeft");
    await expect(serverBadge).toHaveText("SYN_RCVD");

    // 6. Auto-play toggle (Lecture auto -> advances -> Pause)
    await page.getByRole("button", { name: "Réinitialiser" }).click();
    await expect(clientBadge).toHaveText("CLOSED");
    await page.getByRole("button", { name: "Lecture auto" }).click();
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
    await expect(clientBadge).toHaveText("SYN_SENT", { timeout: 5000 });
    await page.getByRole("button", { name: "Pause" }).click();
    await expect(page.getByRole("button", { name: "Lecture auto" })).toBeVisible();

    // 7. Full edge-case loss scenario: SYN-ACK lost -> RTO retransmission preserves lost row alongside retransmitted row
    await page.getByRole("button", { name: /Simuler perte du SYN-ACK/i }).click();
    await expect(clientBadge).toHaveText("CLOSED");

    await nextButton.click(); // Step 1: SYN
    await expect(clientBadge).toHaveText("SYN_SENT");

    await nextButton.click(); // Step 2: SYN-ACK lost
    await expect(
      page.getByRole("heading", { level: 2, name: /SYN-ACK est perdu sur le réseau/i }),
    ).toBeVisible();
    await expect(page.getByTestId("diagram-row-lost-syn-ack")).toBeVisible();

    await nextButton.click(); // Step 3: RTO retransmits SYN-ACK without overwriting lost row
    await expect(page.getByTestId("diagram-row-lost-syn-ack")).toBeVisible();
    await expect(page.getByTestId("diagram-row-syn-ack")).toBeVisible();

    await nextButton.click(); // Step 4: Client ESTABLISHED + ACK
    await nextButton.click(); // Step 5: Server ESTABLISHED
    await expect(clientBadge).toHaveText("ESTABLISHED");
    await expect(serverBadge).toHaveText("ESTABLISHED");

    await page.getByRole("button", { name: /Revenir au mode nominal/i }).click();

    // 8. Complete all 4 comprehension exercises + score invalidation + native radio keyboard navigation
    const scoreBadge = page.getByTestId("exercises-score-badge");
    await expect(scoreBadge).toHaveText("0 / 4 validés");

    // Exercise 1: choice + invalidation check when changing answer
    const ex1 = page.getByTestId("exercise-card-ex-tcp-ack-number");
    await ex1.getByText("seq = 300, ack = 101").click();
    await ex1.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex1.getByText("Raisonnement exact")).toBeVisible();
    await expect(scoreBadge).toHaveText("1 / 4 validés");

    // Changing option clears submitted state & invalidates score badge
    await ex1.getByText(wrongOptionLabel, { exact: true }).click();
    await expect(scoreBadge).toHaveText("0 / 4 validés");
    await ex1.getByText("seq = 300, ack = 101").click();
    await ex1.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(scoreBadge).toHaveText("1 / 4 validés");

    // Exercise 2: native radio keyboard navigation (ArrowDown / ArrowUp)
    const ex2 = page.getByTestId("exercise-card-ex-tcp-why-three-ways");
    const ex2Opt1 = ex2.getByRole("radio", {
      name: /Parce que le serveur doit vérifier que le client/i,
    });
    await ex2Opt1.focus();
    await page.keyboard.press("Space");
    await expect(ex2Opt1).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await ex2.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex2.getByText("Pas encore — analysons pourquoi")).toBeVisible();
    await expect(scoreBadge).toHaveText("1 / 4 validés");

    await ex2.getByRole("radio", { name: /Parce que TCP doit échanger des certificats/i }).focus();
    await page.keyboard.press("ArrowUp");
    await expect(ex2Opt1).toBeChecked();
    await ex2.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex2.getByText("Raisonnement exact")).toBeVisible();
    await expect(scoreBadge).toHaveText("2 / 4 validés");

    // Exercise 3: state prediction
    const ex3 = page.getByTestId("exercise-card-ex-tcp-server-half-open");
    await ex3.getByText("SYN_RCVD", { exact: true }).click();
    await ex3.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex3.getByText("Raisonnement exact")).toBeVisible();
    await expect(scoreBadge).toHaveText("3 / 4 validés");

    // Exercise 4: sequence ordering + reset score invalidation check
    const ex4 = page.getByTestId("exercise-card-ex-tcp-order-transitions");
    const moveSynUp = ex4.getByRole("button", {
      name: /Monter Le client passe en SYN_SENT/i,
    });
    await moveSynUp.click();
    await moveSynUp.click();
    await ex4.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex4.getByText("Raisonnement exact")).toBeVisible();
    await expect(scoreBadge).toHaveText("4 / 4 validés");

    await ex4.getByRole("button", { name: "Réessayer" }).click();
    await expect(scoreBadge).toHaveText("3 / 4 validés");
    await ex4.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(ex4.getByText("Pas encore — analysons pourquoi")).toBeVisible();
    await expect(scoreBadge).toHaveText("3 / 4 validés");
    await moveSynUp.click();
    await moveSynUp.click();
    await ex4.getByRole("button", { name: "Vérifier ma réponse" }).click();
    await expect(scoreBadge).toHaveText("4 / 4 validés");

    // 9. Capture desktop screenshot + overflow + landmark + performance checks
    await page.screenshot({ path: testInfo.outputPath("tcp-handshake-flow.png"), fullPage: true });

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(hasOverflow).toBe(false);

    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigation principale" })).toBeVisible();

    const domLoadedMs = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;
      return nav ? nav.domContentLoadedEventEnd : 0;
    });
    expect(domLoadedMs).toBeLessThan(5000);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("snaps cleanly when prefers-reduced-motion is reduce", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/lessons/tcp-three-way-handshake");

    const reducedActive = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    expect(reducedActive).toBe(true);

    const clientBadge = page.getByTestId("client-tcp-state");
    const serverBadge = page.getByTestId("server-tcp-state");
    const nextButton = page.getByRole("button", { name: "Suivant" });

    await nextButton.click();
    await expect(page.getByTestId("diagram-row-syn")).toBeVisible();
    const progressTransition = await page
      .getByRole("progressbar")
      .locator("div")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(progressTransition).toBe("0s");

    await nextButton.click();
    await nextButton.click();
    await nextButton.click();

    await expect(clientBadge).toHaveText("ESTABLISHED");
    await expect(serverBadge).toHaveText("ESTABLISHED");
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    // Verify dynamic route [slug] returns HTTP 404 for unknown lessons
    const unknownResponse = await page.goto("/lessons/unknown-lesson-slug");
    expect(unknownResponse?.status()).toBe(404);
    expect(pageErrors).toEqual([]);
  });

  test("renders cleanly without horizontal overflow on mobile (375x812)", async ({
    page,
  }, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(err.message));

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const homeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(homeOverflow).toBe(false);

    await page.goto("/lessons/tcp-three-way-handshake");
    await expect(page.getByTestId("client-tcp-state")).toHaveText("CLOSED");

    const lessonOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(lessonOverflow).toBe(false);

    await page.screenshot({
      path: testInfo.outputPath("tcp-handshake-mobile.png"),
      fullPage: true,
    });
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});
