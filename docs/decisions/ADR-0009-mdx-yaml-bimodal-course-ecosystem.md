# ADR-0009 — Écosystème auteur MDX + YAML, Mode Studio en diapositives expressives et voix off Gemini 3.8 Flash TTS

- **Statut** : Proposé et implémenté en pilote (en attente de revue humaine finale)
- **Date** : 2026-11-19
- **Contexte** : Refonte complète de la méthodologie de production et de livraison des cours pour couvrir de façon durable, exigeante et open-source les 160 unités / 1 122 micro-leçons du programme V4, en garantissant à la fois un cours écrit de très haut niveau pédagogique et un mode guidé expressif permettant à tout élève de suivre et maîtriser le sujet sans avoir besoin de lire.

## Problème observé sur le prototype initial

1. **Rédaction JSON fragmentée et non industrialisable** : séparer `course.page.json` et `lesson-audio-scripts.json` a provoqué une dérive directe (10 cues audio pointant vers 6 sections DOM), un ton oral grandiloquent déconnecté de la page et des distracteurs QCM caricaturaux.
2. **Mode guidé trop proche du mode texte** : la première itération affichait essentiellement les mêmes blocs empilés que le mode lecture, avec trop peu de scènes visuelles et une barre audio flottante superposée.
3. **Couplage en dur et collision simulateur** : `CourseLessonStudio` utilisait un branchement `if/else` en dur sur les diagrammes, deux `<audio>` potentiellement désynchronisés, et `RefutationFunnelDiagram` usurpait `data-testid="observation-workbench"` au détriment du moteur déterministe réel (`ObservationWorkbench`).
4. **Pipeline TTS hérité** : `scripts/media/generate-lesson-audio.py` utilisait l'ancienne API `generateContent` sans `speech_metadata`, sans cache par diapositive, sans retry ni fallback MP3 pour Safari/WebKit, et générait des fichiers `.wav` PCM jusqu'à 13 Mo par chapitre.

## Décision

1. **Source de vérité unique en MDX + YAML par unité (`lessons/<slug>/`)** :
   - `meta.yaml` : métadonnées V4, objectifs, sources primaires (dont `rfc-1918`, `nist-sp-800-92`, `nist-sp-800-61r3`), configuration vocale.
   - `course.mdx` : chapitres découpés en **diapositives/scènes denses et expressives** (`<Scene id="..." title="..." pauseForAction="...">` — 28 scènes sur la leçon pilote) réunissant **côte à côte** la spécification visuelle de diapositive (`<Slide layout="...">`), les repères clés (`<Focus>`), le contenu éditorial/interactif (`<WorkedExample>`, `<MicroCheck>`, `<Visual>`, `<Terminal>`, `<Practice>`, `<ReferenceSheet>`, `<Summary>`) et la narration orale dédiée (`<AudioScript>`).
   - `exercises.yaml` : exercices diagnostiques avec `misconceptionTags` obligatoires sur chaque distracteur.
   - `pronunciation.yaml` (optionnel, local au cours) complétant le dictionnaire global `curriculum/pronunciation.yaml`.
2. **Compilateur déterministe quote-aware et Linter qualité sur 100 points dans `@cyber-school/lesson-runtime`** :
   - Parseur YAML 1.2 déterministe sans dépendance externe (`yaml-parser.ts`) avec objets inline `{ k: v }`.
   - Compilateur MDX (`mdx-course-compiler.ts`) basé sur un scanner quote-aware (rejetant les balises inconnues ou non fermées et gérant `>` dans les attributs), validant 8 mises en page de diapositives (`SlideVisualSpecSchema` : `hero-dilemma`, `log-spotlight`, `contrast-split`, `mechanism-flow`, `timeline-shift`, `elimination-board`, `rule-manifesto`, `case-gallery`) par Zod `.strict()`.
   - Grille qualité (`course-quality-linter.ts`, seuil >= 85/100) vérifiant la couverture en diapositives expressives (`>= 70 %`), la parité scène↔audio, l'absence de dérive de persona dans `style`, l'absence de renvois spatiaux cassés (`ci-dessus`, `remontez sur le schéma`), l'absence de distracteurs caricaturaux et la non-fuite des identifiants internes V4.
   - Commandes `corepack pnpm course:compile` et `corepack pnpm course:lint`, vérifiées avec la parité `audio-manifest.json` dans `corepack pnpm validate:curriculum`.
3. **Expérience bimodale radicalement différenciée (palette sombre Cyber School `#101312` / `#131815` / `#c8ed97` / `#68b8ea` / `#fda4af` préservée)** :
   - **Mode Lecture** : colonne éditoriale calme (`max-w-[780px]`), boutons « Écouter » par étape et barre audio synchronisée.
   - **Mode Studio / Écoute guidée (« Sans lecture »)** : scène plein écran élargie (`max-w-[1120px]`, sommaire replié automatiquement), moteur de rendu expressif `SlideStageRenderer` (8 mises en page visuelles), barre de progression séquencée par diapositive, console de transport intégrée non-superposée (`min-h-[44px]`, curseur `<input type="range">` accessible clavier, raccourcis `ArrowLeft`/`ArrowRight`/`Space` sécurisés), sous-titres désactivés par défaut (principe de redondance de Mayer) et notes/transcription dépliables à la demande.
   - **Contrôleur audio unique relevé (`useCourseAudio`)** : un seul élément `<audio>` multi-sources (`.ogg` Opus + `.mp3` fallback) avec surveillance de frontière à 50 ms pour des pauses pédagogiques (`pauseForAction`) exactes, état d'erreur explicite (aucun minuteur silencieux factice) et continuité totale lors du basculement Lecture ↔ Mode Studio.
   - **Simulateur déterministe réel rétabli** : `RefutationFunnelDiagram` n'usurpe plus `observation-workbench`, et la scène dédiée du chapitre 3 monte le vrai moteur `ObservationWorkbench` (Cas 3A + Cas 3B + limites du modèle).
4. **Voix off générique via Gemini 3.8 Flash TTS (`Interactions API`)** :
   - `scripts/media/generate-lesson-audio.py --slug <slug>` appelle `gemini-3.8-flash-tts` via `client.interactions.create` (`v1beta`) avec `speech_metadata.style` strictement limité au ton/rythme (stabilité de voix), cache SHA-256 par diapositive (`.cache/tts/`), synthèse parallèle (`--workers`), retry backoff exponentiel (4 tentatives), cumul exact de frames PCM (zéro dérive d'arrondi) et double encodage Ogg Opus (`.ogg`) + MP3 (`.mp3`) via `ffmpeg`.

## Conséquences

- **Positives** : séparation nette entre expérience de lecture approfondie et présentation guidée expressive ; parité DOM ↔ diapositives ↔ audio garantie par CI ; compatibilité universelle desktop/Safari/mobile ; régénération incrémentale rapide grâce au cache SHA-256 par diapositive ; réutilisable tel quel sur les 160 unités V4.
- **Contraintes** : toute édition de `meta.yaml`, `course.mdx` ou `exercises.yaml` doit être suivie de `corepack pnpm course:compile -- --slug <slug>` (vérifié par `validate:curriculum`) puis de `generate-lesson-audio.py` lorsque les `<AudioScript>` changent.
