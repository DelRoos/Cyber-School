import type { CurriculumCatalog, LessonManifest, ResourcesCatalog } from "./schemas.js";

export interface IntegrityIssue {
  code:
    | "DUPLICATE_CONCEPT_ID"
    | "DUPLICATE_RESOURCE_ID"
    | "DUPLICATE_DOMAIN_ID"
    | "DUPLICATE_MODULE_ID"
    | "DUPLICATE_CHAPTER_ID"
    | "DUPLICATE_LESSON_ID"
    | "DUPLICATE_LESSON_SLUG"
    | "DUPLICATE_STEP_ID"
    | "DUPLICATE_EXERCISE_ID"
    | "DUPLICATE_ASSESSMENT_ID"
    | "MISSING_PREREQUISITE"
    | "MISSING_RELATION_TARGET"
    | "MISSING_RESOURCE"
    | "MISSING_CHAPTER_CONCEPT"
    | "MISSING_LESSON_CONCEPT"
    | "MISSING_EXERCISE_CONCEPT"
    | "MISSING_ASSESSMENT_CONCEPT"
    | "MISSING_ASSESSMENT_EXERCISE"
    | "INVALID_EXERCISE_OPTION"
    | "INVALID_SEQUENCE_PERMUTATION"
    | "PREREQUISITE_CYCLE";
  message: string;
  context?: Record<string, unknown>;
}

export interface IntegrityReport {
  valid: boolean;
  issues: IntegrityIssue[];
}

