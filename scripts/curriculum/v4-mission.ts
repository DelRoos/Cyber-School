import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { V4MissionBrief } from "@cyber-school/lesson-runtime";
import {
  V4_DELIVERABLE_KINDS,
  V4_DELIVERABLE_LABELS,
  V4MissionBriefSchema,
} from "@cyber-school/lesson-runtime";
import { computePlanSummary, loadV4PlanningState } from "./v4-plan.ts";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function renderMissionMarkdown(brief: V4MissionBrief, modResourcesCount: number): string {
  const lines: string[] = [
    `# Dossier de mission — ${brief.title}`,
    "",
    `- **Mission ID** : \`${brief.missionId}\``,
    `- **Unité pédagogique** : \`${brief.unitId}\` (slug cible : \`${brief.slug}\`)`,
    `- **Module V4** : \`${brief.moduleId}\` (domaine \`${brief.domainId}\`)`,
    `- **Ressources associées** : ${modResourcesCount}`,
    "",
    "## Micro-leçons V4 à couvrir",
    "",
    ...brief.microLessons.map((m) => `- **${m.id}** (V4 L.${m.provenanceLine}) — ${m.title}`),
    "",
    "## Prérequis d'unités",
    "",
    ...(brief.prerequisiteUnits.length === 0
      ? ["- Aucun prérequis bloquant (unité racine)."]
      : brief.prerequisiteUnits.map((p) => `- \`${p.unitId}\` (état : \`${p.state}\`)`)),
    "",
    "## Ressources et laboratoires externes",
    "",
    ...(brief.associatedResources.length === 0
      ? [
          "- À compléter avant passage en développement (voir module V4 ou `resources/sources.json`).",
        ]
      : brief.associatedResources.map((r) => `- [${r.label}](${r.url}) (${r.category})`)),
    "",
    "## Contrat des 12 livrables",
    "",
    ...brief.deliverablesChecklist.map(
      (d) =>
        `- [${d.status === "verified" ? "x" : " "}] **${d.label}** (\`${d.kind}\`) — \`${d.status}\``,
    ),
    "",
    "## Skills requis",
    "",
    ...brief.requiredSkills.map((s) => `- \`${s}\``),
    "",
    "## Commandes de vérification",
    "",
    ...brief.verificationCommands.map((cmd) => `- \`${cmd}\``),
    "",
  ];
  return lines.join("\n");
}

export function generateMissionBriefs(
  unitIds: string[],
  rootDir = ROOT_DIR,
): { generatedPaths: string[]; briefs: V4MissionBrief[] } {
  const { imported, units, registry } = loadV4PlanningState(rootDir);
  const unitMap = new Map(units.units.map((u) => [u.id, u]));
  const microMap = new Map(imported.microLessons.map((m) => [m.id, m]));
  const modMap = new Map(imported.modules.map((m) => [m.id, m]));
  const recordMap = new Map(registry.records.map((r) => [r.unitId, r]));

  const missionsDir = path.join(rootDir, "production/missions");
  mkdirSync(missionsDir, { recursive: true });

  const generatedPaths: string[] = [];
  const briefs: V4MissionBrief[] = [];

  for (const unitId of unitIds) {
    const unit = unitMap.get(unitId);
    if (!unit) {
      throw new Error(`Unité V4 introuvable : ${unitId}`);
    }
    const record = recordMap.get(unitId);
    const mod = modMap.get(unit.moduleId);
    const microLessons = unit.microLessonIds.map((id) => {
      const m = microMap.get(id);
      if (!m) throw new Error(`Micro-leçon V4 introuvable : ${id}`);
      return {
        id: m.id,
        title: m.title,
        provenanceLine: m.sourceProvenance.lineStart,
      };
    });

    const skills = [
      "curriculum-production",
      "lesson-design",
      "visual-explanation",
      "browser-validation",
    ];
    if (unit.recommendedMedium === "2d-animated" || unit.recommendedMedium === "hybrid") {
      skills.push("gsap-animation");
    } else if (unit.recommendedMedium === "3d-scene") {
      skills.push("threejs-scene");
    }

    const deliverablesChecklist = V4_DELIVERABLE_KINDS.map((kind) => ({
      kind,
      label: V4_DELIVERABLE_LABELS[kind],
      status: record?.deliverables[kind].status ?? ("missing" as const),
    }));

    const brief = V4MissionBriefSchema.parse({
      schemaVersion: "1.0",
      missionId: `MISSION-${unit.id}`,
      unitId: unit.id,
      slug: unit.slug,
      title: unit.title,
      moduleId: unit.moduleId,
      domainId: unit.domainId,
      microLessons,
      prerequisiteUnits: unit.prerequisiteUnitIds.map((preId) => ({
        unitId: preId,
        state: recordMap.get(preId)?.state ?? ("a_planifier" as const),
      })),
      associatedResources: mod?.resources ?? [],
      requiredSkills: skills,
      deliverablesChecklist,
      verificationCommands: [
        `pnpm v4:audit -- --unit ${unit.id}`,
        "pnpm typecheck",
        "pnpm lint",
        "pnpm validate:curriculum",
        "pnpm test:unit",
        "pnpm test:e2e",
      ],
    });

    const jsonPath = path.join(missionsDir, `${unit.id}.json`);
    const mdPath = path.join(missionsDir, `${unit.id}.md`);
    writeFileSync(jsonPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
    writeFileSync(mdPath, renderMissionMarkdown(brief, mod?.resources.length ?? 0), "utf8");
    generatedPaths.push(jsonPath, mdPath);
    briefs.push(brief);
  }

  return { generatedPaths, briefs };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
) {
  const args = process.argv.slice(2);
  const unitFlagIdx = args.indexOf("--unit");
  const isNext = args.includes("--next");
  const limitIdx = args.indexOf("--limit");
  const rawLimit = limitIdx !== -1 ? Number.parseInt(args[limitIdx + 1] ?? "3", 10) : 3;
  const boundedLimit = Math.min(5, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : 3));

  let targetUnitIds: string[] = [];
  if (unitFlagIdx !== -1 && args[unitFlagIdx + 1]) {
    targetUnitIds = [args[unitFlagIdx + 1]!];
  } else if (isNext) {
    const { imported, units, registry } = loadV4PlanningState();
    const plan = computePlanSummary(imported, units, registry, boundedLimit);
    targetUnitIds = plan.eligibleNextUnits.map((u) => u.unitId);
  } else {
    console.error("Usage : pnpm v4:mission -- --unit <unitId> | --next --limit <1..5>");
    process.exit(1);
  }

  if (targetUnitIds.length === 0) {
    console.log("[V4_MISSION] Aucune unité éligible trouvée.");
    process.exit(0);
  }

  const { generatedPaths, briefs } = generateMissionBriefs(targetUnitIds);
  console.log(
    `[V4_MISSION_OK] missions=${briefs.length} files=${generatedPaths.length} units=${targetUnitIds.join(",")}`,
  );
}
