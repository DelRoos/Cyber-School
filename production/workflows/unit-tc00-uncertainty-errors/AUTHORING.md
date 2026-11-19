# Produire la page : Erreurs de décision, Bayes, provenance et contradiction

Unité : unit-tc00-uncertainty-errors. Tâche : TASK-023. Page cible : /lessons/understanding-alerts-and-evidence.

Lire .agents/skills/course-page-production/SKILL.md. Les rôles ci-dessous peuvent être assumés successivement par le même agent. Aucun fournisseur ni modèle n'est imposé.

Notions à couvrir exactement : TC00.009, TC00.010, TC00.011, TC00.012, TC00.013, TC00.014, TC00.015, TC00.016.

Prérequis de l'unité : aucun. Vérifier leur état avant de présenter le cours comme accessible dans un parcours validé.

## Artefacts à produire

- docs/courses/understanding-alerts-and-evidence/COURSE_DOSSIER.md
- lessons/understanding-alerts-and-evidence/lesson.json
- lessons/understanding-alerts-and-evidence/course.page.json
- Curriculum et ressources existants : réutiliser les concepts, ajouter seulement les sources vérifiées nécessaires.
- Expériences : apps/web/src/components/course-experiences/{catalog.ts,registry.tsx}, composants, moteurs et tests.
- tests/e2e/understanding-alerts-and-evidence.spec.ts

## Étapes et conditions de sortie

### 1. Vérifier les sources

Responsabilité : pedagogy-designer. Skills : curriculum-production, lesson-design.
Sortie : COURSE_DOSSIER.md : affirmations, sections des sources et limites du modèle.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

### 2. Rédiger les chapitres complets

Responsabilité : pedagogy-designer. Skills : lesson-design, visual-explanation.
Sortie : lesson.json et course.page.json : explication, exemple, prédiction, exercice, bilan, sources.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

### 3. Construire les expériences

Responsabilité : frontend-engineer. Skills : pedagogical-animation, gsap-animation, visual-explanation.
Sortie : Composants enregistrés, moteurs déterministes et tests des invariants.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

### 4. Assembler la page

Responsabilité : frontend-engineer. Skills : frontend-design, browser-validation.
Sortie : Page /lessons/<slug>, évaluation et test navigateur du parcours complet.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

### 5. Exécuter la réception

Responsabilité : qa-engineer. Skills : browser-validation, project-handoff.
Sortie : Preuve quality:verify correspondant aux sources et à la tâche courantes.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

### 6. Relire avant publication

Responsabilité : human-reviewer. Skills : revue humaine.
Sortie : Revue scientifique et pédagogique humaine réelle, statut de publication géré séparément.
Contrôle : corepack pnpm course:workflow -- status --unit unit-tc00-uncertainty-errors

## Contrat de rédaction

Le fichier draft/course.page.json décrit la forme, pas un cours terminé. Ne pas publier un modèle vide ou du texte de remplissage. L'exemple doit être résolu, les chiffres doivent correspondre au moteur, les erreurs doivent avoir un feedback spécifique.

## Réception

corepack pnpm course:workflow -- check --unit unit-tc00-uncertainty-errors
corepack pnpm course:workflow -- verify --unit unit-tc00-uncertainty-errors

Produire tous les documents et rapports AVANT la QA. Après la QA, status avec --evidence est en lecture seule. Ne pas transformer une structure complète ou des cases cochées en validation scientifique. La publication reste une étape distincte avec approbation humaine réelle.
