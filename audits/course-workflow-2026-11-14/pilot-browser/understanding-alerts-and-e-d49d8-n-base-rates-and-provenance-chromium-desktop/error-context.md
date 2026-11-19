# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: understanding-alerts-and-evidence.spec.ts >> complete course teaches detection, base rates and provenance
- Location: tests\e2e\understanding-alerts-and-evidence.spec.ts:3:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByTestId('exercise-card-alert-predict-false-positive').getByRole('radio', { name: '10 fausses alertes', exact: true })
    - locator resolved to <input value="b" type="radio" class="sr-only" name="exercise-alert-predict-false-positive"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - element is outside of the viewport
  - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
    - retrying click action
      - waiting 100ms
    34 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - element is outside of the viewport
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - element is outside of the viewport
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <label class="relative flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors motion-reduce:transition-none cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring border-border bg-secondary/30 text-secondary-foreground hover:bg-secondary/70">…</label> intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Aller au contenu principal" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Cyber School, accueil" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e9]: cyberschool.
      - navigation "Navigation principale" [ref=e10]:
        - link "Cours" [ref=e11] [cursor=pointer]:
          - /url: /#courses
        - link "Méthode" [ref=e12] [cursor=pointer]:
          - /url: /#method
        - link "Parcours" [ref=e13] [cursor=pointer]:
          - /url: /#roadmap
        - link "Programme complet" [ref=e14] [cursor=pointer]:
          - /url: /curriculum
      - link "Ouvrir un labo" [ref=e15] [cursor=pointer]:
        - /url: /lessons/program-memory-fundamentals
  - main [ref=e19]:
    - generic [ref=e20]:
      - navigation "Fil d’Ariane" [ref=e21]:
        - link "Tous les cours" [ref=e22] [cursor=pointer]:
          - /url: /#courses
        - generic [aria-hidden] [ref=e25]: /
        - generic [ref=e26]: Exploration
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: Les fondamentaux
            - generic [ref=e31]: 40 min à votre rythme
            - generic [ref=e35]: Atelier interactif
          - heading "Comprendre les alertes et les preuves" [level=1] [ref=e36]
          - paragraph [ref=e37]: Un faux positif est un événement bénin classé à tort comme malveillant par un détecteur.
        - generic [ref=e38]:
          - strong [ref=e39]: "08"
          - text: exercices pour faire le lien
      - group [ref=e40]:
        - 'generic "Avant de commencer : ce qu’il faut savoir" [ref=e41] [cursor=pointer]'
      - generic [ref=e42]:
        - generic [ref=e43]:
          - paragraph [ref=e44]: Une alerte vous invite à enquêter. Dans ce cours, vous allez compter ce qu’un détecteur voit et manque, puis suivre une affirmation jusqu’à sa source. Vous pourrez modifier les hypothèses, prédire les résultats et expliquer vos choix.
          - group [ref=e45]:
            - generic "Ce que vous allez apprendre et ce qu’il faut savoir" [ref=e46] [cursor=pointer]
        - generic [ref=e47]:
          - complementary "Sommaire du cours" [ref=e48]:
            - generic [ref=e49]:
              - heading "Votre parcours" [level=2] [ref=e50]
              - paragraph [ref=e51]: Un mécanisme à comprendre à chaque étape.
            - navigation "Chapitres du cours" [ref=e52]:
              - button "1 Une alerte peut se tromper 10 min environ" [ref=e53] [cursor=pointer]:
                - generic [ref=e54]: "1"
                - generic [ref=e55]:
                  - text: Une alerte peut se tromper
                  - generic [ref=e56]: 10 min environ
              - button "2 Inverser la question change le résultat 10 min environ" [ref=e57] [cursor=pointer]:
                - generic [ref=e58]: "2"
                - generic [ref=e59]:
                  - text: Inverser la question change le résultat
                  - generic [ref=e60]: 10 min environ
              - button "3 Remonter à l’origine d’une affirmation 10 min environ" [ref=e61] [cursor=pointer]:
                - generic [ref=e62]: "3"
                - generic [ref=e63]:
                  - text: Remonter à l’origine d’une affirmation
                  - generic [ref=e64]: 10 min environ
              - button "4 Comparer avant de conclure 10 min environ" [ref=e65] [cursor=pointer]:
                - generic [ref=e66]: "4"
                - generic [ref=e67]:
                  - text: Comparer avant de conclure
                  - generic [ref=e68]: 10 min environ
            - button "Afficher le cours complet" [ref=e70] [cursor=pointer]
            - status [ref=e71]:
              - generic [ref=e72]: 1 / 8 réponses justes
              - generic [ref=e73]: Réponses vérifiées pendant cette session.
          - generic [ref=e74]:
            - region "Une alerte peut se tromper" [ref=e75]:
              - generic [ref=e76]:
                - paragraph [ref=e77]: Chapitre 1 sur 4
                - heading "Une alerte peut se tromper" [active] [level=2] [ref=e78]
                - paragraph [ref=e79]: Pourquoi une alerte n’est-elle pas une preuve d’attaque ?
              - paragraph [ref=e80]: "À la fin : Distinguer une fausse alerte d’un événement malveillant manqué."
              - generic [ref=e81]:
                - paragraph [ref=e82]: "Un détecteur examine des événements et décide de signaler certains d’entre eux. Dans notre modèle, la réalité est connue : chaque événement est soit malveillant, soit bénin, c’est-à-dire sans attaque. Dans une enquête réelle, cette réalité doit souvent être établie après l’alerte."
                - paragraph [ref=e83]: Positif signifie « le détecteur signale » ; négatif signifie « il ne signale pas ». Un faux positif est donc un événement bénin signalé à tort. Un faux négatif est un événement malveillant laissé sans alerte. Ces erreurs se trouvent dans deux populations différentes.
                - paragraph [ref=e84]: "La sensibilité mesure la part des cas malveillants détectés. Le taux de faux positifs mesure la part des cas bénins signalés. Dire « 5 % de faux positifs » ne signifie pas « 5 % des alertes sont fausses » : il faut toujours préciser parmi quels événements on compte."
              - region "Exemple résolu" [ref=e85]:
                - heading "Compter les quatre issues" [level=3] [ref=e86]
                - paragraph [ref=e87]: "Considérons 10 000 événements fictifs : 1 % sont malveillants. Le détecteur en repère 90 % et signale à tort 5 % des cas bénins."
                - list [ref=e88]:
                  - listitem [ref=e89]: "Séparer la réalité : 100 événements malveillants et 9 900 événements bénins."
                  - listitem [ref=e90]: "Appliquer 90 % aux 100 cas malveillants : 90 détectés et 10 manqués."
                  - listitem [ref=e91]: "Appliquer 5 % aux 9 900 cas bénins : 495 fausses alertes et 9 405 cas correctement laissés sans alerte."
                - paragraph [ref=e92]: "Le détecteur produit 585 alertes au total : 90 justifiées et 495 fausses. Il manque aussi 10 cas malveillants."
              - generic [ref=e93]:
                - 'heading "Avant de manipuler : votre prédiction" [level=3] [ref=e94]'
                - generic [ref=e95]:
                  - generic [ref=e96]:
                    - generic [ref=e97]: Exercice 1 · Prédiction d'état
                    - heading "Si le taux de fausses alertes passe de 5 % à 10 %, que devient leur nombre ?" [level=3] [ref=e99]
                    - paragraph [ref=e100]: Sur 10 000 événements, 100 sont malveillants et 9 900 sont bénins. Seul le taux de fausses alertes change.
                  - generic [ref=e101]:
                    - group "Si le taux de fausses alertes passe de 5 % à 10 %, que devient leur nombre ?" [ref=e102]:
                      - generic [ref=e104] [cursor=pointer]:
                        - radio "990 fausses alertes" [checked] [ref=e105]
                        - generic [ref=e108]: 990 fausses alertes
                      - generic [ref=e109] [cursor=pointer]:
                        - radio "10 fausses alertes" [ref=e110]
                        - generic [ref=e112]: 10 fausses alertes
                      - generic [ref=e113] [cursor=pointer]:
                        - radio "1 000 fausses alertes" [ref=e114]
                        - generic [ref=e116]: 1 000 fausses alertes
                    - generic [ref=e117]:
                      - button "Vérifier ma réponse" [ref=e118] [cursor=pointer]
                      - button "Réessayer" [ref=e119] [cursor=pointer]
                    - status [ref=e123]:
                      - generic [ref=e128]:
                        - heading "Raisonnement exact" [level=4] [ref=e129]
                        - generic [ref=e130]:
                          - paragraph [ref=e131]: "Exact : 10 % des 9 900 événements bénins donnent 990 fausses alertes."
                          - paragraph [ref=e132]: "Le taux s’applique aux 9 900 événements bénins : 9 900 × 0,10 = 990. Les 100 cas malveillants ne sont pas le dénominateur."
              - generic [ref=e133]: À vous d’expérimenter
              - paragraph [ref=e136]: Avancez d’une étape pour révéler les décisions. Passez ensuite le taux de fausses alertes de 5 % à 10 % et comparez avec votre prédiction.
              - generic "Expérience sur les alertes" [ref=e138]:
                - generic [ref=e139]:
                  - heading "Une alerte peut se tromper" [level=3] [ref=e140]
                  - paragraph [ref=e141]: Cohorte fictive de 10 000 événements. Les paramètres sont des hypothèses pédagogiques.
                - generic [ref=e142]:
                  - generic [ref=e143]:
                    - generic [ref=e144]:
                      - generic [ref=e145]:
                        - generic [ref=e146]: Événements malveillants
                        - status "Événements malveillants 1" [ref=e147]: 1 %
                      - slider "Événements malveillants" [ref=e148]: "1"
                    - generic [ref=e149]:
                      - generic [ref=e150]:
                        - generic [ref=e151]: Détection des cas malveillants
                        - status "Détection des cas malveillants 90" [ref=e152]: 90 %
                      - slider "Détection des cas malveillants" [ref=e153]: "90"
                    - generic [ref=e154]:
                      - generic [ref=e155]:
                        - generic [ref=e156]: Fausses alertes sur les cas bénins
                        - status "Fausses alertes sur les cas bénins 5" [ref=e157]: 5 %
                      - slider "Fausses alertes sur les cas bénins" [ref=e158]: "5"
                  - button "Réinitialiser le modèle" [ref=e160] [cursor=pointer]
                  - figure "La branche « malveillants » et la branche « bénins » n’ont pas le même effectif. Chaque taux s’applique à sa propre branche." [ref=e161]:
                    - 'img "Répartition des événements : Parmi 10 000 événements, 100 sont malveillants et 9 900 sont bénins dans ce modèle." [ref=e162]':
                      - generic [ref=e166]:
                        - generic [ref=e167]: 10 000 événements
                        - generic [ref=e169]: 100 malveillants
                        - generic [ref=e171]: 9 900 bénins
                  - generic [ref=e173]:
                    - button "Précédent" [disabled]
                    - generic [ref=e174]: Séparer les cas réels · 1/3
                    - button "Suivant" [ref=e175] [cursor=pointer]
                  - status [ref=e177]:
                    - generic [ref=e178]:
                      - generic [ref=e179]: MÉCANISME
                      - generic [ref=e180]: "Taux de base : 1 %"
                      - generic [aria-hidden] [ref=e181]: →
                      - generic [ref=e182]: Parmi 10 000 événements, 100 sont malveillants et 9 900 sont bénins dans ce modèle.
                    - generic [ref=e183]: "Alertes justifiées : 15.4 %"
                  - generic [ref=e184]:
                    - paragraph [ref=e185]:
                      - text: "Fausses alertes :"
                      - status [ref=e186]: "495"
                    - paragraph [ref=e187]:
                      - text: "Part justifiée :"
                      - status [ref=e188]: 15.4 %
              - paragraph [ref=e189]: "À observer : Le nombre de fausses alertes change sur la branche des cas bénins. Les cas malveillants manqués restent 10 si la sensibilité reste à 90 %."
              - group [ref=e190]:
                - generic "Les limites de cette expérience" [ref=e191] [cursor=pointer]
              - generic [ref=e192]:
                - heading "Faites le point" [level=3] [ref=e193]
                - paragraph [ref=e194]: Expliquez votre choix, puis vérifiez le raisonnement.
                - generic [ref=e196]:
                  - generic [ref=e197]:
                    - generic [ref=e198]: Exercice 2 · Compréhension
                    - heading "Un événement est réellement malveillant mais ne déclenche aucune alerte. Comment le qualifier ?" [level=3] [ref=e200]
                  - generic [ref=e201]:
                    - group "Un événement est réellement malveillant mais ne déclenche aucune alerte. Comment le qualifier ?" [ref=e202]:
                      - generic [ref=e204] [cursor=pointer]:
                        - radio "Un faux négatif" [ref=e205]
                        - generic [ref=e207]: Un faux négatif
                      - generic [ref=e208] [cursor=pointer]:
                        - radio "Un faux positif" [ref=e209]
                        - generic [ref=e211]: Un faux positif
                      - generic [ref=e212] [cursor=pointer]:
                        - radio "Un vrai négatif" [ref=e213]
                        - generic [ref=e215]: Un vrai négatif
                    - generic [ref=e216]:
                      - button "Vérifier ma réponse" [disabled]
              - group [ref=e217]:
                - generic "Une confusion fréquente" [ref=e218] [cursor=pointer]
              - generic [ref=e219]:
                - heading "À retenir" [level=3] [ref=e220]
                - paragraph [ref=e221]: Nommez l’erreur en comparant la décision du détecteur au fait réel.
                - paragraph [ref=e222]:
                  - strong [ref=e223]: "Pour transférer l’idée :"
                  - text: Que faudrait-il mesurer pour savoir combien d’événements malveillants votre système laisse sans alerte ?
              - group [ref=e224]:
                - generic "Les sources de ce chapitre" [ref=e225] [cursor=pointer]
            - generic [ref=e228]:
              - button "Chapitre précédent" [disabled] [ref=e229]
              - generic [ref=e232]: 1 / 4
              - button "Chapitre suivant" [ref=e233] [cursor=pointer]
      - group [ref=e236]:
        - 'generic "Pour aller plus loin : sources et laboratoires +" [ref=e237] [cursor=pointer]'
  - contentinfo [ref=e238]:
    - generic [ref=e239]:
      - link "cyberschool." [ref=e240] [cursor=pointer]:
        - /url: /
      - paragraph [ref=e242]: Académie interactive conçue pour comprendre l'architecture mémoire, les réseaux et les mécanismes de sécurité par l'expérimentation directe.
    - generic [ref=e243]:
      - heading "Laboratoires ouverts" [level=2] [ref=e244]
      - link "Dans la mémoire d'un programme" [ref=e245] [cursor=pointer]:
        - /url: /lessons/program-memory-fundamentals
      - link "Trois messages pour se connecter" [ref=e246] [cursor=pointer]:
        - /url: /lessons/tcp-three-way-handshake
      - link "Raisonnement causal et réfutation" [ref=e247] [cursor=pointer]:
        - /url: /lessons/scientific-reasoning-and-proof
    - generic [ref=e248]:
      - heading "Découvrir" [level=2] [ref=e249]
      - link "La méthode pédagogique" [ref=e250] [cursor=pointer]:
        - /url: /#method
      - link "Catalogue des cours" [ref=e251] [cursor=pointer]:
        - /url: /#courses
      - link "Progression du cursus" [ref=e252] [cursor=pointer]:
        - /url: /#roadmap
      - link "Questions fréquentes" [ref=e253] [cursor=pointer]:
        - /url: /#faq
    - generic [ref=e254]:
      - heading "Cursus" [level=2] [ref=e255]
      - link "Programme complet" [ref=e256] [cursor=pointer]:
        - /url: /curriculum
      - link "Commencer par les bases" [ref=e257] [cursor=pointer]:
        - /url: /lessons/program-memory-fundamentals
  - alert [ref=e258]
