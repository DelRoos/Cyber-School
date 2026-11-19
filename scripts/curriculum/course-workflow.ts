import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import {
  CoursePageSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  StableIdSchema,
  validateCoursePageBindings,
} from "@cyber-school/lesson-runtime";
import { readTasks, snapshot, verifyEvidence } from "../quality/core.ts";
import { loadV4PlanningState } from "./v4-plan.ts";
import { generateMissionBriefs } from "./v4-mission.ts";

interface ExperienceCatalogEntry {
  id: string;
  component: string;
  engine: string;
}

function loadExperienceCatalog(root: string): ExperienceCatalogEntry[] {
  const catalogPath = path.join(root, "apps/web/src/components/course-experiences/catalog.ts");
  if (!fs.existsSync(catalogPath)) return [];
  const raw = fs.readFileSync(catalogPath, "utf8");
  const entries: ExperienceCatalogEntry[] = [];
  const entryPattern =
    /\{\s*id:\s*"([^"]+)"\s*,\s*component:\s*"([^"]+)"\s*,\s*engine:\s*"([^"]+)"\s*,?\s*\}/g;
  for (const match of raw.matchAll(entryPattern)) {
    if (match[1] && match[2] && match[3]) {
      entries.push({ id: match[1], component: match[2], engine: match[3] });
    }
  }
  return entries;
}

const ROOT = path.resolve(import.meta.dirname, "../..");
export const WorkflowSpecSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    unitId: StableIdSchema,
    lessonSlug: StableIdSchema,
    taskId: z.string().regex(/^TASK-\d+$/),
    microLessonIds: z.array(z.string()).min(1),
  })
  .strict();
export type WorkflowSpec = z.infer<typeof WorkflowSpecSchema>;

export const COURSE_WORKFLOW_STAGES = [
  {
    id: "research",
    role: "pedagogy-designer",
    title: "Vérifier les sources",
    skills: ["curriculum-production", "lesson-design"],
    output: "COURSE_DOSSIER.md : affirmations, sections des sources et limites du modèle",
  },
  {
    id: "teaching",
    role: "pedagogy-designer",
    title: "Rédiger les chapitres complets",
    skills: ["lesson-design", "visual-explanation"],
    output:
      "lesson.json et course.page.json : explication, exemple, prédiction, exercice, bilan, sources",
  },
  {
    id: "experiences",
    role: "frontend-engineer",
    title: "Construire les expériences",
    skills: ["pedagogical-animation", "gsap-animation", "visual-explanation"],
    output: "Composants enregistrés, moteurs déterministes et tests des invariants",
  },
  {
    id: "assembly",
    role: "frontend-engineer",
    title: "Assembler la page",
    skills: ["frontend-design", "browser-validation"],
    output: "Page /cours/<slug>, évaluation et test navigateur du parcours complet",
  },
  {
    id: "verification",
    role: "qa-engineer",
    title: "Exécuter la réception",
    skills: ["browser-validation", "project-handoff"],
    output: "Preuve quality:verify correspondant aux sources et à la tâche courantes",
  },
  {
    id: "human-review",
    role: "human-reviewer",
    title: "Relire avant publication",
    skills: [],
    output:
      "Revue scientifique et pédagogique humaine réelle, statut de publication géré séparément",
  },
] as const;

/** Reject directory symlinks as well as lexical traversal; writes never escape the project. */
function safePath(root: string, relative: string): string {
  const base = path.resolve(root);
  const target = path.resolve(base, relative);
  if (!target.startsWith(base + path.sep)) throw new Error("Path outside workspace.");
  let cursor = target;
  while (cursor !== base) {
    if (fs.existsSync(cursor) && fs.lstatSync(cursor).isSymbolicLink())
      throw new Error("Workflow paths cannot use symlinks.");
    cursor = path.dirname(cursor);
  }
  return target;
}
function writeMissing(root: string, relative: string, content: string): boolean {
  const file = safePath(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) return false;
  fs.writeFileSync(file, content, { encoding: "utf8", flag: "wx" });
  return true;
}

