import { z } from "zod";
import { StableIdSchema, type LessonManifest, type ResourcesCatalog } from "./schemas.js";

const teachingText = z
  .string()
  .trim()
  .min(20)
  .refine(
    (value) => !/\b(?:TODO|TBD|lorem ipsum|placeholder)\b|à compléter/i.test(value),
    "Un contenu pédagogique rédigé est requis, pas une consigne à compléter.",
  );

export const ChapterCalloutKindSchema = z.enum(["information", "question", "warning", "error"]);
export const ChapterCalloutPlacementSchema = z.enum([
  "opening",
  "explanation",
  "example",
  "experience",
  "practice",
]);

export const ChapterCalloutSchema = z
  .object({
    id: StableIdSchema,
    kind: ChapterCalloutKindSchema,
    placement: ChapterCalloutPlacementSchema,
    title: z.string().trim().min(3),
    body: teachingText,
  })
  .strict();

export const CourseEditorialBlockSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("heading"),
      text: z.string().trim().min(3),
    })
    .strict(),
  z
    .object({
      type: z.literal("prose"),
      paragraphs: z.array(teachingText).min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("callout"),
      kind: ChapterCalloutKindSchema,
      title: z.string().trim().min(3).optional(),
      body: teachingText,
    })
    .strict(),
  z
    .object({
      type: z.literal("quote"),
      paragraphs: z.array(teachingText).min(1),
      attribution: z.string().trim().min(3).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("banner"),
      variant: z.enum(["welcome", "practice"]),
      caption: z.string().trim().min(5).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("terminal"),
      label: z.string().trim().min(2),
      content: z.string().trim().min(5),
    })
    .strict(),
  z
    .object({
      type: z.literal("table"),
      headers: z.array(z.string().trim().min(2)).min(2),
      rows: z.array(z.array(z.string().trim().min(1)).min(2)).min(1),
      caption: z.string().trim().min(5).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("list"),
      ordered: z.boolean().default(true),
      items: z
        .array(
          z
            .object({
              lead: z.string().trim().min(2).optional(),
              detail: z.string().trim().min(8),
            })
            .strict(),
        )
        .min(2),
    })
    .strict(),
  z
    .object({
      type: z.literal("diagram"),
      diagramId: StableIdSchema,
      caption: z.string().trim().min(8),
    })
    .strict(),
  z
    .object({
      type: z.literal("worked-example"),
      title: z.string().trim().min(3),
      startingPoint: teachingText,
      steps: z
        .array(
          z
            .object({
              step: teachingText,
              why: teachingText,
            })
            .strict(),
        )
        .min(2),
      conclusion: teachingText,
    })
    .strict(),
  z
    .object({
      type: z.literal("micro-check"),
      id: StableIdSchema,
      prompt: teachingText,
      options: z
        .array(
          z
            .object({
              id: StableIdSchema,
              label: z.string().trim().min(5),
              feedback: teachingText,
            })
            .strict(),
        )
        .min(2)
        .max(4),
      correctOptionId: StableIdSchema,
      explanation: teachingText,
    })
    .strict(),
  z
    .object({
      type: z.literal("reference-sheet"),
      title: z.string().trim().min(3),
      intro: teachingText.optional(),
      groups: z
        .array(
          z
            .object({
              title: z.string().trim().min(3),
              items: z
                .array(
                  z
                    .object({
                      term: z.string().trim().min(2),
                      meaning: z.string().trim().min(8),
                      pitfall: z.string().trim().min(8).optional(),
                    })
                    .strict(),
                )
                .min(1),
            })
            .strict(),
        )
        .min(1),
    })
    .strict(),
  z
    .object({
      type: z.literal("practice"),
      title: z.string().trim().min(3),
      context: teachingText,
      instructions: z.array(z.string().trim().min(8)).min(1),
      experienceId: StableIdSchema.optional(),
      exerciseIds: z.array(StableIdSchema).optional(),
      showTransferPad: z.boolean().optional(),
      selfCheckPoints: z.array(z.string().trim().min(8)).optional(),
      solutionSummary: teachingText.optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal("summary"),
      points: z.array(teachingText).min(3).max(6),
      transition: teachingText,
    })
    .strict(),
]);

export const SlideToneSchema = z.enum(["fact", "info", "warning", "danger", "neutral"]);

