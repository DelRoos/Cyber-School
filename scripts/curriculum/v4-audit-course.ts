import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CurriculumCatalog,
  LessonManifest,
  ResourcesCatalog,
  V4DeliverableKind,
  V4ProductionRecord,
} from "@cyber-school/lesson-runtime";
import {
  assertCanPublishRecord,
  CurriculumCatalogSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  V4_DELIVERABLE_KINDS,
  V4ProductionRegistrySchema,
} from "@cyber-school/lesson-runtime";
import { loadV4PlanningState } from "./v4-plan.ts";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export interface CourseAuditReport {
  unitId: string;
  slug: string;
  passedTechnicalChecks: boolean;
  readyForHumanReview: boolean;
  canPublish: boolean;
  microLessonsExpected: number;
  exerciseCount: number;
  exerciseKinds: string[];
  hasAssessment: boolean;
  resourceCitationsCount: number;
  verifiedOrReadyDeliverables: V4DeliverableKind[];
  missingDeliverables: V4DeliverableKind[];
  findings: string[];
  publicationBlockers: string[];
}

function loadAllCurriculumCatalogs(rootDir: string): CurriculumCatalog[] {
  const dir = path.join(rootDir, "curriculum");
  const catalogs: CurriculumCatalog[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const raw = JSON.parse(readFileSync(path.join(dir, entry.name), "utf8")) as unknown;
    catalogs.push(CurriculumCatalogSchema.parse(raw));
  }
  return catalogs;
}

export function auditCourseUnit(unitId: string, rootDir = ROOT_DIR): CourseAuditReport {
  const { units, registry } = loadV4PlanningState(rootDir);
  const unit = units.units.find((u) => u.id === unitId);
  if (!unit) {
    throw new Error(`Unité introuvable : ${unitId}`);
  }
  const record: V4ProductionRecord | undefined = registry.records.find((r) => r.unitId === unitId);
  if (!record) {
    throw new Error(`Enregistrement de production introuvable pour ${unitId}`);
  }

  const findings: string[] = [];
  const lessonSlug = record.lessonSlug ?? unit.legacyBridgeLessonSlug ?? unit.slug;
  const lessonManifestPath = path.join(rootDir, "lessons", lessonSlug, "lesson.json");
  let lesson: LessonManifest | undefined;

  if (!existsSync(lessonManifestPath)) {
    findings.push(`Manifeste lesson.json absent : lessons/${lessonSlug}/lesson.json`);
  } else {
    const parsed = LessonManifestSchema.safeParse(
      JSON.parse(readFileSync(lessonManifestPath, "utf8")),
    );
    if (!parsed.success) {
      findings.push(
        `Manifeste lesson.json invalide : ${parsed.error.issues.map((i) => i.message).join("; ")}`,
      );
    } else {
      lesson = parsed.data;
    }
  }

  const resourcesCatalog: ResourcesCatalog = ResourcesCatalogSchema.parse(
    JSON.parse(readFileSync(path.join(rootDir, "resources/sources.json"), "utf8")),
  );
  const resourceMap = new Map(resourcesCatalog.resources.map((r) => [r.id, r]));

  const catalogs = loadAllCurriculumCatalogs(rootDir);
  const allConcepts = new Map(catalogs.flatMap((c) => c.concepts.map((cpt) => [cpt.id, cpt])));

  const exerciseKinds = lesson ? [...new Set(lesson.exercises.map((e) => e.kind))] : [];
  const hasAssessment = Boolean(lesson?.assessments && lesson.assessments.length > 0);

  if (lesson) {
    if (lesson.exercises.length < 3) {
      findings.push(
        `Nombre d'exercices insuffisant (${lesson.exercises.length} < 3 recommandés pour couvrir prédiction, causalité et contre-exemple).`,
      );
    }
    if (exerciseKinds.length < 2) {
      findings.push(
        `Diversité d'exercices insuffisante (${exerciseKinds.join(", ") || "aucun"}) : au moins 2 modes requis par le contrat V4.`,
      );
    }
    if (!hasAssessment) {
      findings.push("Aucune évaluation sommative (assessments) définie dans lesson.json.");
    }
    if (lesson.resourceIds.length === 0) {
      findings.push("Aucune ressource scientifique référencée dans lesson.json.");
    } else {
      for (const rId of lesson.resourceIds) {
        if (!resourceMap.has(rId)) {
          findings.push(`Ressource référencée absente de resources/sources.json : ${rId}`);
        }
      }
    }
    if (!allConcepts.has(lesson.conceptId)) {
      findings.push(`Concept principal ${lesson.conceptId} introuvable dans curriculum/*.json.`);
    }
  }

  const verifiedOrReadyDeliverables: V4DeliverableKind[] = [];
  const missingDeliverables: V4DeliverableKind[] = [];
  for (const kind of V4_DELIVERABLE_KINDS) {
    const entry = record.deliverables[kind];
    if (entry.status === "verified" || entry.status === "ready") {
      if (entry.artifactPath && !existsSync(path.join(rootDir, entry.artifactPath))) {
        findings.push(
          `Livrable ${kind} pointe vers un fichier introuvable : ${entry.artifactPath}`,
        );
        missingDeliverables.push(kind);
      } else {
        verifiedOrReadyDeliverables.push(kind);
      }
    } else {
      missingDeliverables.push(kind);
    }
  }

  const reviewApproved = lesson?.review?.status === "approved";
  const publicationBlockers = assertCanPublishRecord(record, lesson?.status, reviewApproved);

  const report: CourseAuditReport = {
    unitId: unit.id,
    slug: lessonSlug,
    passedTechnicalChecks: Boolean(lesson) && findings.length === 0,
    readyForHumanReview:
      Boolean(lesson) && findings.length === 0 && missingDeliverables.length <= 1,
    canPublish: publicationBlockers.length === 0,
    microLessonsExpected: unit.microLessonIds.length,
    exerciseCount: lesson?.exercises.length ?? 0,
    exerciseKinds,
    hasAssessment,
    resourceCitationsCount: lesson?.resourceIds.length ?? 0,
    verifiedOrReadyDeliverables,
    missingDeliverables,
    findings,
    publicationBlockers,
  };

  const reportsDir = path.join(rootDir, "production/reports");
  mkdirSync(reportsDir, { recursive: true });
  writeFileSync(
    path.join(reportsDir, `${unit.id}-qa.json`),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );

  // Re-validate registry parse cleanly
  V4ProductionRegistrySchema.parse(registry);
  return report;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const args = process.argv.slice(2);
  const unitIdx = args.indexOf("--unit");
  const unitId = unitIdx !== -1 ? args[unitIdx + 1] : undefined;
  if (!unitId) {
    console.error("Usage : pnpm v4:audit -- --unit <unitId>");
    process.exit(1);
  }
  const report = auditCourseUnit(unitId);
  console.log(
    `[V4_AUDIT] unit=${report.unitId} technical=${report.passedTechnicalChecks} readyForReview=${report.readyForHumanReview} canPublish=${report.canPublish} deliverablesReady=${report.verifiedOrReadyDeliverables.length}/12 findings=${report.findings.length}`,
  );
  if (report.findings.length > 0) {
    for (const f of report.findings) console.log(`  - ${f}`);
  }
}
