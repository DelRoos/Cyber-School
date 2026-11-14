import { z } from "zod";

export const StableIdSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Identifier must be kebab-case");

export const DepthLevelSchema = z.enum(["foundational", "intermediate", "advanced", "expert"]);

export const ResourceTrustLevelSchema = z.enum([
  "primary-standard",
  "official-docs",
  "peer-reviewed",
  "community-verified",
]);

export const ResourceMetadataSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    publisher: z.string().min(2),
    url: z
      .string()
      .url()
      .refine((val) => val.startsWith("https://"), {
        message: "External resource URLs must use HTTPS",
      }),
    publishedYear: z.number().int().min(1960).max(2100).optional(),
    verifiedAt: z.string().min(4).optional(),
    sectionRef: z.string().min(1).optional(),
    trustLevel: ResourceTrustLevelSchema,
    untrustedContentNotice: z.literal(true),
    summary: z.string().min(10),
  })
  .strict();

export const ResourcesCatalogSchema = z
  .object({
    version: z.literal("1.0"),
    resources: z.array(ResourceMetadataSchema).min(1),
  })
  .strict();

export const ConceptRelationSchema = z
  .object({
    targetConceptId: StableIdSchema,
    type: z.enum(["builds_on", "contrasts_with", "applied_in", "part_of"]),
    note: z.string().min(3).optional(),
  })
  .strict();

export const AtomicConceptSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    definition: z.string().min(20),
    prerequisites: z.array(StableIdSchema),
    learningObjectives: z.array(z.string().min(10)).min(1),
    relations: z.array(ConceptRelationSchema),
    resourceIds: z.array(StableIdSchema).min(1),
    depthLevel: DepthLevelSchema,
    validationCriteria: z.array(z.string().min(10)).min(1),
  })
  .strict();

export const ChapterSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    summary: z.string().min(10),
    conceptIds: z.array(StableIdSchema).min(1),
  })
  .strict();

export const ModuleSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    summary: z.string().min(10),
    chapters: z.array(ChapterSchema).min(1),
  })
  .strict();

export const DomainSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    summary: z.string().min(10),
    modules: z.array(ModuleSchema).min(1),
  })
  .strict();

export const CurriculumCatalogSchema = z
  .object({
    version: z.literal("1.0"),
    domains: z.array(DomainSchema).min(1),
    concepts: z.array(AtomicConceptSchema).min(1),
  })
  .strict();

export const ExternalLabLinkSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    provider: z.string().min(2),
    url: z
      .string()
      .url()
      .refine((val) => val.startsWith("https://"), {
        message: "External lab URLs must use HTTPS",
      }),
    description: z.string().min(10),
    localSteps: z.array(z.string().min(5)).optional(),
    estimatedMinutes: z.number().int().positive(),
  })
  .strict();

export const ExerciseOptionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    feedback: z.string().min(10),
  })
  .strict();

const BaseExerciseShape = {
  id: StableIdSchema,
  conceptId: StableIdSchema,
  prompt: z.string().min(10),
  hint: z.string().min(5).optional(),
  explanation: z.string().min(15),
};

