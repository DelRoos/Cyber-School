import type {
  V4ImportedCurriculum,
  V4MicroLesson,
  V4ModuleSummary,
  V4PedagogicalUnit,
  V4UnitsCatalog,
} from "@cyber-school/lesson-runtime";
import { V4UnitsCatalogSchema, verifyUnitCoverage } from "@cyber-school/lesson-runtime";

const TC00_CURATED_UNITS: V4PedagogicalUnit[] = [
  {
    id: "unit-tc00-observation-interpretation",
    slug: "observation-et-interpretation",
    title: "Distinguer une observation d’une interprétation",
    moduleId: "TC-00",
    domainId: "v4-tronc-commun",
    rationale:
      "Première leçon complète : lire un relevé, séparer ce qu’il rapporte de l’explication proposée et formuler une conclusion justifiée.",
    microLessonIds: ["TC00.001"],
    prerequisiteUnitIds: [],
    recommendedMedium: "2d-animated",
    estimatedMinutes: 20,
    groupingStatus: "curated",
  },
  {
    id: "unit-tc00-observation-hypotheses",
    slug: "scientific-reasoning-and-proof",
    title: "Hypothèses, causalité et contre-exemples",
    moduleId: "TC-00",
    domainId: "v4-tronc-commun",
    rationale:
      "Suite du raisonnement scientifique : formuler une hypothèse falsifiable, isoler variables contrôlées et confondantes, et construire un contre-exemple minimal.",
    microLessonIds: [
      "TC00.002",
      "TC00.003",
      "TC00.004",
      "TC00.005",
      "TC00.006",
      "TC00.007",
      "TC00.008",
    ],
    prerequisiteUnitIds: ["unit-tc00-observation-interpretation"],
    recommendedMedium: "2d-animated",
    estimatedMinutes: 25,
    groupingStatus: "curated",
  },
  {
    id: "unit-tc00-uncertainty-errors",
    slug: "tc00-uncertainty-and-error",
    title: "Erreurs de décision, Bayes, provenance et contradiction",
    moduleId: "TC-00",
    domainId: "v4-tronc-commun",
    rationale:
      "Second bloc du module TC-00 : quantifier faux positifs/négatifs, appliquer les probabilités conditionnelles et le taux de base, puis qualifier la provenance et confronter des sources contradictoires.",
    microLessonIds: [
      "TC00.009",
      "TC00.010",
      "TC00.011",
      "TC00.012",
      "TC00.013",
      "TC00.014",
      "TC00.015",
      "TC00.016",
    ],
    prerequisiteUnitIds: [],
    recommendedMedium: "2d-graph",
    estimatedMinutes: 25,
    groupingStatus: "curated",
  },
  {
    id: "unit-tc00-evidence-calibration",
    slug: "tc00-evidence-and-calibration",
    title: "Reproductibilité, incertitude, mémorisation et vérification IA",
    moduleId: "TC-00",
    domainId: "v4-tronc-commun",
    rationale:
      "Troisième bloc de TC-00 : reproduction indépendante, intervalles d'incertitude, révision après contre-indice, science cognitive de la rétention et réfutation d'une réponse IA.",
    microLessonIds: [
      "TC00.017",
      "TC00.018",
      "TC00.019",
      "TC00.020",
      "TC00.021",
      "TC00.022",
      "TC00.023",
      "TC00.024",
    ],
    prerequisiteUnitIds: [],
    recommendedMedium: "2d-animated",
    estimatedMinutes: 25,
    groupingStatus: "curated",
  },
];

function inferMedium(
  moduleId: string,
  titlesJoined: string,
): V4PedagogicalUnit["recommendedMedium"] {
  const lower = titlesJoined.toLowerCase();
  if (
    moduleId.startsWith("TC-01") ||
    moduleId.startsWith("TC-03") ||
    lower.includes("mémoire") ||
    lower.includes("pile") ||
    lower.includes("réseau")
  ) {
    return "2d-animated";
  }
  if (
    lower.includes("probabilit") ||
    lower.includes("statistiq") ||
    lower.includes("courbe") ||
    lower.includes("graphe") ||
    lower.includes("complexit")
  ) {
    return "2d-graph";
  }
  return "hybrid";
}