export const SlideVisualSpecSchema = z.discriminatedUnion("layout", [
  z
    .object({
      layout: z.literal("hero-dilemma"),
      kicker: z.string().trim().min(3),
      headline: z.string().trim().min(6),
      alertBadge: z.string().trim().min(3).optional(),
      alertText: z.string().trim().min(10).optional(),
      leftStake: z
        .object({
          label: z.string().trim().min(3),
          detail: z.string().trim().min(8),
          tone: SlideToneSchema,
        })
        .strict(),
      rightStake: z
        .object({
          label: z.string().trim().min(3),
          detail: z.string().trim().min(8),
          tone: SlideToneSchema,
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      layout: z.literal("log-spotlight"),
      sourceLabel: z.string().trim().min(3),
      lines: z.array(z.string().trim().min(5)).min(1).max(4),
      highlights: z
        .array(
          z
            .object({
              token: z.string().trim().min(1),
              label: z.string().trim().min(2),
              explanation: z.string().trim().min(8),
              tone: SlideToneSchema.optional(),
            })
            .strict(),
        )
        .min(1)
        .max(5),
    })
    .strict(),
  z
    .object({
      layout: z.literal("contrast-split"),
      leftTitle: z.string().trim().min(3),
      leftTone: SlideToneSchema,
      leftItems: z.array(z.string().trim().min(5)).min(1).max(5),
      rightTitle: z.string().trim().min(3),
      rightTone: SlideToneSchema,
      rightItems: z.array(z.string().trim().min(5)).min(1).max(5),
      verdict: z.string().trim().min(10).optional(),
    })
    .strict(),
  z
    .object({
      layout: z.literal("mechanism-flow"),
      nodes: z
        .array(
          z
            .object({
              title: z.string().trim().min(2),
              detail: z.string().trim().min(6),
              zone: z.enum(["upstream", "boundary", "sensor", "output"]),
            })
            .strict(),
        )
        .min(2)
        .max(5),
      blindSpotLabel: z.string().trim().min(5).optional(),
      takeaway: z.string().trim().min(10).optional(),
    })
    .strict(),
  z
    .object({
      layout: z.literal("timeline-shift"),
      driftNote: z.string().trim().min(10),
      apparentOrder: z
        .array(
          z
            .object({
              time: z.string().trim().min(4),
              host: z.string().trim().min(2),
              event: z.string().trim().min(6),
            })
            .strict(),
        )
        .min(2)
        .max(4),
      realOrder: z
        .array(
          z
            .object({
              time: z.string().trim().min(4),
              host: z.string().trim().min(2),
              event: z.string().trim().min(6),
            })
            .strict(),
        )
        .min(2)
        .max(4),
      lesson: z.string().trim().min(10),
    })
    .strict(),
  z
    .object({
      layout: z.literal("elimination-board"),
      sourceLabel: z.string().trim().min(3),
      activeSourceCount: z.string().trim().min(2),
      hypotheses: z
        .array(
          z
            .object({
              code: z.string().trim().min(2),
              title: z.string().trim().min(4),
              status: z.enum(["open", "refuted", "corroborated"]),
              reason: z.string().trim().min(8),
            })
            .strict(),
        )
        .min(2)
        .max(4),
    })
    .strict(),
  z
    .object({
      layout: z.literal("rule-manifesto"),
      axiom: z.string().trim().min(10),
      subtext: z.string().trim().min(10).optional(),
      pillars: z
        .array(
          z
            .object({
              label: z.string().trim().min(3),
              detail: z.string().trim().min(8),
            })
            .strict(),
        )
        .min(2)
        .max(4),
    })
    .strict(),
  z
    .object({
      layout: z.literal("case-gallery"),
      cards: z
        .array(
          z
            .object({
              sensor: z.string().trim().min(2),
              fact: z.string().trim().min(6),
              trap: z.string().trim().min(6),
              check: z.string().trim().min(6),
            })
            .strict(),
        )
        .min(2)
        .max(6),
    })
    .strict(),
]);

export const CourseSceneSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().trim().min(3),
    focusPoints: z.array(z.string().trim().min(8)).min(1).max(5).optional(),
    pauseForAction: z.boolean().optional(),
    audioStyle: z.string().trim().min(3).optional(),
    slide: SlideVisualSpecSchema.optional(),
    blocks: z.array(CourseEditorialBlockSchema).min(1),
  })
  .strict();

export const CoursePartChapterSchema = z
  .object({
    id: StableIdSchema,
    number: z.number().int().positive(),
    title: z.string().trim().min(3),
    subtitle: z.string().trim().min(5),
    estimatedMinutes: z.number().int().positive(),
    blocks: z.array(CourseEditorialBlockSchema).min(2),
    scenes: z.array(CourseSceneSchema).min(1).optional(),
  })
  .strict();

