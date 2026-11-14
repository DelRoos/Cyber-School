import { z } from "zod";
import { StableIdSchema } from "./schemas.js";

export const V4CoverageStateSchema = z.enum([
  "uncovered",
  "planned",
  "partial",
  "covered",
  "verified",
]);
export type V4CoverageState = z.infer<typeof V4CoverageStateSchema>;

export const V4_PRODUCTION_STATES = [
  "a_planifier",
  "sources_a_completer",
  "conception_en_cours",
  "conception_a_valider",
  "pret_a_developper",
  "developpement_en_cours",
  "tests_en_cours",
  "revue_necessaire",
  "valide",
  "publie",
  "a_reviser",
  "bloque",
] as const;

export const V4ProductionStateSchema = z.enum(V4_PRODUCTION_STATES);
export type V4ProductionState = z.infer<typeof V4ProductionStateSchema>;

export const V4_PRODUCTION_STATE_LABELS: Record<V4ProductionState, string> = {
  a_planifier: "À planifier",
  sources_a_completer: "Sources à compléter",
  conception_en_cours: "Conception en cours",
  conception_a_valider: "Conception à valider",
  pret_a_developper: "Prêt à développer",
  developpement_en_cours: "Développement en cours",
  tests_en_cours: "Tests en cours",
  revue_necessaire: "Revue nécessaire",
  valide: "Validé",
  publie: "Publié",
  a_reviser: "À réviser",
  bloque: "Bloqué",
};

export const V4_DELIVERABLE_KINDS = [
  "scientific_sheet",
  "learning_objectives",
  "pedagogical_structure",
  "visual_storyboard",
  "animation_spec",
  "simulation_spec",
  "exercise_bank",
  "web_implementation",
  "technical_tests",
  "pedagogical_validation_report",
  "external_labs",
  "publication_metadata",
] as const;

export const V4DeliverableKindSchema = z.enum(V4_DELIVERABLE_KINDS);
export type V4DeliverableKind = z.infer<typeof V4DeliverableKindSchema>;

export const V4_DELIVERABLE_LABELS: Record<V4DeliverableKind, string> = {
  scientific_sheet: "1. Fiche scientifique et références",
  learning_objectives: "2. Objectifs d'apprentissage",
  pedagogical_structure: "3. Structure pédagogique",
  visual_storyboard: "4. Storyboard visuel",
  animation_spec: "5. Spécification des animations",
  simulation_spec: "6. Spécification des simulations",
  exercise_bank: "7. Banque d'exercices",
  web_implementation: "8. Implémentation Web",
  technical_tests: "9. Tests techniques",
  pedagogical_validation_report: "10. Rapport de validation pédagogique",
  external_labs: "11. Liens vers les laboratoires externes",
  publication_metadata: "12. Informations de publication",
};

export const V4ProposedDependencySchema = z
  .object({
    targetId: z.string().min(2),
    targetKind: z.enum(["module", "micro-lesson", "exam", "unit"]),
    rationale: z.string().min(5),
    status: z.enum(["proposed", "validated", "rejected"]),
  })
  .strict();
export type V4ProposedDependency = z.infer<typeof V4ProposedDependencySchema>;

export const V4ResourceLinkSchema = z
  .object({
    label: z.string().min(1),
    url: z.string().url(),
    category: z.enum(["reference", "external-lab"]),
  })
  .strict();
export type V4ResourceLink = z.infer<typeof V4ResourceLinkSchema>;

export const V4SourceProvenanceSchema = z
  .object({
    file: z.string().min(1),
    lineStart: z.number().int().positive(),
    lineEnd: z.number().int().positive(),
    sectionHeading: z.string().min(1),
  })
  .strict();

