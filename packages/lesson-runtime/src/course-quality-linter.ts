import type { CompiledCourseArtifacts } from "./mdx-course-compiler.js";

export interface CourseQualityIssue {
  severity: "error" | "warning";
  dimension: "audio-sync" | "editorial" | "pedagogy" | "rigor";
  code: string;
  message: string;
}

export interface CourseQualityReport {
  slug: string;
  score: number;
  passed: boolean;
  breakdown: {
    audioSync: number; // /25
    editorial: number; // /20
    pedagogy: number; // /30
    rigor: number; // /25
  };
  stats: {
    chapters: number;
    scenes: number;
    expressiveSlides: number;
    totalAudioWords: number;
    estimatedAudioMinutes: number;
    exercises: number;
    microChecks: number;
    workedExamples: number;
    hasReferenceSheet: boolean;
  };
  issues: CourseQualityIssue[];
}

const BANNED_POMPOUS_AUDIO_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /épistémologie de l['’]investigation/i, label: "ton amphithéâtre pompeux" },
  { pattern: /froideur géométrique/i, label: "style grandiloquent artificiel" },
  { pattern: /asépsie de la machine|asepsie de la machine/i, label: "jargon ampoulé" },
  { pattern: /équifinalité empirique/i, label: "terme académique hors niveau" },
  { pattern: /rectitude intellectuelle/i, label: "ton moralisateur" },
  { pattern: /arcanes du noyau/i, label: "emphase inutile" },
  { pattern: /dialecte de programmation/i, label: "formule pompeuse" },
  { pattern: /savoir ésotérique/i, label: "formule grandiloquente" },
  { pattern: /expert assermenté/i, label: "emphase artificielle" },
];

const BANNED_CARTOON_DISTRACTOR_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /autorisation préfectorale/i, label: "distracteur absurde" },
  { pattern: /redémarré trois fois/i, label: "distracteur absurde" },
  { pattern: /sanction disciplinaire/i, label: "distracteur caricatural" },
  { pattern: /réservées aux ministères/i, label: "distracteur absurde" },
  { pattern: /8\s*000 fautes de frappe/i, label: "distracteur impossible" },
  { pattern: /factices sous linux/i, label: "distracteur caricatural" },
];