function balancedChunk<T>(items: T[], targetSize = 8): T[][] {
  if (items.length <= targetSize) return [items];
  const groupCount = Math.ceil(items.length / targetSize);
  const baseSize = Math.floor(items.length / groupCount);
  const remainder = items.length % groupCount;
  const chunks: T[][] = [];
  let cursor = 0;
  for (let i = 0; i < groupCount; i += 1) {
    const size = baseSize + (i < remainder ? 1 : 0);
    chunks.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return chunks;
}

function groupModuleMicroLessons(
  mod: V4ModuleSummary,
  micros: V4MicroLesson[],
): Array<{ title: string; items: V4MicroLesson[] }> {
  const withSubsections = micros.some((m) => Boolean(m.subsectionTitle));
  if (withSubsections && mod.id === "B-11") {
    const groups: Array<{ title: string; items: V4MicroLesson[] }> = [];
    for (const item of micros) {
      const subTitle = item.subsectionTitle ?? mod.title;
      const last = groups[groups.length - 1];
      if (!last || last.title !== subTitle) {
        groups.push({ title: subTitle, items: [item] });
      } else {
        last.items.push(item);
      }
    }
    return groups;
  }

  return balancedChunk(micros, 8).map((chunk, idx, arr) => ({
    title:
      arr.length === 1
        ? mod.title
        : `${mod.id} — Unité ${idx + 1} (${chunk[0]!.id}..${chunk[chunk.length - 1]!.id})`,
    items: chunk,
  }));
}

function toSafeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildUnitsCatalog(
  imported: V4ImportedCurriculum,
  existingCatalog?: V4UnitsCatalog,
): V4UnitsCatalog {
  const microById = new Map(imported.microLessons.map((m) => [m.id, m]));
  const curatedByModule = new Map<string, V4PedagogicalUnit[]>();
  const existingById = new Map<string, V4PedagogicalUnit>();

  if (existingCatalog) {
    for (const unit of existingCatalog.units) {
      existingById.set(unit.id, unit);
      if (unit.groupingStatus === "curated") {
        const arr = curatedByModule.get(unit.moduleId) ?? [];
        arr.push(unit);
        curatedByModule.set(unit.moduleId, arr);
      }
    }
  }

  const unitsByModule = new Map<string, V4PedagogicalUnit[]>();
  const rawUnits: V4PedagogicalUnit[] = [];

  for (const mod of imported.modules) {
    if (mod.id === "TC-00") {
      const tc00Units = TC00_CURATED_UNITS.map((u) => existingById.get(u.id) ?? u);
      unitsByModule.set(mod.id, tc00Units);
      rawUnits.push(...tc00Units);
      continue;
    }

    const existingCurated = curatedByModule.get(mod.id);
    if (existingCurated && existingCurated.length > 0) {
      const coveredSet = new Set(existingCurated.flatMap((u) => u.microLessonIds));
      const exactMatch =
        coveredSet.size === mod.microLessonIds.length &&
        mod.microLessonIds.every((id) => coveredSet.has(id));
      if (exactMatch) {
        unitsByModule.set(mod.id, existingCurated);
        rawUnits.push(...existingCurated);
        continue;
      }
    }

    const modMicros = mod.microLessonIds
      .map((id) => microById.get(id))
      .filter((m): m is V4MicroLesson => Boolean(m));
    const groups = groupModuleMicroLessons(mod, modMicros);
    const created: V4PedagogicalUnit[] = [];

    groups.forEach((group, idx) => {
      const unitCode = `${toSafeSlug(mod.id)}-${String(idx + 1).padStart(2, "0")}`;
      const id = `unit-${unitCode}`;
      const microIds = group.items.map((item) => item.id);
      const existing = existingById.get(id);
      const titlesJoined = group.items.map((i) => i.title).join(" ");

      const unit: V4PedagogicalUnit = {
        id,
        slug: existing?.slug ?? unitCode,
        title: existing?.title ?? group.title,
        moduleId: mod.id,
        domainId: mod.domainId,
        rationale:
          existing?.rationale ??
          `Regroupement pédagogique cohérent de ${microIds.length} micro-leçons (${microIds[0]} à ${microIds[microIds.length - 1]}) du module ${mod.id}.`,
        microLessonIds: microIds,
        prerequisiteUnitIds: idx > 0 ? [created[idx - 1]!.id] : [],
        recommendedMedium: existing?.recommendedMedium ?? inferMedium(mod.id, titlesJoined),
        estimatedMinutes: existing?.estimatedMinutes ?? Math.max(15, microIds.length * 4),
        ...(existing?.legacyBridgeLessonSlug
          ? { legacyBridgeLessonSlug: existing.legacyBridgeLessonSlug }
          : {}),
        groupingStatus: existing?.groupingStatus ?? "auto-grouped",
      };
      created.push(unit);
      rawUnits.push(unit);
    });

    unitsByModule.set(mod.id, created);
  }

  // Link first unit of each non-TC-00 module to the terminal unit(s) of prerequisite modules
  const modMap = new Map(imported.modules.map((m) => [m.id, m]));
  for (const mod of imported.modules) {
    if (mod.id === "TC-00") continue;
    const modUnits = unitsByModule.get(mod.id) ?? [];
    if (modUnits.length === 0) continue;

    const firstUnit = modUnits[0]!;
    if (firstUnit.groupingStatus === "curated" && existingById.has(firstUnit.id)) {
      continue;
    }

    const prereqModuleIds = new Set<string>(
      mod.explicitPrerequisites.filter((id) => modMap.has(id) && id !== mod.id),
    );
    for (const dep of mod.proposedDependencies) {
      if (dep.status !== "rejected" && dep.targetKind === "module" && modMap.has(dep.targetId)) {
        prereqModuleIds.add(dep.targetId);
      }
    }

    const prereqUnitIds: string[] = [];
    for (const prereqModId of prereqModuleIds) {
      if (prereqModId === "TC-00") {
        const tc00 = unitsByModule.get("TC-00") ?? [];
        for (const u of tc00) prereqUnitIds.push(u.id);
      } else {
        const targetUnits = unitsByModule.get(prereqModId) ?? [];
        const terminal = targetUnits[targetUnits.length - 1];
        if (terminal) prereqUnitIds.push(terminal.id);
      }
    }

    firstUnit.prerequisiteUnitIds = [...new Set(prereqUnitIds)];
  }

  const catalog = V4UnitsCatalogSchema.parse({
    schemaVersion: "1.0",
    units: rawUnits,
  });

  const coverageReport = verifyUnitCoverage(imported, catalog);
  if (!coverageReport.valid) {
    throw new Error(
      `Couverture invalide des unités V4 : ${JSON.stringify(coverageReport, null, 2)}`,
    );
  }

  return catalog;
}
