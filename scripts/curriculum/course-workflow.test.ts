import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import {
  CoursePageSchema,
  LessonManifestSchema,
  ResourcesCatalogSchema,
  validateCoursePageBindings,
} from "@cyber-school/lesson-runtime";
import { inspectCourseWorkflow, prepareCourseWorkflow } from "./course-workflow.ts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const UNIT = "unit-tc00-observation-interpretation";
const SLUG = "observation-et-interpretation";
const temporary: string[] = [];
const read = (root: string, relative: string): unknown =>
  JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
function copy(root: string, relative: string) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(ROOT, relative), target);
}
function sampleLesson() {
  return LessonManifestSchema.parse({
    version: "1.0",
    contentRevision: "1.0.0",
    id: `lesson-${SLUG}`,
    slug: SLUG,
    title: "Distinguer une observation d’une interprétation",
    conceptId: "tc00-observation-fact-vs-interpretation",
    estimatedMinutes: 20,
    medium: "2d-animated",
    mediumJustification:
      "Un banc visuel 2D sépare ce que le système journalise des hypothèses humaines.",
    status: "in-review",
    steps: [
      {
        id: "chapter-first",
        title: "Lire un relevé sans conclure trop vite",
        summary: "Séparer la trace enregistrée de son explication.",
        visualFocus: "evidence-ledger",
      },
    ],
    exercises: [
      {
        kind: "state-prediction",
        id: "exercise-predict",
        conceptId: "tc00-observation-fact-vs-interpretation",
        prompt: "Que peut-on affirmer à partir d'une seule ligne de journal horodatée ?",
        scenario:
          "Trois codes 401 apparaissent à dix secondes d'intervalle sur un compte de service.",
        explanation: "On ne peut affirmer que l'événement journalisé, pas l'intention.",
        options: [
          {
            id: "a",
            label: "Uniquement le fait journalisé à cette date",
            feedback: "Exact : le journal ne prouve pas à lui seul l'intention.",
          },
          {
            id: "b",
            label: "Une intrusion confirmée",
            feedback: "Trop rapide : l'intention reste une hypothèse.",
          },
        ],
        correctOptionId: "a",
      },
      {
        kind: "multiple-choice",
        id: "exercise-practice",
        conceptId: "tc00-observation-fact-vs-interpretation",
        prompt: "Quel énoncé reste une observation vérifiable ?",
        explanation: "Une observation cite l'événement brut et son horodatage.",
        options: [
          {
            id: "a",
            label: "Trois tentatives refusées à 09:41 sur le compte de service",
            feedback: "Exact : fait vérifiable sans interprétation d'intention.",
          },
          {
            id: "b",
            label: "Un pirate insiste sur le serveur",
            feedback: "Incorrect : c'est une interprétation non démontrée.",
          },
        ],
        correctOptionId: "a",
      },
    ],
    assessments: [
      {
        id: "assess-obs",
        title: "Contrôle final",
        conceptIds: ["tc00-observation-fact-vs-interpretation"],
        passingScorePercent: 80,
        exerciseIds: ["exercise-predict", "exercise-practice"],
      },
    ],
    externalLabs: [],
    resourceIds: ["rfc-9293"],
    review: { status: "pending" },
  });
}
function sampleCoursePage() {
  return CoursePageSchema.parse({
    schemaVersion: "1.0",
    lessonId: `lesson-${SLUG}`,
    unitId: UNIT,
    audience: "Débutants en cybersécurité apprenant à analyser des journaux.",
    introduction:
      "Cette leçon montre comment séparer un relevé observable d'une hypothèse explicative.",
    learningObjectives: [
      "Identifier les faits observables dans un relevé horodaté.",
      "Formuler des hypothèses distinctes sans les confondre avec la preuve.",
    ],
    prerequisites: ["Aucun prérequis technique exigé pour cette première notion."],
    chapters: [
      {
        id: "chapter-first",
        title: "Lire un relevé sans conclure trop vite",
        estimatedMinutes: 20,
        question: "Comment séparer ce que le journal mesure de ce que l'analyste suppose ?",
        objective: "Distinguer l'événement enregistré de l'interprétation proposée.",
        explanation: [
          "Un journal technique enregistre des événements selon un format et une horloge donnés.",
          "L'attribution d'intention ou de cause exige une corrélation avec d'autres indices.",
        ],
        workedExample: {
          title: "Trois refus de connexion horodatés",
          startingPoint: "Trois codes 401 apparaissent à dix secondes d'intervalle.",
          steps: [
            "Relever exactement le code, le compte cible et l'horodatage.",
            "Lister au moins deux hypothèses distinctes (tâche planifiée, erreur humaine, attaque).",
          ],
          conclusion:
            "Le journal prouve les trois refus, pas encore l'origine humaine ou malveillante.",
        },
        predictionExerciseId: "exercise-predict",
        experience: {
          componentId: "sample-experience",
          instruction: "Inspecter les entrées du relevé avant de choisir une piste.",
          observe: "Comparer le fait brut et le libellé d'hypothèse.",
          modelLimits: "Ce relevé simplifié ne couvre pas la synchronisation NTP multi-hôtes.",
        },
        practiceExerciseIds: ["exercise-practice"],
        misconception: {
          claim: "Trois refus rapides prouvent immédiatement une intrusion.",
          correction: "Un script légitime mal configuré peut produire la même séquence brute.",
        },
        takeaway: "Toujours séparer l'observation brute de l'interprétation dans le dossier.",
        transferQuestion: "Comment vérifier l'hypothèse sur une alerte pare-feu similaire ?",
        resourceIds: ["rfc-9293"],
        conceptIds: ["tc00-observation-fact-vs-interpretation"],
        microLessonIds: ["TC00.001"],
      },
    ],
    finalTakeaway:
      "Une conclusion solide commence par la séparation stricte entre relevé observable et hypothèse.",
  });
}
function writeSampleLessonArtifacts(root: string) {
  const lessonDir = path.join(root, "lessons", SLUG);
  fs.mkdirSync(lessonDir, { recursive: true });
  fs.writeFileSync(path.join(lessonDir, "lesson.json"), JSON.stringify(sampleLesson(), null, 2));
  fs.writeFileSync(
    path.join(lessonDir, "course.page.json"),
    JSON.stringify(sampleCoursePage(), null, 2),
  );
  const dossierPath = path.join(root, `docs/courses/${SLUG}/COURSE_DOSSIER.md`);
  fs.mkdirSync(path.dirname(dossierPath), { recursive: true });
  fs.writeFileSync(
    dossierPath,
    "# Dossier scientifique et pédagogique\n\n" +
      "Ce dossier synthétise les sources NIST SP 800-92 et les limites du modèle. ".repeat(12),
  );
}
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cyber-course-workflow-"));
  temporary.push(root);
  for (const file of [
    "curriculum/v4/imported-curriculum.json",
    "production/units.json",
    "production/registry.json",
    "resources/sources.json",
    "planning/tasks/TASK-023-complete-course-page-workflow.md",
  ])
    copy(root, file);
  return root;
}
afterEach(() => {
  for (const root of temporary.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

test("prepare is bounded, idempotent and preserves authored mission and draft", () => {
  const root = fixture();
  const authored = path.join(root, `production/missions/${UNIT}.md`);
  fs.mkdirSync(path.dirname(authored), { recursive: true });
  fs.writeFileSync(authored, "Human-authored mission");
  const first = prepareCourseWorkflow(root, UNIT, "TASK-023", SLUG);
  assert.equal(first.created.length, 3);
  const draft = path.join(root, `production/workflows/${UNIT}/draft/course.page.json`);
  fs.writeFileSync(draft, "Authored draft");
  assert.deepEqual(prepareCourseWorkflow(root, UNIT, "TASK-023", SLUG).created, []);
  assert.equal(fs.readFileSync(draft, "utf8"), "Authored draft");
  assert.equal(fs.readFileSync(authored, "utf8"), "Human-authored mission");
  assert.equal(fs.existsSync(path.join(root, "lessons")), false);
  assert.throws(
    () => prepareCourseWorkflow(root, UNIT, "TASK-023", "another-slug"),
    /different inputs/,
  );
});

test("prepare rejects unknown work and traversal before writing", () => {
  const root = fixture();
  assert.throws(() => prepareCourseWorkflow(root, UNIT, "TASK-999"), /Unknown task/);
  assert.throws(() => prepareCourseWorkflow(root, "unknown-unit", "TASK-023"), /Unknown unit/);
  assert.throws(() => prepareCourseWorkflow(root, UNIT, "TASK-023", "../../outside"));
  assert.equal(fs.existsSync(path.join(root, "production/workflows")), false);
});

test("an authoring packet and malformed JSON never count as a completed course", () => {
  const root = fixture();
  prepareCourseWorkflow(root, UNIT, "TASK-023", SLUG);
  const report = inspectCourseWorkflow(root, UNIT);
  assert.equal(report.structureReady, false);
  assert.equal(report.readyForHumanReview, false);
  writeSampleLessonArtifacts(root);
  fs.writeFileSync(path.join(root, `lessons/${SLUG}/course.page.json`), "{broken");
  const invalid = inspectCourseWorkflow(root, UNIT);
  assert.equal(invalid.structureReady, false);
  assert.match(
    invalid.stages.find((stage) => stage.id === "teaching")!.findings.join(" "),
    /JSON illisible/,
  );
});

test("workflow report never fabricates execution, experiences, or human approval when UI is absent", () => {
  const root = fixture();
  prepareCourseWorkflow(root, UNIT, "TASK-023", SLUG);
  writeSampleLessonArtifacts(root);
  const before = fs.readFileSync(
    path.join(root, `production/workflows/${UNIT}/workflow.json`),
    "utf8",
  );
  const report = inspectCourseWorkflow(root, UNIT);
  assert.equal(report.structureReady, false);
  assert.equal(report.readyForHumanReview, false);
  assert.equal(report.publicationPerformed, false);
  const invalid = inspectCourseWorkflow(root, UNIT, "continuity/validation/missing/result.json");
  assert.equal(invalid.stages.find((stage) => stage.id === "verification")!.complete, false);
  assert.equal(invalid.stages.find((stage) => stage.id === "human-review")!.complete, false);
  assert.equal(
    fs.readFileSync(path.join(root, `production/workflows/${UNIT}/workflow.json`), "utf8"),
    before,
  );
});

test("complete page contract rejects scaffolds and broken pedagogical bindings", () => {
  const page = sampleCoursePage();
  const lesson = sampleLesson();
  const resources = ResourcesCatalogSchema.parse(read(ROOT, "resources/sources.json"));
  const options = {
    resources,
    experienceIds: page.chapters.map((chapter) => chapter.experience.componentId),
    expectedMicroLessonIds: page.chapters.flatMap((chapter) => chapter.microLessonIds),
  };
  assert.deepEqual(validateCoursePageBindings(page, lesson, options), []);
  const scaffold = structuredClone(page);
  scaffold.chapters[0]!.explanation[0] = "TODO : écrire une longue explication pour cette notion";
  assert.equal(CoursePageSchema.safeParse(scaffold).success, false);
  const duplicate = structuredClone(page);
  duplicate.chapters.push({ ...structuredClone(duplicate.chapters[0]!), id: "duplicate-chapter" });
  assert.equal(CoursePageSchema.safeParse(duplicate).success, false);
  const broken = structuredClone(page);
  broken.chapters[0]!.predictionExerciseId = "missing-exercise";
  broken.chapters[0]!.experience.componentId = "not-implemented";
  broken.chapters[0]!.resourceIds = ["unknown-source"];
  const issues = validateCoursePageBindings(broken, lesson, {
    ...options,
    expectedMicroLessonIds: ["TC00.999"],
  });
  for (const expected of [/prediction/, /not registered/, /source/, /not placed/, /micro-lessons/])
    assert(
      issues.some((issue) => expected.test(issue)),
      expected.source,
    );
  const noAssessment = { ...lesson, assessments: [] };
  assert(
    validateCoursePageBindings(page, noAssessment, options).some((issue) =>
      issue.includes("cumulative assessment"),
    ),
  );
});
