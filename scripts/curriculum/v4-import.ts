import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  V4CoverageState,
  V4ImportedCurriculum,
  V4ProductionRecord,
  V4ProductionRegistry,
  V4ProductionState,
  V4ProposedDependency,
  V4UnitsCatalog,
} from "@cyber-school/lesson-runtime";
import {
  createEmptyDeliverablesRecord,
  LessonManifestSchema,
  V4ImportedCurriculumSchema,
  V4ProductionRegistrySchema,
  V4UnitsCatalogSchema,
  verifyUnitCoverage,
} from "@cyber-school/lesson-runtime";
import { parseV4CurriculumMarkdown, V4_SOURCE_FILENAME } from "./v4-parser.ts";
import { buildUnitsCatalog } from "./v4-units-builder.ts";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

interface LiveLessonInfo {
  slug: string;
  status: "draft" | "in-review" | "published";
  version: string;
}

function readJsonIfExists<T>(filePath: string): T | undefined {
  if (!existsSync(filePath)) return undefined;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function writeStableJson(filePath: string, data: unknown): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function loadLiveLessons(rootDir: string): Map<string, LiveLessonInfo> {
  const lessonsDir = path.join(rootDir, "lessons");
  const result = new Map<string, LiveLessonInfo>();
  if (!existsSync(lessonsDir)) return result;

  for (const entry of readdirSync(lessonsDir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(lessonsDir, entry.name, "lesson.json");
    if (!existsSync(manifestPath)) continue;
    const raw = JSON.parse(readFileSync(manifestPath, "utf8")) as unknown;
    const parsed = LessonManifestSchema.safeParse(raw);
    if (parsed.success) {
      result.set(parsed.data.slug, {
        slug: parsed.data.slug,
        status: parsed.data.status,
        version: parsed.data.contentRevision,
      });
    }
  }
  return result;
}

function stateToCoverage(state: V4ProductionState, isBridgePartial: boolean): V4CoverageState {
  if (state === "valide" || state === "publie") return "verified";
  if (state === "revue_necessaire" || state === "tests_en_cours") {
    return isBridgePartial ? "partial" : "covered";
  }
  if (
    state === "developpement_en_cours" ||
    state === "pret_a_developper" ||
    state === "conception_a_valider" ||
    state === "conception_en_cours" ||
    state === "sources_a_completer"
  ) {
    return "planned";
  }
  return isBridgePartial ? "partial" : "uncovered";
}

function defaultStateFromLesson(lesson: LiveLessonInfo | undefined): V4ProductionState {
  if (!lesson) return "a_planifier";
  if (lesson.status === "in-review") return "revue_necessaire";
  if (lesson.status === "draft") return "developpement_en_cours";
  // Never auto-promote to "publie" solely during import unless explicit registry record exists
  return "valide";
}

export interface RunImportSummary {
  modules: number;
  microLessons: number;
  competencies: number;
  exams: number;
  units: number;
  anomalies: number;
  coverageValid: boolean;
}

export function runV4Import(rootDir = ROOT_DIR): RunImportSummary {
  const sourcePath = path.join(rootDir, V4_SOURCE_FILENAME);
  const importedOutPath = path.join(rootDir, "curriculum/v4/imported-curriculum.json");
  const reportOutPath = path.join(rootDir, "curriculum/v4/import-report.json");
  const unitsOutPath = path.join(rootDir, "production/units.json");
  const registryOutPath = path.join(rootDir, "production/registry.json");

  const markdown = readFileSync(sourcePath, "utf8");

  const prevImportedRaw = readJsonIfExists<unknown>(importedOutPath);
  const prevImportedParsed = prevImportedRaw
    ? V4ImportedCurriculumSchema.safeParse(prevImportedRaw)
    : undefined;
  const preservedDependencies = new Map<string, V4ProposedDependency[]>();
  if (prevImportedParsed?.success) {
    for (const mod of prevImportedParsed.data.modules) {
      if (mod.proposedDependencies.length > 0) {
        preservedDependencies.set(mod.id, mod.proposedDependencies);
      }
    }
  }

  const prevUnitsRaw = readJsonIfExists<unknown>(unitsOutPath);
  const prevUnitsParsed = prevUnitsRaw ? V4UnitsCatalogSchema.safeParse(prevUnitsRaw) : undefined;

  const prevRegistryRaw = readJsonIfExists<unknown>(registryOutPath);
  const prevRegistryParsed = prevRegistryRaw
    ? V4ProductionRegistrySchema.safeParse(prevRegistryRaw)
    : undefined;
  const existingRecordByUnit = new Map<string, V4ProductionRecord>();
  if (prevRegistryParsed?.success) {
    for (const rec of prevRegistryParsed.data.records) {
      existingRecordByUnit.set(rec.unitId, rec);
    }
  }

  const liveLessons = loadLiveLessons(rootDir);

  // First pass: parse modules/microLessons & build/merge pedagogical units
  const firstPass = parseV4CurriculumMarkdown(markdown, { preservedDependencies });
  const unitsCatalog: V4UnitsCatalog = buildUnitsCatalog(
    firstPass.curriculum,
    prevUnitsParsed?.success ? prevUnitsParsed.data : undefined,
  );

  // Build/merge production registry preserving manual state transitions and deliverables
  const records: V4ProductionRecord[] = unitsCatalog.units.map((unit) => {
    const existing = existingRecordByUnit.get(unit.id);
    const linkedSlug = unit.legacyBridgeLessonSlug ?? existing?.lessonSlug;
    const liveLesson = linkedSlug ? liveLessons.get(linkedSlug) : undefined;

    if (existing) {
      const updatedDeliverables = structuredClone(existing.deliverables);
      if (liveLesson && updatedDeliverables.web_implementation.status === "missing") {
        updatedDeliverables.web_implementation = {
          status: "draft",
          artifactPath: `lessons/${liveLesson.slug}/lesson.json`,
        };
      }
      return {
        ...existing,
        slug: unit.slug,
        title: unit.title,
        moduleId: unit.moduleId,
        lessonSlug: linkedSlug,
        deliverables: updatedDeliverables,
      };
    }

    const deliverables = createEmptyDeliverablesRecord();
    if (liveLesson) {
      deliverables.web_implementation = {
        status: liveLesson.status === "draft" ? "draft" : "ready",
        artifactPath: `lessons/${liveLesson.slug}/lesson.json`,
        notes: "Cours existant antérieur à V4 relié comme pont pédagogique.",
      };
    }

    return {
      unitId: unit.id,
      slug: unit.slug,
      title: unit.title,
      moduleId: unit.moduleId,
      state: defaultStateFromLesson(liveLesson),
      version: liveLesson?.version ?? "0.1.0",
      taskIds: [],
      ...(linkedSlug ? { lessonSlug: linkedSlug } : {}),
      deliverables,
      validationEvidenceRefs: [],
      blockerReasons: [],
      updatedAt: "2026-11-14",
      ...(liveLesson
        ? {
            notes: `Pont vers la leçon existante lessons/${liveLesson.slug}/lesson.json (${liveLesson.status}).`,
          }
        : {}),
    };
  });

  const registry: V4ProductionRegistry = V4ProductionRegistrySchema.parse({
    schemaVersion: "1.0",
    records,
  });

  // Second pass: inject computed unitId, coverageState, productionState, mappedLessonSlugs into V4 microLessons
  const recordByUnitId = new Map(registry.records.map((r) => [r.unitId, r]));
  const unitByMicroId = new Map<string, (typeof unitsCatalog.units)[number]>();
  for (const u of unitsCatalog.units) {
    for (const microId of u.microLessonIds) {
      unitByMicroId.set(microId, u);
    }
  }

  const finalPass = parseV4CurriculumMarkdown(markdown, {
    preservedDependencies,
    coverageLookup: (microLessonId) => {
      const unit = unitByMicroId.get(microLessonId);
      if (!unit) {
        return {
          coverageState: "uncovered",
          productionState: "a_planifier",
          mappedLessonSlugs: [],
        };
      }
      const record = recordByUnitId.get(unit.id);
      const productionState = record?.state ?? "a_planifier";
      const mappedSlugs = record?.lessonSlug
        ? [record.lessonSlug]
        : unit.legacyBridgeLessonSlug
          ? [unit.legacyBridgeLessonSlug]
          : [];
      const isBridgePartial =
        unit.id !== "unit-tc00-observation-hypotheses" && Boolean(unit.legacyBridgeLessonSlug);
      return {
        coverageState: stateToCoverage(productionState, isBridgePartial),
        productionState,
        unitId: unit.id,
        mappedLessonSlugs: mappedSlugs,
      };
    },
  });

  const coverageReport = verifyUnitCoverage(finalPass.curriculum, unitsCatalog);
  const importedValidated: V4ImportedCurriculum = V4ImportedCurriculumSchema.parse(
    finalPass.curriculum,
  );

  writeStableJson(importedOutPath, importedValidated);
  writeStableJson(unitsOutPath, unitsCatalog);
  writeStableJson(registryOutPath, registry);
  writeStableJson(reportOutPath, {
    schemaVersion: "1.0",
    sourceFile: importedValidated.sourceFile,
    sourceSha256: importedValidated.sourceSha256,
    stats: importedValidated.stats,
    unitsCount: unitsCatalog.units.length,
    coverageReport,
    anomalies: finalPass.anomalies,
  });

  return {
    modules: importedValidated.stats.moduleCount,
    microLessons: importedValidated.stats.microLessonCount,
    competencies: importedValidated.stats.competencyCount,
    exams: importedValidated.stats.examCount,
    units: unitsCatalog.units.length,
    anomalies: finalPass.anomalies.length,
    coverageValid: coverageReport.valid,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const summary = runV4Import();
  console.log(
    `[V4_IMPORT_OK] modules=${summary.modules} microLessons=${summary.microLessons} competencies=${summary.competencies} exams=${summary.exams} units=${summary.units} coverageValid=${summary.coverageValid} anomalies=${summary.anomalies}`,
  );
}