export const V4MicroLessonSchema = z
  .object({
    id: z.string().regex(/^[A-Z]+\d+\.\d{3}$/),
    domainId: StableIdSchema,
    domainTitle: z.string().min(2),
    moduleId: z.string().regex(/^[A-Z]+-\d+$/),
    moduleTitle: z.string().min(2),
    subsectionTitle: z.string().optional(),
    title: z.string().min(3),
    position: z
      .object({
        moduleOrder: z.number().int().positive(),
        microOrder: z.number().int().positive(),
        globalOrder: z.number().int().positive(),
      })
      .strict(),
    sourceProvenance: V4SourceProvenanceSchema,
    learningObjectives: z.array(z.string().min(3)).min(1),
    explicitPrerequisites: z.array(z.string().min(2)),
    proposedDependencies: z.array(V4ProposedDependencySchema),
    linkedCompetencyIds: z.array(z.string().min(3)),
    associatedResources: z.array(V4ResourceLinkSchema),
    coverageState: V4CoverageStateSchema,
    productionState: V4ProductionStateSchema,
    unitId: StableIdSchema.optional(),
    mappedLessonSlugs: z.array(StableIdSchema),
  })
  .strict();
export type V4MicroLesson = z.infer<typeof V4MicroLessonSchema>;

export const V4ModuleCompetencySchema = z
  .object({
    id: z.string().min(4),
    title: z.string().min(3),
    line: z.number().int().positive(),
  })
  .strict();

export const V4ModuleSummarySchema = z
  .object({
    id: z.string().regex(/^[A-Z]+-\d+$/),
    title: z.string().min(3),
    domainId: StableIdSchema,
    domainTitle: z.string().min(2),
    moduleOrder: z.number().int().positive(),
    microLessonIds: z.array(z.string().min(4)).min(1),
    competencies: z.array(V4ModuleCompetencySchema),
    explicitPrerequisites: z.array(z.string().min(2)),
    proposedDependencies: z.array(V4ProposedDependencySchema),
    resources: z.array(V4ResourceLinkSchema),
    books: z.array(z.string()),
    visualizationsHint: z.string().optional(),
    exercisesHint: z.string().optional(),
    validationHint: z.string().optional(),
    hasPart2Spec: z.boolean(),
    provenancePart1Line: z.number().int().positive(),
    provenancePart2Line: z.number().int().positive().optional(),
  })
  .strict();
export type V4ModuleSummary = z.infer<typeof V4ModuleSummarySchema>;

export const V4ExamSchema = z
  .object({
    id: z.string().regex(/^EX-\d{2}$/),
    title: z.string().min(3),
    explicitPrerequisites: z.array(z.string().min(2)),
    criteria: z.array(z.string().min(4)).min(1),
    externalLabs: z.array(V4ResourceLinkSchema),
    line: z.number().int().positive(),
  })
  .strict();
export type V4Exam = z.infer<typeof V4ExamSchema>;

export const V4ImportedCurriculumSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    sourceFile: z.string().min(1),
    sourceSha256: z.string().length(64),
    stats: z
      .object({
        moduleCount: z.number().int().positive(),
        microLessonCount: z.number().int().positive(),
        competencyCount: z.number().int().nonnegative(),
        examCount: z.number().int().nonnegative(),
      })
      .strict(),
    modules: z.array(V4ModuleSummarySchema).min(1),
    microLessons: z.array(V4MicroLessonSchema).min(1),
    exams: z.array(V4ExamSchema),
  })
  .strict();
export type V4ImportedCurriculum = z.infer<typeof V4ImportedCurriculumSchema>;

export const V4PedagogicalUnitSchema = z
  .object({
    id: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(3),
    moduleId: z.string().regex(/^[A-Z]+-\d+$/),
    domainId: StableIdSchema,
    rationale: z.string().min(10),
    microLessonIds: z.array(z.string().min(4)).min(1),
    prerequisiteUnitIds: z.array(StableIdSchema),
    recommendedMedium: z.enum(["2d-animated", "2d-graph", "3d-scene", "hybrid"]),
    estimatedMinutes: z.number().int().positive(),
    legacyBridgeLessonSlug: StableIdSchema.optional(),
    groupingStatus: z.enum(["auto-grouped", "curated"]),
  })
  .strict();