function validateChoiceOptions(
  data: { options: Array<{ id: string }>; correctOptionId: string },
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const option of data.options) {
    if (seen.has(option.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate option id "${option.id}"`,
        path: ["options"],
      });
    }
    seen.add(option.id);
  }
  if (!seen.has(data.correctOptionId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `correctOptionId "${data.correctOptionId}" does not match any option id`,
      path: ["correctOptionId"],
    });
  }
}

export const MultipleChoiceExerciseSchema = z
  .object({
    ...BaseExerciseShape,
    kind: z.literal("multiple-choice"),
    options: z.array(ExerciseOptionSchema).min(2),
    correctOptionId: z.string().min(1),
  })
  .strict()
  .superRefine(validateChoiceOptions);

export const StatePredictionExerciseSchema = z
  .object({
    ...BaseExerciseShape,
    kind: z.literal("state-prediction"),
    scenario: z.string().min(10),
    options: z.array(ExerciseOptionSchema).min(2),
    correctOptionId: z.string().min(1),
  })
  .strict()
  .superRefine(validateChoiceOptions);

export const SequenceOrderExerciseSchema = z
  .object({
    ...BaseExerciseShape,
    kind: z.literal("sequence-order"),
    items: z
      .array(
        z
          .object({
            id: z.string().min(1),
            label: z.string().min(1),
          })
          .strict(),
      )
      .min(2),
    expectedOrder: z.array(z.string().min(1)).min(2),
  })
  .strict()
  .superRefine((data, ctx) => {
    const itemIds = data.items.map((item) => item.id);
    const uniqueItemIds = new Set(itemIds);
    if (uniqueItemIds.size !== itemIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Sequence items contain duplicate ids",
        path: ["items"],
      });
    }

    const expectedSet = new Set(data.expectedOrder);
    const sameLength = data.expectedOrder.length === itemIds.length;
    const sameSize = expectedSet.size === uniqueItemIds.size;
    const allMatch =
      sameLength && sameSize && data.expectedOrder.every((id) => uniqueItemIds.has(id));

    if (!allMatch) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "expectedOrder must be an exact permutation of items ids",
        path: ["expectedOrder"],
      });
    }
  });

export const DiagramProbeZoneSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    region: z.string().min(1),
    detail: z.string().min(1).optional(),
    feedback: z.string().min(10),
  })
  .strict();

export const DiagramProbeExerciseSchema = z
  .object({
    ...BaseExerciseShape,
    kind: z.literal("diagram-probe"),
    diagramTitle: z.string().min(3),
    diagramCaption: z.string().min(10),
    allowMultiple: z.boolean().optional(),
    zones: z.array(DiagramProbeZoneSchema).min(2),
    correctZoneIds: z.array(z.string().min(1)).min(1),
  })
  .strict()
  .superRefine((data, ctx) => {
    const zoneIds = new Set<string>();
    for (const zone of data.zones) {
      if (zoneIds.has(zone.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate diagram probe zone id "${zone.id}"`,
          path: ["zones"],
        });
      }
      zoneIds.add(zone.id);
    }
    const seenCorrect = new Set<string>();
    for (const targetId of data.correctZoneIds) {
      if (!zoneIds.has(targetId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `correctZoneIds entry "${targetId}" does not match any zone id`,
          path: ["correctZoneIds"],
        });
      }
      if (seenCorrect.has(targetId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate correctZoneIds entry "${targetId}"`,
          path: ["correctZoneIds"],
        });
      }
      seenCorrect.add(targetId);
    }
    if (!data.allowMultiple && data.correctZoneIds.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Single-select diagram-probe exercises must have exactly 1 correctZoneId",
        path: ["correctZoneIds"],
      });
    }
  });

export const ExerciseDefinitionSchema = z.discriminatedUnion("kind", [
  MultipleChoiceExerciseSchema,
  SequenceOrderExerciseSchema,
  StatePredictionExerciseSchema,
  DiagramProbeExerciseSchema,
]);

export const AssessmentBlueprintSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    conceptIds: z.array(StableIdSchema).min(1),
    passingScorePercent: z.number().int().min(50).max(100),
    exerciseIds: z.array(StableIdSchema).min(1),
  })
  .strict();

export const LessonStepSchema = z
  .object({
    id: StableIdSchema,
    title: z.string().min(3),
    summary: z.string().min(10),
    visualFocus: z.string().min(3),
  })
  .strict();

export const LessonReviewSchema = z
  .object({
    status: z.enum(["pending", "approved"]),
    scientificReviewer: z.string().min(2).optional(),
    qaEvidenceRef: z
      .string()
      .regex(/^continuity\/validation\/.+\.json$/)
      .optional(),
    approvedBy: z.string().min(2).optional(),
    reviewedAt: z.iso.date().optional(),
  })
  .strict();

export const LessonManifestSchema = z
  .object({
    version: z.literal("1.0"),
    contentRevision: z
      .string()
      .regex(/^\d+\.\d+\.\d+$/, "Explicit content revision required (major.minor.patch)"),
    id: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(3),
    conceptId: StableIdSchema,
    estimatedMinutes: z.number().int().positive(),
    medium: z.enum(["2d-animated", "2d-graph", "3d-scene", "hybrid"]),
    mediumJustification: z.string().min(15),
    status: z.enum(["draft", "in-review", "published"]),
    review: LessonReviewSchema.optional(),
    steps: z.array(LessonStepSchema).min(1),
    exercises: z.array(ExerciseDefinitionSchema).min(1),
    assessments: z.array(AssessmentBlueprintSchema).optional(),
    externalLabs: z.array(ExternalLabLinkSchema),
    resourceIds: z.array(StableIdSchema).min(1),
  })
  .strict()
  .superRefine((lesson, ctx) => {
    if (
      lesson.status === "published" &&
      (lesson.review?.status !== "approved" ||
        !lesson.review.scientificReviewer ||
        !lesson.review.approvedBy ||
        !lesson.review.reviewedAt ||
        !lesson.review.qaEvidenceRef)
    )
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["review"],
        message:
          "Publication requires scientific review, human approval and a generated QA evidence reference.",
      });
  });

export type DepthLevel = z.infer<typeof DepthLevelSchema>;
export type ResourceMetadata = z.infer<typeof ResourceMetadataSchema>;
export type ResourcesCatalog = z.infer<typeof ResourcesCatalogSchema>;
export type AtomicConcept = z.infer<typeof AtomicConceptSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Domain = z.infer<typeof DomainSchema>;
export type CurriculumCatalog = z.infer<typeof CurriculumCatalogSchema>;
export type ExternalLabLink = z.infer<typeof ExternalLabLinkSchema>;
export type DiagramProbeZone = z.infer<typeof DiagramProbeZoneSchema>;
export type DiagramProbeExercise = z.infer<typeof DiagramProbeExerciseSchema>;
export type ExerciseDefinition = z.infer<typeof ExerciseDefinitionSchema>;
export type AssessmentBlueprint = z.infer<typeof AssessmentBlueprintSchema>;
export type LessonStep = z.infer<typeof LessonStepSchema>;
export type LessonReview = z.infer<typeof LessonReviewSchema>;
export type LessonManifest = z.infer<typeof LessonManifestSchema>;
