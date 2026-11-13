# Critères d'acceptation pédagogiques et techniques

Ce document sert de grille d'acceptation contractuelle pour **Claude Code** (implémentation) et **Codex** (audit et validation finale), en complément direct de [docs/standards/QUALITY_GATES.md](../../standards/QUALITY_GATES.md) et [docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md](../../standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md).

---

## 1. Critères pédagogiques et scientifiques

- [ ] **Couverture intégrale des 14 concepts atomiques** : chaque concept défini dans [curriculum/program-memory-foundations.json](../../../curriculum/program-memory-foundations.json) possède au moins une explication interactive et au moins un exercice rattaché.
- [ ] **Zéro saisie manuelle de code** : aucun exercice ni simulateur n'exige que l'apprenant rédige du code syntaxique ; toute manipulation s'effectue par sélection, pas-à-pas, paramètres bornés et prédiction d'état.
- [ ] **Exactitude technique vérifiable** :
  - `VIS-01` place l'octet de poids faible à l'adresse la plus basse (_little-endian_) sans jamais inverser les digits à l'intérieur d'un octet.
  - `VIS-02` montre l'isolation par table des pages (même adresse virtuelle dans `P1` et `P2` → cadres physiques différents) et lève `SIGSEGV` sur écriture dans `Text` ou page non mappée.
  - `VIS-03` fait croître la pile vers les **adresses décroissantes**, laisse visibles en grisé les octets libérés après `RET` (pas de zérotage imaginaire) et montre la corruption différée du pointeur pendant au prochain appel.
  - `VIS-04` distingue fragmentation interne (en-têtes + alignement) et externe (trous disjoints), illustre _coalescing_, fuite, _double free_ et _Use-After-Free_.
  - `VIS-05` distingue clairement libération manuelle, libération déterministe par portée (Rust/RAII) et traçage depuis _GC Roots_.
- [ ] **Encarts de nuance scientifique présents** : chaque simulateur intègre un tiroir/encart « Réalité OS & Compilateur » mentionnant ASLR, registres `-O2`, caches CPU et comportement indéfini.
- [ ] **Sources tracées** : la leçon référence uniquement des IDs validés présents dans [resources/sources.json](../../../resources/sources.json).

---

## 2. Critères visuels et d'accessibilité (`WCAG AA` + `reduced-motion`)

- [ ] **Arbitrage 2D respecté** : 100 % des scènes en SVG 2D + GSAP + Motion + D3.js (aucune dépendance 3D chargée inutilement).
- [ ] **Cycle de vie GSAP propre** : utilisation exclusive de `createGsapTimelineScope` depuis `@cyber-school/animations`, zéro animation orpheline au changement de chapitre ou démontage React.
- [ ] **`prefers-reduced-motion: reduce`** : test automatisé confirmant l'absence de transitions animées bloquantes et la mise à jour immédiate + lisible des badges d'état/adresses.
- [ ] **Double encodage visuel** : aucune distinction d'état (`Text`, `Heap`, `Stack`, `Free`, `Leak`, `UAF`) ne repose uniquement sur la couleur ; chaque bloc affiche texte, droits ou motif distinctif.
- [ ] **Navigation clavier 100 % fonctionnelle** : tous les contrôles (`Pas suivant`, `Pas précédent`, sélection de segment/chunk, scénarios, exercices) utilisables au clavier (`Tab`, `Enter`, `Space`, `ArrowLeft`/`ArrowRight`) avec anneau de focus visible et annonces `aria-live="polite"`.
- [ ] **Responsive `375px` & Desktop `1440px`** : zéro débordement horizontal (`scrollWidth <= clientWidth`) et cibles tactiles >= `44 × 44 px`.

---

## 3. Critères d'ingénierie et de validation automatisée

À exécuter avant clôture de chaque tâche d'implémentation sous **Node LTS (`v22.x`)** :

1. `corepack pnpm typecheck` → exit `0`.
2. `corepack pnpm lint` → exit `0`.
3. `corepack pnpm format:check` → exit `0`.
4. `corepack pnpm test:unit` → inclut tests unitaires des machines à états déterministes de `VIS-01`..`VIS-05` (little-endian, MMU/permissions, `RSP`/`RBP`, coalescing/fragmentation, timeline GC/RAII) et des nouveaux composants d'exercices le cas échéant.
5. `corepack pnpm test:guards` → exit `0`.
6. `corepack pnpm validate:curriculum` → exit `0` avec le nouveau manifeste `lessons/program-memory-fundamentals/lesson.json`.
7. `corepack pnpm build` → exit `0`.
8. `corepack pnpm test:e2e` (Playwright) vérifiant au minimum :
   - chargement complet du cours `/lessons/program-memory-fundamentals` sans `console.error` ni `pageerror` ;
   - parcours clavier pas-à-pas sur `VIS-01`..`VIS-05` (dont déclenchement observable `SIGSEGV`, _dangling pointer_ puis écrasement, _Use-After-Free_ et mode `reduced-motion`) ;
   - validation interactive d'au moins un exercice `multiple-choice`, `state-prediction` et `sequence-order` avec feedback immédiat ;
   - vérification mobile `375×812` sans débordement horizontal.
9. `corepack pnpm quality:verify --task <TASK-ID>` et `corepack pnpm validate:governance` → exit `0`.