export type V4PedagogicalUnit = z.infer<typeof V4PedagogicalUnitSchema>;

export const V4UnitsCatalogSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    units: z.array(V4PedagogicalUnitSchema).min(1),
  })
  .strict();
export type V4UnitsCatalog = z.infer<typeof V4UnitsCatalogSchema>;

export const V4DeliverableEntrySchema = z
  .object({
    status: z.enum(["missing", "draft", "ready", "verified"]),
    artifactPath: z.string().optional(),
    notes: z.string().optional(),
  })
  .strict();

export const V4UnitDeliverablesRecordSchema = z
  .object({
    scientific_sheet: V4DeliverableEntrySchema,
    learning_objectives: V4DeliverableEntrySchema,
    pedagogical_structure: V4DeliverableEntrySchema,
    visual_storyboard: V4DeliverableEntrySchema,
    animation_spec: V4DeliverableEntrySchema,
    simulation_spec: V4DeliverableEntrySchema,
    exercise_bank: V4DeliverableEntrySchema,
    web_implementation: V4DeliverableEntrySchema,
    technical_tests: V4DeliverableEntrySchema,
    pedagogical_validation_report: V4DeliverableEntrySchema,
    external_labs: V4DeliverableEntrySchema,
    publication_metadata: V4DeliverableEntrySchema,
  })
  .strict();
export type V4UnitDeliverablesRecord = z.infer<typeof V4UnitDeliverablesRecordSchema>;

export const V4ProductionRecordSchema = z
  .object({
    unitId: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(3),
    moduleId: z.string().regex(/^[A-Z]+-\d+$/),
    state: V4ProductionStateSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    taskIds: z.array(z.string().min(3)),
    lessonSlug: StableIdSchema.optional(),
    deliverables: V4UnitDeliverablesRecordSchema,
    validationEvidenceRefs: z.array(z.string().min(5)),
    blockerReasons: z.array(z.string().min(3)),
    updatedAt: z.string().min(10),
    notes: z.string().optional(),
  })
  .strict();
export type V4ProductionRecord = z.infer<typeof V4ProductionRecordSchema>;

export const V4ProductionRegistrySchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    records: z.array(V4ProductionRecordSchema),
  })
  .strict();
export type V4ProductionRegistry = z.infer<typeof V4ProductionRegistrySchema>;

export const V4MissionBriefSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    missionId: z.string().min(3),
    unitId: StableIdSchema,
    slug: StableIdSchema,
    title: z.string().min(3),
    moduleId: z.string().regex(/^[A-Z]+-\d+$/),
    domainId: StableIdSchema,
    microLessons: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        provenanceLine: z.number().int().positive(),
      }),
    ),
    prerequisiteUnits: z.array(
      z.object({
        unitId: StableIdSchema,
        state: V4ProductionStateSchema,
      }),
    ),
    associatedResources: z.array(V4ResourceLinkSchema),
    requiredSkills: z.array(z.string().min(2)),
    deliverablesChecklist: z.array(
      z.object({
        kind: V4DeliverableKindSchema,
        label: z.string(),
        status: z.enum(["missing", "draft", "ready", "verified"]),
      }),
    ),
    verificationCommands: z.array(z.string().min(3)),
  })
  .strict();
export type V4MissionBrief = z.infer<typeof V4MissionBriefSchema>;

export function createEmptyDeliverablesRecord(): V4UnitDeliverablesRecord {
  const mk = () => ({ status: "missing" as const });
  return {
    scientific_sheet: mk(),
    learning_objectives: mk(),
    pedagogical_structure: mk(),
    visual_storyboard: mk(),
    animation_spec: mk(),
    simulation_spec: mk(),
    exercise_bank: mk(),
    web_implementation: mk(),
    technical_tests: mk(),
    pedagogical_validation_report: mk(),
    external_labs: mk(),
    publication_metadata: mk(),
  };
}

