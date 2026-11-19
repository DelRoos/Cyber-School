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

test("MDX+YAML 28-slide course overview, 4 progressive chapters, worked examples, micro-checks, real ObservationWorkbench (Cas 3A & 3B), reference sheet, 12-question quiz and persistence work end-to-end", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors = collectErrors(page);
  const response = await page.goto("/cours/observation-et-interpretation");
  expect(response?.status()).toBe(200);

  // Course overview landing page
  await expect(page.getByTestId("course-main-heading")).toHaveText(
    "Distinguer une observation d'une interprétation",
  );
  await expect(page.locator("body")).not.toContainText("TC00.001");
  await expect(page.locator("body")).not.toContainText("unit-tc00-observation-interpretation");
  await expect(page.locator("body")).not.toContainText("Version en revue");
  await expect(page.locator("#course-overview-section")).toContainText("TechNova");
  await expect(page.getByRole("heading", { name: "Table des matières" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objectifs pédagogiques" })).toBeVisible();
  await expect(page.getByTestId("course-start-listening-btn")).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("course-overview.png"),
    fullPage: true,
  });

  // Start course -> Chapter 1 (Reading mode)
  await page.getByTestId("course-start-btn").click();
  await expect(page.locator("#ch-1-decomposez-alerte")).toBeVisible();
  await expect(page.locator("#ch-2-mesure-et-angles-morts")).toBeHidden();
  await expect(page.locator("#ch-1-decomposez-alerte")).toContainText(
    "Autopsiez une alerte avant d'agir",
  );

  // Interactive diagram + inline Micro-Check (Retrieval Practice)
  await page.getByRole("button", { name: /Attaquant externe/i }).click();
  await expect(page.locator("#ch-1-decomposez-alerte")).toContainText("Ajout supposé n°1");

  const mc1 = page.getByTestId("micro-check-mc-ch1-autopsy");
  await expect(mc1).toBeVisible();
  await mc1.getByTestId("micro-check-opt-mc-ch1-rfc1918").click();
  await expect(page.getByTestId("micro-check-feedback-mc-ch1-autopsy")).toContainText(
    "Réflexe exact",
  );

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("course-chapter-1-reading.png"),
    fullPage: false,
  });

  // Advance to Chapter 2 (Real OpenSSH log + 3 Blind Spots + Worked Example + Micro-Check)
  await page.locator("#ch-1-decomposez-alerte").getByTestId("chapter-next-btn").click();
  await expect(page.locator("#ch-2-mesure-et-angles-morts")).toBeVisible();
  await expect(page.locator("#ch-2-mesure-et-angles-morts")).toContainText("/var/log/auth.log");
  await expect(
    page.locator("#ch-2-mesure-et-angles-morts").getByTestId("worked-example-block"),
  ).toBeVisible();
  await expect(
    page.locator("#ch-2-mesure-et-angles-morts").getByTestId("worked-example-block"),
  ).toContainText("Pourquoi :");
  await page
    .getByTestId("micro-check-mc-ch2-invariance")
    .getByTestId("micro-check-opt-mc-ch2-none")
    .click();
  await expect(page.getByTestId("micro-check-feedback-mc-ch2-invariance")).toContainText(
    "Réflexe exact",
  );

  // Advance to Chapter 3 (Refutation funnel + REAL deterministic ObservationWorkbench: Cas 3A & Cas 3B)
  await page.locator("#ch-2-mesure-et-angles-morts").getByTestId("chapter-next-btn").click();
  await expect(page.locator("#ch-3-recoupez-sources")).toBeVisible();

  const workbench = page.getByTestId("observation-workbench");
  await expect(workbench).toHaveCount(1);
  await expect(workbench).toBeVisible();
  await expect(workbench.getByTestId("metric-fields")).toHaveText("5 champs");
  await expect(workbench.getByTestId("metric-sources")).toHaveText("1 / 3");
  await expect(workbench.getByTestId("metric-compatible")).toHaveText("3 pistes");
  await expect(workbench.getByTestId("metric-unsupported")).toHaveText("0");

  // Sensor blindness invariance across upstream causes
  await workbench.getByTestId("cause-btn-h2-scheduled-script-old-password").click();
  await expect(workbench.getByTestId("metric-fields")).toHaveText("5 champs");
  await workbench.getByTestId("cause-btn-h3-unauthorized-lateral").click();
  await expect(workbench.getByTestId("metric-fields")).toHaveText("5 champs");

  // Premature conclusion trap
  await workbench.getByTestId("select-hyp-h3-unauthorized-lateral").click();
  await expect(workbench.getByTestId("metric-unsupported")).toHaveText("0");
  await workbench.getByTestId("claim-as-fact-checkbox").check();
  await expect(workbench.getByTestId("metric-unsupported")).toHaveText("1");
  await expect(workbench.getByTestId("workbench-verdict-title")).toContainText(
    "Conclusion prématurée",
  );
  await workbench.getByTestId("claim-as-fact-checkbox").uncheck();
  await expect(workbench.getByTestId("metric-unsupported")).toHaveText("0");

  // Source 2: CMDB (3 -> 2 pistes)
  await workbench.getByTestId("mode-btn-with-inventory").click();
  await expect(workbench.getByTestId("metric-sources")).toHaveText("2 / 3");
  await expect(workbench.getByTestId("metric-compatible")).toHaveText("2 pistes");

  // Source 3A: Backup log (2 -> 1 piste: H2 corroborated)
  await workbench.getByTestId("mode-btn-with-inventory-and-backup-log").click();
  await expect(workbench.getByTestId("metric-sources")).toHaveText("3 / 3");
  await expect(workbench.getByTestId("metric-compatible")).toHaveText("1 piste");
  await workbench.getByTestId("select-hyp-h2-scheduled-script-old-password").click();
  await expect(workbench.getByTestId("workbench-verdict-title")).toContainText(
    "Conclusion corroborée par 3 sources",
  );

  // Source 3B: Interactive shell log (H3 corroborated — hostile incident!)
  await workbench.getByTestId("mode-btn-with-inventory-and-interactive-shell").click();
  await expect(workbench.getByTestId("metric-sources")).toHaveText("3 / 3");
  await expect(workbench.getByTestId("metric-compatible")).toHaveText("1 piste");
  await workbench.getByTestId("select-hyp-h3-unauthorized-lateral").click();
  await expect(workbench.getByTestId("workbench-verdict-title")).toContainText(
    "Conclusion corroborée par 3 sources",
  );

  // Explicit model limits disclosure
  const modelLimits = page.getByTestId("experience-model-limits");
  await expect(modelLimits).toBeVisible();

  await workbench.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: testInfo.outputPath("course-chapter-3-real-workbench.png"),
    fullPage: false,
  });

  // Advance to Chapter 4 (3-part ticket + Transfer Table + EDR Worked Example + Transfer Pad + Reference Sheet + Sources)
  await page.locator("#ch-3-recoupez-sources").getByTestId("chapter-next-btn").click();
  await expect(page.locator("#ch-4-redigez-constat")).toBeVisible();
  await expect(page.locator("#ch-4-redigez-constat")).toContainText(
    "Liste rouge · À ne jamais écrire dans le volet",
  );
  await expect(page.locator("#ch-4-redigez-constat table")).toContainText("EXECUTION_BLOCKED");
  await expect(
    page.locator("#ch-4-redigez-constat").getByTestId("worked-example-block"),
  ).toBeVisible();
  await expect(
    page.locator("#ch-4-redigez-constat").getByTestId("reference-sheet-block"),
  ).toBeVisible();
  await expect(
    page.locator("#ch-4-redigez-constat").getByTestId("lesson-summary-block"),
  ).toContainText("En résumé");

  const chapterSources = page.getByTestId("last-chapter-sources-section");
  await expect(chapterSources).toBeVisible();
  await expect(chapterSources).toContainText("NIST SP 800-92");
  await expect(chapterSources).toContainText("NIST SP 800-61r3");
  await expect(chapterSources).toContainText("RFC 1918");
  const nistLink = chapterSources.getByRole("link", { name: /^Source$/i }).first();
  await expect(nistLink).toHaveAttribute(
    "href",
    "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf",
  );

  const textarea = page.locator("#transfer-response-input");
  await textarea.fill(
    "Observation : backup-agent consigne UPLOAD_REJECTED sur archives-rh.zip (quota_exceeded).",
  );

  // Advance to Final Quiz (12 high-signal questions)
  await page.locator("#ch-4-redigez-constat").getByTestId("chapter-next-btn").click();
  await expect(page.locator("#part-quiz-view")).toBeVisible();
  await expect(page.locator("#part-quiz-view")).toContainText("Question 1");
  await expect(page.locator("#part-quiz-view")).toContainText("Question 12");

  const ex1 = page.getByTestId("exercise-card-ex-obs-01-prediction");
  await expect(ex1.getByRole("button", { name: /^Chapitre 2$/ })).toBeVisible();
  await ex1.getByText(/Les quatre champs \(service, event, account, source_ip\) restent/i).click();
  await expect(ex1).not.toContainText("Raisonnement exact");

  await page
    .getByTestId("exercise-card-ex-obs-02-classification")
    .getByText(
      /Le journal sshd de srv-paie-01 consigne 3 événements AUTH_FAILURE visant c\.moreau/i,
    )
    .click();

  const ex3Card = page.getByTestId("exercise-card-ex-obs-05-corroboration");
  await expect(ex3Card.getByRole("button", { name: /^Chapitre 3$/ })).toBeVisible();
  await ex3Card
    .getByText(/La faute de frappe depuis le poste de Claire \(H1\) est écartée/i)
    .click();

  const ex3 = page.getByTestId("exercise-card-ex-obs-03-sequence");
  await ex3.getByRole("button", { name: /Monter Relever les champs exacts/i }).click();
  await ex3.getByRole("button", { name: /Monter Relever les champs exacts/i }).click();
  await ex3.getByRole("button", { name: /Monter Recenser toutes les hypothèses/i }).click();
  await ex3.getByRole("button", { name: /Monter Recenser toutes les hypothèses/i }).click();

  await page
    .getByTestId("exercise-card-ex-obs-04-transfer")
    .getByText(/Observation : antivirus-agent consigne EXECUTION_BLOCKED sur nettoyage\.sh/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-06-account-meaning")
    .getByText(/Un client joignant le serveur depuis 192\.168\.1\.45 a soumis l'identifiant/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-07-vocabulary-bias")
    .getByText(/Les termes « malveillante », « agressive » et « a tenté d'extraire »/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-08-firewall-drop")
    .getByText(/le pare-feu a consigné le rejet \(DROP\) d'un paquet TCP/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-09-corroboration-local-cron")
    .getByText(/Il corrobore fortement la piste du script de sauvegarde \(H2\)/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-12-ntp-drift")
    .getByText(/Vérifier l'état de synchronisation NTP et la dérive d'horloge/i)
    .click();

  await page
    .getByTestId("exercise-card-ex-obs-13-absence-of-log")
    .getByText(/Aucune anomalie n'est consignée dans ce fichier local/i)
    .click();

  const ex12Card = page.getByTestId("exercise-card-ex-obs-16-reverse-dns-trap");
  await expect(ex12Card.getByRole("button", { name: /^Chapitre 2$/ })).toBeVisible();
  await ex12Card
    .getByText(/Parce que le détenteur de la plage IP peut inscrire n'importe quel texte/i)
    .click();

  await page.getByTestId("quiz-submit-all-btn").click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText(
    "12 / 12 exercices validés (100 %)",
  );
  await expect(page.getByTestId("assessment-status-text")).toContainText(
    "Bravo : vous avez validé 12 exercices sur 12 (100 %). Quiz réussi !",
  );
  await expect(page.locator("#part-quiz-view")).not.toContainText("OpenClassrooms");
  await expect(ex1).toContainText("Raisonnement exact");

  // Reload persistence
  await page.reload();
  await expect(page.getByTestId("exercises-score-badge")).toContainText(
    "12 / 12 exercices validés",
  );

  // Top "Recommencer le quiz" resets quiz answers WITHOUT wiping Chapter 4 transfer draft
  await page.getByTestId("clear-course-progress-btn").click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText(
    "0 / 12 questions renseignées",
  );

  // Open sidebar if auto-collapsed on mobile, then navigate back to Chapter 4
  const reopenBtn = page.getByTestId("reopen-toc-btn");
  if (await reopenBtn.isVisible()) {
    await reopenBtn.click();
  }
  await page.getByTestId("toc-chapter-ch-4-redigez-constat").click();
  await expect(page.locator("#transfer-response-input")).toHaveValue(
    /backup-agent consigne UPLOAD_REJECTED/,
  );

  // Sidebar collapse & reopen
  await page.getByRole("button", { name: "Replier la table des matières" }).click();
  await expect(page.getByTestId("reopen-toc-btn")).toBeVisible();
  await page.getByTestId("reopen-toc-btn").click();
  await expect(page.getByTestId("desktop-outline")).toBeVisible();

  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});

test("editing a verified answer invalidates the score and blocked storage keeps the course usable", async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  const page = await context.newPage();
  const errors = collectErrors(page);

  await page.goto("/cours/observation-et-interpretation");
  await page.getByTestId("overview-quiz-btn").click();
  const ex1 = page.getByTestId("exercise-card-ex-obs-01-prediction");
  await ex1.getByText(/Les quatre champs \(service, event, account, source_ip\) restent/i).click();
  await page.getByTestId("quiz-submit-all-btn").click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText("1 / 12 exercices validés");

  await ex1.getByText(/Le code d'événement passe de AUTH_FAILURE à SCRIPT_FAILURE/i).click();
  await expect(page.getByTestId("exercises-score-badge")).toContainText(
    "1 / 12 questions renseignées",
  );

  expect(errors).toEqual([]);
  await context.close();
});

test("course page reflows cleanly at 320px in both Guided Theater and Reading modes with reduced motion and keyboard navigation", async ({
  page,
}, testInfo) => {
  const errors = collectErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 812 });

  const response = await page.goto("/cours/observation-et-interpretation");
  expect(response?.status()).toBe(200);
  await expect(page.getByTestId("course-main-heading")).toBeVisible();
  await expectNoOverflow(page);

  // Check Guided Theater Mode at 320px (zero transport-dock overlap)
  await page.getByTestId("course-start-listening-btn").click();
  await expect(page.getByTestId("guided-listening-stage")).toBeVisible();
  await expect(page.getByTestId("slide-layout-hero-dilemma")).toBeVisible();
  const slideBox320 = await page.getByTestId("slide-layout-hero-dilemma").boundingBox();
  const dockBox320 = await page.getByTestId("studio-transport-dock").boundingBox();
  expect(slideBox320).not.toBeNull();
  expect(dockBox320).not.toBeNull();
  expect(dockBox320!.y).toBeGreaterThanOrEqual(slideBox320!.y + slideBox320!.height - 2);
  await expectNoOverflow(page);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("course-theater-320.png"),
    fullPage: true,
  });

  // Switch to Reading Mode and verify synced audio bar buttons never clip past 320px
  await page.getByTestId("switch-to-reading-from-stage").click();
  const readingBarClipped = await page.evaluate(() => {
    const bar = document.querySelector('[data-testid="course-synced-audio-bar"]');
    if (!bar) return true;
    const buttons = Array.from(bar.querySelectorAll("button")).filter((btn) => {
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return buttons.some((btn) => btn.getBoundingClientRect().right > window.innerWidth + 1);
  });
  expect(readingBarClipped).toBe(false);
  const reopenBtn = page.getByTestId("reopen-toc-btn");
  if (await reopenBtn.isVisible()) {
    await reopenBtn.click();
  }
  await page.getByTestId("toc-chapter-ch-3-recoupez-sources").click();
  const workbench = page.getByTestId("observation-workbench");
  const nextBtn = workbench.getByTestId("workbench-next-step");
  await nextBtn.focus();
  await page.keyboard.press("Enter");
  await expect(workbench.getByTestId("metric-sources")).toHaveText("2 / 3");
  await expectNoOverflow(page);

  expect(errors).toEqual([]);
});

test("removed legacy course slugs return 404 and the curriculum links to the first lesson", async ({
  page,
}) => {
  await page.goto("/parcours/v4-tronc-commun");
  const firstLessonLink = page.getByTestId("parcours-first-lesson-link");
  await expect(firstLessonLink).toBeVisible();
  await firstLessonLink.click();
  await expect(page).toHaveURL(/\/cours\/observation-et-interpretation$/);
  await expect(page.getByTestId("course-main-heading")).toHaveText(
    "Distinguer une observation d'une interprétation",
  );

  for (const oldSlug of [
    "tcp-three-way-handshake",
    "program-memory-fundamentals",
    "scientific-reasoning-and-proof",
  ]) {
    const res = await page.goto(`/cours/${oldSlug}`);
    expect(res?.status()).toBe(404);
  }
});

test("Studio Presentation Theater (28 expressive slides), dual Ogg+MP3 audio, single-controller mode-switch continuity, and Mayer Redundancy work end-to-end", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors = collectErrors(page);
  await page.goto("/cours/observation-et-interpretation");

  // Overview: audio strictly absent
  await expect(page.getByTestId("course-audio-element")).toHaveCount(0);
  await expect(page.getByTestId("course-synced-audio-bar")).toBeHidden();

  // Enter Guided Studio Theater directly from Overview -> sidebar auto-collapses for wide cinema view
  await page.getByTestId("course-start-listening-btn").click();
  const stage = page.getByTestId("guided-listening-stage");
  await expect(stage).toBeVisible();
  await expect(page.getByTestId("desktop-outline")).toBeHidden();
  await expect(page.getByTestId("course-synced-audio-bar")).toBeHidden();
  await expect(page.getByTestId("studio-transport-dock")).toBeVisible();

  // Slide 1 / 7 -> Expressive hero-dilemma layout with non-overlapping attached transport bar
  await expect(stage).toContainText("Mode écoute guidée · Diapo 1 / 7");
  await expect(page.getByTestId("slide-layout-hero-dilemma")).toBeVisible();
  await expect(page.getByTestId("guided-slides-toc")).toBeVisible();
  await expect(page.getByTestId("audio-active-cue-title")).toContainText(
    "Le dilemme de 08:15 UTC chez TechNova",
  );
  const heroBox = await page.getByTestId("slide-layout-hero-dilemma").boundingBox();
  const dockBox = await page.getByTestId("studio-transport-dock").boundingBox();
  expect(heroBox).not.toBeNull();
  expect(dockBox).not.toBeNull();
  expect(dockBox!.y).toBeGreaterThanOrEqual(heroBox!.y + heroBox!.height - 2);

  // On desktop, slides outline sits to the LEFT of the slide canvas like a vertical Table des matières
  if (testInfo.project.name === "chromium-desktop") {
    const tocBox = await page.getByTestId("guided-slides-toc").boundingBox();
    const pill1Box = await page.getByTestId("listening-scene-pill-ch1-s1-crise").boundingBox();
    const pill2Box = await page
      .getByTestId("listening-scene-pill-ch1-s2-alerte-vs-log")
      .boundingBox();
    expect(tocBox).not.toBeNull();
    expect(pill1Box).not.toBeNull();
    expect(pill2Box).not.toBeNull();
    expect(tocBox!.x + tocBox!.width).toBeLessThanOrEqual(heroBox!.x + 8);
    expect(pill2Box!.y).toBeGreaterThan(pill1Box!.y);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("theater-ch1-hero-dilemma.png"),
    fullPage: false,
  });

  // Verify dual Ogg Opus + MP3 <source> assets both respond HTTP 200
  const oggSrc = await page
    .locator('[data-testid="course-audio-element"] source[type*="ogg"]')
    .getAttribute("src");
  const mp3Src = await page
    .locator('[data-testid="course-audio-element"] source[type*="mpeg"]')
    .getAttribute("src");
  expect(oggSrc).toBe("/audio/lessons/observation-et-interpretation/ch-1-decomposez-alerte.ogg");
  expect(mp3Src).toBe("/audio/lessons/observation-et-interpretation/ch-1-decomposez-alerte.mp3");
  expect((await page.request.get(oggSrc!)).status()).toBe(200);
  expect((await page.request.get(mp3Src!)).status()).toBe(200);

  // Verify Mayer Redundancy: subtitles OFF by default, toggleable on demand
  await expect(page.getByTestId("theater-subtitles-bar")).toBeHidden();
  await page.getByTestId("theater-subtitles-toggle").click();
  await expect(page.getByTestId("theater-subtitles-bar")).toBeVisible();
  await page.getByTestId("theater-subtitles-toggle").click();
  await expect(page.getByTestId("theater-subtitles-bar")).toBeHidden();

  // Cycle playback speed to 0.75x inside Studio Transport Dock
  const speedBtn = page.getByTestId("audio-speed-btn");
  await expect(speedBtn).toHaveText("1x");
  await speedBtn.click(); // 1.25x
  await speedBtn.click(); // 1.5x
  await speedBtn.click(); // 1.75x
  await speedBtn.click(); // 0.75x
  await expect(speedBtn).toHaveText("0.75x");

  // Jump to Slide 3 / 7 -> log-spotlight interactive forensic terminal
  await page.getByTestId("listening-scene-pill-ch1-s3-autopsie-faits").click();
  await expect(stage).toContainText("Mode écoute guidée · Diapo 3 / 7");
  await expect(page.getByTestId("slide-layout-log-spotlight")).toBeVisible();

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("theater-ch1-log-spotlight.png"),
    fullPage: false,
  });

  // Jump to Slide 6 / 7 -> interactive workshop with SignalAutopsyDiagram + MicroCheck
  await page.getByTestId("listening-scene-pill-ch1-s6-atelier-autopsie").click();
  await expect(stage).toContainText("Mode écoute guidée · Diapo 6 / 7");
  await expect(stage.getByTestId("signal-autopsy-diagram")).toBeVisible();
  await expect(stage.getByTestId("micro-check-mc-ch1-autopsy")).toBeVisible();

  // Open transcript drawer -> clean French prose (zero raw <short pause> tags)
  await page.getByTestId("audio-transcript-toggle").click();
  const transcript = page.getByTestId("audio-teacher-transcript");
  await expect(transcript).toBeVisible();
  await expect(transcript).toContainText("Voix mentor");
  await expect(transcript).not.toContainText("<short pause>");

  // Switch to Reading Mode -> single lifted audio controller preserves active slide AND 0.75x playback rate!
  await page.getByTestId("switch-to-reading-from-stage").click();
  await expect(stage).toBeHidden();
  await expect(page.getByTestId("course-synced-audio-bar")).toBeVisible();
  await expect(page.locator("#ch1-s6-atelier-autopsie")).toHaveClass(/border.*\[#c8ed97\]/);
  const readingSpeedBtn = page
    .locator('[data-testid="audio-speed-btn"], [data-testid="audio-speed-btn-mobile"]')
    .filter({ visible: true })
    .first();
  await expect(readingSpeedBtn).toHaveText("0.75x");

  // Switch back into Guided Theater Mode (exactly 1 active mode toggle mounted) and verify diverse layouts across Chapters 2, 3, and 4
  await expect(page.getByTestId("study-mode-listening-btn")).toHaveCount(1);
  await page.getByTestId("study-mode-listening-btn").click();
  await expect(stage).toBeVisible();

  // Chapter 2 -> Slide 2 (mechanism-flow)
  await page.locator("#ch-1-decomposez-alerte").getByTestId("chapter-next-btn").click();
  await expect(page.getByTestId("slide-layout-log-spotlight")).toBeVisible();
  await page.getByTestId("listening-scene-pill-ch2-s2-angle-mort-amont").click();
  await expect(page.getByTestId("slide-layout-mechanism-flow")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("theater-ch2-mechanism-flow.png"),
    fullPage: false,
  });

  // Chapter 3 -> Slide 1 (elimination-board) & Slide 6 (timeline-shift)
  await page.locator("#ch-2-mesure-et-angles-morts").getByTestId("chapter-next-btn").click();
  await expect(page.getByTestId("slide-layout-elimination-board")).toBeVisible();
  await page.getByTestId("listening-scene-pill-ch3-s6-piege-ntp").click();
  await expect(page.getByTestId("slide-layout-timeline-shift")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("theater-ch3-timeline-shift.png"),
    fullPage: false,
  });

  // Chapter 4 -> Slide 3 (case-gallery)
  await page.locator("#ch-3-recoupez-sources").getByTestId("chapter-next-btn").click();
  await expect(page.getByTestId("slide-layout-contrast-split")).toBeVisible();
  await page.getByTestId("listening-scene-pill-ch4-s3-transfert-capteurs").click();
  await expect(page.getByTestId("slide-layout-case-gallery")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: testInfo.outputPath("theater-ch4-case-gallery.png"),
    fullPage: false,
  });

  // Navigate to Quiz -> audio strictly hidden
  await page.locator("#ch-4-redigez-constat").getByTestId("chapter-next-btn").click();
  await expect(page.getByTestId("course-assessment-summary")).toBeVisible();
  await expect(page.getByTestId("course-audio-element")).toHaveCount(0);
  await expect(page.getByTestId("course-synced-audio-bar")).toBeHidden();

  await expectNoOverflow(page);
  expect(errors).toEqual([]);
});