export function prepareCourseWorkflow(root: string, unitId: string, taskId: string, slug?: string) {
  const { units, registry } = loadV4PlanningState(root);
  const unit = units.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error(`Unknown unit: ${unitId}`);
  if (!readTasks(root).tasks.has(taskId)) throw new Error(`Unknown task: ${taskId}`);
  const record = registry.records.find((entry) => entry.unitId === unitId);
  const proposed = WorkflowSpecSchema.parse({
    schemaVersion: "1.0",
    unitId,
    lessonSlug: slug ?? record?.lessonSlug ?? unit.slug,
    taskId,
    microLessonIds: unit.microLessonIds,
  });
  const relative = `production/workflows/${unit.id}`;
  const file = safePath(root, `${relative}/workflow.json`);
  if (fs.existsSync(file)) {
    const previous = WorkflowSpecSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
    if (
      previous.taskId !== taskId ||
      previous.lessonSlug !== proposed.lessonSlug ||
      JSON.stringify(previous.microLessonIds) !== JSON.stringify(proposed.microLessonIds)
    )
      throw new Error(
        "Existing workflow has different inputs. Review it explicitly instead of overwriting it.",
      );
  }
  const created: string[] = [];
  const put = (name: string, content: string) => {
    if (writeMissing(root, `${relative}/${name}`, content)) created.push(`${relative}/${name}`);
  };
  put("workflow.json", JSON.stringify(proposed, null, 2) + "\n");
  // The ordinary mission is context, not a claim that a page or lesson has been produced.
  const missionPath = safePath(root, `production/missions/${unit.id}.json`);
  const missionMarkdown = safePath(root, `production/missions/${unit.id}.md`);
  if (!fs.existsSync(missionPath) && !fs.existsSync(missionMarkdown))
    generateMissionBriefs([unit.id], root);
  const lessonDir = `lessons/${proposed.lessonSlug}`;
  const dossier = `docs/courses/${proposed.lessonSlug}/COURSE_DOSSIER.md`;
  put(
    "AUTHORING.md",
    [
      `# Produire la page : ${unit.title}`,
      "",
      `Unité : ${unit.id}. Tâche : ${taskId}. Page cible : /cours/${proposed.lessonSlug}.`,
      "",
      "Lire .agents/skills/course-page-production/SKILL.md. Les rôles ci-dessous peuvent être assumés successivement par le même agent. Aucun fournisseur ni modèle n'est imposé.",
      "",
      `Notions à couvrir exactement : ${unit.microLessonIds.join(", ")}.`,
      "",
      `Prérequis de l'unité : ${unit.prerequisiteUnitIds.join(", ") || "aucun"}. Vérifier leur état avant de présenter le cours comme accessible dans un parcours validé.`,
      "",
      "## Artefacts à produire",
      `- ${dossier}`,
      `- ${lessonDir}/lesson.json`,
      `- ${lessonDir}/course.page.json`,
      "- Curriculum et ressources existants : réutiliser les concepts, ajouter seulement les sources vérifiées nécessaires.",
      "- Expériences : apps/web/src/components/course-experiences/{catalog.ts,registry.tsx}, composants, moteurs et tests.",
      `- tests/e2e/${proposed.lessonSlug}.spec.ts`,
      "",
      "## Étapes et conditions de sortie",
      ...COURSE_WORKFLOW_STAGES.flatMap((stage, index) => [
        "",
        `### ${index + 1}. ${stage.title}`,
        `Responsabilité : ${stage.role}. Skills : ${stage.skills.join(", ") || "revue humaine"}.`,
        `Sortie : ${stage.output}.`,
        `Contrôle : corepack pnpm course:workflow -- status --unit ${unit.id}`,
      ]),
      "",
      "## Contrat de rédaction",
      "Le fichier draft/course.page.json décrit la forme, pas un cours terminé. Ne pas publier un modèle vide ou du texte de remplissage. L'exemple doit être résolu, les chiffres doivent correspondre au moteur, les erreurs doivent avoir un feedback spécifique.",
      "",
      "## Réception",
      `corepack pnpm course:workflow -- check --unit ${unit.id}`,
      `corepack pnpm course:workflow -- verify --unit ${unit.id}`,
      "",
      "Produire tous les documents et rapports AVANT la QA. Après la QA, status avec --evidence est en lecture seule. Ne pas transformer une structure complète ou des cases cochées en validation scientifique. La publication reste une étape distincte avec approbation humaine réelle.",
      "",
    ].join("\n"),
  );
  put(
    "draft/course.page.json",
    JSON.stringify(
      {
        schemaVersion: "1.0",
        unitId,
        lessonId: `lesson-${proposed.lessonSlug}`,
        audience: "",
        introduction: "",
        learningObjectives: [],
        prerequisites: [],
        chapters: [
          {
            id: "chapter-first",
            title: "",
            estimatedMinutes: 10,
            question: "",
            objective: "",
            explanation: [],
            workedExample: { title: "", startingPoint: "", steps: [], conclusion: "" },
            predictionExerciseId: "exercise-predict",
            experience: {
              componentId: "unregistered",
              instruction: "",
              observe: "",
              modelLimits: "",
            },
            practiceExerciseIds: [],
            misconception: { claim: "", correction: "" },
            takeaway: "",
            transferQuestion: "",
            resourceIds: [],
            conceptIds: [],
            microLessonIds: unit.microLessonIds,
          },
        ],
        finalTakeaway: "",
      },
      null,
      2,
    ) + "\n",
  );
  return { spec: proposed, created };
}