export interface UnitCoverageReport {
  valid: boolean;
  totalMicroLessons: number;
  assignedMicroLessons: number;
  missingMicroLessonIds: string[];
  duplicateAssignments: Array<{ microLessonId: string; unitIds: string[] }>;
  unknownMicroLessonIds: string[];
  missingPrerequisiteUnitIds: Array<{ unitId: string; missingPrereqId: string }>;
  cycleDetected: boolean;
}

export function verifyUnitCoverage(
  imported: V4ImportedCurriculum,
  unitsCatalog: V4UnitsCatalog,
): UnitCoverageReport {
  const validMicroIds = new Set(imported.microLessons.map((m) => m.id));
  const unitMap = new Map(unitsCatalog.units.map((u) => [u.id, u]));
  const seenAssignments = new Map<string, string[]>();
  const unknownMicroLessonIds: string[] = [];

  for (const unit of unitsCatalog.units) {
    for (const microId of unit.microLessonIds) {
      if (!validMicroIds.has(microId)) {
        unknownMicroLessonIds.push(microId);
      }
      const list = seenAssignments.get(microId) ?? [];
      list.push(unit.id);
      seenAssignments.set(microId, list);
    }
  }

  const missingMicroLessonIds = imported.microLessons
    .map((m) => m.id)
    .filter((id) => !seenAssignments.has(id));

  const duplicateAssignments = [...seenAssignments.entries()]
    .filter(([, uIds]) => uIds.length > 1)
    .map(([microLessonId, unitIds]) => ({ microLessonId, unitIds }));

  const missingPrerequisiteUnitIds: Array<{ unitId: string; missingPrereqId: string }> = [];
  for (const unit of unitsCatalog.units) {
    for (const preId of unit.prerequisiteUnitIds) {
      if (!unitMap.has(preId)) {
        missingPrerequisiteUnitIds.push({ unitId: unit.id, missingPrereqId: preId });
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  let cycleDetected = false;
  function dfs(id: string) {
    if (visited.has(id) || cycleDetected) return;
    if (visiting.has(id)) {
      cycleDetected = true;
      return;
    }
    visiting.add(id);
    const u = unitMap.get(id);
    if (u) {
      for (const pre of u.prerequisiteUnitIds) {
        if (unitMap.has(pre)) dfs(pre);
      }
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const u of unitsCatalog.units) dfs(u.id);

  return {
    valid:
      missingMicroLessonIds.length === 0 &&
      duplicateAssignments.length === 0 &&
      unknownMicroLessonIds.length === 0 &&
      missingPrerequisiteUnitIds.length === 0 &&
      !cycleDetected,
    totalMicroLessons: imported.microLessons.length,
    assignedMicroLessons: seenAssignments.size,
    missingMicroLessonIds,
    duplicateAssignments,
    unknownMicroLessonIds,
    missingPrerequisiteUnitIds,
    cycleDetected,
  };
}

export function assertCanPublishRecord(
  record: V4ProductionRecord,
  lessonStatus: "draft" | "in-review" | "published" | undefined,
  reviewApproved: boolean,
): string[] {
  const blockers: string[] = [];
  if (lessonStatus !== "published" || !reviewApproved) {
    blockers.push(
      "La publication exige un manifeste lesson.json 'published' approuvé humainement.",
    );
  }
  if (record.validationEvidenceRefs.length === 0) {
    blockers.push("Aucune preuve d'exécution (validationEvidenceRefs) enregistrée.");
  }
  for (const kind of V4_DELIVERABLE_KINDS) {
    if (record.deliverables[kind].status !== "verified") {
      blockers.push(`Livrable requis non vérifié : ${V4_DELIVERABLE_LABELS[kind]}.`);
    }
  }
  return blockers;
}
