import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  V4ImportedCurriculum,
  V4PedagogicalUnit,
  V4ProductionRecord,
  V4ProductionRegistry,
  V4ProductionState,
  V4UnitsCatalog,
} from "@cyber-school/lesson-runtime";
import {
  V4_PRODUCTION_STATE_LABELS,
  V4ImportedCurriculumSchema,
  V4ProductionRegistrySchema,
  V4UnitsCatalogSchema,
} from "@cyber-school/lesson-runtime";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const COMPLETED_PREREQ_STATES = new Set<V4ProductionState>(["valide", "publie"]);

export interface PlanSummary {
  totalMicroLessons: number;
  totalUnits: number;
  byState: Record<string, number>;
  domains: Array<{
    domainId: string;
    domainTitle: string;
    totalMicroLessons: number;
    uncoveredMicroLessons: number;
    unitsCount: number;
  }>;
  eligibleNextUnits: Array<{
    unitId: string;
    slug: string;
    title: string;
    moduleId: string;
    microLessonsCount: number;
    state: V4ProductionState;
  }>;
  blockedUnitsCount: number;
}

export function loadV4PlanningState(rootDir = ROOT_DIR): {
  imported: V4ImportedCurriculum;
  units: V4UnitsCatalog;
  registry: V4ProductionRegistry;
} {
  const imported = V4ImportedCurriculumSchema.parse(
    JSON.parse(readFileSync(path.join(rootDir, "curriculum/v4/imported-curriculum.json"), "utf8")),
  );
  const units = V4UnitsCatalogSchema.parse(
    JSON.parse(readFileSync(path.join(rootDir, "production/units.json"), "utf8")),
  );
  const registry = V4ProductionRegistrySchema.parse(
    JSON.parse(readFileSync(path.join(rootDir, "production/registry.json"), "utf8")),
  );
  return { imported, units, registry };
}

export function computePlanSummary(
  imported: V4ImportedCurriculum,
  units: V4UnitsCatalog,
  registry: V4ProductionRegistry,
  limit = 6,
): PlanSummary {
  const recordByUnit = new Map<string, V4ProductionRecord>(
    registry.records.map((r) => [r.unitId, r]),
  );
  const byState: Record<string, number> = {};
  for (const r of registry.records) {
    byState[r.state] = (byState[r.state] ?? 0) + 1;
  }

  const domainStats = new Map<
    string,
    {
      domainId: string;
      domainTitle: string;
      totalMicroLessons: number;
      uncoveredMicroLessons: number;
      unitsCount: number;
    }
  >();

  for (const m of imported.microLessons) {
    const entry = domainStats.get(m.domainId) ?? {
      domainId: m.domainId,
      domainTitle: m.domainTitle,
      totalMicroLessons: 0,
      uncoveredMicroLessons: 0,
      unitsCount: 0,
    };
    entry.totalMicroLessons += 1;
    if (m.coverageState === "uncovered") entry.uncoveredMicroLessons += 1;
    domainStats.set(m.domainId, entry);
  }

  for (const u of units.units) {
    const entry = domainStats.get(u.domainId);
    if (entry) entry.unitsCount += 1;
  }

  const eligibleUnits: V4PedagogicalUnit[] = [];
  let blockedUnitsCount = 0;

  for (const unit of units.units) {
    const record = recordByUnit.get(unit.id);
    const state = record?.state ?? "a_planifier";
    if (COMPLETED_PREREQ_STATES.has(state)) continue;
    if (state === "bloque") {
      blockedUnitsCount += 1;
      continue;
    }

    const prereqsMet = unit.prerequisiteUnitIds.every((preId) => {
      const preState = recordByUnit.get(preId)?.state;
      return preState ? COMPLETED_PREREQ_STATES.has(preState) : false;
    });

    if (prereqsMet) {
      eligibleUnits.push(unit);
    } else {
      blockedUnitsCount += 1;
    }
  }

  return {
    totalMicroLessons: imported.microLessons.length,
    totalUnits: units.units.length,
    byState,
    domains: [...domainStats.values()],
    eligibleNextUnits: eligibleUnits.slice(0, Math.max(1, limit)).map((u) => ({
      unitId: u.id,
      slug: u.slug,
      title: u.title,
      moduleId: u.moduleId,
      microLessonsCount: u.microLessonIds.length,
      state: recordByUnit.get(u.id)?.state ?? "a_planifier",
    })),
    blockedUnitsCount,
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex !== -1 ? Number.parseInt(args[limitIndex + 1] ?? "6", 10) : 6;
  const { imported, units, registry } = loadV4PlanningState();
  const summary = computePlanSummary(imported, units, registry, Number.isFinite(limit) ? limit : 6);

  if (asJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      `=== PLANIFICATION CURSUS V4 (${summary.totalMicroLessons} micro-leçons / ${summary.totalUnits} unités) ===`,
    );
    console.log("\nPar domaine :");
    for (const d of summary.domains) {
      console.log(
        `- ${d.domainTitle} : ${d.unitsCount} unités | ${d.uncoveredMicroLessons}/${d.totalMicroLessons} micro-leçons non couvertes`,
      );
    }
    console.log("\nÉtats de production :");
    for (const [state, count] of Object.entries(summary.byState)) {
      const label =
        V4_PRODUCTION_STATE_LABELS[state as keyof typeof V4_PRODUCTION_STATE_LABELS] ?? state;
      console.log(`- ${label} (${state}) : ${count}`);
    }
    console.log(`\nProchains lots éligibles (limite=${summary.eligibleNextUnits.length}) :`);
    for (const u of summary.eligibleNextUnits) {
      console.log(
        `- ${u.unitId} [${u.moduleId}] — ${u.title} (${u.microLessonsCount} micro-leçons, état=${u.state})`,
      );
    }
    console.log(`\nUnités en attente de prérequis ou bloquées : ${summary.blockedUnitsCount}`);
  }
}