const BANNED_FILLER_OPENERS = [
  /^bienvenue dans ce cours\b/i,
  /^comme tout le monde le sait\b/i,
  /^c['’]est très simple\b/i,
];

const STYLE_PERSONA_DRIFT_REGEX =
  /\b(?:french|english|male|female|man|woman|mentor|professor|teacher)\b/i;

const BROKEN_CROSS_SCENE_REF_REGEX = /remontez sur le schéma|laboratoire interactif ci-dessus/i;

const INTERNAL_ID_LEAK_REGEX = /\b(?:TC|A|B|C|D|X)\d{2}\.\d{3}\b|\bunit-[a-z0-9]+-[a-z0-9-]+\b/;

function countWords(text: string): number {
  return text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function lintCompiledCourse(compiled: CompiledCourseArtifacts): CourseQualityReport {
  const issues: CourseQualityIssue[] = [];
  let audioSync = 25;
  let editorial = 20;
  let pedagogy = 30;
  let rigor = 25;

  const parts = compiled.page.courseParts ?? [];
  const allChapters = parts.flatMap((part) => part.chapters);
  const allScenes = allChapters.flatMap((chapter) => chapter.scenes ?? []);

  let totalAudioWords = 0;
  let expressiveSlides = 0;
  let microChecks = 0;
  let workedExamples = 0;
  let hasReferenceSheet = false;
  let hasPauseForAction = false;
  let hasTransferPad = false;
  let hasInteractiveVisualOrExp = false;

  // 1. Audio ↔ Slide/DOM sync, voice consistency & pacing (25 pts)
  for (const chapter of allChapters) {
    const scenes = chapter.scenes ?? [];
    const audioChapter = compiled.audioScripts.chapters[chapter.id];
    if (!audioChapter) {
      audioSync -= 10;
      issues.push({
        severity: "error",
        dimension: "audio-sync",
        code: "MISSING_AUDIO_CHAPTER",
        message: `Le chapitre ${chapter.id} n'a pas de piste audio compilée.`,
      });
      continue;
    }

    if (scenes.length !== audioChapter.cues.length) {
      audioSync -= 10;
      issues.push({
        severity: "error",
        dimension: "audio-sync",
        code: "SCENE_CUE_COUNT_MISMATCH",
        message: `Chapitre ${chapter.id} : ${scenes.length} scènes/slides pour ${audioChapter.cues.length} cues audio.`,
      });
    }

    for (let i = 0; i < scenes.length; i += 1) {
      const scene = scenes[i]!;
      const cue = audioChapter.cues[i];
      if (!cue || cue.blockId !== scene.id) {
        audioSync -= 6;
        issues.push({
          severity: "error",
          dimension: "audio-sync",
          code: "SCENE_CUE_ID_MISMATCH",
          message: `Scène ${scene.id} non alignée avec le cue audio correspondant (${cue?.blockId ?? "absent"}).`,
        });
        continue;
      }

      if (scene.pauseForAction) hasPauseForAction = true;

      const hasDedicatedVisual =
        Boolean(scene.slide) ||
        scene.blocks.some(
          (b) =>
            b.type === "diagram" ||
            b.type === "worked-example" ||
            b.type === "micro-check" ||
            b.type === "reference-sheet" ||
            (b.type === "practice" && (Boolean(b.experienceId) || Boolean(b.showTransferPad))),
        );
      if (hasDedicatedVisual) expressiveSlides += 1;

      const words = countWords(cue.spokenText);
      totalAudioWords += words;
      if (words < 22) {
        audioSync -= 2;
        issues.push({
          severity: "warning",
          dimension: "audio-sync",
          code: "AUDIO_TOO_SHORT",
          message: `Scène ${scene.id} : narration très courte (${words} mots).`,
        });
      } else if (words > 240) {
        audioSync -= 2;
        issues.push({
          severity: "warning",
          dimension: "audio-sync",
          code: "AUDIO_SLIDE_TOO_LONG",
          message: `Scène ${scene.id} : narration longue pour une seule slide (${words} mots > 240). Scindez en deux slides plus rythmées.`,
        });
      }

      if (cue.style && STYLE_PERSONA_DRIFT_REGEX.test(cue.style)) {
        audioSync -= 2;
        issues.push({
          severity: "warning",
          dimension: "audio-sync",
          code: "STYLE_PERSONA_DRIFT",
          message: `Scène ${scene.id} : évitez d'injecter langue/genre/persona dans speech_metadata.style (« ${cue.style} ») pour préserver la stabilité de voix Gemini 3.8 TTS.`,
        });
      }

      if (/\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\//.test(cue.spokenText)) {
        audioSync -= 4;
        issues.push({
          severity: "error",
          dimension: "audio-sync",
          code: "RAW_MARKDOWN_IN_AUDIO",
          message: `Scène ${scene.id} : syntaxe Markdown brute détectée dans <AudioScript>.`,
        });
      }

      for (const banned of BANNED_POMPOUS_AUDIO_PATTERNS) {
        if (banned.pattern.test(cue.spokenText)) {
          audioSync -= 4;
          issues.push({
            severity: "error",
            dimension: "audio-sync",
            code: "POMPOUS_AUDIO_TONE",
            message: `Scène ${scene.id} : expression pompeuse détectée (${banned.label}).`,
          });
        }
      }

      if (INTERNAL_ID_LEAK_REGEX.test(cue.spokenText)) {
        rigor -= 8;
        issues.push({
          severity: "error",
          dimension: "rigor",
          code: "INTERNAL_ID_IN_AUDIO",
          message: `Scène ${scene.id} : identifiant interne V4 détecté dans la voix off.`,
        });
      }
    }
  }

  // Require rich visual slide coverage so Guided Mode never looks like stripped text
  if (allScenes.length > 0 && expressiveSlides / allScenes.length < 0.7) {
    editorial -= 5;
    issues.push({
      severity: "warning",
      dimension: "editorial",
      code: "LOW_SLIDE_EXPRESSIVENESS",
      message: `Seulement ${expressiveSlides}/${allScenes.length} scènes possèdent une <Slide> expressive ou un visuel interactif dédié (objectif >= 70 %).`,
    });
  }

  // 2. Editorial clarity, formatting & self-contained scenes (20 pts)
  for (const scene of allScenes) {
    const sceneHasInteractive = scene.blocks.some(
      (b) => b.type === "diagram" || (b.type === "practice" && Boolean(b.experienceId)),
    );

    for (const block of scene.blocks) {
      if (block.type === "prose") {
        for (const p of block.paragraphs) {
          if (p.length > 560) {
            editorial -= 3;
            issues.push({
              severity: "warning",
              dimension: "editorial",
              code: "PARAGRAPH_WALL_OF_TEXT",
              message: `Scène ${scene.id} : paragraphe trop dense (${p.length} caractères > 560).`,
            });
          }
          for (const opener of BANNED_FILLER_OPENERS) {
            if (opener.test(p)) {
              editorial -= 3;
              issues.push({
                severity: "warning",
                dimension: "editorial",
                code: "FILLER_OPENER",
                message: `Scène ${scene.id} : formule d'ouverture creuse détectée.`,
              });
            }
          }
          if (INTERNAL_ID_LEAK_REGEX.test(p)) {
            rigor -= 8;
            issues.push({
              severity: "error",
              dimension: "rigor",
              code: "INTERNAL_ID_IN_PROSE",
              message: `Scène ${scene.id} : identifiant interne V4 exposé dans la prose apprenant.`,
            });
          }
        }
      } else if (block.type === "worked-example") {
        workedExamples += 1;
      } else if (block.type === "micro-check") {
        microChecks += 1;
      } else if (block.type === "reference-sheet") {
        hasReferenceSheet = true;
      } else if (block.type === "diagram") {
        hasInteractiveVisualOrExp = true;
      } else if (block.type === "practice") {
        if (block.experienceId) hasInteractiveVisualOrExp = true;
        if (block.showTransferPad) hasTransferPad = true;
        const practiceText = `${block.context} ${block.instructions.join(" ")}`;
        if (!sceneHasInteractive && BROKEN_CROSS_SCENE_REF_REGEX.test(practiceText)) {
          editorial -= 4;
          issues.push({
            severity: "error",
            dimension: "editorial",
            code: "BROKEN_CROSS_SCENE_REFERENCE",
            message: `Scène ${scene.id} : <Practice> renvoie à un schéma ou laboratoire « ci-dessus » qui n'est pas monté dans cette scène.`,
          });
        }
      }
    }
  }

  for (const chapter of allChapters) {
    const hasSummary = chapter.blocks.some((b) => b.type === "summary");
    if (!hasSummary) {
      editorial -= 4;
      issues.push({
        severity: "error",
        dimension: "editorial",
        code: "MISSING_CHAPTER_SUMMARY",
        message: `Chapitre ${chapter.id} : bloc <Summary> (« En résumé ») manquant.`,
      });
    }
  }

  // 3. Pedagogical strength & assessment rigor (30 pts)
  if (workedExamples === 0) {
    pedagogy -= 8;
    issues.push({
      severity: "error",
      dimension: "pedagogy",
      code: "MISSING_WORKED_EXAMPLE",
      message: "Aucun <WorkedExample> (exemple résolu commenté avec Pourquoi) dans le cours.",
    });
  }
  if (microChecks === 0) {
    pedagogy -= 6;
    issues.push({
      severity: "warning",
      dimension: "pedagogy",
      code: "MISSING_MICRO_CHECK",
      message:
        "Aucun <MicroCheck> intégré dans les chapitres pour la récupération active immédiate.",
    });
  }
  if (!hasReferenceSheet) {
    pedagogy -= 5;
    issues.push({
      severity: "warning",
      dimension: "pedagogy",
      code: "MISSING_REFERENCE_SHEET",
      message: "Aucune <ReferenceSheet> (fiche référence Diátaxis) en fin de cours.",
    });
  }
  if (!hasPauseForAction) {
    pedagogy -= 4;
    issues.push({
      severity: "warning",
      dimension: "pedagogy",
      code: "MISSING_ACTION_PAUSE",
      message: 'Aucune scène ne définit pauseForAction="true" avant une question ou un atelier.',
    });
  }
  if (!hasInteractiveVisualOrExp) {
    pedagogy -= 6;
    issues.push({
      severity: "error",
      dimension: "pedagogy",
      code: "MISSING_VISUAL_EXPERIENCE",
      message: "Aucun visuel interactif ni simulateur relié au cours.",
    });
  }
  if (!hasTransferPad) {
    pedagogy -= 4;
    issues.push({
      severity: "warning",
      dimension: "pedagogy",
      code: "MISSING_TRANSFER_PRACTICE",
      message: 'Aucun atelier de transfert autonome (showTransferPad="true").',
    });
  }

  for (const exercise of compiled.lesson.exercises) {
    if (INTERNAL_ID_LEAK_REGEX.test(exercise.prompt)) {
      rigor -= 5;
      issues.push({
        severity: "error",
        dimension: "rigor",
        code: "INTERNAL_ID_IN_EXERCISE",
        message: `Exercice ${exercise.id} : identifiant interne V4 dans l'énoncé.`,
      });
    }

    if (exercise.kind === "multiple-choice" || exercise.kind === "state-prediction") {
      const tags = compiled.misconceptionTagsByExercise[exercise.id] ?? {};
      for (const option of exercise.options) {
        if (option.id === exercise.correctOptionId) continue;

        for (const banned of BANNED_CARTOON_DISTRACTOR_PATTERNS) {
          if (banned.pattern.test(option.label)) {
            pedagogy -= 5;
            issues.push({
              severity: "error",
              dimension: "pedagogy",
              code: "CARTOON_DISTRACTOR",
              message: `Exercice ${exercise.id} (${option.id}) : ${banned.label} détecté.`,
            });
          }
        }

        if (option.feedback.length < 45) {
          pedagogy -= 2;
          issues.push({
            severity: "warning",
            dimension: "pedagogy",
            code: "SHALLOW_DISTRACTOR_FEEDBACK",
            message: `Exercice ${exercise.id} (${option.id}) : feedback diagnostique trop court (${option.feedback.length} caractères).`,
          });
        }

        if (!tags[option.id]) {
          pedagogy -= 1;
          issues.push({
            severity: "warning",
            dimension: "pedagogy",
            code: "MISSING_MISCONCEPTION_TAG",
            message: `Exercice ${exercise.id} (${option.id}) : misconceptionTag absent dans exercises.yaml.`,
          });
        }
      }
    }
  }

  // 4. Rigor & governance checks (25 pts)
  if (compiled.lesson.resourceIds.length < 2) {
    rigor -= 8;
    issues.push({
      severity: "error",
      dimension: "rigor",
      code: "INSUFFICIENT_PRIMARY_SOURCES",
      message: "Le cours doit s'appuyer sur au moins 2 sources primaires référencées.",
    });
  }

  const clamped = {
    audioSync: Math.max(0, audioSync),
    editorial: Math.max(0, editorial),
    pedagogy: Math.max(0, pedagogy),
    rigor: Math.max(0, rigor),
  };
  const score = clamped.audioSync + clamped.editorial + clamped.pedagogy + clamped.rigor;
  const hasErrors = issues.some((issue) => issue.severity === "error");

  return {
    slug: compiled.lesson.slug,
    score,
    passed: !hasErrors && score >= 85,
    breakdown: clamped,
    stats: {
      chapters: allChapters.length,
      scenes: allScenes.length,
      expressiveSlides,
      totalAudioWords,
      estimatedAudioMinutes: Math.max(1, Math.round(totalAudioWords / 148)),
      exercises: compiled.lesson.exercises.length,
      microChecks,
      workedExamples,
      hasReferenceSheet,
    },
    issues,
  };
}