export function inspectCourseWorkflow(root: string, unitId: string, evidenceRef?: string) {
  StableIdSchema.parse(unitId);
  const spec = WorkflowSpecSchema.parse(
    JSON.parse(
      fs.readFileSync(safePath(root, `production/workflows/${unitId}/workflow.json`), "utf8"),
    ),
  );
  if (spec.unitId !== unitId) throw new Error("Workflow and unit identifiers differ.");
  const { units, registry } = loadV4PlanningState(root);
  const unit = units.units.find((entry) => entry.id === unitId);
  if (!unit) throw new Error("Workflow unit is no longer in the curriculum.");
  const findings: Record<string, string[]> = {
    research: [],
    teaching: [],
    experiences: [],
    assembly: [],
    verification: [],
    "human-review": [],
  };
  const dossier = safePath(root, `docs/courses/${spec.lessonSlug}/COURSE_DOSSIER.md`);
  if (!fs.existsSync(dossier) || fs.readFileSync(dossier, "utf8").trim().length < 500)
    findings.research!.push(
      "Le dossier scientifique et pédagogique est absent ou insuffisamment rédigé.",
    );
  if (JSON.stringify(spec.microLessonIds) !== JSON.stringify(unit.microLessonIds))
    findings.research!.push("Le périmètre de la mission a changé ; revoir le workflow.");
  const resources = ResourcesCatalogSchema.parse(
    JSON.parse(fs.readFileSync(safePath(root, "resources/sources.json"), "utf8")),
  );
  const readArtifact = (relative: string): unknown => {
    const file = safePath(root, relative);
    if (!fs.existsSync(file)) return undefined;
    try {
      return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      findings.teaching!.push(`JSON illisible : ${relative}.`);
      return undefined;
    }
  };
  const manifest = LessonManifestSchema.safeParse(
    readArtifact(`lessons/${spec.lessonSlug}/lesson.json`),
  );
  const page = CoursePageSchema.safeParse(
    readArtifact(`lessons/${spec.lessonSlug}/course.page.json`),
  );
  if (!manifest.success) findings.teaching!.push("Le manifeste du cours est absent ou invalide.");
  if (!page.success)
    findings.teaching!.push(
      ...page.error.issues.map((issue) => `Page : ${issue.path.join(".")} — ${issue.message}`),
    );
  const experienceCatalog = loadExperienceCatalog(root);
  if (manifest.success && page.success) {
    if (page.data.unitId !== unitId)
      findings.teaching!.push("La page appartient à une autre unité.");
    findings.teaching!.push(
      ...validateCoursePageBindings(page.data, manifest.data, {
        resources,
        experienceIds: experienceCatalog.map((entry) => entry.id),
        expectedMicroLessonIds: unit.microLessonIds,
      }),
    );
    for (const id of manifest.data.resourceIds) {
      const resource = resources.resources.find((entry) => entry.id === id);
      if (!resource?.verifiedAt)
        findings.research!.push(`Source ${id} : référence vérifiée et datée manquante.`);
    }
    for (const chapter of page.data.chapters) {
      const experience = experienceCatalog.find(
        (entry) => entry.id === chapter.experience.componentId,
      );
      if (!experience)
        findings.experiences!.push(
          `Expérience non enregistrée : ${chapter.experience.componentId}.`,
        );
      else
        for (const relative of [
          `apps/web/src/components/course-experiences/${experience.component}.tsx`,
          `apps/web/src/components/course-experiences/${experience.engine}.ts`,
          `apps/web/src/components/course-experiences/__tests__/${experience.engine}.test.ts`,
        ])
          if (!fs.existsSync(safePath(root, relative)))
            findings.experiences!.push(`Artefact manquant : ${relative}.`);
    }
  }
  if (!fs.existsSync(safePath(root, `tests/e2e/${spec.lessonSlug}.spec.ts`)))
    findings.assembly!.push("Le scénario navigateur complet du cours est absent.");
  if (!fs.existsSync(safePath(root, "apps/web/src/app/cours/[slug]/page.tsx")))
    findings.assembly!.push("La route de cours /cours/[slug] est absente.");
  if (!evidenceRef)
    findings.verification!.push(
      `Exécuter la réception : course:workflow -- verify --unit ${unitId}.`,
    );
  else {
    const task = readTasks(root).tasks.get(spec.taskId);
    if (!task) findings.verification!.push(`Tâche ${spec.taskId} inconnue.`);
    else
      findings.verification!.push(
        ...verifyEvidence(root, evidenceRef, { source: snapshot(root), task }).map(
          (issue) => issue.message,
        ),
      );
  }
  const record = registry.records.find((entry) => entry.unitId === unitId);
  if (
    !manifest.success ||
    manifest.data.review?.status !== "approved" ||
    !manifest.data.review.scientificReviewer ||
    !manifest.data.review.approvedBy ||
    !manifest.data.review.reviewedAt ||
    record?.deliverables.pedagogical_validation_report.status !== "verified"
  )
    findings["human-review"]!.push(
      "La revue scientifique et pédagogique humaine réelle reste requise ; aucun accord n'est inventé.",
    );
  const stages = COURSE_WORKFLOW_STAGES.map((stage) => ({
    ...stage,
    complete: findings[stage.id]!.length === 0,
    findings: [...new Set(findings[stage.id]!)],
  }));
  const structureReady = stages.slice(0, 4).every((stage) => stage.complete);
  const readyForHumanReview = structureReady && stages[4]!.complete;
  return {
    unitId,
    lessonSlug: spec.lessonSlug,
    taskId: spec.taskId,
    structureReady,
    readyForHumanReview,
    publicationPerformed: false as const,
    stages,
    nextStage: stages.find((stage) => !stage.complete)?.id ?? "publication-separate",
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2).filter((value) => value !== "--");
  const command = args[0];
  const flag = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const unitId = flag("--unit");
  if (!unitId || !["prepare", "status", "check", "verify"].includes(command ?? ""))
    throw new Error(
      "Usage: course:workflow -- prepare|status|check|verify --unit <id> [--task TASK-...] [--slug <slug>] [--evidence <ref>]",
    );
  if (command === "prepare") {
    const taskId = flag("--task");
    if (!taskId) throw new Error("prepare requires an existing --task identifier.");
    console.log(
      JSON.stringify(prepareCourseWorkflow(ROOT, unitId, taskId, flag("--slug")), null, 2),
    );
  } else if (command === "verify") {
    const report = inspectCourseWorkflow(ROOT, unitId);
    if (!report.structureReady) {
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
    } else {
      const result = spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          path.join(ROOT, "scripts/quality/run-checks.ts"),
          "--task",
          report.taskId,
        ],
        { cwd: ROOT, stdio: "inherit", windowsHide: true },
      );
      process.exitCode = result.status ?? 1;
    }
  } else {
    const report = inspectCourseWorkflow(ROOT, unitId, flag("--evidence"));
    console.log(JSON.stringify(report, null, 2));
    if (command === "check" && !report.structureReady) process.exitCode = 1;
  }
}