```

# Test source

```ts
  1   | import { expect, test } from "@playwright/test";
  2   | 
  3   | test("complete course teaches detection, base rates and provenance", async ({ page }, testInfo) => {
  4   |   // A complete journey through four chapters, including full-page captures on mobile.
  5   |   test.setTimeout(90_000);
  6   |   const errors: string[] = [];
  7   |   page.on("pageerror", (error) => errors.push(error.message));
  8   |   page.on("console", (message) => {
  9   |     if (message.type() === "error") errors.push(message.text());
  10  |   });
  11  |   await page.emulateMedia({ reducedMotion: "reduce" });
  12  |   const response = await page.goto("/lessons/understanding-alerts-and-evidence");
  13  |   expect(response?.status()).toBe(200);
  14  |   await expect(page.getByRole("heading", { level: 1 })).toHaveText(
  15  |     "Comprendre les alertes et les preuves",
  16  |   );
  17  |   await expect(page.getByTestId("guided-course-experience")).toBeVisible();
  18  |   const prediction = page.getByTestId("exercise-card-alert-predict-false-positive");
  19  |   await prediction.getByRole("radio", { name: "990 fausses alertes", exact: true }).focus();
  20  |   await page.keyboard.press("Space");
  21  |   await prediction.getByRole("button", { name: /Vérifier/ }).click();
  22  |   await expect(page.getByTestId("course-score")).toHaveText("1 / 8 réponses justes");
  23  | 
  24  |   const lab = page.getByTestId("alert-lab-classifier");
  25  |   await lab.focus();
  26  |   await page.keyboard.press("ArrowRight");
  27  |   await expect(lab.getByText("Appliquer le détecteur · 2/3")).toBeVisible();
  28  |   await page.keyboard.press("Tab");
  29  |   await expect(lab.getByTestId("base-rate-input")).toBeFocused();
  30  |   const rate = lab.getByTestId("false-positive-input");
  31  |   await rate.fill("10");
  32  |   await expect(lab.getByTestId("false-positive-count")).toHaveText("990");
  33  |   await rate.focus();
  34  |   await page.keyboard.press("ArrowLeft");
  35  |   await expect(lab.getByTestId("false-positive-count")).toHaveText("891");
  36  |   await page.screenshot({
  37  |     path: testInfo.outputPath("complete-course-guided.png"),
  38  |     fullPage: true,
  39  |   });
  40  | 
  41  |   await page.getByTestId("course-chapter-chapter-base-rate").focus();
  42  |   await page.keyboard.press("Enter");
  43  |   await expect(
  44  |     page.getByRole("heading", { name: "Inverser la question change le résultat", exact: true }),
  45  |   ).toBeFocused();
  46  |   await expect(page.getByTestId("alert-lab-classifier")).toHaveCount(0);
  47  |   const base = page.getByTestId("alert-lab-base-rate");
  48  |   await expect(base.getByTestId("alert-posterior")).toHaveText("15.4 %");
  49  |   await base.getByRole("button", { name: /Comparer avec 20/ }).click();
  50  |   await expect(base.getByTestId("alert-posterior")).toHaveText("81.8 %");
  51  |   await page.getByTestId("course-chapter-chapter-detection-errors").click();
  52  |   await expect(
  53  |     prediction.getByRole("radio", { name: "990 fausses alertes", exact: true }),
  54  |   ).toBeChecked();
  55  |   await expect(prediction.getByRole("heading", { name: "Raisonnement exact" })).toBeVisible();
> 56  |   await prediction.getByRole("radio", { name: "10 fausses alertes", exact: true }).click();
      |                                                                                    ^ Error: locator.click: Test timeout of 90000ms exceeded.
  57  |   await expect(page.getByTestId("course-score")).toHaveText("0 / 8 réponses justes");
  58  |   await prediction.getByRole("button", { name: /Vérifier/ }).click();
  59  |   await expect(prediction.getByText(/Vous avez appliqué le taux aux 100/)).toBeVisible();
  60  | 
  61  |   await page.getByTestId("course-chapter-chapter-provenance").click();
  62  |   const origin = page.getByTestId("evidence-lab-origin");
  63  |   await origin.getByRole("button", { name: "Voir le document source" }).click();
  64  |   await expect(origin.getByTestId("evidence-original")).toContainText("AUTH_FAILED");
  65  |   await origin.getByRole("checkbox", { name: "Rendre la source indisponible" }).check();
  66  |   await expect(origin.getByTestId("evidence-transform")).toContainText(
  67  |     "Vérification impossible ici",
  68  |   );
  69  |   await expect(origin.getByRole("button", { name: "Voir le document source" })).toBeDisabled();
  70  | 
  71  |   await page.getByTestId("course-chapter-chapter-source-comparison").click();
  72  |   const conflict = page.getByTestId("evidence-lab-conflict");
  73  |   await conflict.focus();
  74  |   await page.keyboard.press("ArrowRight");
  75  |   await expect(conflict.getByTestId("evidence-transform")).toContainText("Contradiction à traiter");
  76  |   await conflict.getByRole("checkbox", { name: "Comparer avec un autre événement" }).check();
  77  |   await expect(conflict.getByTestId("evidence-transform")).toContainText("Événements différents");
  78  |   const assessment = page.getByTestId("assessment-runner");
  79  |   await assessment.getByRole("link", { name: /Si le taux de fausses alertes/ }).click();
  80  |   await expect(prediction).toBeFocused();
  81  |   await expect(page.getByTestId("course-chapter-chapter-detection-errors")).toHaveAttribute(
  82  |     "aria-current",
  83  |     "step",
  84  |   );
  85  | 
  86  |   await page.getByTestId("course-show-all").click();
  87  |   await expect(page.locator(".learning-chapter:visible")).toHaveCount(4);
  88  |   for (const [id, answer] of [
  89  |     ["alert-predict-false-positive", /^990 fausses alertes$/],
  90  |     ["alert-identify-false-negative", /^Un faux négatif$/],
  91  |     ["alert-predict-posterior", /^Environ 15,4/],
  92  |     ["alert-explain-base-rate", /^Il y a davantage/],
  93  |     ["evidence-predict-direct", /^Le journal enregistre/],
  94  |     ["evidence-find-provenance", /^Retrouver le journal cité/],
  95  |     ["evidence-predict-second-hand", /^Non, elles dépendent/],
  96  |     ["evidence-compare-events", /^Non, les résultats portent/],
  97  |   ] as const) {
  98  |     const card = page.getByTestId(`exercise-card-${id}`);
  99  |     await card.getByRole("radio", { name: answer }).click();
  100 |     await card.getByRole("button", { name: /Vérifier/ }).click();
  101 |   }
  102 |   await expect(page.getByTestId("course-score")).toHaveText("8 / 8 réponses justes");
  103 |   await expect(assessment).toContainText("Maîtrisé (100%)");
  104 |   await prediction.getByRole("radio", { name: "10 fausses alertes", exact: true }).click();
  105 |   await expect(page.getByTestId("course-score")).toHaveText("7 / 8 réponses justes");
  106 |   await expect(assessment).not.toContainText("Maîtrisé (100%)");
  107 |   for (const details of await page.locator(".learning-chapter details").all())
  108 |     await details.evaluate((node) => {
  109 |       (node as HTMLDetailsElement).open = true;
  110 |     });
  111 |   const sourceLinks = page.locator(".learning-chapter a[target='_blank']");
  112 |   expect(await sourceLinks.count()).toBeGreaterThanOrEqual(4);
  113 |   for (const link of await sourceLinks.all())
  114 |     await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  115 |   await page.screenshot({ path: testInfo.outputPath("complete-course-full.png"), fullPage: true });
  116 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  117 |   expect(errors).toEqual([]);
  118 | });
  119 | 
```