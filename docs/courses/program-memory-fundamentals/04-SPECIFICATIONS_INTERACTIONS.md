# Spécifications d'interactions, d'accessibilité et d'intégration UI

## 1. Intégration au Design System et aux packages du monorepo

- **Composants réutilisés** :
  - `@cyber-school/ui` : `Button`, `Badge`, `Card`, `Tabs` (ou contrôles d'onglets accessibles), panneaux d'explication et tokens CSS sémantiques (contraste >= 4.5:1 texte normal, >= 3:1 éléments graphiques/bordures).
  - `@cyber-school/animations` : encapsuler **toute** animation GSAP via `createGsapTimelineScope` avec `cleanup` strict à l'unmount et lecture de `window.matchMedia('(prefers-reduced-motion: reduce)')`.
  - `@cyber-school/exercises` & `@cyber-school/lesson-runtime` : réutilisation directe pour les exercices `multiple-choice`, `state-prediction` et `sequence-order`, plus proposition structurée dans [ADR-0006](../../decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md) pour le type `diagram-probe` et le runner d'évaluation cumulative `AssessmentBlueprint`.
- **Zéro saisie manuelle de code** : aucun champ éditeur libre (`textarea` de code, Monaco, etc.). Toutes les interactions reposent sur des sélecteurs de scénarios, boutons pas-à-pas, curseurs temporels, clics de zones mémoire et choix raisonnés.

---

## 2. Contrats de navigation clavier et lecteur d'écran (WCAG AA)

### Raccourcis et focus dans chaque simulateur (`VIS-01`..`VIS-05`)

| Interaction                  | Touche clavier                                | Comportement attendu                                                                   |
| ---------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Navigation entre contrôles   | `Tab` / `Shift+Tab`                           | Ordre logique : sélecteur de scénario → transport (Play/Step) → scène → panneau d'état |
| Pas suivant / Pas précédent  | `ArrowRight` / `ArrowLeft` (sur timeline)     | Avance ou recule d'exactement 1 état déterministe                                      |
| Sélection de segment / chunk | `ArrowUp` / `ArrowDown` ou `Tab` + `Enter`    | Inspecte la cellule, le segment (`Text`, `Heap`, `Stack`) ou le chunk sans souris      |
| Lecture / Pause              | `Space` ou `Enter` sur le bouton Lecture      | Démarre/suspend l'avance automatique ; annonce l'état au lecteur d'écran               |
| Revenir à l'état initial     | `Home` (sur timeline) ou bouton Réinitialiser | Réinitialise l'état déterministe à `step = 0`                                          |

### Exigences ARIA

- Chaque simulateur est encapsulé dans une `<section role="region" aria-labelledby="...">`.
- La bande explicative synchronisée sous la scène utilise `aria-live="polite"` et `aria-atomic="true"` afin d'énoncer chaque transition majeure (`ex. "Étape 3 sur 6 : RET dépile 0x004A, RSP passe à 0x7FF8, le bloc de la variable locale sort de la trame active"`).
- Les codes couleur (`Text`, `Heap`, `Stack`, `Free`, `Corrupted/UAF`) ne véhiculent **jamais** l'information seuls : ils sont doublés par des **icônes, motifs/hachures ou badges textuels explicites** (`r-x`, `rw-`, `LIBRE`, `OCCUPÉ`, `DANGLING`, `UAF`).

---

## 3. Prise en charge de `prefers-reduced-motion`

1. Lorsqu'un utilisateur active `prefers-reduced-motion: reduce` (ou le toggle manuel d'accessibilité éventuel) :
   - Aucune translation prolongée de jeton sur bus ni secousse d'erreur (`SIGSEGV`) n'est jouée (`duration = 0` sur les tweens GSAP ou saut direct à la pose finale).
   - Le changement d'état reste **immédiatement lisible** grâce à un anneau de focus contrasté et un badge delta (`RSP: 0x7FD0 -> 0x7FF0`).
2. Sur mobile (`375px` de largeur) :
   - La disposition à 2 colonnes (Trace + Mémoire) bascule proprement en **pile verticale compacte** sans débordement horizontal (`overflow-x: hidden` sur le viewport, défilement interne uniquement si tableau hexadécimal explicite avec indicateur).
   - Les cibles cliquables/tactiles (segments, chunks, boutons pas-à-pas) font au minimum `44 × 44 px`.

---

## 4. Intégration des laboratoires externes (lecture seule et sécurité)

En fin de parcours (après maîtrise des concepts), deux guides pratiques **externes en lecture seule** sont proposés conformément à [docs/security/AI_ENVIRONMENT_SECURITY.md](../../security/AI_ENVIRONMENT_SECURITY.md) :

1. **Compiler Explorer (`https://godbolt.org`, ID ressource `godbolt-explorer`)** :
   - Liens ouvrables en nouvel onglet (`rel="noopener noreferrer"`) avec avertissement explicite de contenu externe (`untrustedContentNotice`).
   - L'apprenant observe côte à côte une petite fonction C compilée en `-O0` (trames visibles sur la pile) puis en `-O2` (promotion en registres / suppression d'allocation pile), **sans devoir écrire ni soumettre de code**.
2. **Lecture guidée d'un dump mémoire GDB (`x/nfu addr`)** :
   - Fiche interactive locale montrant comment lire la commande GDB `x/16bx $rsp` (16 octets hexadécimaux à partir de `RSP`) et `cat /proc/self/maps`, en reliant directement les adresses réelles x86-64 aux représentations de `VIS-02` et `VIS-03`.
