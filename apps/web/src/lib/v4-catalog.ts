import fs from "node:fs";
import path from "node:path";
import {
  V4ImportedCurriculumSchema,
  V4ProductionRegistrySchema,
  V4UnitsCatalogSchema,
  type V4ProductionState,
} from "@cyber-school/lesson-runtime";
import { findRepoRoot } from "./curriculum-data";

export interface V4ExplorerUnitView {
  unitId: string;
  slug: string;
  title: string;
  moduleId: string;
  moduleTitle: string;
  domainId: string;
  domainTitle: string;
  state: V4ProductionState;
  lessonSlug?: string;
  eligibleNow: boolean;
  prerequisiteUnitIds: string[];
  recommendedMedium: string;
  estimatedMinutes: number;
  microLessons: Array<{
    id: string;
    title: string;
    coverageState: string;
    provenanceLine: number;
  }>;
}

export interface V4ExplorerDomainSummary {
  id: string;
  title: string;
  unitsCount: number;
  microLessonsCount: number;
  coveredCount: number;
}

export interface V4ExplorerData {
  totalModules: number;
  totalMicroLessons: number;
  totalCompetencies: number;
  totalExams: number;
  totalUnits: number;
  eligibleUnitsCount: number;
  coveredOrInReviewCount: number;
  domains: V4ExplorerDomainSummary[];
  units: V4ExplorerUnitView[];
}

const PREREQ_SATISFIED_STATES = new Set<V4ProductionState>(["valide", "publie"]);
const ACTIVE_COVERAGE_STATES = new Set(["partial", "covered", "verified"]);

export function loadV4ExplorerData(rootDir = findRepoRoot()): V4ExplorerData {
  const imported = V4ImportedCurriculumSchema.parse(
    JSON.parse(
      fs.readFileSync(path.join(rootDir, "curriculum/v4/imported-curriculum.json"), "utf8"),
    ),
  );
  const units = V4UnitsCatalogSchema.parse(
    JSON.parse(fs.readFileSync(path.join(rootDir, "production/units.json"), "utf8")),
  );
  const registry = V4ProductionRegistrySchema.parse(
    JSON.parse(fs.readFileSync(path.join(rootDir, "production/registry.json"), "utf8")),
  );

  const moduleMap = new Map(imported.modules.map((m) => [m.id, m]));
  const microMap = new Map(imported.microLessons.map((m) => [m.id, m]));
  const recordMap = new Map(registry.records.map((r) => [r.unitId, r]));

  const domainMap = new Map<string, V4ExplorerDomainSummary>();
  for (const m of imported.microLessons) {
    const entry = domainMap.get(m.domainId) ?? {
      id: m.domainId,
      title: m.domainTitle,
      unitsCount: 0,
      microLessonsCount: 0,
      coveredCount: 0,
    };
    entry.microLessonsCount += 1;
    if (ACTIVE_COVERAGE_STATES.has(m.coverageState)) {
      entry.coveredCount += 1;
    }
    domainMap.set(m.domainId, entry);
  }

  let eligibleUnitsCount = 0;
  const unitViews: V4ExplorerUnitView[] = units.units.map((u) => {
    const rec = recordMap.get(u.id);
    const mod = moduleMap.get(u.moduleId);
    const state = rec?.state ?? "a_planifier";

    const domainEntry = domainMap.get(u.domainId);
    if (domainEntry) domainEntry.unitsCount += 1;

    const alreadyAdvanced =
      state === "revue_necessaire" || state === "valide" || state === "publie";
    const prereqsMet = u.prerequisiteUnitIds.every((preId) => {
      const preState = recordMap.get(preId)?.state;
      return preState ? PREREQ_SATISFIED_STATES.has(preState) : false;
    });
    const eligibleNow = !alreadyAdvanced && state !== "bloque" && prereqsMet;
    if (eligibleNow) eligibleUnitsCount += 1;

    return {
      unitId: u.id,
      slug: u.slug,
      title: u.title,
      moduleId: u.moduleId,
      moduleTitle: mod?.title ?? u.moduleId,
      domainId: u.domainId,
      domainTitle: mod?.domainTitle ?? u.domainId,
      state,
      ...((rec?.lessonSlug ?? u.legacyBridgeLessonSlug)
        ? { lessonSlug: rec?.lessonSlug ?? u.legacyBridgeLessonSlug }
        : {}),
      eligibleNow,
      prerequisiteUnitIds: u.prerequisiteUnitIds,
      recommendedMedium: u.recommendedMedium,
      estimatedMinutes: u.estimatedMinutes,
      microLessons: u.microLessonIds.map((microId) => {
        const m = microMap.get(microId);
        return {
          id: microId,
          title: m?.title ?? microId,
          coverageState: m?.coverageState ?? "uncovered",
          provenanceLine: m?.sourceProvenance.lineStart ?? 1,
        };
      }),
    };
  });

  const coveredOrInReviewCount = imported.microLessons.filter((m) =>
    ACTIVE_COVERAGE_STATES.has(m.coverageState),
  ).length;

  return {
    totalModules: imported.stats.moduleCount,
    totalMicroLessons: imported.stats.microLessonCount,
    totalCompetencies: imported.stats.competencyCount,
    totalExams: imported.stats.examCount,
    totalUnits: units.units.length,
    eligibleUnitsCount,
    coveredOrInReviewCount,
    domains: [...domainMap.values()],
    units: unitViews,
  };
}