export const CoursePartSchema = z
  .object({
    id: StableIdSchema,
    number: z.number().int().positive(),
    title: z.string().trim().min(3),
    summary: teachingText,
    chapters: z.array(CoursePartChapterSchema).min(1),
    quizTitle: z.string().trim().min(3),
    quizIntro: teachingText,
  })
  .strict();

export const CourseChapterSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    estimatedMinutes: z.number().int().positive(),
    question: teachingText,
    objective: teachingText,
    explanation: z.array(teachingText).min(2),
    callouts: z.array(ChapterCalloutSchema).optional(),
    workedExample: z
      .object({
        title: z.string().min(3),
        startingPoint: teachingText,
        steps: z.array(teachingText).min(2),
        conclusion: teachingText,
      })
      .strict(),
    predictionExerciseId: StableIdSchema,
    experience: z
      .object({
        componentId: StableIdSchema,
        instruction: teachingText,
        observe: teachingText,
        modelLimits: teachingText,
      })
      .strict(),
    practiceExerciseIds: z.array(StableIdSchema).min(1),
    misconception: z.object({ claim: teachingText, correction: teachingText }).strict(),
    takeaway: teachingText,
    summaryPoints: z.array(teachingText).min(3).max(6).optional(),
    transferQuestion: teachingText,
    transitionToNext: teachingText.optional(),
    resourceIds: z.array(StableIdSchema).min(1),
    conceptIds: z.array(StableIdSchema).min(1),
    microLessonIds: z.array(z.string().regex(/^[A-Z]+\d+\.\d{3}$/)).min(1),
  })
  .strict();

