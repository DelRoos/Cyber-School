# Fiche de référence — Comprendre le fonctionnement de la mémoire d'un programme

## 1. Identité du cours

- **Identifiant cible de leçon / parcours** : `program-memory-fundamentals`
- **Titre complet** : _Comprendre le fonctionnement de la mémoire d'un programme : de l'exécution des instructions à la gestion des variables, de la pile et du tas_
- **Domaine du référentiel** : `systems-and-memory` (_Architecture Systèmes & Mémoire des Programmes_) — défini dans [curriculum/program-memory-foundations.json](../../../curriculum/program-memory-foundations.json)
- **Statut actuel** : Conception pédagogique, visuelle et technique validée ; implémentation interactive planifiée (`TASK-009` à `TASK-014`)
- **Durée totale estimée** : `4 h 30` (3 modules, 6 chapitres progressifs, 5 simulateurs/visualisations interactives, 16 exercices sans écriture de code et 1 évaluation cumulative)

## 2. Public cible et prérequis d'entrée

### Public cible

- Apprenants connaissant les bases syntaxiques d'un langage impératif ou objet (variables, conditions, boucles, appels de fonctions) mais pour qui la mémoire reste une « boîte noire ».
- Développeurs souhaitant comprendre en profondeur ce qui se produit réellement entre le CPU, le système d'exploitation, la pile d'appels, l'allocateur du tas, les pointeurs et les modèles de sûreté modernes (C, Rust, JVM/.NET).

### Prérequis d'entrée

- Savoir lire un pseudocode simple (affectation, condition, appel de fonction avec paramètres et valeur de retour).
- Connaître la notion de bit et d'octet (`1 octet = 8 bits`) et savoir lire une notation hexadécimale simple (des rappels visuels intégrés sont fournis dès la section 1).

> **Contrainte de modalité** : conformément aux objectifs de conception, l'apprenant **n'écrit aucun code manuellement** dans les évaluations ou simulateurs. Tous les mécanismes sont explorés par manipulation directe d'états mémoire, contrôle pas-à-pas, prédiction et diagnostic visuel.

## 3. Objectifs généraux de maîtrise

À l'issue du cours, l'apprenant est capable de :

1. **Expliquer le lien exécution ↔ mémoire** : suivre le cycle _Fetch-Decode-Execute_, le pointeur d'instruction (`PC`/`RIP`), l'adressage par octet et l'ordre little-endian.
2. **Lire l'espace d'adressage d'un processus** : distinguer adresses virtuelles et cadres physiques (MMU, pagination) et situer les segments `Text`, `Data`/`BSS`, `Heap`, `mmap` et `Stack` avec leurs permissions `rwx`.
3. **Tracer la pile d'appels** : prédire l'évolution de `RSP`/`RBP`, l'adresse de retour, les trames d'activation et identifier l'apparition exacte d'un pointeur pendant (_dangling pointer_) ou d'un _stack overflow_.
4. **Expliquer l'allocation dynamique sur le tas** : justifier le recours au tas, décrire le rôle interne des en-têtes de blocs (_chunks_), listes libres et fusion, et analyser fragmentation interne/externe, fuites, _double free_ et _Use-After-Free_.
5. **Comparer les modèles de gestion mémoire** : opposer gestion manuelle (C), _Ownership/RAII_ (Rust/C++) et ramasse-miettes traçant (JVM/.NET), en gardant conscience des écarts entre modèle pédagogique, optimisations compilateur et matériel réel.

## 4. Arbitrage technologique et choix 2D vs 3D

Conformément à [docs/standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md](../../standards/PEDAGOGICAL_AND_VISUAL_STANDARDS.md) et à `.agents/skills/visual-explanation/SKILL.md` :