export function validateCurriculumIntegrity(
  curriculum: CurriculumCatalog,
  resources: ResourcesCatalog,
  lessons: LessonManifest[],
): IntegrityReport {
  const issues: IntegrityIssue[] = [];

  const resourceIds = new Set<string>();
  for (const res of resources.resources) {
    if (resourceIds.has(res.id)) {
      issues.push({
        code: "DUPLICATE_RESOURCE_ID",
        message: `Duplicate resource id "${res.id}"`,
      });
    }
    resourceIds.add(res.id);
  }

  const conceptMap = new Map<string, (typeof curriculum.concepts)[number]>();
  for (const concept of curriculum.concepts) {
    if (conceptMap.has(concept.id)) {
      issues.push({
        code: "DUPLICATE_CONCEPT_ID",
        message: `Duplicate concept id "${concept.id}"`,
      });
    }
    conceptMap.set(concept.id, concept);
  }

  for (const concept of curriculum.concepts) {
    for (const prereq of concept.prerequisites) {
      if (!conceptMap.has(prereq)) {
        issues.push({
          code: "MISSING_PREREQUISITE",
          message: `Concept "${concept.id}" references missing prerequisite "${prereq}"`,
          context: { conceptId: concept.id, prerequisiteId: prereq },
        });
      }
    }

    for (const rel of concept.relations) {
      if (!conceptMap.has(rel.targetConceptId)) {
        issues.push({
          code: "MISSING_RELATION_TARGET",
          message: `Concept "${concept.id}" references missing relation target "${rel.targetConceptId}"`,
          context: { conceptId: concept.id, targetConceptId: rel.targetConceptId },
        });
      }
    }

    for (const resId of concept.resourceIds) {
      if (!resourceIds.has(resId)) {
        issues.push({
          code: "MISSING_RESOURCE",
          message: `Concept "${concept.id}" references missing resource "${resId}"`,
          context: { conceptId: concept.id, resourceId: resId },
        });
      }
    }
  }

  const domainIds = new Set<string>();
  const moduleIds = new Set<string>();
  const chapterIds = new Set<string>();

  for (const domain of curriculum.domains) {
    if (domainIds.has(domain.id)) {
      issues.push({
        code: "DUPLICATE_DOMAIN_ID",
        message: `Duplicate domain id "${domain.id}"`,
      });
    }
    domainIds.add(domain.id);

    for (const mod of domain.modules) {
      if (moduleIds.has(mod.id)) {
        issues.push({
          code: "DUPLICATE_MODULE_ID",
          message: `Duplicate module id "${mod.id}"`,
        });
      }
      moduleIds.add(mod.id);

      for (const chapter of mod.chapters) {
        if (chapterIds.has(chapter.id)) {
          issues.push({
            code: "DUPLICATE_CHAPTER_ID",
            message: `Duplicate chapter id "${chapter.id}"`,
          });
        }
        chapterIds.add(chapter.id);

        for (const conceptId of chapter.conceptIds) {
          if (!conceptMap.has(conceptId)) {
            issues.push({
              code: "MISSING_CHAPTER_CONCEPT",
              message: `Chapter "${chapter.id}" references unknown concept "${conceptId}"`,
              context: { chapterId: chapter.id, conceptId },
            });
          }
        }
      }
    }
  }

  const lessonIds = new Set<string>();
  const lessonSlugs = new Set<string>();
  const globalExerciseIds = new Set<string>();
  const globalAssessmentIds = new Set<string>();

  for (const lesson of lessons) {
    if (lessonIds.has(lesson.id)) {
      issues.push({
        code: "DUPLICATE_LESSON_ID",
        message: `Duplicate lesson id "${lesson.id}"`,
      });
    }
    lessonIds.add(lesson.id);

    if (lessonSlugs.has(lesson.slug)) {
      issues.push({
        code: "DUPLICATE_LESSON_SLUG",
        message: `Duplicate lesson slug "${lesson.slug}"`,
      });
    }
    lessonSlugs.add(lesson.slug);

    if (!conceptMap.has(lesson.conceptId)) {
      issues.push({
        code: "MISSING_LESSON_CONCEPT",
        message: `Lesson "${lesson.id}" references unknown concept "${lesson.conceptId}"`,
        context: { lessonId: lesson.id, conceptId: lesson.conceptId },
      });
    }

    for (const resId of lesson.resourceIds) {
      if (!resourceIds.has(resId)) {
        issues.push({
          code: "MISSING_RESOURCE",
          message: `Lesson "${lesson.id}" references missing resource "${resId}"`,
          context: { lessonId: lesson.id, resourceId: resId },
        });
      }
    }

    const stepIds = new Set<string>();
    for (const step of lesson.steps) {
      if (stepIds.has(step.id)) {
        issues.push({
          code: "DUPLICATE_STEP_ID",
          message: `Duplicate step id "${step.id}" in lesson "${lesson.id}"`,
          context: { lessonId: lesson.id, stepId: step.id },
        });
      }
      stepIds.add(step.id);
    }

    const lessonExerciseIds = new Set<string>();
    for (const exercise of lesson.exercises) {
      if (globalExerciseIds.has(exercise.id)) {
        issues.push({
          code: "DUPLICATE_EXERCISE_ID",
          message: `Duplicate exercise id "${exercise.id}"`,
          context: { lessonId: lesson.id, exerciseId: exercise.id },
        });
      }
      globalExerciseIds.add(exercise.id);
      lessonExerciseIds.add(exercise.id);

      if (!conceptMap.has(exercise.conceptId)) {
        issues.push({
          code: "MISSING_EXERCISE_CONCEPT",
          message: `Exercise "${exercise.id}" in lesson "${lesson.id}" references unknown concept "${exercise.conceptId}"`,
          context: {
            lessonId: lesson.id,
            exerciseId: exercise.id,
            conceptId: exercise.conceptId,
          },
        });
      }

      if (exercise.kind === "multiple-choice" || exercise.kind === "state-prediction") {
        const optionIds = new Set(exercise.options.map((o) => o.id));
        if (!optionIds.has(exercise.correctOptionId)) {
          issues.push({
            code: "INVALID_EXERCISE_OPTION",
            message: `Exercise "${exercise.id}" correctOptionId "${exercise.correctOptionId}" not found in options`,
            context: {
              lessonId: lesson.id,
              exerciseId: exercise.id,
              correctOptionId: exercise.correctOptionId,
            },
          });
        }
      } else if (exercise.kind === "sequence-order") {
        const itemIds = exercise.items.map((item) => item.id);
        const uniqueItems = new Set(itemIds);
        const expectedSet = new Set(exercise.expectedOrder);
        const validPermutation =
          uniqueItems.size === itemIds.length &&
          exercise.expectedOrder.length === itemIds.length &&
          expectedSet.size === uniqueItems.size &&
          exercise.expectedOrder.every((id) => uniqueItems.has(id));
        if (!validPermutation) {
          issues.push({
            code: "INVALID_SEQUENCE_PERMUTATION",
            message: `Sequence exercise "${exercise.id}" expectedOrder is not an exact permutation of items`,
            context: { lessonId: lesson.id, exerciseId: exercise.id },
          });
        }
      } else if (exercise.kind === "diagram-probe") {
        const zoneIds = new Set(exercise.zones.map((z) => z.id));
        const hasValidTargets =
          exercise.correctZoneIds.length >= 1 &&
          exercise.correctZoneIds.every((id) => zoneIds.has(id));
        if (!hasValidTargets) {
          issues.push({
            code: "INVALID_EXERCISE_OPTION",
            message: `Diagram probe exercise "${exercise.id}" contains unknown correctZoneIds`,
            context: { lessonId: lesson.id, exerciseId: exercise.id },
          });
        }
      }
    }

    for (const assessment of lesson.assessments ?? []) {
      if (globalAssessmentIds.has(assessment.id)) {
        issues.push({
          code: "DUPLICATE_ASSESSMENT_ID",
          message: `Duplicate assessment id "${assessment.id}"`,
          context: { lessonId: lesson.id, assessmentId: assessment.id },
        });
      }
      globalAssessmentIds.add(assessment.id);

      for (const conceptId of assessment.conceptIds) {
        if (!conceptMap.has(conceptId)) {
          issues.push({
            code: "MISSING_ASSESSMENT_CONCEPT",
            message: `Assessment "${assessment.id}" references unknown concept "${conceptId}"`,
            context: {
              lessonId: lesson.id,
              assessmentId: assessment.id,
              conceptId,
            },
          });
        }
      }

      for (const exId of assessment.exerciseIds) {
        if (!lessonExerciseIds.has(exId)) {
          issues.push({
            code: "MISSING_ASSESSMENT_EXERCISE",
            message: `Assessment "${assessment.id}" references unknown exercise "${exId}"`,
            context: {
              lessonId: lesson.id,
              assessmentId: assessment.id,
              exerciseId: exId,
            },
          });
        }
      }
    }
  }

  // Detect cycles in prerequisite DAG using 3-color DFS
  const visitState = new Map<string, "unvisited" | "visiting" | "visited">();
  for (const concept of curriculum.concepts) {
    visitState.set(concept.id, "unvisited");
  }

  const stack: string[] = [];

  function dfs(conceptId: string): void {
    visitState.set(conceptId, "visiting");
    stack.push(conceptId);

    const concept = conceptMap.get(conceptId);
    if (concept) {
      for (const prereq of concept.prerequisites) {
        if (!conceptMap.has(prereq)) continue;
        const state = visitState.get(prereq);
        if (state === "visiting") {
          const cycleStart = stack.indexOf(prereq);
          const cyclePath = [...stack.slice(cycleStart), prereq];
          issues.push({
            code: "PREREQUISITE_CYCLE",
            message: `Prerequisite cycle detected: ${cyclePath.join(" -> ")}`,
            context: { cycle: cyclePath },
          });
        } else if (state === "unvisited") {
          dfs(prereq);
        }
      }
    }

    stack.pop();
    visitState.set(conceptId, "visited");
  }

  for (const concept of curriculum.concepts) {
    if (visitState.get(concept.id) === "unvisited") {
      dfs(concept.id);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