export const CoursePageSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    lessonId: StableIdSchema,
    unitId: StableIdSchema,
    audience: teachingText,
    levelLabel: z.string().trim().min(3).optional(),
    introduction: teachingText,
    overviewNarrative: z.array(teachingText).min(2).optional(),
    learningObjectives: z.array(teachingText).min(2),
    prerequisites: z.array(teachingText).min(1),
    chapters: z.array(CourseChapterSchema).min(1),
    courseParts: z.array(CoursePartSchema).min(1).optional(),
    finalTakeaway: teachingText,
  })
  .strict()
  .superRefine((page, ctx) => {
    const ids = page.chapters.map((chapter) => chapter.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({
        code: "custom",
        path: ["chapters"],
        message: "Duplicate chapter identifiers.",
      });
    const microIds = page.chapters.flatMap((chapter) => chapter.microLessonIds);
    if (new Set(microIds).size !== microIds.length)
      ctx.addIssue({
        code: "custom",
        path: ["chapters"],
        message: "A micro-lesson must have one owning chapter.",
      });
    if (page.courseParts) {
      const partChapterIds = page.courseParts.flatMap((part) => part.chapters.map((c) => c.id));
      if (new Set(partChapterIds).size !== partChapterIds.length)
        ctx.addIssue({
          code: "custom",
          path: ["courseParts"],
          message: "Duplicate reader chapter identifiers.",
        });

      const seenSceneIds = new Set<string>();
      const seenMicroCheckIds = new Set<string>();

      for (const part of page.courseParts) {
        for (const ch of part.chapters) {
          for (const scene of ch.scenes ?? []) {
            if (seenSceneIds.has(scene.id)) {
              ctx.addIssue({
                code: "custom",
                path: ["courseParts"],
                message: `Duplicate scene id "${scene.id}".`,
              });
            }
            seenSceneIds.add(scene.id);
          }

          for (const block of ch.blocks) {
            if (block.type === "micro-check") {
              if (seenMicroCheckIds.has(block.id)) {
                ctx.addIssue({
                  code: "custom",
                  path: ["courseParts"],
                  message: `Duplicate micro-check id "${block.id}".`,
                });
              }
              seenMicroCheckIds.add(block.id);

              const optIds = new Set<string>();
              for (const opt of block.options) {
                if (optIds.has(opt.id)) {
                  ctx.addIssue({
                    code: "custom",
                    path: ["courseParts"],
                    message: `Micro-check "${block.id}" contains duplicate option id "${opt.id}".`,
                  });
                }
                optIds.add(opt.id);
              }
              if (!optIds.has(block.correctOptionId)) {
                ctx.addIssue({
                  code: "custom",
                  path: ["courseParts"],
                  message: `Micro-check "${block.id}" correctOptionId "${block.correctOptionId}" does not match any option.`,
                });
              }
            }
          }
        }
      }
    }
  });

export type ChapterCallout = z.infer<typeof ChapterCalloutSchema>;
export type ChapterCalloutKind = z.infer<typeof ChapterCalloutKindSchema>;
export type ChapterCalloutPlacement = z.infer<typeof ChapterCalloutPlacementSchema>;
export type CourseEditorialBlock = z.infer<typeof CourseEditorialBlockSchema>;
export type SlideTone = z.infer<typeof SlideToneSchema>;
export type SlideVisualSpec = z.infer<typeof SlideVisualSpecSchema>;
export type CourseScene = z.infer<typeof CourseSceneSchema>;
export type CoursePartChapter = z.infer<typeof CoursePartChapterSchema>;
export type CoursePart = z.infer<typeof CoursePartSchema>;
export type CoursePage = z.infer<typeof CoursePageSchema>;
export type CourseChapter = z.infer<typeof CourseChapterSchema>;

/** Checks the actual teaching-to-exercise bindings, not just the JSON shape. */
export function validateCoursePageBindings(
  page: CoursePage,
  lesson: LessonManifest,
  options: {
    resources: ResourcesCatalog;
    experienceIds: readonly string[];
    expectedMicroLessonIds?: readonly string[];
  },
): string[] {
  const issues: string[] = [];
  if (page.lessonId !== lesson.id) issues.push("Page and manifest identify different lessons.");
  const chapterIds = new Set(page.chapters.map((chapter) => chapter.id));
  if (
    chapterIds.size !== lesson.steps.length ||
    lesson.steps.some((step) => !chapterIds.has(step.id))
  )
    issues.push("Every manifest step must have exactly one complete chapter.");
  const exercises = new Map(lesson.exercises.map((exercise) => [exercise.id, exercise]));
  const resources = new Set(options.resources.resources.map((resource) => resource.id));
  const used = new Set<string>();
  for (const chapter of page.chapters) {
    if (!options.experienceIds.includes(chapter.experience.componentId))
      issues.push(`${chapter.id}: experience ${chapter.experience.componentId} is not registered.`);
    if (exercises.get(chapter.predictionExerciseId)?.kind !== "state-prediction")
      issues.push(`${chapter.id}: the prediction must reference a state-prediction exercise.`);
    for (const id of [chapter.predictionExerciseId, ...chapter.practiceExerciseIds]) {
      if (!exercises.has(id)) issues.push(`${chapter.id}: unknown exercise ${id}.`);
      const exercise = exercises.get(id);
      if (exercise && !chapter.conceptIds.includes(exercise.conceptId))
        issues.push(`${chapter.id}: exercise ${id} tests a concept outside this chapter.`);
      if (used.has(id)) issues.push(`${id}: an exercise must have one owning chapter.`);
      used.add(id);
    }
    for (const id of chapter.conceptIds)
      if (
        ![chapter.predictionExerciseId, ...chapter.practiceExerciseIds].some(
          (exerciseId) => exercises.get(exerciseId)?.conceptId === id,
        )
      )
        issues.push(`${chapter.id}: concept ${id} has no comprehension exercise.`);
    for (const id of chapter.resourceIds) {
      if (!resources.has(id) || !lesson.resourceIds.includes(id))
        issues.push(`${chapter.id}: source ${id} is missing from the lesson or source catalog.`);
    }
  }
  if (page.courseParts) {
    for (const part of page.courseParts) {
      for (const partChapter of part.chapters) {
        for (const block of partChapter.blocks) {
          if (block.type !== "practice") continue;
          if (block.experienceId && !options.experienceIds.includes(block.experienceId))
            issues.push(`${partChapter.id}: experience ${block.experienceId} is not registered.`);
          for (const exId of block.exerciseIds ?? []) {
            if (!exercises.has(exId)) issues.push(`${partChapter.id}: unknown exercise ${exId}.`);
          }
        }
      }
    }
  }
  for (const id of exercises.keys())
    if (!used.has(id)) issues.push(`${id}: exercise not placed in the page.`);
  if (!lesson.assessments?.length)
    issues.push("The complete course needs a cumulative assessment.");
  const assessed = new Set(lesson.assessments?.flatMap((assessment) => assessment.exerciseIds));
  for (const id of exercises.keys())
    if (!assessed.has(id)) issues.push(`${id}: exercise missing from the cumulative assessment.`);
  if (options.expectedMicroLessonIds) {
    const actual = page.chapters.flatMap((chapter) => chapter.microLessonIds);
    if (
      actual.length !== options.expectedMicroLessonIds.length ||
      options.expectedMicroLessonIds.some((id) => !actual.includes(id))
    )
      issues.push("The page does not cover exactly the micro-lessons assigned to this unit.");
  }
  return issues;
}
