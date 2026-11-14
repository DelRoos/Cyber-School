# Dossier de cours — `scientific-reasoning-and-proof` (Unité `unit-tc00-observation-hypotheses`)

## 1. Fiche scientifique et références (`scientific_sheet`)

- **Unité V4 couverte** : `unit-tc00-observation-hypotheses` (`TC-00`, micro-leçons `TC00.001` à `TC00.008`).
- **Compétences Part 2 associées** : `TC00.01`, `TC00.02`, `TC00.04`, `TC00.05`, `TC00.08`.
- **Sources vérifiées (`resources/sources.json`)** :
  - `openstax-intro-stats` (OpenStax, Ch. 1 & 12 : plan d'expérience, variables confondantes, corrélation vs causalité).
  - `nist-nice-framework` (NIST SP 800-181r1 : rigueur analytique et qualification de preuve).
  - `stanford-scientific-method` (Stanford Encyclopedia : méthode hypothético-déductive, falsifiabilité).

## 2. Objectifs d'apprentissage (`learning_objectives`)

À l'issue de cette unité, l'apprenant sait :

1. Distinguer une observation brute journalisée d'une interprétation causale non prouvée (`TC00.001`).
2. Ordonner rigoureusement observation, hypothèse, prédiction testable, mesure et conclusion (`TC00.002`).
3. Formuler une hypothèse falsifiable munie d'un critère objectif de réfutation (`TC00.003`).
4. Identifier et figer les variables contrôlées d'un protocole de mesure comparatif (`TC00.004`).
5. Repérer une variable confondante $Z$ dans un graphe causal et distinguer corrélation $P(Y \mid X)$ et intervention $P(Y \mid \text{do}(X))$ (`TC00.005`, `TC00.007`).
6. Expliciter les hypothèses cachées d'une chaîne causale (`TC00.006`).
7. Réfuter une règle universelle (« toutes les requêtes 200 sont authentifiées ») par un contre-exemple minimal (`TC00.008`).

## 3. Structure pédagogique (`pedagogical_structure`)

1. **Étape 1 (`step-observation-hypothesis`)** : Séparer fait horodaté, interprétation hâtive et prédiction testable (`TC00.001..003`).
2. **Étape 2 (`step-controls-confounders`)** : Explorer la fourche causale $Z \to X, Z \to Y$ sur un cas de télémétrie SSH/EDR (`TC00.004..005`).
3. **Étape 3 (`step-causal-vs-correlation`)** : Comparer corrélation observationnelle et test d'intervention $\text{do}(X)$ tout en explicitant la chaîne causale (`TC00.006..007`).
4. **Étape 4 (`step-minimal-counterexample`)** : Construire le contre-exemple minimal réfutant une règle de sécurité trop absolue (`TC00.008`).

## 4. Storyboard visuel (`visual_storyboard`)

- **Scène 1 (`Vis01CausalConfounder`)** : Graphe causal SVG interactif à 3 nœuds (`Déploiement EDR (X)`, `Alertes SSH (Y)`, `Scan cron lundi 08h (Z)`) avec flux animés, bascule d'état (`Observation brute`, `Corrélation X ↔ Y`, `Révélation du confondant Z`, `Intervention contrôlée do(X)`), et barres comparant $r(X,Y)$ observationnel vs impact réel après contrôle de $Z$.
- **Scène 2 (`Vis02CounterexampleFalsifier`)** : Panneau de conditions système commutables testant une affirmation universelle en sécurité Web avec détecteur automatique de **contre-exemple minimal** (met en évidence les propriétés minimales nécessaires à la réfutation).

## 5. Spécification des animations (`animation_spec`)

- Moteur : GSAP via `useGsapScope`, respect strict de `usePrefersReducedMotion` et `getStepDuration` (`@cyber-school/animations`).
- Contrôles : Lecture/Pause, Étape précédente/suivante, Réinitialisation, navigation clavier (`ArrowLeft`, `ArrowRight`, `Home`) et annonce `aria-live="polite"`.
- Durée par transition : `0.45s` (`0s` si `prefers-reduced-motion` activé).

## 6. Spécification des simulations (`simulation_spec`)

- Logique déterministe pure dans `apps/web/src/lessons/scientific-reasoning-and-proof/engines/causal-reasoning.ts` testée par Vitest :
  - calcul exact des états causaux (`CausalStage`), taux d'alertes observé/contrôlé, et diagnostic d'intervention $\text{do}(X)$ ;
  - évaluateur d'assertions universelles et détecteur de minimalité pour les contre-exemples (vérifiant si des conditions superflues ont été ajoutées).

## 7. Banque d'exercices (`exercise_bank`) & Rapport de préparation pédagogique (`pedagogical_validation_report`)

- **6 exercices couvrant 4 modes distincts** dans `lessons/scientific-reasoning-and-proof/lesson.json` :
  - `ex-tc00-01` (`multiple-choice`) : Observation brute vs interprétation sur trace SSH (`TC00.001`).
  - `ex-tc00-02` (`sequence-order`) : Chaîne méthodologique falsifiable (`TC00.002` / `TC00.003`).
  - `ex-tc00-03` (`state-prediction`) : Prédiction après contrôle du confondant $Z$ (`TC00.004` / `TC00.005` / `TC00.007`).
  - `ex-tc00-04` (`diagram-probe`) : Sondage des nœuds d'une fourche causale ($Z \to X$, $Z \to Y$) (`TC00.005`).
  - `ex-tc00-05` (`multiple-choice`) : Hypothèse cachée d'une chaîne causale (`TC00.006`).
  - `ex-tc00-06` (`state-prediction`) : Identification d'un contre-exemple minimal sans condition redondante (`TC00.008`).
- **2 évaluations sommatives** (`assess-tc00-causality`, `assess-tc00-falsification`) intégrées via `AssessmentRunner`.
- **Statut de revue** : `in-review` (`revue_necessaire`). Aucune publication automatique sans validation scientifique et humaine.