- **Médium retenu** : **`hybrid` (SVG interactif haute précision + GSAP + Motion + graphiques D3.js)** — **aucune scène 3D WebGL n'est retenue** pour ce cours.
- **Justification pédagogique de l'exclusion 3D** :
  - L'apprentissage de la mémoire repose sur la lecture simultanée et exacte d'**adresses hexadécimales**, d'**intervalles contigus d'octets**, d'**alignements à 4/8/16 octets**, de **flèches d'indirection (pointeurs)** et de **limites de trames/blocs**.
  - Une projection perspective 3D introduit une **occlusion visuelle**, déforme l'alignement vertical des adresses et complique la sélection clavier/tactile sans apporter d'information spatiale pertinente (la mémoire virtuelle d'un processus est fondamentalement un **espace linéaire adressable 1D** structuré en couches/régions 2D).
- **Bibliothèques exploitées** :
  - `@cyber-school/ui` : primitives accessibles, badges de segments, contrôles de lecture pas-à-pas, panneaux de détails synchronisés.
  - `@cyber-school/animations` (`createGsapTimelineScope` + `Motion`) : séquencement déterministe des flux bus CPU/RAM, empilement/dépilement de trames de pile, séparation/fusion de chunks, respect strict de `prefers-reduced-motion`.
  - **D3.js** (`d3-scale`, `d3-shape`) : jauge de fragmentation interne/externe et courbes comparatives d'empreinte mémoire (Manuel vs RAII vs GC).
  - **XYFlow (`React Flow`)** : réutilisé ultérieurement via `TASK-003` pour naviguer dans le graphe des 14 concepts atomiques du domaine `systems-and-memory`.

## 5. Cartographie des documents du dossier de conception

| Document                                                                                   | Rôle dans la conception                                                              |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [01-CONCEPTS_ATOMIQUES.md](./01-CONCEPTS_ATOMIQUES.md)                                     | Référentiel détaillé des 14 concepts atomiques (9 champs obligatoires + graphe DAG)  |
| [02-PLAN_PEDAGOGIQUE.md](./02-PLAN_PEDAGOGIQUE.md)                                         | Progression didactique sur 6 sections (intuition → interne → cas limites)            |
| [03-STORYBOARDS_VISUELS.md](./03-STORYBOARDS_VISUELS.md)                                   | Spécification scène par scène des 5 simulateurs/visualisations (`VIS-01` à `VIS-05`) |
| [04-SPECIFICATIONS_INTERACTIONS.md](./04-SPECIFICATIONS_INTERACTIONS.md)                   | Contrats UI, clavier, ARIA, `reduced-motion`, mobile `375px` et labos externes       |
| [05-BANQUE_EXERCICES.md](./05-BANQUE_EXERCICES.md)                                         | 16 exercices de raisonnement sans écriture de code + rubriques + schéma d'extension  |
| [06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md](./06-RIGUEUR_SCIENTIFIQUE_ET_SOURCES.md)           | Compromis pédagogiques assumés, avertissements OS/compilateur et sources primaires   |
| [07-CRITERES_ACCEPTATION.md](./07-CRITERES_ACCEPTATION.md)                                 | Critères vérifiables pour implémentation Claude Code et validation Codex             |
| [08-PLAN_DEVELOPPEMENT_ET_HANDOFF_CLAUDE.md](./08-PLAN_DEVELOPPEMENT_ET_HANDOFF_CLAUDE.md) | Décomposition en tâches atomiques (`TASK-009`..`TASK-014`) et relais Claude Code     |

## 6. Alignement avec le socle technique existant

- **Catalogue de concepts** : déjà validé par schéma Zod via `corepack pnpm validate:curriculum` dans [curriculum/program-memory-foundations.json](../../../curriculum/program-memory-foundations.json).
- **Sources primaires** : enregistrées et validées dans [resources/sources.json](../../../resources/sources.json) (`linux-mm-concepts`, `linux-proc-pid-maps`, `sysv-amd64-abi`, `glibc-malloc-internals`, `rust-ownership-book`, `dotnet-gc-fundamentals`, `godbolt-explorer`).
- **Contrat d'architecture respecté** : ce dossier ne modifie pas arbitrairement l'architecture ; lorsqu'un type d'exercice enrichi (inspection interactive de zone mémoire) ou le lecteur multi-exercices d'évaluation est utile, l'extension est explicitement isolée dans un ADR proposé ([ADR-0006](../../decisions/ADR-0006-interactive-diagram-probe-and-assessment-runner.md)) soumis à approbation avant implémentation.
